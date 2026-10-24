import { claimSchema } from "../../../lib/schema";
import { assessClaim } from "../../../lib/assess";
import { draftClaim } from "../../../lib/llm";
import { readJsonRequest, RequestBodyError } from "../../../lib/read-json-request";
import { admitEvaluation } from "../../../lib/request-budget";

export const runtime = "nodejs";

const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  try {
    const rejection = await admitEvaluation(request);
    if (rejection) return rejection;
    const parsed = await readJsonRequest(request);
    const validation = claimSchema.safeParse(parsed);
    if (!validation.success) {
      const fields = Object.fromEntries(validation.error.issues.map((issue) => [issue.path.join("."), issue.message]));
      return Response.json({ error: "Check the highlighted flight details.", fields }, { status: 422, headers });
    }
    const input = validation.data;
    const computed = assessClaim(input);
    const draft = await draftClaim(input, computed, request.signal);
    return Response.json({ input, computed, ...draft }, { headers });
  } catch (error) {
    if (error instanceof RequestBodyError) return Response.json({ error: error.message }, { status: error.status, headers });
    return Response.json({ error: "We could not complete the check. Your details are still in the form. Please try again." }, { status: 500, headers });
  }
}
