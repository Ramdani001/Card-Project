import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const apiPermissions: Record<string, Record<string, string[]>> = {
  "/api/users": {
    GET: ["*"],
    POST: ["Administrator"],
    PATCH: ["Administrator"],
    DELETE: ["Administrator"],
  },
  "/api/cards": {
    GET: ["*"],
    POST: ["Administrator", "User"],
    PATCH: ["Administrator", "User"],
    DELETE: ["Administrator", "User"],
  },
  "/api/type-cards": {
    GET: ["*"],
    POST: ["Administrator"],
    PATCH: ["Administrator"],
    DELETE: ["Administrator"],
  },
  "/api/discounts": {
    GET: ["*"],
    POST: ["Administrator"],
    PATCH: ["Administrator"],
    DELETE: ["Administrator"],
  },
  "/api/roles": {
    GET: ["*"],
    POST: ["Administrator"],
    PATCH: ["Administrator"],
    DELETE: ["Administrator"],
  },
};
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    const method = req.method;
    const userRole = token?.role as string;

    const matchingPath = Object.keys(apiPermissions).find((path) => pathname.startsWith(path));

    if (matchingPath) {
      const allowedRoles = apiPermissions[matchingPath][method];

      if (allowedRoles) {
        if (!token) {
          return NextResponse.json({ success: false, message: "Authentication required for this API" }, { status: 401 });
        }

        const isAllRoles = allowedRoles.includes("*");
        if (!isAllRoles && !allowedRoles.includes(userRole)) {
          return NextResponse.json({ success: false, message: `Forbidden: ${userRole} cannot ${method}` }, { status: 403 });
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/((?!login|register|api/auth|api/register|_next/static|_next/image|favicon.ico).*)"],
};
