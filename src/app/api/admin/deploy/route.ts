import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

/**
 * Netlify Deployment Trigger API
 * Uses Netlify Build Hooks to securely trigger a redeploy from the Admin Dashboard.
 */
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const buildHookUrl = process.env.NETLIFY_BUILD_HOOK;

  if (!buildHookUrl) {
    return NextResponse.json({ 
      error: 'configuration_missing',
      message: 'Netlify Build Hook URL not configured in environment variables.' 
    }, { status: 501 });
  }

  try {
    const response = await fetch(buildHookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        triggered_by: session.user.email,
        reason: 'Manual Admin Push from Epicenter Dashboard'
      })
    });

    if (response.ok) {
      return NextResponse.json({ 
        ok: true, 
        message: 'Deployment successfully triggered on Netlify.' 
      });
    } else {
      const errorData = await response.text();
      console.error('Netlify Deployment Error:', errorData);
      return NextResponse.json({ 
        error: 'deployment_failed', 
        message: 'Netlify rejected the deployment request.' 
      }, { status: 502 });
    }
  } catch (err: any) {
    console.error('Deployment Trigger Exception:', err.message);
    return NextResponse.json({ 
      error: 'system_error', 
      message: 'Failed to communicate with Netlify servers.' 
    }, { status: 500 });
  }
}
