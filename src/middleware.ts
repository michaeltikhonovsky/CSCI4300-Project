import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "./utils/auth";

const PROTECTED_ROUTES = ["/api/users/*/points", "/api/bets", "/api/auth"];

export async function middleware(request: NextRequest) {
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => {
    const pattern = new RegExp("^" + route.replace("*", "[^/]+") + "/?$");
    return pattern.test(request.nextUrl.pathname);
  });

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // for auth route only apply middleware to PUT requests
  if (request.nextUrl.pathname === "/api/auth" && request.method !== "PUT") {
    return NextResponse.next();
  }

  // for bets route only apply middleware to POST requests
  if (request.nextUrl.pathname === "/api/bets" && request.method !== "POST") {
    return NextResponse.next();
  }

  // check for user authentication via headers
  const authHeader = request.headers.get("Authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: "Authentication required" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // verify JWT token
  const payload = await verifyToken(token);

  if (!payload || !payload.userId) {
    return new NextResponse(
      JSON.stringify({ error: "Invalid or expired token" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // for routes with user id in path verify the token belongs to user
  if (request.nextUrl.pathname.includes("/users/")) {
    const pathParts = request.nextUrl.pathname.split("/");
    const idIndex = pathParts.indexOf("users") + 1;

    if (idIndex < pathParts.length) {
      const urlUserId = pathParts[idIndex];

      // if token's user id doesn't match the url's user id, deny access
      if (payload.userId !== urlUserId) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/users/:path*/points", "/api/bets", "/api/auth"],
};
