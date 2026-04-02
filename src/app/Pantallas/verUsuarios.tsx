import { usuarios } from "@/src/db/schema";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { drizzle, useLiveQuery } from "drizzle-orm/expo-sqlite";
import { LinearGradient } from "expo-linear-gradient";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export const verUsuarios = () => {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema: { usuarios } });
  const { data: lista } = useLiveQuery(drizzleDb.select().from(usuarios));
  const [menuVisible, setMenuVisible] = useState(false);


  /*
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        Lista de Usuarios
      </Text>

      <FlatList
        data={lista}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{ padding: 10, borderBottomWidth: 1, borderColor: "#ccc" }}
          >
            <Text style={{ fontWeight: "bold" }}>{item.nombre}</Text>
            <Text>Email: {item.correo}</Text>
            <Text>Contraseña: {item.password}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No hay usuarios registrados.</Text>}
      />
    </View>*/

  return (
    <LinearGradient
      // La propiedad correcta es 'colors' en plural
      colors={["#e0f7f9", "#ffffff", "#e0f7f9"]}
      style={styles.mainContainer}
    >
      
     <SafeAreaView style={styles.safeArea}>
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
     </SafeAreaView>
     





    </LinearGradient>
  );
};

export default verUsuarios;

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safeArea: { flex: 1 },
  profileIconContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.05)" },
  dropdownMenu: {
    position: "absolute",
    top: 100,
    right: 20,
    backgroundColor: "white",
    borderRadius: 12,
    width: 220,
    paddingVertical: 15,
    elevation: 15,
  },
  userInfoSection: { paddingHorizontal: 20, paddingBottom: 5 },
  userNameText: { fontSize: 18, fontWeight: "bold" },
  userSubText: { fontSize: 13, color: "#888" },
  menuDivider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoutText: { marginLeft: 10, color: "#0a3d62", fontWeight: "bold" },
  header: { alignItems: "center", paddingVertical: 10 },
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
    backgroundColor: "#f4f4f4",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 40,
    padding: 20,
  },
  scrollContent: { paddingBottom: 10 },
  emptyText: { textAlign: "center", color: "#888", marginTop: 20 },
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
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: { flex: 1 },
  activityName: { fontSize: 17, fontWeight: "bold" },
  activityTime: { fontSize: 13, color: "#777" },
  deleteButton: { padding: 10 },
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
