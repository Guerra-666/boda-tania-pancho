import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const guests = sqliteTable("guests", {
  // Identificador único (UUID)
  id: text("id").primaryKey(),

  // Datos principales del invitado
  name: text("name").notNull(),
  phone: text("phone").notNull(),

  // Pases totales vs confirmados
  ticketsTotal: integer("tickets_total").notNull(),
  ticketsConfirmed: integer("tickets_confirmed").default(0),

  // Estado: pendiente, confirmado, o declinado
  status: text("status", { enum: ['pending', 'confirmed', 'declined'] })
    .default('pending')
    .notNull(),

  // Restricciones alimenticias y mensaje para los novios
  dietaryRestrictions: text("dietary_restrictions"),
  message: text("message"),

  // Control del código QR en la puerta
  qrValidated: integer("qr_validated", { mode: 'boolean' })
    .default(false)
    .notNull(),
  validationTimestamp: text("validation_timestamp"),

  // 🔴 NUEVO CAMPO: Mesa asignada al invitado
  tableNumber: integer("table_number"),

  // Fechas automáticas
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
    .notNull(),
});