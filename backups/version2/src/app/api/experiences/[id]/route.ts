export async function GET() { return Response.json({ id: 1, title: 'Dubai Experience', description: 'Amazing visit', user_name: 'Guest', status: 'published', comments: [] }) }
export async function DELETE() { return Response.json({ ok: true }) }
export async function PATCH() { return Response.json({ ok: true }) }
