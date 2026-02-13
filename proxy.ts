import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { apiPermissions } from "./config/apiPermissions";
import { pagePermissions } from "./config/pagePermission";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    const method = req.method;
    const userRole = token?.role as string;

    if (pathname.startsWith("/api")) {
      const matchingApiPath = Object.keys(apiPermissions).find((path) => pathname.startsWith(path));

      if (matchingApiPath) {
        const allowedRoles = apiPermissions[matchingApiPath][method];

        if (allowedRoles) {
          if (!token) {
            return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
          }

          const isAllRoles = allowedRoles.includes("*");
          if (!isAllRoles && !allowedRoles.includes(userRole)) {
            return NextResponse.json(
              {
                success: false,
                message: `Forbidden: Role '${userRole}' cannot access ${method} ${pathname}`,
              },
              { status: 403 }
            );
          }
        }
      }

      return NextResponse.next();
    }

    const matchingPagePath = Object.keys(pagePermissions).find((path) => pathname.startsWith(path));

    if (matchingPagePath) {
      const allowedRoles = pagePermissions[matchingPagePath];

      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;

        if (pathname.startsWith("/api")) {
          return true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/profile/:path*", "/api/:path*"],
};
