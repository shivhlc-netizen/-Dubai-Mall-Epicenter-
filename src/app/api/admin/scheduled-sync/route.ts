// Demo mode stub — original Gemini+MySQL version preserved in git history (commit 9d3a6bd)
export async function GET() {
  return Response.json({ ok: true, schedule: 'disabled', nextRun: null })
}
export async function POST() {
  return Response.json({ ok: true, message: 'Pulse sync disabled in demo mode', status: 'DEMO' })
}
