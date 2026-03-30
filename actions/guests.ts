'use server'

import { db } from '../db';
import { guests } from '../db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createGuest(formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const ticketsTotal = parseInt(formData.get('ticketsTotal') as string);

  if (!name || !phone || isNaN(ticketsTotal)) return { error: "Datos incompletos" };

  try {
    const id = crypto.randomUUID();
    await db.insert(guests).values({
      id,
      name,
      phone,
      ticketsTotal,
      status: 'pending',
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    return { error: "Error al guardar en la base de datos" };
  }
}

// 4. Editar un invitado existente (Uso en Dashboard)
export async function editGuest(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const ticketsTotal = parseInt(formData.get('ticketsTotal') as string);

  try {
    await db.update(guests)
      .set({ name, phone, ticketsTotal })
      .where(eq(guests.id, id));

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar" };
  }
}

export async function deleteGuest(id: string) {
  try {
    await db.delete(guests).where(eq(guests.id, id));
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e) {
    return { error: "No se pudo eliminar" };
  }
}

// Actualizar RSVP (Página Pública del Invitado) - AHORA GUARDA EL MENSAJE
export async function updateRsvp(formData: FormData) {
  const id = formData.get('id') as string;
  const status = formData.get('status') as 'confirmed' | 'declined';
  const ticketsConfirmed = parseInt(formData.get('ticketsConfirmed') as string || '0');
  const dietary = formData.get('dietary') as string;
  const message = formData.get('message') as string; // ¡Nuevo campo para el Muro de los Deseos!

  if (!id || !status) return { error: "ID o Estado faltante" };

  try {
    await db.update(guests)
      .set({
        status,
        ticketsConfirmed: status === 'confirmed' ? ticketsConfirmed : 0,
        dietaryRestrictions: dietary,
        message: message, // Guardamos el mensaje en la BD
        updatedAt: new Date().toISOString()
      })
      .where(eq(guests.id, id));

    revalidatePath(`/invite/${id}`);
    revalidatePath('/dashboard');

    return { success: true };
  } catch (e) {
    return { error: "Error al actualizar respuesta" };
  }
}

export async function validateQrAccess(guestId: string) {
  try {
    const guestResult = await db.select().from(guests).where(eq(guests.id, guestId));
    const guest = guestResult[0];

    if (!guest) {
      return { success: false, message: "¡ERROR! Invitación no válida o falsa." };
    }

    if (guest.status !== 'confirmed') {
      return { success: false, message: `Invitado no confirmado (Estado: ${guest.status}).` };
    }

    if (guest.qrValidated) {
      const hora = guest.validationTimestamp ? new Date(guest.validationTimestamp).toLocaleTimeString() : 'antes';
      return { success: false, message: `¡ALERTA! Este QR ya ingresó a las ${hora}.` };
    }

    await db.update(guests)
      .set({
        qrValidated: true,
        validationTimestamp: new Date().toISOString()
      })
      .where(eq(guests.id, guestId));

    revalidatePath('/dashboard');
    revalidatePath('/scanner');

    return {
      success: true,
      name: guest.name,
      tickets: guest.ticketsConfirmed
    };
  } catch (e) {
    return { success: false, message: "Error de conexión con la base de datos." };
  }
}