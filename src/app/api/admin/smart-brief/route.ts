export async function GET() {
  return Response.json({ objective: 'Showcase Dubai Mall as the worlds premier luxury destination.', intelligence: ['285,000+ monthly visitors', '1,200+ retail brands', 'Fashion Avenue — worlds largest luxury retail corridor'], metrics: ['Fashion Avenue footfall up 12%', 'International visitor share 68%'] })
}
export async function POST() { return Response.json({ ok: true }) }
