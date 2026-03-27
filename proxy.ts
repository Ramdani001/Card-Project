import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import prisma from "@/lib/prisma";
import { CONSTANT } from "./constants";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    const method = req.method as "GET" | "POST" | "PATCH" | "DELETE";

    if (pathname === "/api/webhooks/midtrans") {
      return NextResponse.next();
    }

    let userRole: string = CONSTANT.ROLE_GUEST_NAME;
    let permissions: Record<string, any> = {};

    if (token) {
      userRole = token.role as string;
      permissions = (token.permissions as any) || {};
    } else {
      const guestRoleData = await prisma.role.findUnique({
        where: { name: CONSTANT.ROLE_GUEST_NAME },
        include: {
          roleApiAccesses: { include: { apiEndpoints: true } },
        },
      });

      if (guestRoleData) {
        guestRoleData.roleApiAccesses.forEach((access) => {
          if (access.apiEndpoints?.url) {
            permissions[access.apiEndpoints.url] = {
              GET: access.canRead,
              POST: access.canCreate,
              PATCH: access.canUpdate,
              DELETE: access.canDelete,
            };
          }
        });
      }
    }

    if (userRole === CONSTANT.ROLE_ADMIN_NAME) return NextResponse.next();

    if (pathname.startsWith("/api")) {
      const activePermissions = permissions || {};
      const endpointKey = Object.keys(activePermissions).find((url) => pathname.startsWith(url));

      if (endpointKey) {
        const allowedMethod = activePermissions[endpointKey][method];
        if (!allowedMethod) {
          return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }
        return NextResponse.next();
      }

      return NextResponse.json({ success: false, message: "Access Denied" }, { status: 403 });
    }

    if (pathname.startsWith("/dashboard") && userRole === CONSTANT.ROLE_GUEST_NAME) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: { authorized: () => true },
  }
);
