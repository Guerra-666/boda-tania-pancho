import { cache } from 'react';
import type { Metadata } from 'next';
import { db } from '../../../db';
import { guests } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ClientView from './ClientView';

const getGuest = cache(async (id: string) => {
  const guestResult = await db.select().from(guests).where(eq(guests.id, id));
  return guestResult[0] ?? null;
});

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return undefined;
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params;
  const guest = await getGuest(id);
  const baseUrl = getBaseUrl();
  const title = guest?.name
    ? `Tania & Francisco | Invitacion para ${guest.name}`
    : 'Tania & Francisco | Invitacion';
  const description = guest?.name
    ? `Estas invitado a nuestra boda, ${guest.name}. Abre la invitacion y confirma tu asistencia.`
    : 'Estas invitado a nuestra boda. Abre la invitacion y confirma tu asistencia.';
  const ogImage = '/tania.jpeg';

  return {
    metadataBase: baseUrl ? new URL(baseUrl) : undefined,
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/invite/${id}`,
      images: [
        {
          url: ogImage
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    }
  };
}

export default async function InvitationPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  // 1. Consultamos los datos del invitado en la Base de Datos
  const guest = await getGuest(id);

  // OPTIMIZACIÓN: Verificamos primero si existe.
  // Si no existe, lanzamos el 404 y evitamos hacer la segunda consulta.
  if (!guest) {
    notFound();
  }

  // 2. Obtenemos todos los invitados para filtrar los mensajes del Muro de los Deseos
  const allGuests = await db.select().from(guests);
  const guestMessages = allGuests
    .filter(g => g.message && g.message.trim() !== '')
    .map(g => ({
      name: g.name,
      text: g.message as string
    }));

  // 3. Renderizamos el componente cliente interactivo y le pasamos toda la info
  return <ClientView guest={guest} messages={guestMessages} />;
}