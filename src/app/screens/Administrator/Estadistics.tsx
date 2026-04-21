import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

// --- BASE DE DATOS ---
import { estadisticas } from "@/src/db/schema";
import { usuarios } from "@/src/db/schema"; 
import { desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

const screenWidth = Dimensions.get("window").width;

export const Estadisticas = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const [cargando, setCargando] = useState(true);
  const [statsPantallas, setStatsPantallas] = useState<any[]>([]);
  const [totalAppVisitas, setTotalAppVisitas] = useState(0);
  const [statsGenero, setStatsGenero] = useState<any[]>([]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const resPantallas = await drizzleDb
        .select({
          nombre_pantalla: estadisticas.nombre_pantalla,
          contador: sql<number>`CAST(count(${estadisticas.id}) AS INTEGER)`,
        })
        .from(estadisticas)
        .groupBy(estadisticas.nombre_pantalla)
        .orderBy(desc(sql`count(${estadisticas.id})`));

      const totalVisitas = await drizzleDb
        .select({ total: sql<number>`CAST(count(*) AS INTEGER)` })
        .from(estadisticas);


        const resGenero = await drizzleDb
      .select({
        genero: usuarios.genero,
        cantidad: sql<number>`CAST(count(${usuarios.id}) AS INTEGER)`,
      })
      .from(usuarios)
      .groupBy(usuarios.genero);

      const colores: Record<string, string> = {
        "Masculino": "#0a3d62",
        "Femenino": "#6edae8",
        "No binario": "#f39c12",
        "Prefiero no decirlo": "#e74c3c",
        "Otro": "#f1c40f"
      };

      const dataPie = resGenero.map((item) => ({
        name: item.genero,
        population: item.cantidad,
        color: colores[item.genero] || "#ccc",
        legendFontColor: "#7f7f7f",
        legendFontSize: 12,
      }));

      setStatsGenero(dataPie);
      setStatsPantallas(resPantallas);
      setTotalAppVisitas(totalVisitas[0]?.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, []),
  );

  const dataGrafica = {
   labels: statsPantallas.length > 0
    ? statsPantallas.slice(0, 5).map((s) => {
        const nombre = s.nombre_pantalla;
        // Si es muy largo, lo cortamos a 8-10 caracteres
        return nombre.length > 10 ? nombre.substring(0, 8) + ".." : nombre;
      })
    : ["..."],
    datasets: [
      {
        data:
          statsPantallas.length > 0
            ? statsPantallas.slice(0, 5).map((s) => s.contador)
            : [0],
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    fillShadowGradientFrom: "#0a3d62",
    fillShadowGradientTo: "#6edae8",
    fillShadowGradientFromOpacity: 1,
    fillShadowGradientToOpacity: 0.8,
    color: (opacity = 1) => `rgba(10, 61, 98, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, 0.6)`,
    barPercentage: 0.7,
    decimalPlaces: 0,
    propsForLabels: { fontSize: 10, fontWeight: "bold" } as any,
  };

  return (
    <LinearGradient colors={["#0a3d62", "#e0f7f9"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={34}
              color="white"
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>ANALÍTICAS</Text>
            <Text style={styles.headerSubtitle}>Métricas de Rendimiento</Text>
          </View>
        </View>

        {cargando ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#6edae8" />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* GRÁFICA */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <MaterialCommunityIcons
                  name="chart-box-outline"
                  size={22}
                  color="#0a3d62"
                />
                <Text style={styles.chartTitle}>Uso por Pantalla (Top 5)</Text>
              </View>

              {statsPantallas.length > 0 && (
                <BarChart
                  data={dataGrafica}
                  width={screenWidth - 60}
                  height={240}
                  yAxisLabel="" // <--- SOLUCIÓN AL ERROR
                  yAxisSuffix="" // <--- SOLUCIÓN AL ERROR
                  chartConfig={chartConfig}
                  verticalLabelRotation={20}
                  fromZero
                  showValuesOnTopOfBars
                  style={styles.chartStyle}
                />
              )}
            </View>

            {/* RANKING */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ranking Detallado</Text>
              <View style={styles.badgeVisitas}>
                <Text style={styles.badgeText}>{totalAppVisitas} Visitas</Text>
              </View>
            </View>

            {statsPantallas.map((item, i) => (
              <View key={i} style={styles.statRow}>
                <LinearGradient
                  colors={
                    i === 0 ? ["#f1c40f", "#f39c12"] : ["#f0f4f7", "#e0e6ed"]
                  }
                  style={styles.rankBadge}
                >
                  <Text
                    style={[styles.rankText, i === 0 && { color: "white" }]}
                  >
                    {i + 1}
                  </Text>
                </LinearGradient>

                <View style={styles.infoContainer}>
                  <Text style={styles.screenName}>
                    {item.nombre_pantalla.toUpperCase()}
                  </Text>
                  <Text style={styles.countTextSub}>Interacciones únicas</Text>
                </View>

                <View style={styles.countTag}>
                  <Text style={styles.countNumber}>{item.contador}</Text>
                  <MaterialCommunityIcons
                    name={i === 0 ? "fire" : "trending-up"}
                    size={16}
                    color={i === 0 ? "#e67e22" : "#0a3d62"}
                  />
                </View>
              </View>
            ))}

            {/* GRÁFICA DE GÉNERO */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={22}
                  color="#0a3d62"
                />
                <Text style={styles.chartTitle}>Distribución por Género</Text>
              </View>

              {statsGenero.length > 0 ? (
                <PieChart
                  data={statsGenero}
                  width={screenWidth - 40}
                  height={180}
                  chartConfig={chartConfig}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
                  center={[10, 0]} // Ajusta esto para centrar el círculo
                  absolute // Muestra el número absoluto en lugar de porcentaje
                />
              ) : (
                <Text style={{ marginTop: 20, color: "#888" }}>No hay datos de usuarios</Text>
              )}
            </View>

          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "white",
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6edae8",
    fontWeight: "600",
    marginTop: -2,
  },
  scrollContent: { paddingBottom: 30, paddingHorizontal: 20 },
  loaderContainer: { flex: 1, justifyContent: "center" },

  chartCard: {
    backgroundColor: "white",
    borderRadius: 32,
    paddingVertical:30,   // Cambiamos padding general por vertical
    paddingHorizontal: 10, // Menos padding horizontal para dar espacio a la gráfica
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    marginVertical: 10,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0a3d62",
    marginLeft: 8,
  },
  chartStyle: { borderRadius: 20, paddingRight: 40, paddingLeft: 40, marginTop: 10, marginBottom: -20 },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  sectionTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  badgeVisitas: {
    backgroundColor: "#6edae8",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: { color: "#0a3d62", fontWeight: "900", fontSize: 11 },

  statRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 22,
    padding: 15,
    marginBottom: 12,
    alignItems: "center",
  },
  rankBadge: {
    width: 38,
    height: 38,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  rankText: { fontWeight: "900", fontSize: 18, color: "#0a3d62" },
  infoContainer: { flex: 1 },
  screenName: { fontSize: 14, fontWeight: "800", color: "#333" },
  countTextSub: { fontSize: 11, color: "#888", fontWeight: "600" },
  countTag: {
    alignItems: "center",
    backgroundColor: "#f0f4f7",
    padding: 8,
    borderRadius: 12,
    minWidth: 50,
  },
  countNumber: { fontSize: 16, fontWeight: "900", color: "#0a3d62" },
});

export default Estadisticas;
