import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

// --- BASE DE DATOS ---
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { estadisticas, actividades, usuarios } from "@/src/db/schema"; // Asegúrate de importar tus tablas
import { desc, sql } from "drizzle-orm";

export const Estadisticas = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const [cargando, setCargando] = useState(true);
  const [statsPantallas, setStatsPantallas] = useState<any[]>([]);
  const [totalAppVisitas, setTotalAppVisitas] = useState(0);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      // 1. Obtener ranking de pantallas más visitadas
        const resPantallas = await drizzleDb
            .select({
                nombre_pantalla: estadisticas.nombre_pantalla,
                contador: sql<number>`CAST(count(${estadisticas.id}) AS INTEGER)`, // Cuenta cuántos usuarios únicos hay
            })
            .from(estadisticas)
            .groupBy(estadisticas.nombre_pantalla)
            .orderBy(desc(sql`count(${estadisticas.id})`));
      // 2. Calcular el total de visitas de toda la app
        const total = await drizzleDb
            .select({ total: sql<number>`CAST(count(${estadisticas.usuario_id}) AS INTEGER)` })
            .from(estadisticas);

            // --- DEBUG CRÍTICO ---
    console.log("¿Qué hay en resPantallas?:", resPantallas);
    console.log("¿Qué hay en total?:", total[0]?.total);
    // ---------------------

      setStatsPantallas(resPantallas);
      setTotalAppVisitas(total[0]?.total || 0);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setCargando(false);
    }
  };

 useFocusEffect(
  useCallback(() => {
    cargarDatos();
  }, [])
);

  return (
    <LinearGradient colors={["#0a3d62", "#3c6382"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard </Text>
        </View>

        {cargando ? (
          <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* CARD RESUMEN TOTAL */}
            <View style={styles.mainCard}>
              <Text style={styles.mainCardTitle}>Visitas Totales</Text>
              <Text style={styles.mainCardValue}>{totalAppVisitas}</Text>
              <Text style={styles.mainCardSub}>Interacciones registradas</Text>
            </View>

            {/* SECCIÓN RANKING DE PANTALLAS */}
            <Text style={styles.sectionTitle}>Uso por Pantalla</Text>
            {statsPantallas.map((item) => (
                // AQUÍ: Añadimos la key al contenedor principal de la fila
                <View key={item.nombre_pantalla} style={styles.statRow}> 
                    <View style={styles.rankBadge}>
                    {/* ... resto del código ... */}
                    </View>
                    
                    <View style={styles.infoContainer}>
                    <Text style={styles.screenName}>{item.nombre_pantalla}</Text>
                    {/* ... barra de progreso ... */}
                    </View>

                    <View style={styles.countContainer}>
                    <Text style={styles.countText}>{item.contador}</Text>
                    </View>
                </View>
                ))}

          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Estadisticas;

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 20 
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "white" },
  scrollContent: { padding: 20 },
  
  // Estilos de la tarjeta principal
  mainCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  mainCardTitle: { color: "#d1d8e0", fontSize: 16, textTransform: "uppercase" },
  mainCardValue: { color: "white", fontSize: 48, fontWeight: "bold", marginVertical: 5 },
  mainCardSub: { color: "#d1d8e0", fontSize: 12 },

  sectionTitle: { color: "white", fontSize: 18, fontWeight: "bold", marginBottom: 15 },

  // Filas de estadísticas
  statRow: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    alignItems: "center",
    elevation: 4,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  topRank: { backgroundColor: "#f39c12" },
  rankText: { fontWeight: "bold", color: "#2c3e50" },
  
  infoContainer: { flex: 1 },
  screenName: { fontSize: 16, fontWeight: "bold", color: "#2c3e50", marginBottom: 5 },
  progressBarBg: { height: 6, backgroundColor: "#f0f0f0", borderRadius: 3, width: "90%" },
  progressBarFill: { height: 6, backgroundColor: "#0a3d62", borderRadius: 3 },

  countContainer: { alignItems: "center" },
  countText: { fontSize: 18, fontWeight: "bold", color: "#0a3d62" },
  countLabel: { fontSize: 10, color: "#7f8c8d" }
});