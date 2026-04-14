import { useAppContext } from "@/src/context/AppContextProvider";
import { actividades, inscripciones } from "@/src/db/schema";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 1. DICCIONARIO DE AVATARES (Asegúrate de que las rutas sean correctas)
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

export const ListaActividades = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema: { inscripciones } });
  const { usuario, setUsuario, registrarVisita } = useAppContext();
  const [menuVisible, setMenuVisible] = useState(false);

  // Estados para la carga de datos
  const [listaActividades, setListaActividades] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // --- LÓGICA DEL AVATAR ---
  // Si el usuario tiene avatar lo usa, si no, pone el 'av1' por defecto
  const avatarActual = usuario?.avatar
    ? AVATARES[usuario.avatar]
    : AVATARES["av1"];

  const cargarActividades = async () => {
    try {
      setCargando(true);
      const res = await drizzleDb.select().from(actividades);
      setListaActividades(res);
    } catch (error) {
      console.error("Error al cargar:", error);
    } finally {
      setCargando(false);
    }
  };

  function volverAtras() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  const cerrarSesion = () => {
    setMenuVisible(false);
    setUsuario(null);
    router.replace("/");
  };

  async function apuntarseActividad(actividad: any) {
    if (!usuario) {
      Alert.alert("Error", "No hay usuario logueado");
      return;
    }
    try {
      const yaApuntado = await drizzleDb.select().from(inscripciones).all();
      const existe = yaApuntado.find(
        (i) =>
          i.usuarioId === Number(usuario.id) && i.actividadId === actividad.id,
      );

      if (existe) {
        Alert.alert("Aviso", "Ya estás apuntado a esta actividad");
        return;
      }

      Alert.alert(
        "Confirmación",
        `¿Te quieres apuntar a ${actividad.nombre}?`,
        [
          { text: "No", style: "cancel" },
          {
            text: "Sí",
            onPress: async () => {
              await drizzleDb.insert(inscripciones).values({
                usuarioId: Number(usuario.id),
                actividadId: actividad.id,
              });
              Alert.alert("¡Éxito!", "Te has apuntado correctamente");
            },
          },
        ],
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo procesar la inscripción");
    }
  }

  useEffect(() => {
    cargarActividades();
  }, []);

  useFocusEffect(
    useCallback(() => {
      registrarVisita(db, "Lista de Actividades");
    }, [usuario]),
  );

  return (
    <LinearGradient
      colors={["#e0f7f9", "#ffffff", "#e0f7f9"]}
      style={styles.mainContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* --- ICONO SUPERIOR DERECHA (EL QUE TE FALTA) --- */}
        <TouchableOpacity
          style={styles.profileIconContainer}
          onPress={() => setMenuVisible(true)}
        >
          <Image source={avatarActual} style={styles.avatarTopRight} />
        </TouchableOpacity>

        {/* MODAL DEL MENÚ DESPLEGABLE */}
        <Modal
          visible={menuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.dropdownMenu}>
                <View style={styles.userInfoSection}>
                  <View style={styles.menuHeaderRow}>
                    {/* AVATAR DENTRO DEL MENÚ */}
                    <Image
                      source={avatarActual}
                      style={styles.avatarInsideMenu}
                    />
                    <Text style={styles.userNameText}>
                      {usuario?.nick || "Usuario"}
                    </Text>
                  </View>
                </View>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/screens/UserProfile");
                  }}
                >
                  <Text style={styles.menuItemText}>Mi perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/screens/MyActivities");
                  }}
                >
                  <Text style={styles.menuItemText}>Mis actividades</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push("/screens/Help");
                  }}
                >
                  <Text style={styles.menuItemText}>Ayuda</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.logoutItem}
                  onPress={cerrarSesion}
                >
                  <MaterialCommunityIcons
                    name="logout"
                    size={18}
                    color="#0a3d62"
                  />
                  <Text style={styles.logoutText}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>LISTA DE</Text>
          <Text style={styles.headerSubtitle}>ACTIVIDADES</Text>
        </View>

        <View style={styles.formCard}>
          {cargando ? (
            <ActivityIndicator
              size="large"
              color="#0a3d62"
              style={{ marginTop: 20 }}
            />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {listaActividades.length === 0 ? (
                <Text style={styles.emptyText}>
                  No hay actividades disponibles.
                </Text>
              ) : (
                listaActividades.map((actividad) => (
                  <TouchableOpacity
                    key={actividad.id}
                    style={styles.activityRow}
                    onPress={() => apuntarseActividad(actividad)}
                  >
                    <View style={styles.iconContainer}>
                      <MaterialCommunityIcons
                        name={actividad.icon || "run"}
                        size={30}
                        color="#0a3d62"
                      />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.activityName}>
                        {actividad.nombre}
                      </Text>
                      <Text style={styles.activityTime}>
                        {actividad.dia}, {actividad.hora}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name="plus-circle-outline"
                      size={24}
                      color="#0a3d62"
                    />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <TouchableOpacity onPress={volverAtras} style={styles.backButton}>
              <Text style={styles.backButtonText}>VOLVER ATRÁS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ListaActividades;

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  profileIconContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  // ESTILO AVATAR ARRIBA DERECHA
  avatarTopRight: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#0a3d62",
    backgroundColor: "#fff",
  },
  // ESTILO AVATAR DENTRO DEL MENÚ
  avatarInsideMenu: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  menuHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  dropdownMenu: {
    position: "absolute",
    top: 105,
    right: 20,
    backgroundColor: "white",
    borderRadius: 12,
    width: 220,
    paddingVertical: 15,
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  userInfoSection: {
    paddingHorizontal: 15,
    paddingBottom: 5,
  },
  userNameText: { fontSize: 17, fontWeight: "bold", color: "#0a3d62" },
  menuDivider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  menuItem: { paddingVertical: 10, paddingHorizontal: 20 },
  menuItemText: { fontSize: 15, color: "#333" },
  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#0a3d62",
    fontWeight: "bold",
  },
  header: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 10,
  },
  headerTitle: { fontSize: 26, fontWeight: "900", color: "#0a3d62" },
  headerSubtitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0a3d62",
    fontStyle: "italic",
    marginTop: -10,
  },
  formCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 40,
    padding: 20,
    elevation: 10,
  },
  scrollContent: { paddingBottom: 10 },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#e0f7f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: { flex: 1 },
  activityName: { fontSize: 17, fontWeight: "bold", color: "#333" },
  activityTime: { fontSize: 13, color: "#777" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 30 },
  footer: { marginTop: 15, alignItems: "center" },
  backButton: {
    backgroundColor: "#0a3d62",
    borderRadius: 20,
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
  },
  backButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
