import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('admin_session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    // Token inválido o expirado → redirigir al login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/scanner', '/dashboard/:path*'],
};
