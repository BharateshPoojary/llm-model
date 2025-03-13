import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  if (url.pathname === "/") {
    const chatId = Date.now();
    return NextResponse.redirect(new URL(`/c/${chatId}`, request.url));
  }
}
export const config = {
  matcher: ["/"],
};
