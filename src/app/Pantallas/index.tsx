import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const index = () => {
  function navegarGuardarPersona() {
    router.push({ pathname: "/GuardarPersona" });
  }

  //function navegarVerUsuarios() {
   // router.push({ pathname: "/Pantallas/verUsuarios" });
 // }

  function navegarRegistroUsuario() {
    router.push({ pathname: "/Pantallas/RegistroUsuario" });
  }

  function navegarForgotPassword() {
    router.push({ pathname: "/Pantallas/forgotPassword" });
  }

  function navegarListaActividades() {
    router.push({ pathname: "/Pantallas/mostrarActividades" });
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

        {/* TARJETA DE LOGIN RESALTADA */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Bienvenido</Text>

          <TextInput
            style={styles.input}
            placeholder="EMAIL"
            placeholderTextColor="#888"
          />

          <TextInput
            style={styles.input}
            placeholder="CONTRASEÑA"
            secureTextEntry={true}
            placeholderTextColor="#888"
          />

          {/* Botón ENTRAR más potente */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={navegarListaActividades}
          >
            <Text style={styles.loginButtonText}>ENTRAR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={navegarForgotPassword}>
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            //onPress={navegarGuardarPersona}
            onPress={navegarRegistroUsuario}
            style={styles.registerBtn}
          >
            <Text style={styles.registerText}>
              ¿Eres nuevo?{" "}
              <Text style={styles.registerLink}>Regístrate aquí</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default index;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flex: 1.5, // Reducido un poco para dar espacio al login
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
    backgroundColor: "#FFFFFF", // Blanco total para que destaque sobre el fondo cian
    marginHorizontal: 25,
    marginBottom: 60,
    paddingHorizontal: 25,
    paddingVertical: 35,
    borderRadius: 30,
    // Sombra muy marcada (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    // Sombra muy marcada (Android)
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
    backgroundColor: "#0a3d62", // Azul marino oscuro para máximo contraste
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
