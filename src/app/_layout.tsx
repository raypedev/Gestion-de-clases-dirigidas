import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import React, { Suspense } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import migrations from "../../drizzle/migrations";
import AppContextProvider from "../context/AppContextProvider";
import { actividades, inscripciones, usuarios } from "../db/schema";

// Cambiamos a prueba6 para forzar una base de datos nueva con la columna avatar
export const DATABASE_NAME = "prueba6Drizzle";

async function crearTablas(db: any) {
  const drizzleDb = drizzle(db, {
    schema: { usuarios, inscripciones, actividades },
  });

  // 1. TABLA USUARIOS (Añadido el campo avatar)
  await drizzleDb.run(sql`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      dni TEXT,
      correo TEXT NOT NULL,
      password TEXT NOT NULL,
      genero TEXT NOT NULL,
      avatar TEXT
    );
  `);

  // 2. TABLA INSCRIPCIONES
  await drizzleDb.run(sql`
    CREATE TABLE IF NOT EXISTS inscripciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      actividad_id INTEGER
    );
  `);

  // 3. TABLA ACTIVIDADES
  await drizzleDb.run(sql`
    CREATE TABLE IF NOT EXISTS actividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      dia TEXT NOT NULL,
      hora TEXT NOT NULL,
      icon TEXT NOT NULL
    );
  `);

  // 4. TABLA ESTADISTICAS
  await drizzleDb.run(sql`
    CREATE TABLE IF NOT EXISTS estadisticas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_pantalla TEXT NOT NULL,
      usuario_id INTEGER NOT NULL
    );
  `);

  console.log("Tablas aseguradas con columna avatar");
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0a3d62" />
      <Text style={{ marginTop: 10 }}>Configurando base de datos...</Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppContextProvider>
      <Suspense fallback={<LoadingScreen />}>
        <SQLiteProvider
          databaseName={DATABASE_NAME}
          options={{ enableChangeListener: true }}
          useSuspense
          onInit={async (database) => {
            try {
              const db = drizzle(database, {
                schema: { usuarios, inscripciones, actividades },
              });

              // Ejecutamos la creación manual con la nueva columna
              await crearTablas(database);

              try {
                await migrate(db, migrations);
              } catch (migError) {
                console.log("Migraciones saltadas");
              }

              await database.execAsync(`PRAGMA foreign_keys = ON`);
              console.log("Base de datos prueba6 lista");
            } catch (error) {
              console.error("Error crítico en la DB", error);
            }
          }}
        >
          <Stack screenOptions={{ headerShown: false }} />
        </SQLiteProvider>
      </Suspense>
    </AppContextProvider>
  );
}
