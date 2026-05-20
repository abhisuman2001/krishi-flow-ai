import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, decodeSession, encodeSession, Officer } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE)?.value;

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const current = decodeSession(session);
    if (!current) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const updates = await request.json();

    // Only allow safe fields to be updated
    const allowed: (keyof Officer)[] = ['name', 'phone', 'department', 'district', 'state'];
    const sanitized: Partial<Officer> = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        (sanitized as Record<string, unknown>)[key] = updates[key];
      }
    }

    // Recompute initials if name changed
    if (sanitized.name) {
      const parts = (sanitized.name as string).trim().split(' ');
      sanitized.initials = parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    }

    const updated: Officer = { ...current, ...sanitized };
    const newSession = encodeSession(updated);

    const response = NextResponse.json({ officer: updated, success: true });
    response.cookies.set(SESSION_COOKIE, newSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
