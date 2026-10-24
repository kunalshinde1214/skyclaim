export class RequestBodyError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = "RequestBodyError"; }
}

export async function readJsonRequest(request: Request, { maxBytes = 8192, timeoutMs = 5000 } = {}): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new RequestBodyError("Send flight details as JSON.", 415);
  }
  const declared = request.headers.get("content-length");
  if (declared && (!/^\d+$/.test(declared) || !Number.isSafeInteger(Number(declared)))) throw new RequestBodyError("The flight details could not be read.", 400);
  if (declared && Number(declared) > maxBytes) throw new RequestBodyError("The flight details are too long.", 413);
  if (!request.body) throw new RequestBodyError("Enter your flight details.", 400);
  const reader = request.body.getReader();
  let rejectRead: (error: RequestBodyError) => void = () => {};
  const interrupted = new Promise<never>((_, reject) => { rejectRead = reject; });
  const abort = () => rejectRead(new RequestBodyError("The request ended before the check completed. Please try again.", 408));
  const timer = setTimeout(() => rejectRead(new RequestBodyError("The flight details took too long to arrive. Please try again.", 408)), timeoutMs);
  request.signal.addEventListener("abort", abort, { once: true });
  let consumed = false;
  try {
    if (request.signal.aborted) throw new RequestBodyError("The request ended before the check completed. Please try again.", 408);
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await Promise.race([reader.read(), interrupted]);
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) throw new RequestBodyError("The flight details are too long.", 413);
      chunks.push(value);
    }
    consumed = true;
    const body = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body)); }
    catch { throw new RequestBodyError("The flight details could not be read. Please try again.", 400); }
  } finally {
    clearTimeout(timer);
    request.signal.removeEventListener("abort", abort);
    if (!consumed) void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
