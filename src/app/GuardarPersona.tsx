import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { personas } from "../db/schema";

const GuardarPersona = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema: { personas } });
  const { data: lista } = useLiveQuery(drizzleDb.select().from(personas));

  async function almacenarPersona() {
    let edadAleatoria = Math.trunc(Math.random() * 100);
    let nombreAleatorio = "persona_" + Math.trunc(Math.random() * 10000);
    await drizzleDb
      .insert(personas)
      .values({ nombre: nombreAleatorio, edad: edadAleatoria });
  }

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "flex-start", alignItems: "center" }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Guardar Persona
      </Text>
      <Button title="Guardar Persona" onPress={almacenarPersona} />
      <View style={{ marginTop: 20, flex: 1 }}>
        <Text>Lista de personas guardadas:</Text>
        {lista?.map((p) => (
          <Text key={p.id}>
            {p.id} - {p.nombre} - {p.edad} años
          </Text>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default GuardarPersona;

const styles = StyleSheet.create({});
