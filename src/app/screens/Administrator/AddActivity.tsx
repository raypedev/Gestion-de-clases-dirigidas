import { useAppContext } from "@/src/context/AppContextProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
  const { usuario, setUsuario } = useAppContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const [nombre, setNombre] = useState("");
  const [dia, setDia] = useState("");
  const [hora, setHora] = useState("");
  const [iconoSeleccionado, setIconoSeleccionado] = useState(
    ICONOS_DISPONIBLES[0],
  );

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  const cerrarSesion = () => {
    setMenuVisible(false);
    setUsuario(null);
    router.replace("/");
  };

  async function guardarActividad() {
    if (!nombre.trim() || !dia.trim() || !hora.trim()) {
      Alert.alert(
        "Campos incompletos",
        "Por favor, rellena todos los datos antes de guardar.",
      );
      return;
    }

    try {
      await drizzleDb.insert(actividades).values({
        nombre: nombre.trim().toUpperCase(),
        dia: dia.trim().toUpperCase(),
        hora: hora.trim().toUpperCase(),
        icon: iconoSeleccionado.name,
      });

      Alert.alert("¡Éxito!", "La actividad se ha guardado correctamente.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Error detallado:", error);
      Alert.alert("Error al guardar", `Mensaje: ${error.message}`);
    }
  }

  return (
    <LinearGradient
      colors={["#e0f7f9", "#ffffff", "#e0f7f9"]}
      style={styles.mainContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ICONO DE PERFIL */}
        <TouchableOpacity
          style={styles.profileIconContainer}
          onPress={() => setMenuVisible(true)}
        >
          <MaterialCommunityIcons
            name="account-circle"
            size={45}
            color="#ccc"
          />
        </TouchableOpacity>

        {/* MODAL DE MENÚ ACTUALIZADO */}
        <Modal visible={menuVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.dropdownMenu}>
                <View style={styles.userInfoSection}>
                  <Text style={styles.userNameText}>
                    {usuario?.nick || "rayco"}
                  </Text>
                </View>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/screens/Administrator/Estadistics");
                  }}
                >
                  <Text style={styles.menuItemText}>Estadísticas</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.logoutItem}
                  onPress={cerrarSesion}
                >
                  <MaterialCommunityIcons
                    name="logout"
                    size={20}
                    color="#0a3d62"
                  />
                  <Text style={styles.logoutText}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* CABECERA */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={30}
              color="#0a3d62"
            />
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

            <Text style={styles.sectionLabel}>Selecciona un icono:</Text>
            <View style={styles.iconGrid}>
              {ICONOS_DISPONIBLES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.iconOption,
                    iconoSeleccionado.id === item.id &&
                      styles.iconOptionSelected,
                  ]}
                  onPress={() => setIconoSeleccionado(item)}
                >
                  <MaterialCommunityIcons
                    name={item.name as any}
                    size={26}
                    color={
                      iconoSeleccionado.id === item.id ? "#fff" : "#0a3d62"
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>

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
  profileIconContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  dropdownMenu: {
    position: "absolute",
    top: 100,
    right: 20,
    backgroundColor: "white",
    borderRadius: 20,
    width: 240,
    paddingVertical: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  userInfoSection: { paddingHorizontal: 20, paddingVertical: 10 },
  userNameText: { fontSize: 18, fontWeight: "bold", color: "#0a3d62" },
  menuDivider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 5 },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logoutText: {
    marginLeft: 12,
    color: "#0a3d62",
    fontWeight: "bold",
    fontSize: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  backButton: {
    padding: 10,
    zIndex: 10,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 40,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0a3d62",
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
    color: "#333",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#f0f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  iconOptionSelected: {
    backgroundColor: "#0a3d62",
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
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});
