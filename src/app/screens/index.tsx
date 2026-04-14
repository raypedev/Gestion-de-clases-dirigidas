import { useAppContext } from "@/src/context/AppContextProvider";
import { usuarios } from "@/src/db/schema";
import MaskedView from "@react-native-masked-view/masked-view";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const LoginScreen = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema: { usuarios } });
  const { setUsuario } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function navegarRegistroUsuario() {
    router.push({ pathname: "/screens/registeruser" });
  }

  function navegarForgotPassword() {
    router.push({ pathname: "/screens/forgotPassword" });
  }

  async function hacerLogin() {
    try {
      // 1. Obtener todos los usuarios de la DB
      const resultado = await drizzleDb.select().from(usuarios).all();

      // 2. Buscar si las credenciales coinciden
      const usuarioEncontrado = resultado.find(
        (u) => u.correo === email && u.password === password,
      );

      // 3. CASO ESPECIAL: Admin (admin/admin)
      if (email === "admin" && password === "admin") {
        setUsuario({
          id: 0,
          nick: "Administrador",
          avatar: "av1",
        });
        router.push("/screens/AdminActivityList");
        return;
      }

      // 4. CASO NORMAL: Usuario de la Base de Datos
      if (!usuarioEncontrado) {
        Alert.alert("Error", "Credenciales incorrectas");
        return;
      }

      // 5. GUARDAR EN EL CONTEXTO
      // Usamos ?? "av1" para solucionar el error de 'string | null'
      setUsuario({
        id: usuarioEncontrado.id,
        nick: usuarioEncontrado.nombre,
        avatar: usuarioEncontrado.avatar ?? "av1",
      });

      // Navegar a la lista de actividades
      router.push("/screens/ActivityList");
    } catch (error) {
      console.error(error);
      // Este error suele saltar si la tabla no existe o la DB está bloqueada
      Alert.alert("Error", "Hubo un problema al acceder a los datos.");
    }
  }

  return (
    <LinearGradient
      colors={["#e0f7f9", "#ffffff", "#e0f7f9"]}
      style={styles.mainContainer}
    >
      <SafeAreaView style={styles.safeArea}>
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
          <Text style={styles.cardTitle}>Bienvenido</Text>

          <TextInput
            style={styles.input}
            placeholder="EMAIL"
            placeholderTextColor="#888"
            onChangeText={(text) => setEmail(text.trim())}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="CONTRASEÑA"
            secureTextEntry={true}
            placeholderTextColor="#888"
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.loginButton} onPress={hacerLogin}>
            <Text style={styles.loginButtonText}>ENTRAR</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={navegarForgotPassword}>
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
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

export default LoginScreen;

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  header: { flex: 1.5, justifyContent: "center", alignItems: "center" },
  maskedView: { width: "100%", height: 80 },
  maskElementContainer: {
    backgroundColor: "transparent",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientFill: { flex: 1 },
  logoText: {
    fontSize: 48,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -2,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 25,
    marginBottom: 60,
    paddingHorizontal: 25,
    paddingVertical: 35,
    borderRadius: 30,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
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
    elevation: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 2,
  },
  forgotPassword: { textAlign: "center", marginTop: 20, color: "#777" },
  registerBtn: { marginTop: 15 },
  registerText: { textAlign: "center", color: "#444" },
  registerLink: {
    fontWeight: "bold",
    color: "#0a3d62",
    textDecorationLine: "underline",
  },
});
