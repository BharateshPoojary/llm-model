import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.formData();
  const token = body.get("cf-turnstile-response");
  const secret = process.env.TURNSTILE_SECRET_KEY as string;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Missing Turnstile token" },
      { status: 400 }
    );
  }

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token.toString(),
      }),
    }
  );

  const result = await res.json();

  if (result.success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json(
      { success: false, error: result["error-codes"] },
      { status: 400 }
    );
  }
}
