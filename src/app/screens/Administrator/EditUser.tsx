import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- BASE DE DATOS ---
import { useAppContext } from "@/src/context/AppContextProvider";
import { usuarios } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

// Diccionario de Avatares completo (8)
const AVATARES: Record<string, any> = {
  av1: require("@/assets/images/avatar1.png"),
  av2: require("@/assets/images/avatar2.png"),
  av3: require("@/assets/images/avatar3.png"),
  av4: require("@/assets/images/avatar4.png"),
  av5: require("@/assets/images/avatar5.png"),
  av6: require("@/assets/images/avatar6.png"),
  av7: require("@/assets/images/avatar7.png"),
  av8: require("@/assets/images/avatar8.png"),
};

export const EditUser = () => {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);
  const { registrarVisita } = useAppContext();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(true);
  const [genero, setGenero] = useState("");
  const [avatar, setAvatar] = useState("av1");

  const opcionesGenero = [
    { label: "Mujer", value: "Mujer" },
    { label: "Hombre", value: "Hombre" },
    { label: "Prefiero no decir", value: "Prefiero no decir" },
  ];

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        const res = await drizzleDb
          .select()
          .from(usuarios)
          .where(eq(usuarios.id, Number(id)));

        if (res.length > 0) {
          setNombre(res[0].nombre);
          setCorreo(res[0].correo);
          setPassword(res[0].password);
          setGenero(res[0].genero || "");
          setAvatar(res[0].avatar || "av1");
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatosUsuario();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      registrarVisita(db, "Editar Usuario");
    }, []),
  );

  const actualizarUsuario = async () => {
    if (!nombre.trim() || !correo.trim() || !password.trim()) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }
    try {
      await drizzleDb
        .update(usuarios)
        .set({
          nombre: nombre.trim(),
          correo: correo.trim().toLowerCase(),
          password: password.trim(),
          genero: genero,
          avatar: avatar,
        })
        .where(eq(usuarios.id, Number(id)));

      Alert.alert("¡Actualizado!", "Usuario modificado correctamente", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar");
    }
  };

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0a3d62" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#e0f7f9", "#ffffff", "#e0f7f9"]}
      style={styles.mainContainer}
    >
      <SafeAreaView style={styles.safeArea}>
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
            <Text style={styles.headerTitle}>EDITAR</Text>
            <Text style={styles.headerSubtitle}>USUARIO</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <Text style={styles.labelCenter}>Selecciona tu Avatar</Text>

            <View style={styles.avatarPreviewSection}>
              <Image source={AVATARES[avatar]} style={styles.bigAvatar} />
            </View>

            {/* CONTENEDOR DE AVATARES CON SCROLL HORIZONTAL FORZADO */}
            <View style={styles.listWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.avatarListContainer}
              >
                {Object.keys(AVATARES).map((key) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setAvatar(key)}
                    style={[
                      styles.avatarOption,
                      avatar === key && styles.avatarOptionSelected,
                    ]}
                  >
                    <Image source={AVATARES[key]} style={styles.smallAvatar} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.divider} />

            <Text style={styles.label}>Nombre de Usuario</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
            />

            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={styles.label}>Género</Text>
            <View style={styles.genderContainer}>
              {opcionesGenero.map((opcion) => (
                <TouchableOpacity
                  key={opcion.label}
                  style={styles.genderOption}
                  onPress={() => setGenero(opcion.label)}
                >
                  <View
                    style={[
                      styles.circle,
                      genero === opcion.label && styles.circleSelected,
                    ]}
                  >
                    {genero === opcion.label && (
                      <View style={styles.innerCircle} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.genderLabel,
                      genero === opcion.label && styles.genderLabelSelected,
                    ]}
                  >
                    {opcion.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={actualizarUsuario}
            >
              <Text style={styles.saveButtonText}>GUARDAR CAMBIOS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.cancelContainer}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default EditUser;

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  backButton: { padding: 10 },
  headerTextContainer: { flex: 1, alignItems: "center", marginRight: 40 },
  headerTitle: { fontSize: 26, fontWeight: "900", color: "#0a3d62" },
  headerSubtitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0a3d62",
    fontStyle: "italic",
    marginTop: -10,
  },
  formCard: {
    backgroundColor: "#fff",
    marginHorizontal: 25,
    borderRadius: 35,
    padding: 25,
    elevation: 15,
  },
  labelCenter: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#555",
    marginBottom: 10,
  },
  avatarPreviewSection: { alignItems: "center", marginBottom: 15 },
  bigAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#0a3d62",
  },

  // Estilos corregidos para el scroll de avatares
  listWrapper: { width: "100%", height: 80, marginBottom: 10 },
  avatarListContainer: { paddingHorizontal: 5, alignItems: "center" },
  avatarOption: {
    padding: 3,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "transparent",
    marginRight: 12,
  },
  avatarOptionSelected: { borderColor: "#0a3d62", backgroundColor: "#e0f7f9" },
  smallAvatar: { width: 55, height: 55, borderRadius: 27.5 },

  divider: { height: 1, backgroundColor: "#eee", marginVertical: 15 },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  saveButton: {
    backgroundColor: "#002851",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelContainer: { marginTop: 20, alignItems: "center" },
  cancelText: { color: "#888", textDecorationLine: "underline" },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 25,
  },
  genderOption: { alignItems: "center" },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#eee",
    marginBottom: 5,
  },
  circleSelected: { borderColor: "#0a3d62" },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0a3d62",
  },
  genderLabel: { fontSize: 12, color: "#888" },
  genderLabelSelected: { color: "#0a3d62", fontWeight: "bold" },
});
