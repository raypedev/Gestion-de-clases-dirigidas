import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- BASE DE DATOS ---
import { actividades, inscripciones, usuarios } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

export const ActivityDetails = () => {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();

  const drizzleDb = drizzle(db, {
    schema: { usuarios, inscripciones, actividades },
  });

  const [cargando, setCargando] = useState(true);
  const [usuariosInscritos, setUsuariosInscritos] = useState<any[]>([]);
  const [infoActividad, setInfoActividad] = useState<any>(null);

  const cargarDatos = async () => {
    if (!id) return;

    try {
      setCargando(true);

      // 1. Obtener información de la actividad
      const act = await drizzleDb
        .select()
        .from(actividades)
        .where(eq(actividades.id, Number(id)));

      if (act.length > 0) {
        setInfoActividad(act[0]);
      }

      // 2. Obtener usuarios mediante JOIN
      const res = await drizzleDb
        .select({
          id: usuarios.id,
          nick: usuarios.nombre,
          email: usuarios.correo,
        })
        .from(inscripciones)
        .innerJoin(usuarios, eq(inscripciones.usuarioId, usuarios.id))
        .where(eq(inscripciones.actividadId, Number(id)));

      setUsuariosInscritos(res);
    } catch (error) {
      console.error("Error al cargar detalles:", error);
    } finally {
      setCargando(false);
    }
  };

  // FUNCIÓN PARA CANCELAR RESERVA
  const cancelarReserva = (usuarioId: number, nombreUsuario: string) => {
    Alert.alert(
      "Cancelar Reserva",
      `¿Estás seguro de que quieres eliminar a ${nombreUsuario} de esta actividad?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await drizzleDb
                .delete(inscripciones)
                .where(
                  and(
                    eq(inscripciones.usuarioId, usuarioId),
                    eq(inscripciones.actividadId, Number(id)),
                  ),
                );
              Alert.alert("Éxito", "Reserva cancelada correctamente");
              cargarDatos(); // Recargar la lista
            } catch (error) {
              console.error("Error al cancelar:", error);
              Alert.alert("Error", "No se pudo cancelar la reserva");
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  return (
    <LinearGradient
      colors={["#e0f7f9", "#ffffff", "#e0f7f9"]}
      style={styles.mainContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>RESERVAS DE</Text>
          <Text style={styles.headerSubtitle}>
            {infoActividad?.nombre?.toUpperCase() || "CARGANDO..."}
          </Text>
        </View>

        <View style={styles.formCard}>
          {cargando ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#0a3d62" />
              <Text style={{ marginTop: 10, color: "#0a3d62" }}>
                Buscando reservas...
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.infoBar}>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={22}
                  color="#0a3d62"
                />
                <Text style={styles.infoBarText}>
                  {infoActividad?.dia} — {infoActividad?.hora}
                </Text>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {usuariosInscritos.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons
                      name="account-off-outline"
                      size={50}
                      color="#ccc"
                    />
                    <Text style={styles.emptyText}>
                      No hay usuarios inscritos aún.
                    </Text>
                  </View>
                ) : (
                  usuariosInscritos.map((user) => (
                    <View key={user.id} style={styles.userRow}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {user.nick?.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.userNick}>{user.nick}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                      </View>

                      {/* BOTÓN PARA CANCELAR RESERVA */}
                      <TouchableOpacity
                        onPress={() => cancelarReserva(user.id, user.nick)}
                        style={styles.deleteButton}
                      >
                        <MaterialCommunityIcons
                          name="trash-can-outline"
                          size={24}
                          color="#e74c3c"
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            </>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>VOLVER A LA LISTA</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ActivityDetails;

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  header: { alignItems: "center", paddingVertical: 20 },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#0a3d62" },
  headerSubtitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0a3d62",
    fontStyle: "italic",
    marginTop: -5,
  },
  formCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 30,
    padding: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  infoBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f7f9",
    padding: 12,
    borderRadius: 15,
    marginBottom: 20,
  },
  infoBarText: {
    marginLeft: 10,
    fontWeight: "bold",
    color: "#0a3d62",
    fontSize: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#0a3d62",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  userInfo: { flex: 1 },
  userNick: { fontSize: 17, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 13, color: "#777" },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 16,
    marginTop: 10,
  },
  backButton: {
    backgroundColor: "#0a3d62",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
  backButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
