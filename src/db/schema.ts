//import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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

/*
export const categorias = sqliteTable('categorias', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nombre: text('nombre').unique().notNull(),


});


export const productos = sqliteTable('productos', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nombre: text('nombre').unique().notNull(),
    stock: integer('stock'),
    precio: real('precio'),
    categoriaId: integer('categoria_id').references(() => categorias.id),
});



export const categoriasRelations = relations(categorias, ({ many }) => ({
    productos: many(productos),
}));

export const productosRelations = relations(productos, ({ one }) => ({
    pais: one(categorias, {
        fields: [productos.categoriaId],
        references: [categorias.id],
    }),
}));

*/
