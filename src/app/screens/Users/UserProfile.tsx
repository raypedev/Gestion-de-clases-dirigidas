import { useAppContext } from "@/src/context/AppContextProvider";
import { usuarios } from "@/src/db/schema";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 1. Diccionario de Avatares (Asegúrate de que las rutas sean correctas)
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

export default function UserProfile() {
  const { usuario, setUsuario } = useAppContext();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [editando, setEditando] = useState(false);
  const [genero, setGenero] = useState("");
  const [avatar, setAvatar] = useState("av1");

  // Géneros actualizados (sin no binario)
  const opcionesGenero = [
    { label: "Mujer", value: "Mujer" },
    { label: "Hombre", value: "Hombre" },
    { label: "Otros", value: "Otros" },
    { label: "Prefiero no decir", value: "Prefiero no decir" },
  ];

  useEffect(() => {
    async function cargarDatosUsuario() {
      if (!usuario) return;
      try {
        const res = await drizzleDb
          .select()
          .from(usuarios)
          .where(eq(usuarios.id, Number(usuario.id)));

        if (res.length > 0) {
          setNombre(res[0].nombre);
          setDni(res[0].dni || "");
          setPassword(res[0].password);
          setEmail(res[0].correo);
          setGenero(res[0].genero || "");
          setAvatar(res[0].avatar || "av1");
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error);
      }
    }
    cargarDatosUsuario();
  }, [usuario]);

  const guardarCambios = async () => {
    if (!nombre.trim() || !password.trim()) {
      Alert.alert("Error", "El nombre y la contraseña no pueden estar vacíos");
      return;
    }

    try {
      await drizzleDb
        .update(usuarios)
        .set({
          nombre: nombre,
          dni: dni,
          password: password,
          genero: genero,
          avatar: avatar, // Guardamos el nuevo avatar
        })
        .where(eq(usuarios.id, Number(usuario!.id)));

      // Actualizamos el contexto global
      setUsuario({
        ...usuario!,
        nick: nombre,
        avatar: avatar, // Añadimos el avatar al contexto para que cambie en toda la app
      });

      setEditando(false);
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (error) {
      Alert.alert("Error", "No se pudieron guardar los cambios");
    }
  };

  const { registrarVisita } = useAppContext();
  useFocusEffect(
    useCallback(() => {
      registrarVisita(db, "Mi Perfil");
    }, [usuario]),
  );

  return (
    <LinearGradient colors={["#e0f7f9", "#ffffff"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={28}
                color="#0a3d62"
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>MI PERFIL</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              {/* --- SECCIÓN DE AVATAR (EDITABLE O VISTA) --- */}
              <View style={styles.avatarSection}>
                {editando ? (
                  <>
                    <Text style={styles.labelCenter}>Cambiar Avatar</Text>
                    <View style={styles.avatarGrid}>
                      {Object.keys(AVATARES).map((key) => (
                        <TouchableOpacity
                          key={key}
                          onPress={() => setAvatar(key)}
                          style={[
                            styles.avatarItem,
                            avatar === key && styles.avatarItemSelected,
                          ]}
                        >
                          <Image
                            source={AVATARES[key]}
                            style={styles.avatarImgSmall}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                ) : (
                  <View style={styles.avatarViewContainer}>
                    <Image
                      source={AVATARES[avatar]}
                      style={styles.avatarImgLarge}
                    />
                    <Text style={styles.welcomeText}>¡Hola, {nombre}!</Text>
                  </View>
                )}
              </View>

              {/* Correo (Solo lectura siempre) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo Electrónico</Text>
                <View style={styles.emailDisplay}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={20}
                    color="#888"
                  />
                  <Text style={styles.emailText}>{email || "..."}</Text>
                </View>
              </View>

              {/* Nombre */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre Completo</Text>
                <TextInput
                  style={[styles.input, !editando && styles.disabledInput]}
                  value={nombre}
                  onChangeText={setNombre}
                  editable={editando}
                />
              </View>

              {/* DNI */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>DNI</Text>
                <TextInput
                  style={[styles.input, !editando && styles.disabledInput]}
                  value={dni}
                  onChangeText={setDni}
                  editable={editando}
                />
              </View>

              {/* Contraseña */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={[styles.input, !editando && styles.disabledInput]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!editando}
                  editable={editando}
                />
              </View>

              {/* Género */}
              <Text style={styles.label}>Género</Text>
              <View style={styles.genderContainer}>
                {opcionesGenero.map((opcion) => {
                  const seleccionado = genero === opcion.label;
                  return (
                    <TouchableOpacity
                      key={opcion.label}
                      style={styles.genderOption}
                      onPress={() => editando && setGenero(opcion.label)}
                      disabled={!editando}
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

              {/* Botones */}
              {!editando ? (
                <TouchableOpacity
                  style={styles.mainBtn}
                  onPress={() => setEditando(true)}
                >
                  <MaterialCommunityIcons
                    name="account-edit"
                    size={20}
                    color="white"
                  />
                  <Text style={styles.btnText}>EDITAR PERFIL</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.cancelBtn]}
                    onPress={() => setEditando(false)}
                  >
                    <Text style={styles.btnText}>CANCELAR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.saveBtn]}
                    onPress={guardarCambios}
                  >
                    <Text style={styles.btnText}>GUARDAR</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 2,
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#0a3d62" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "white",
    borderRadius: 35,
    padding: 25,
    elevation: 8,
  },

  // Avatar Estilos
  avatarSection: { marginBottom: 20, alignItems: "center" },
  avatarViewContainer: { alignItems: "center" },
  avatarImgLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#0a3d62",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },
  avatarItem: {
    margin: 5,
    padding: 3,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarItemSelected: { borderColor: "#0a3d62", backgroundColor: "#e0f7f9" },
  avatarImgSmall: { width: 45, height: 45, borderRadius: 22.5 },
  labelCenter: {
    fontSize: 13,
    color: "#0a3d62",
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
  },

  welcomeText: {
    fontSize: 16,
    color: "#0a3d62",
    marginTop: 10,
    fontWeight: "bold",
  },
  inputGroup: { marginBottom: 15 },
  label: {
    fontSize: 13,
    color: "#0a3d62",
    marginBottom: 8,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 15,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#eee",
    color: "#333",
  },
  disabledInput: {
    backgroundColor: "#f2f2f2",
    color: "#777",
    borderColor: "#ececec",
  },
  emailDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ececec",
  },
  emailText: { marginLeft: 10, fontSize: 16, color: "#888" },
  genderContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  genderOption: {
    alignItems: "center",
    width: "48%",
    flexDirection: "row",
    marginBottom: 10,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 8,
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
  mainBtn: {
    backgroundColor: "#0a3d62",
    flexDirection: "row",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, padding: 16, borderRadius: 20, alignItems: "center" },
  saveBtn: { backgroundColor: "#2ecc71" },
  cancelBtn: { backgroundColor: "#e74c3c" },
  btnText: { color: "white", fontWeight: "bold" },
});
