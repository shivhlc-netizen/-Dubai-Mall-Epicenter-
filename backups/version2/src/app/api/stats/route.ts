export async function GET() {
  return Response.json({ total_visits: 285000, total_sessions: 142000, avg_duration: 420 })
}
export async function POST() { return Response.json({ ok: true }) }
