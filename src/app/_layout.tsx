import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import React, { Suspense } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import migrations from "../../drizzle/migrations";
import AppContextProvider from "../context/AppContextProvider";
import { actividades, inscripciones, usuarios } from "../db/schema"; // <--- Añadido actividades aquí

// Cambiamos el nombre a prueba5 para forzar una base de datos limpia sin errores de migración previos
export const DATABASE_NAME = "prueba5Drizzle"; 

async function crearTablas(db: any) {
  // Aseguramos que actividades esté en el schema del objeto drizzle
  const drizzleDb = drizzle(db, { schema: { usuarios, inscripciones, actividades } });

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

  // --- NUEVA TABLA ACTIVIDADES ---
  await drizzleDb.run(sql`
    CREATE TABLE IF NOT EXISTS actividades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      dia TEXT NOT NULL,
      hora TEXT NOT NULL,
      icon TEXT NOT NULL
    );
  `);

  // --- NUEVA TABLA ESTADISTICAS ---
  await drizzleDb.run(sql`
    CREATE TABLE IF NOT EXISTS estadisticas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_pantalla TEXT NOT NULL,
      usuario_id TEXT NOT NULL
    );
  `);


  console.log("Tablas aseguradas (usuarios, inscripciones y actividades)");
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
              // Inicializamos drizzle con todas las tablas
              const db = drizzle(database, { schema: { usuarios, inscripciones, actividades } });
              
              // 1. Forzamos la creación manual para evitar fallos de "no such table"
              await crearTablas(database); 
              
              // 2. Intentamos migrar el resto (si las migraciones fallan, las tablas manuales ya están listas)
              try {
                await migrate(db, migrations);
              } catch (migError) {
                console.log("Aviso: Migraciones saltadas o ya aplicadas");
              }

              await database.execAsync(`PRAGMA foreign_keys = ON`);
              console.log("DB lista y configurada");
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