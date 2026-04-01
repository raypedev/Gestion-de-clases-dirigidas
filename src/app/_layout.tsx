import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import React, { Suspense } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import migrations from "../../drizzle/migrations";
import AppContextProvider from "../context/AppContextProvider";
import { usuarios, inscripciones } from "../db/schema";

export const DATABASE_NAME = "prueba4Drizzle";

async function crearTablas(db: any) {
  const drizzleDb = drizzle(db, { schema: { usuarios, inscripciones } });

  // Crear tabla usuarios si no existe
  await drizzleDb.run(sql`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      dni TEXT,
      correo TEXT NOT NULL,
      password TEXT NOT NULL
    );
  `);

  // Crear tabla inscripciones si no existe
  await drizzleDb.run(sql`
    CREATE TABLE IF NOT EXISTS inscripciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      actividad_id INTEGER
    );
  `);

  console.log("Tablas aseguradas");
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>Cargando la app...</Text>
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
              const db = drizzle(database, { schema: { usuarios, inscripciones } });
              await crearTablas(database); // Asegura que las tablas existen antes de migrar
              await migrate(db, migrations); // crea todas las tablas
              await db.run(sql`PRAGMA foreign_keys = ON`);
              console.log("DB lista con migraciones y FK activadas");
            } catch (error) {
              console.error("Error migrando la DB", error);
            }
          }}
        >
          <Stack screenOptions={{ headerShown: false }} />
        </SQLiteProvider>
      </Suspense>
    </AppContextProvider>
  );
}