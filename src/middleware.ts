import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// const isProtectedRoute = createRouteMatcher([
//   "/", // Protect the root route
//   "/c(.*)", // Protect routes starting with /c/
// ]);
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth();
  // if (!userId && isProtectedRoute(req))
  //   redirectToSignIn({ returnBackUrl: req.url });
  if (!userId && !isPublicRoute(req)) {
    const redirectUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (userId && req.nextUrl.pathname === "/") {
    const chatId = Date.now();
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
    // Skip Next.js internals and all static files, unless found in search
    //Negative Lookahead (?!...) It is used to tell nextjs middleware not to run the middleware function for this following files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
