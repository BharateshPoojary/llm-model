import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth();
  if (userId && isPublicRoute(req)) {
    const chatId = Date.now();
    console.log("chatId", chatId);
    const newUrl = new URL(`/c/${chatId}`, req.url);
    return NextResponse.redirect(newUrl);
  }
  if (
    !userId &&
    (req.nextUrl.pathname.startsWith("/c") || req.nextUrl.pathname === "/")
  ) {
    const redirectUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next(); //passing the control to the next middleware
});

export const config = {
  matcher: [
    "/",
    "/c/:path*",
    "/sign-in",
    "/sign-Up",
    "/((?!api|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
