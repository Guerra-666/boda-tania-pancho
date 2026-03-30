import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Drizzle Kit corre en la terminal, así que necesitamos decirle
// explícitamente que lea las variables de tu archivo .env.local
// Asegúrate de que el nombre aquí coincida EXACTAMENTE con tu archivo (ej. ".env.local" o ".env")
dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "./db/schema.ts", // La ruta donde acabas de crear el esquema
  out: "./drizzle",         // Carpeta donde Drizzle guardará el historial (se crea sola)
  dialect: "turso",         // <-- CAMBIO CLAVE: Debe ser "turso", no "sqlite"
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});