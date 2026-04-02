import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- BASE DE DATOS ---
// Asegúrate de que 'usuarios' esté exportado en tu schema.ts
import { usuarios } from "@/src/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

export const userList = () => {
  const [listaUsuarios, setListaUsuarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  // Función para cargar usuarios desde SQLite
  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const res = await drizzleDb.select().from(usuarios);
      setListaUsuarios(res);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setCargando(false);
    }
  };

  // Recargar cada vez que la pantalla gane el foco
  useFocusEffect(
    useCallback(() => {
      cargarUsuarios();
    }, []),
  );

  return (
    <LinearGradient
      colors={["#e0f7f9", "#ffffff", "#e0f7f9"]}
      style={styles.mainContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Encabezado igual al de Actividades */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>USUARIOS</Text>
          <Text style={styles.headerSubtitle}>REGISTRADOS</Text>
        </View>

        <View style={styles.formCard}>
          {cargando ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#0a3d62" />
            </View>
          ) : (
            <FlatList
              data={listaUsuarios}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <View style={styles.userRow}>
                  <View style={styles.avatarContainer}>
                    <MaterialCommunityIcons
                      name="account"
                      size={28}
                      color="#0a3d62"
                    />
                  </View>

                  <View style={styles.textContainer}>
                    <Text style={styles.userName}>{item.nombre}</Text>
                    <Text style={styles.userEmail}>{item.correo}</Text>
                    <Text style={styles.userPassword}>
                      Pass: {item.password}
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="#ccc"
                  />
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No hay usuarios en la base de datos.
                </Text>
              }
            />
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/Pantallas/registeruser")}
            >
              <Text style={styles.actionButtonText}>AÑADIR USUARIO</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.cancelContainer}
            >
              <Text style={styles.cancelText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default userList;

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  header: { alignItems: "center", paddingVertical: 20, marginTop: 20 },
  headerTitle: { fontSize: 24, fontWeight: "900", color: "#0a3d62" },
  headerSubtitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0a3d62",
    fontStyle: "italic",
    marginTop: -8,
  },
  formCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 35,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#e0f7f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 14, color: "#666", marginTop: 2 },
  userPassword: { fontSize: 12, color: "#aaa", fontStyle: "italic" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40 },
  backButton: {
    backgroundColor: "#0a3d62",
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
  cancelContainer: { marginTop: 15 },
  backButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  actionButton: {
    backgroundColor: "#002851",
    borderRadius: 20,
    paddingVertical: 18,
    width: "100%",
    alignItems: "center",
  },
  actionButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelText: { color: "#888", textDecorationLine: "underline" },
  footer: { marginTop: 10, alignItems: "center" },
});
