import { NextRequest, NextResponse } from 'next/server';
import { DEMO_OFFICERS, SESSION_COOKIE, encodeSession, Officer } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const found = DEMO_OFFICERS.find(
      (o) =>
        o.email.toLowerCase() === email.toLowerCase().trim() &&
        o.password === password
    );

    if (!found) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Strip password before storing in session
    const { password: _pw, ...officer }: typeof found = found;
    void _pw;

    const sessionValue = encodeSession(officer as Officer);

    const response = NextResponse.json({ officer, success: true });
    response.cookies.set(SESSION_COOKIE, sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
