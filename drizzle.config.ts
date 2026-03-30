import type { Config } from 'drizzle-kit';
export default {
    schema: './src/db/schema.ts', // Ruta a tu archivo de esquema
    out: './drizzle', // Carpeta donde se guardarán las migraciones
    dialect: 'sqlite', // Especifica que estás usando SQLite
    driver: 'expo', // ¡Importante! Indica que es para Expo SQLite
} satisfies Config;