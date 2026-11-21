import { beforeEach, describe, expect, it, vi } from "vitest";
const budget = vi.hoisted(() => ({ access: vi.fn(), consume: vi.fn() }));
vi.mock("../lib/request-budget", () => ({ checkEvaluationAccess: budget.access, admitEvaluation: budget.consume }));
import { POST } from "../app/api/evaluate/route";
import { examples } from "../lib/examples";
beforeEach(() => { vi.clearAllMocks(); budget.access.mockReturnValue(undefined); budget.consume.mockResolvedValue(undefined); });
const request = (body: string, type = "application/json") => new Request("http://localhost/api/evaluate", { method: "POST", headers: { "Content-Type": type }, body });
describe("validation before shared storage admission", () => {
  it("does not spend a shared budget on invalid facts", async () => {
    expect((await POST(request(JSON.stringify({ ...examples.eu261, passengers: 0 })))).status).toBe(422);
    expect(budget.consume).not.toHaveBeenCalled();
  });
  it("does not spend a shared budget on malformed or unsupported input", async () => {
    expect((await POST(request("{broken"))).status).toBe(400);
    expect((await POST(request("body", "text/plain"))).status).toBe(415);
    expect(budget.consume).not.toHaveBeenCalled();
  });
  it("respects a budget rejection before calculating a valid assessment", async () => {
    budget.consume.mockResolvedValue(Response.json({ error: "Busy" }, { status: 429 }));
    const response = await POST(request(JSON.stringify(examples.eu261)));
    expect(response.status).toBe(429); expect(budget.consume).toHaveBeenCalledOnce();
    expect(await response.json()).not.toHaveProperty("computed");
  });
  it("rejects a cross-origin caller before attempting to read its body", async () => {
    budget.access.mockReturnValue(Response.json({ error: "Open directly" }, { status: 403 }));
    expect((await POST(request("{broken"))).status).toBe(403);
    expect(budget.consume).not.toHaveBeenCalled();
  });
});
