import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

// const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) {
    const redirectUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(redirectUrl);
  } else if (userId && req.nextUrl.pathname.startsWith("/c")) {
    return NextResponse.next();
  } else {
    const chatId = Date.now();
    console.log("chatId", chatId);
    const newUrl = new URL(`/c/${chatId}`, req.url);
    return NextResponse.redirect(newUrl);
  }
});

export const config = {
  matcher: [
    "/",
    "/c(.*)",
    "/((?!api|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
