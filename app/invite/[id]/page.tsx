import { db } from '../../../db';
import { guests } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ClientView from './ClientView';

export default async function InvitationPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  // 1. Consultamos los datos del invitado en la Base de Datos
  const guestResult = await db.select().from(guests).where(eq(guests.id, id));
  const guest = guestResult[0];

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