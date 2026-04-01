import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- IMPORTACIONES DE BASE DE DATOS ---
import { actividades } from "@/src/db/schema";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

const ICONOS_DISPONIBLES = [
  { id: "1", name: "meditation", label: "Yoga" },
  { id: "2", name: "human-female-dance", label: "Zumba" },
  { id: "3", name: "bike", label: "Spinning" },
  { id: "4", name: "weight-lifter", label: "GAP" },
  { id: "5", name: "run-fast", label: "Cardio/Running" },
  { id: "6", name: "arm-flex", label: "Fuerza" },
];

export const AnadirActividad = () => {
  const [nombre, setNombre] = useState("");
  const [dia, setDia] = useState("");
  const [hora, setHora] = useState("");
  const [iconoSeleccionado, setIconoSeleccionado] = useState(ICONOS_DISPONIBLES[0]);

  // Inicializamos la conexión a la BD
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  // FUNCIÓN PARA GUARDAR EN SQLITE
  async function guardarActividad() {
    // 1. Validación de campos vacíos
    if (!nombre.trim() || !dia.trim() || !hora.trim()) {
      Alert.alert("Campos incompletos", "Por favor, rellena todos los datos antes de guardar.");
      return;
    }

    try {
      console.log("Intentando guardar actividad...");

      // 2. INSERT REAL USANDO DRIZZLE
      await drizzleDb.insert(actividades).values({
        nombre: nombre.trim().toUpperCase(),
        dia: dia.trim().toUpperCase(),
        hora: hora.trim().toUpperCase(),
        icon: iconoSeleccionado.name,
      });

      // 3. Éxito
      Alert.alert("¡Éxito!", "La actividad se ha guardado correctamente.", [
        { text: "OK", onPress: () => router.back() }
      ]);

    } catch (error: any) {
      // 4. Captura de errores (Si sale "no such table", debes borrar la app y reinstalar)
      console.error("Error detallado:", error);
      Alert.alert("Error al guardar", `Mensaje: ${error.message}`);
    }
  }

  function volver() {
    router.back();
  }

  return (
    <LinearGradient
      colors={["#e0f7f9", "#ffffff", "#e0f7f9"]}
      style={styles.mainContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* CABECERA */}
        <View style={styles.header}>
          <TouchableOpacity onPress={volver} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={30} color="#0a3d62" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>NUEVA</Text>
            <Text style={styles.headerSubtitle}>ACTIVIDAD</Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <Text style={styles.cardLabel}>Detalles de la clase</Text>

            {/* INPUTS */}
            <TextInput
              style={styles.input}
              placeholder="NOMBRE (EJ. YOGA, ZUMBA...)"
              placeholderTextColor="#888"
              value={nombre}
              onChangeText={setNombre}
            />

            <TextInput
              style={styles.input}
              placeholder="DÍA (EJ. LUNES)"
              placeholderTextColor="#888"
              value={dia}
              onChangeText={setDia}
            />

            <TextInput
              style={styles.input}
              placeholder="HORA (EJ. 10:00 AM)"
              placeholderTextColor="#888"
              value={hora}
              onChangeText={setHora}
            />

            {/* SELECTOR DE ICONOS */}
            <Text style={styles.sectionLabel}>Selecciona un icono:</Text>
            <View style={styles.iconGrid}>
              {ICONOS_DISPONIBLES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.iconOption,
                    iconoSeleccionado.id === item.id && styles.iconOptionSelected
                  ]}
                  onPress={() => setIconoSeleccionado(item)}
                >
                  <MaterialCommunityIcons 
                    name={item.name as any} 
                    size={26} 
                    color={iconoSeleccionado.id === item.id ? "#fff" : "#0a3d62"} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* VISTA PREVIA */}
            <View style={styles.previewContainer}>
               <Text style={styles.iconLabel}>Vista previa:</Text>
               <View style={styles.iconCircle}>
                  <MaterialCommunityIcons 
                    name={iconoSeleccionado.name as any} 
                    size={45} 
                    color="#0a3d62" 
                  />
               </View>
               <Text style={styles.sectionLabel}>{iconoSeleccionado.label}</Text>
            </View>

            {/* BOTÓN GUARDAR */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={guardarActividad}
            >
              <Text style={styles.loginButtonText}>GUARDAR ACTIVIDAD</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default AnadirActividad;

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  backButton: {
    padding: 10,
    position: "absolute",
    left: 10,
    zIndex: 10,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0a3d62",
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#0a3d62",
    fontStyle: "italic",
    marginTop: -10,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 25,
    marginBottom: 40,
    paddingHorizontal: 25,
    paddingVertical: 30,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
    textTransform: "uppercase",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#eee",
    color: "#333",
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f0f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0a3d6220',
  },
  iconOptionSelected: {
    backgroundColor: '#0a3d62',
    borderColor: '#0a3d62',
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  iconLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  iconCircle: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: "#e0f7f9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0a3d62",
  },
  loginButton: {
    backgroundColor: "#0a3d62",
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#0a3d62",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },
});