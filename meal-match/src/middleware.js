import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Define public paths
  const isPublicPath = 
    path === "/" || 
    path === "/login" || 
    path === "/register" || 
    path === "/about" ||
    path.startsWith("/api/");
  
  // Check if path includes dynamic [userId] segment
  const isProtectedPath = 
    path.includes("/profile/") || 
    path.includes("/favorites/") || 
    path.includes("/templates/") || 
    path.includes("/dashboard/");
  
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // Redirect logic
  if (isPublicPath && token) {
    // If user is logged in and tries to access public pages like login/register
    // Redirect them to dashboard
    if (path === "/login" || path === "/register") {
      return NextResponse.redirect(new URL(`/dashboard/grid/${token.id}`, request.url));
    }
  }
  
  if (isProtectedPath && !token) {
    // If user is not logged in and tries to access protected routes
    // Redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Check if userId in URL matches the logged-in user's ID
  if (isProtectedPath && token) {
    const urlUserId = path.split("/").pop();
    if (urlUserId !== token.id) {
      // User is trying to access another user's page
      return NextResponse.redirect(new URL(`/dashboard/grid/${token.id}`, request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};