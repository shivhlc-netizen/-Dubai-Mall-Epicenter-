export async function GET() {
  return Response.json({
    experiences: [
      { id: 1, title: 'A Night at the Fountain Show', description: 'The Dubai Fountain at night is absolutely magical. The lights, music, and water create an unforgettable symphony.', user_name: 'Sarah M.', image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', status: 'published', is_featured_on_home: 1, created_at: '2025-03-15T18:00:00Z', comments: [] },
      { id: 2, title: 'Shopping in Fashion Avenue', description: 'Fashion Avenue is like walking through a dream. Every luxury brand, impeccable service, and stunning architecture.', user_name: 'Ahmed K.', image_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800', status: 'published', is_featured_on_home: 1, created_at: '2025-03-10T14:00:00Z', comments: [] },
      { id: 3, title: 'Dubai Aquarium Wonder', description: 'Watching the whale sharks glide past is a spiritual experience. One of the most breathtaking things I have ever seen.', user_name: 'Priya R.', image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', status: 'published', is_featured_on_home: 0, created_at: '2025-02-28T10:00:00Z', comments: [] }
    ],
    total: 3
  })
}
export async function POST() { return Response.json({ ok: true, id: 99, message: 'Demo mode - submissions noted' }) }
