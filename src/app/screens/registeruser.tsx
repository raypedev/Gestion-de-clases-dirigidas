import { useAppContext } from "@/src/context/AppContextProvider";
import { usuarios } from "@/src/db/schema";
import MaskedView from "@react-native-masked-view/masked-view";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useState } from "react";
import {
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

export const RegistroUsuario = () => {
  const [textoNombre, setTextoNombre] = useState("");
  const [textoDNI, setTextoDNI] = useState("");
  const [textoMail, setTextoMail] = useState("");
  const [textoContraseña, setTextoContraseña] = useState("");
  const [genero, setGenero] = useState("");
  const [avatarSeleccionado, setAvatarSeleccionado] = useState("av1");

  const opcionesGenero = [
    "Femenino",
    "Masculino",
    "No binario",
    "Prefiero no decir",
    "Otro",
  ];

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema: { usuarios } });

  function navigateBack() {
    router.push({ pathname: "/" });
  }

  async function registrarPersona() {
    if (
      !textoNombre ||
      !textoDNI ||
      !textoMail ||
      !textoContraseña ||
      !genero
    ) {
      Alert.alert("Error", "Por favor, rellena todos los campos");
      return;
    }

    try {
      await drizzleDb.insert(usuarios).values({
        nombre: textoNombre,
        dni: textoDNI,
        correo: textoMail,
        password: textoContraseña,
        genero: genero,
        avatar: avatarSeleccionado,
      });

      Alert.alert("¡Bienvenido!", "Usuario registrado correctamente", [
        { text: "OK", onPress: () => router.push({ pathname: "/" }) },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        "Hubo un problema al registrar. Reinstala la app para actualizar la DB.",
      );
    }
  }

  const { registrarVisita } = useAppContext();

  useFocusEffect(
    useCallback(() => {
      registrarVisita(db, "Registrar Usuario");
    }, []),
  );

  return (
    <LinearGradient
      colors={["#e0f7f9", "#ffffff", "#e0f7f9"]}
      style={styles.mainContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* BOTÓN VOLVER ATRÁS */}
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <MaskedView
              style={styles.maskedView}
              maskElement={
                <View style={styles.maskElementContainer}>
                  <Text style={styles.logoText}>VITALITYFIT</Text>
                </View>
              }
            >
              <LinearGradient
                colors={["#0a3d62", "#3c6382", "#6edae8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientFill}
              />
            </MaskedView>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Crear Cuenta</Text>

            {/* --- SELECTOR DE 8 AVATARES EN CUADRÍCULA --- */}
            <Text style={styles.label}>Selecciona tu avatar:</Text>
            <View style={styles.avatarGrid}>
              {Object.keys(AVATARES).map((key) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setAvatarSeleccionado(key)}
                  style={[
                    styles.avatarItem,
                    avatarSeleccionado === key && styles.avatarItemSelected,
                  ]}
                >
                  <Image source={AVATARES[key]} style={styles.avatarImg} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Juan Pérez"
              onChangeText={setTextoNombre}
            />

            <Text style={styles.inputLabel}>DNI</Text>
            <TextInput
              style={styles.input}
              placeholder="12345678X"
              onChangeText={setTextoDNI}
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              onChangeText={setTextoMail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              onChangeText={setTextoContraseña}
              secureTextEntry
            />

            <Text style={styles.label}>Género:</Text>
            <View style={styles.genderContainer}>
              {opcionesGenero.map((opcion) => {
                const seleccionado = genero === opcion;
                return (
                  <TouchableOpacity
                    key={opcion}
                    style={styles.genderOption}
                    onPress={() => setGenero(opcion)}
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
                      {opcion}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={registrarPersona}
            >
              <Text style={styles.loginButtonText}>REGISTRARSE</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={navigateBack}>
              <Text style={styles.forgotPassword}>
                ¿Ya tienes cuenta? Inicia sesión
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RegistroUsuario;

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#0a3d62",
    fontWeight: "bold",
    fontSize: 16,
  },
  header: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  maskedView: { width: "100%", height: 60 },
  maskElementContainer: {
    backgroundColor: "transparent",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientFill: { flex: 1 },
  logoText: { fontSize: 38, fontWeight: "900", fontStyle: "italic" },

  formCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderRadius: 30,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0a3d62",
    marginBottom: 20,
  },

  // ESTILOS DE LA CUADRÍCULA DE 8 AVATARES
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  avatarItem: {
    margin: 5,
    padding: 3,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarItemSelected: {
    borderColor: "#0a3d62",
    backgroundColor: "#e0f7f9",
  },
  avatarImg: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },

  label: { fontSize: 15, fontWeight: "bold", color: "#555", marginBottom: 10 },
  inputLabel: { fontSize: 13, color: "#777", marginBottom: 5, marginLeft: 5 },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  genderContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  genderOption: {
    alignItems: "center",
    width: "45%",
    marginBottom: 10,
    flexDirection: "row",
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
  loginButton: {
    backgroundColor: "#0a3d62",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    elevation: 5,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
  forgotPassword: {
    textAlign: "center",
    marginTop: 20,
    color: "#0a3d62",
    fontWeight: "600",
  },
});
