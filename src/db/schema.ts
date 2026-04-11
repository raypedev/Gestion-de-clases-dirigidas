//import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

// export const personas = sqliteTable("personas", {
//     id: integer("id").primaryKey({ autoIncrement: true }),
//     nombre: text("nombre").notNull(),
//     edad: integer("edad"),
// });

export const usuarios = sqliteTable("usuarios", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nombre: text("nombre").notNull(),
    dni: text("dni"),
    correo: text("correo").notNull(),
    password: text("password").notNull(),
    genero: text("genero").notNull(),
});

export const inscripciones = sqliteTable("inscripciones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  usuarioId: integer("usuario_id"),
  actividadId: integer("actividad_id"),
});

export const actividades = sqliteTable("actividades", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nombre: text("nombre").notNull(),
    dia: text("dia").notNull(),
    hora: text("hora").notNull(),
    icon: text("icon"),
});

export const estadisticas = sqliteTable("estadisticas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre_pantalla: text("nombre_pantalla").notNull(),
  usuario_id: integer("usuario_id").notNull(), // <-- Necesitamos saber quién es
});
