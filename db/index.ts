import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Crear el cliente conectándose a Turso con tus variables de entorno
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Exportar la base de datos lista para usarse en la app
export const db = drizzle(client, { schema });