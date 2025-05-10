import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth();
  if (!userId && !isPublicRoute(req)) {
    const redirectUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (userId && req.nextUrl.pathname === "/") {
    const chatId = Date.now();
    console.log("chatId", chatId);
    const newUrl = new URL(`/c/${chatId}`, req.url);
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/c(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/((?!api|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
