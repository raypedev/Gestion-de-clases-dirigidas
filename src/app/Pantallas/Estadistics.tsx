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
  const [statsGeneros, setStatsGeneros] = useState<any[]>([]); // Nuevo estado
  const [totalAppVisitas, setTotalAppVisitas] = useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0); // Para el % de género

  const cargarDatos = async () => {
    try {
      setCargando(true);

      // 1. Ranking de pantallas
      const resPantallas = await drizzleDb
        .select({
          nombre_pantalla: estadisticas.nombre_pantalla,
          contador: sql<number>`CAST(count(${estadisticas.id}) AS INTEGER)`,
        })
        .from(estadisticas)
        .groupBy(estadisticas.nombre_pantalla)
        .orderBy(desc(sql`count(${estadisticas.id})`));

      // 2. Total visitas (denominador para la barra de progreso)
      const totalVisitas = await drizzleDb
        .select({ total: sql<number>`CAST(count(*) AS INTEGER)` })
        .from(estadisticas);

      // 3. Distribución de Géneros
      const resGeneros = await drizzleDb
        .select({
          genero: usuarios.genero,
          cantidad: sql<number>`CAST(count(${usuarios.id}) AS INTEGER)`,
        })
        .from(usuarios)
        .groupBy(usuarios.genero);

      // 4. Total Usuarios (denominador para el % de género)
      const resTotalU = await drizzleDb
        .select({ total: sql<number>`CAST(count(*) AS INTEGER)` })
        .from(usuarios);

      setStatsPantallas(resPantallas);
      setTotalAppVisitas(totalVisitas[0]?.total || 0);
      setStatsGeneros(resGeneros);
      setTotalUsuarios(resTotalU[0]?.total || 0);

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

  // ... (aquí iría el return con el map que completamos antes)
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
            {statsPantallas.map((item, i) => (
            <View key={item.nombre_pantalla} style={styles.statRow}> 
              
              {/* BADGE DE RANKING CON PODIO */}
              <View style={[
                styles.rankBadge, 
                i === 0 && styles.goldBadge,   // Oro
                i === 1 && styles.silverBadge, // Plata
                i === 2 && styles.bronzeBadge  // Bronce
              ]}>
                <Text style={[
                  styles.rankText, 
                  (i >= 0 && i <= 2) && { color: 'white' } // Texto blanco para los 3 primeros
                ]}>
                  {i + 1}
                </Text>
              </View>
              
              <View style={styles.infoContainer}>
                <Text style={styles.screenName}>{item.nombre_pantalla}</Text>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: totalAppVisitas > 0 ? `${(item.contador / totalAppVisitas) * 100}%` : "0%" },
                      i === 0 && { backgroundColor: '#f39c12' }, // Barra también dorada para el top 1
                    ]} 
                  />
                </View>
              </View>

              <View style={styles.countContainer}>
                <Text style={styles.countText}>{item.contador}</Text>
                <Text style={styles.countLabel}>visitas</Text>
              </View>
            </View>
          ))}

                <View style={styles.mainCard}>
                  <Text style={styles.sectionTitle2}>Distribución de Género</Text>
                  {statsGeneros.length > 0 ? (
                    statsGeneros.map((item, index) => (
                      <View key={index} style={styles.genderRow}>
                        <Text style={styles.genderText}>{item.genero || "No especificado"}</Text>
                        <Text style={styles.genderPercentage}>
                          {totalUsuarios > 0 
                            ? ((item.cantidad / totalUsuarios) * 100).toFixed(1) 
                            : 0}% 
                          <Text style={styles.genderCount}> ({item.cantidad})</Text>
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{ color: 'white', opacity: 0.6 }}>No hay datos de usuarios</Text>
                  )}
                </View>

          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Estadisticas;

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  safeArea: { 
    flex: 1 
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 25, 
    paddingVertical: 20 
  },
  backButton: { 
    padding: 8 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: "900", 
    color: "white", 
    fontStyle: "italic",
    letterSpacing: 1 
  },
  scrollContent: { 
    paddingBottom: 40 
  },
  
  // --- TARJETA PRINCIPAL (Inspirada en formCard) ---
  mainCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 25,
    borderRadius: 30,
    padding: 25,
    alignItems: "center",
    marginBottom: 25,
    // Sombra marcada estilo "Principal"
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  mainCardTitle: { 
    color: "#777", 
    fontSize: 14, 
    textTransform: "uppercase", 
    fontWeight: "700",
    letterSpacing: 1
  },
  mainCardValue: { 
    color: "#0a3d62", // Azul de la principal
    fontSize: 48, 
    fontWeight: "900", 
    marginVertical: 5 
  },
  mainCardSub: { 
    color: "#888", 
    fontSize: 12,
    fontWeight: "500"
  },

  sectionTitle: { 
    color: "white", 
    fontSize: 18, 
    fontWeight: "800", 
    marginBottom: 15, 
    marginHorizontal: 30,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  sectionTitle2: { 
    color: "#0a3d62", 
    fontSize: 18, 
    fontWeight: "800", 
    marginBottom: 15, 
    marginHorizontal: 30,
    textTransform: "uppercase",
    letterSpacing: 1
  },

  // --- FILAS DE ESTADÍSTICAS (Coherentes con inputs/cards) ---
  statRow: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 25,
    borderRadius: 20,
    padding: 15,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 12, // Menos redondeado para parecerse a los botones
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  goldBadge: { backgroundColor: "#f1c40f", borderColor: "#f1c40f" },
  silverBadge: { backgroundColor: "#bdc3c7", borderColor: "#bdc3c7" },
  bronzeBadge: { backgroundColor: "#cd7f32", borderColor: "#cd7f32" },
  
  rankText: { 
    fontWeight: "bold", 
    color: "#0a3d62",
    fontSize: 16,
  },
  infoContainer: { 
    flex: 1 
  },
  screenName: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: "#333", 
    marginBottom: 6 
  },
  progressBarBg: { 
    height: 8, 
    backgroundColor: "#f0f0f0", 
    borderRadius: 4, 
    width: "95%" 
  },
  progressBarFill: { 
    height: 8, 
    backgroundColor: "#0a3d62", // El azul de tus botones principales
    borderRadius: 4 
  },

  countContainer: { 
    alignItems: "flex-end",
    paddingLeft: 10
  },
  countText: { 
    fontSize: 18, 
    fontWeight: "800", 
    color: "#0a3d62" 
  },
  countLabel: { 
    fontSize: 10, 
    color: "#999",
    textTransform: "uppercase"
  },

  // --- DISTRIBUCIÓN DE GÉNERO (Dentro de mainCard blanca) ---
  genderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%', 
    marginTop: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0' // Gris suave sobre blanco
  },
  genderText: { 
    color: '#444', 
    fontSize: 15,
    fontWeight: "600" 
  },
  genderPercentage: { 
    color: '#0a3d62', 
    fontWeight: '800', 
    fontSize: 15 
  },
  genderCount: { 
    fontWeight: '400', 
    color: "#999", 
    fontSize: 12 
  },
});