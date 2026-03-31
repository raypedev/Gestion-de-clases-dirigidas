import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { usuarios } from "@/src/db/schema";
import MaskedView from "@react-native-masked-view/masked-view";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const RegistroUsuario = () => {
  // 1. Crear los estados para almacenar los valores
  const [textoNombre, setTextoNombre] = useState("");
  const [textoDNI, setTextoDNI] = useState("");
  const [textoMail, setTextoMail] = useState("");
  const [textoContraseña, setTextoContraseña] = useState("")

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema: { usuarios } });
  // Este Hook siempre tiene la versión más reciente de la tabla.
  // SE ACTUALIZA SOLO cuando detecta un insert/update/delete.
  const { data: lista } = useLiveQuery(drizzleDb.select().from(usuarios));

  function navigateBack() {
    router.push({ pathname: "/" }); // Vuelve a la pantalla principal
  }

  async function registrarPersona() {
    // Validar que todos los campos estén llenos
    if (!textoNombre || !textoDNI || !textoMail || !textoContraseña) {
      Alert.alert("Error", "Por favor, rellena todos los campos");
      return;
    }

    // Insertar en SQLite usando Drizzle
    await drizzleDb.insert(usuarios).values({
      nombre: textoNombre,
      dni: textoDNI,
      correo: textoMail,
      // password: textoContraseña,Por ahora trabajamos con el password default(123456)
    });

    // Mostrar mensaje y volver al login
    Alert.alert(
      "Registro completado",
      "Usuario registrado correctamente",
      [
        {
          text: "OK",
          onPress: () => router.push({ pathname: "/" }), // vuelve al login
        },
      ]
    );
  }

  return (
    <LinearGradient
      colors={["#e0f7f9", "#ffffff", "#e0f7f9"]}
      style={styles.mainContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* LOGO CON DEGRADADO */}
        <View style={styles.header}>
          <MaskedView
            style={styles.maskedView}
            maskElement={
              <View style={styles.maskElementContainer}>
                <Text style={styles.logoText}>FITCONTROL</Text>
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
          {/* TARJETA DE REGISTRO */}
          <Text style={styles.cardTitle}>Registro</Text>
          <Text>Nombre: </Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            onChangeText={setTextoNombre} // 4. Escucha cambios
            placeholderTextColor="#888"
          />
          <Text>DNI: </Text>
          <TextInput
            style={styles.input}
            placeholder="DNI"
            onChangeText={setTextoDNI}
            placeholderTextColor="#888"
          />
          <Text>Correo electrónico: </Text>
          <TextInput
            style={styles.input}
            placeholder="mail"
            onChangeText={setTextoMail}
            placeholderTextColor="#888"
          />

          <Text>Contraseña: </Text>
          <TextInput
            style={styles.input}
            placeholder="contraseña"
            onChangeText={setTextoContraseña}
            placeholderTextColor="#888"
          />
          <TouchableOpacity
            style={styles.loginButton}
            onPress={registrarPersona}
          >
            <Text style={styles.loginButtonText}>Registrarse</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={navigateBack}>
            <Text style={styles.forgotPassword}>
              Volver al inicio de sesión
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};
export default RegistroUsuario;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flex: 1.5, 
    justifyContent: "center",
    alignItems: "center",
  },
  maskedView: {
    width: "100%",
    height: 80,
  },
  maskElementContainer: {
    backgroundColor: "transparent",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientFill: {
    flex: 1,
  },
  logoText: {
    fontSize: 48,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -2,
  },
  // --- ESTILOS DE RESALTE ---
  formCard: {
    backgroundColor: "#FFFFFF", 
    marginHorizontal: 25,
    marginBottom: 60,
    paddingHorizontal: 25,
    paddingVertical: 35,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#eee",
    color: "#333",
  },
  loginButton: {
    backgroundColor: "#0a3d62", 
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#0a3d62",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff", // Texto blanco sobre fondo oscuro
    letterSpacing: 2,
  },
  forgotPassword: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
    fontSize: 14,
  },
  registerBtn: {
    marginTop: 15,
  },
  registerText: {
    textAlign: "center",
    color: "#444",
    fontSize: 14,
  },
  registerLink: {
    fontWeight: "bold",
    color: "#0a3d62",
    textDecorationLine: "underline",
  },
});
