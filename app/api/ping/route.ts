/**
 * Debug route: hit from your phone (e.g. ?x=phone) to verify the device
 * is reaching this deployment and that Vercel Runtime Logs show serverless output.
 *
 * Open: https://your-preview-url.vercel.app/api/ping?x=phone
 * Then check Vercel → Deployments → [this deployment] → Functions / Runtime Logs
 * for the "PING" log line.
 */
export const runtime = "nodejs";

export async function GET(req: Request) {
  if (process.env.ENABLE_DEBUG_PING !== "true") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true, time: Date.now() });
}

