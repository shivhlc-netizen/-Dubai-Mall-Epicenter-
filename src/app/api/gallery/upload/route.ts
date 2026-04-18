export async function POST() { return Response.json({ ok: false, message: 'Upload disabled in demo mode' }, { status: 503 }) }
