import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { queryOne } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = session.user.email;
  const user = await queryOne<any>(
    'SELECT api_budget, api_used FROM users WHERE email = ?',
    [email]
  );

  if (!user) {
    // Return a default for hardcoded failsafe users
    return NextResponse.json({ 
      remaining: 5000, 
      total: 5000, 
      currency: 'Tokens' 
    });
  }

  return NextResponse.json({ 
    remaining: user.api_budget - user.api_used, 
    total: user.api_budget, 
    currency: 'Tokens' 
  });
}
