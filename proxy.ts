import { NextRequest, NextResponse } from "next/server";
import { contentSecurityPolicy } from "./lib/security-headers";

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = contentSecurityPolicy(nonce, process.env.NODE_ENV === "development");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", policy);
  return response;
}
// API bodies must stream straight to their bounded reader; proxying a header-cloned
// request can buffer an unfinished upload before the route's deadline starts.
export const config = { matcher: ["/((?!api|_next/static|_next/image|icon.svg|fonts/).*)"] };
