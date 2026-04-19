export async function GET() { return Response.json({ duplicates: [], orphans: [], total: 0 }) }
export async function POST() { return Response.json({ ok: true }) }
