import { usuarios } from "@/src/db/schema";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

export const verUsuarios = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema: { usuarios } });
  const { data: lista } = useLiveQuery(drizzleDb.select().from(usuarios));

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        Lista de Usuarios
      </Text>

      <FlatList
        data={lista}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{ padding: 10, borderBottomWidth: 1, borderColor: "#ccc" }}
          >
            <Text style={{ fontWeight: "bold" }}>{item.nombre}</Text>
            <Text>Email: {item.correo}</Text>
            <Text>Email: {item.correo}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No hay usuarios registrados.</Text>}
      />
    </View>
  );
};
export default verUsuarios;

const styles = StyleSheet.create({});
