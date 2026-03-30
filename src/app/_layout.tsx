import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import React, { Suspense } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import migrations from "../../drizzle/migrations";
import AppContextProvider from "../context/AppContextProvider";
type Props = {};
export const DATABASE_NAME = "prueba4Drizzle";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>Cargando la app...</Text>
    </View>
  );
}
const RootLayout = (props: Props) => {
  return (
    <AppContextProvider>
      <Suspense fallback={<LoadingScreen />}>
        <SQLiteProvider
          databaseName={DATABASE_NAME}
          options={{ enableChangeListener: true }}
          useSuspense
          onInit={async (database) => {
            try {
              console.log("Simulando carga lenta...");
              await sleep(2000); // 2 segundos retraso
              const db = drizzle(database);
              await migrate(db, migrations);
              console.log("Migration success");

              // Activa FK aquí (después de migraciones)
              await db.run(sql`PRAGMA foreign_keys = ON`);
              console.log("Foreign keys enabled");
            } catch (error) {
              console.error("Migration error", error);
            }
          }}
        >
          <Stack screenOptions={{ headerShown: false }} />
        </SQLiteProvider>
      </Suspense>
    </AppContextProvider>
  );
};

export default RootLayout;
