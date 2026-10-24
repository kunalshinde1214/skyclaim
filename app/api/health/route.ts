export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json({ status: "ok", service: "skyclaim", rulesVersion: "2026-10-18" }, { headers: { "Cache-Control": "no-store" } });
}
