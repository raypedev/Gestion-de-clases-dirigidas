import { useAppContext } from "@/src/context/AppContextProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- BASE DE DATOS ---
import { usuarios } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

// 1. DICCIONARIO DE AVATARES
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

export const UserList = () => {
  const { usuario, setUsuario } = useAppContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const [listaUsuarios, setListaUsuarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);

  // Avatar para mostrar DENTRO del modal
  const avatarAdmin = usuario?.avatar
    ? AVATARES[usuario.avatar]
    : AVATARES["av1"];

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const res = await drizzleDb.select().from(usuarios);
      setListaUsuarios(res);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarUsuarios();
    }, []),
  );

  const cerrarSesion = () => {
    setMenuVisible(false);
    setUsuario(null);
    router.replace("/");
  };

  const eliminarUsuario = (id: number, nombre: string) => {
    Alert.alert("Eliminar Usuario", `¿Estás seguro de borrar a ${nombre}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await drizzleDb.delete(usuarios).where(eq(usuarios.id, id));
            cargarUsuarios();
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar al usuario");
          }
        },
      },
    ]);
  };

  return (
    <LinearGradient
      colors={["#e0f7f9", "#ffffff", "#e0f7f9"]}
      style={styles.mainContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ICONO DE PERFIL (ESQUINA SUPERIOR DERECHA) - SOLO ICONO GRIS */}
        <TouchableOpacity
          style={styles.profileIconContainer}
          onPress={() => setMenuVisible(true)}
        >
          <MaterialCommunityIcons
            name="account-circle"
            size={55}
            color="#ccc"
          />
        </TouchableOpacity>

        {/* MODAL DE MENÚ */}
        <Modal visible={menuVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.dropdownMenu}>
                <View style={styles.userInfoSection}>
                  <View style={styles.menuHeaderRow}>
                    <View style={styles.avatarWrapper}>
                      <MaterialCommunityIcons
                        name="account-circle"
                        size={45}
                        color="#0a3d62"
                      />
                    </View>
                    <Text style={styles.userNameText}>
                      {usuario?.nick || "Administrador"}
                    </Text>
                  </View>
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
                    size={22}
                    color="#0a3d62"
                  />
                  <Text style={styles.logoutText}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>USUARIOS</Text>
          <Text style={styles.headerSubtitle}>REGISTRADOS</Text>
        </View>

        <View style={styles.formCard}>
          {cargando ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#0a3d62" />
            </View>
          ) : (
            <FlatList
              data={listaUsuarios}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <View style={styles.userRow}>
                  <View style={styles.avatarListContainer}>
                    <Image
                      source={
                        item.avatar ? AVATARES[item.avatar] : AVATARES["av1"]
                      }
                      style={styles.avatarInList}
                    />
                  </View>

                  <View style={styles.textContainer}>
                    <Text style={styles.userName}>{item.nombre}</Text>
                    <Text style={styles.userEmail}>{item.correo}</Text>
                    <Text style={styles.userPassword}>
                      Pass: {item.password}
                    </Text>
                  </View>

                  <View style={styles.actionIcons}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/screens/Administrator/EditUser",
                          params: { id: item.id },
                        })
                      }
                      style={{ marginRight: 10 }}
                    >
                      <MaterialCommunityIcons
                        name="pencil"
                        size={22}
                        color="#0a3d62"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => eliminarUsuario(item.id, item.nombre)}
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={22}
                        color="#e74c3c"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No hay usuarios registrados.
                </Text>
              }
            />
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/screens/RegisterUser")}
            >
              <Text style={styles.actionButtonText}>AÑADIR USUARIO</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.cancelContainer}
            >
              <Text style={styles.cancelText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default UserList;

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  profileIconContainer: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
  dropdownMenu: {
    position: "absolute",
    top: 100,
    right: 20,
    backgroundColor: "white",
    borderRadius: 25,
    width: 250,
    paddingVertical: 15,
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  userInfoSection: { paddingHorizontal: 20, paddingBottom: 10 },
  menuHeaderRow: { flexDirection: "row", alignItems: "center" },
  avatarWrapper: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 25,
    padding: 2,
  },
  avatarInsideMenu: { width: 45, height: 45, borderRadius: 22.5 },
  userNameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0a3d62",
    marginLeft: 15,
    flexShrink: 1,
  },
  menuDivider: { height: 1, backgroundColor: "#f2f2f2", marginVertical: 8 },
  menuItem: { paddingHorizontal: 20, paddingVertical: 15 },
  menuItemText: { fontSize: 17, color: "#444", fontWeight: "500" },
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
    fontSize: 17,
  },
  header: { alignItems: "center", paddingVertical: 10, marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: "900", color: "#0a3d62" },
  headerSubtitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0a3d62",
    fontStyle: "italic",
    marginTop: -8,
  },
  formCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 35,
    padding: 20,
    elevation: 10,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatarListContainer: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#f0f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0f7f9",
  },
  avatarInList: {
    width: "100%",
    height: "100%",
  },
  textContainer: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 14, color: "#666", marginTop: 2 },
  userPassword: { fontSize: 12, color: "#aaa", fontStyle: "italic" },
  actionIcons: { flexDirection: "row", alignItems: "center" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40 },
  footer: { marginTop: 10, alignItems: "center" },
  actionButton: {
    backgroundColor: "#002851",
    borderRadius: 20,
    paddingVertical: 18,
    width: "100%",
    alignItems: "center",
  },
  actionButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelContainer: { marginTop: 15 },
  cancelText: { color: "#888", textDecorationLine: "underline" },
});
