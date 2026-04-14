import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// --- TABLA DE USUARIOS ---
export const usuarios = sqliteTable("usuarios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  dni: text("dni"),
  correo: text("correo").notNull(),
  password: text("password").notNull(),
  genero: text("genero").notNull(),
  // Guardamos el identificador del avatar (ej: 'av1', 'av2')
  avatar: text("avatar"),
});

// --- TABLA DE ACTIVIDADES ---
export const actividades = sqliteTable("actividades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  dia: text("dia").notNull(),
  hora: text("hora").notNull(),
  icon: text("icon"), // Nombre del icono de MaterialCommunityIcons
});

// --- TABLA DE INSCRIPCIONES (Relación Usuario <-> Actividad) ---
export const inscripciones = sqliteTable("inscripciones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  usuarioId: integer("usuario_id").references(() => usuarios.id),
  actividadId: integer("actividad_id").references(() => actividades.id),
});

// --- TABLA DE ESTADÍSTICAS ---
export const estadisticas = sqliteTable("estadisticas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre_pantalla: text("nombre_pantalla").notNull(),
  usuario_id: integer("usuario_id").notNull(),
});
