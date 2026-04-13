import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export const EditUser = () => {
  // 1. Hooks de Configuración y Contexto (Siempre al principio)
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);
  const { registrarVisita } = useAppContext();

  // 2. Estados
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(true);
  const [genero, setGenero] = useState("");

  const opcionesGenero = [
    { label: "Mujer", value: "Mujer" },
    { label: "Hombre", value: "Hombre" },
    { label: "No binario", value: "No binario" },
    { label: "Prefiero no decir", value: "Prefiero no decir" },
  ];

  // 3. useEffect para cargar datos iniciales
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
          setGenero(res[0].genero);
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        Alert.alert("Error", "No se pudo cargar la información del usuario");
      } finally {
        setCargando(false);
      }
    };

    cargarDatosUsuario();
  }, [id]);

  // 4. useFocusEffect (Debe estar antes de cualquier 'return' temprano)
  useFocusEffect(
    useCallback(() => {
      registrarVisita(db, "Editar Usuario");
    }, []),
  );

  // 5. Función para actualizar
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
        })
        .where(eq(usuarios.id, Number(id)));

      Alert.alert(
        "¡Actualizado!",
        "El usuario se ha modificado correctamente",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error) {
      console.error("Error al actualizar:", error);
      Alert.alert("Error", "No se pudo actualizar el usuario");
    }
  };

  // 6. Retorno condicional de carga (Ahora es seguro usarlo aquí)
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

        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.formCard}>
            <View style={styles.avatarPreview}>
              <MaterialCommunityIcons
                name="account-edit"
                size={60}
                color="#0a3d62"
              />
            </View>

            <Text style={styles.label}>Nombre de Usuario</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej. Juan Pérez"
            />

            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="correo@ejemplo.com"
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Nueva contraseña"
            />

            <Text style={styles.label}>Género</Text>
            <View style={styles.genderContainer}>
              {opcionesGenero.map((opcion) => {
                const seleccionado = genero === opcion.label;
                return (
                  <TouchableOpacity
                    key={opcion.label}
                    style={styles.genderOption}
                    onPress={() => setGenero(opcion.label)}
                  >
                    <View
                      style={[
                        styles.circle,
                        seleccionado && styles.circleSelected,
                      ]}
                    >
                      {seleccionado && <View style={styles.innerCircle} />}
                    </View>
                    <Text
                      style={[
                        styles.genderLabel,
                        seleccionado && styles.genderLabelSelected,
                      ]}
                    >
                      {opcion.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
    marginBottom: 20,
  },
  backButton: { padding: 10, zIndex: 10 },
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarPreview: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#e0f7f9",
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignSelf: "center",
  },
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
    marginBottom: 20,
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
    justifyContent: "space-between",
    marginBottom: 25,
    marginTop: 10,
    paddingHorizontal: 5,
  },
  genderOption: {
    alignItems: "center",
    flex: 1,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#eee",
    marginBottom: 8,
  },
  circleSelected: {
    borderColor: "#0a3d62",
    backgroundColor: "#fff",
  },
  innerCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#0a3d62",
  },
  genderLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
    textAlign: "center",
  },
  genderLabelSelected: {
    color: "#0a3d62",
    fontWeight: "bold",
  },
});
