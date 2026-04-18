export async function GET() {
  return Response.json({
    shops: [
      { id: 1, name: 'Louis Vuitton', category: 'Luxury Fashion', floor: 'Level 2', zone: 'Fashion Avenue', rating: 4.9, description: 'Iconic French luxury fashion house' },
      { id: 2, name: 'Cartier', category: 'Jewellery', floor: 'Level 2', zone: 'Fashion Avenue', rating: 4.9, description: 'Premier French jewellery and watchmaker' },
      { id: 3, name: 'Rolex', category: 'Watches', floor: 'Level 2', zone: 'Fashion Avenue', rating: 5.0, description: 'Swiss luxury watchmaker since 1905' },
      { id: 4, name: 'Burj Khalifa View', category: 'Attractions', floor: 'Level 1', zone: 'Grand Atrium', rating: 5.0, description: 'Breathtaking views of the worlds tallest tower' },
      { id: 5, name: 'Dubai Aquarium', category: 'Entertainment', floor: 'Level 1', zone: 'Aquarium Walk', rating: 4.8, description: 'One of the largest indoor aquariums in the world' }
    ],
    meta: { total: 5, zone: 'All Zones' }
  })
}
