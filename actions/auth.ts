'use server'

import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

export async function loginAdmin(password: string) {
  // 1. Verificamos si la contraseña coincide con la de tu .env.local
  if (password !== process.env.ADMIN_PASSWORD) {
    return { success: false, error: "Contraseña incorrecta" };
  }

  try {
    // 2. Creamos un "Token" seguro usando el secreto de tu .env.local
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d') // La sesión durará 30 días
      .sign(secret);

    // 3. Guardamos la sesión en las cookies del navegador
    // (Asegúrate de que await cookies() sea usado si estás en Next.js 15, de lo contrario cookies().set funciona directo en Next.js 14)
    const cookieStore = await cookies();
    cookieStore.set('admin_session', token, {
      httpOnly: true, // Seguro contra hackeos XSS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 días en segundos
    });

    return { success: true };
  } catch (error) {
    console.error("Error al crear la sesión:", error);
    return { success: false, error: "Hubo un problema al iniciar sesión" };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  return { success: true };
}