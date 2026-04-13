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
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

    const opcionesGenero = [
    {label: "Mujer", value: "Mujer"},
    {label: "Hombre", value: "Hombre"},
    {label: "No binario", value: "No binario"},
    {label: "Prefiero no decir", value: "Prefiero no decir"},
  ];
    // Cargar datos de la base de datos al montar el componente
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
                }
            } catch (error) {
                console.error("Error al cargar usuario:", error);
                Alert.alert("Error", "No se pudieron cargar los datos del usuario");
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
            await drizzleDb.update(usuarios)
                .set({ 
                    nombre: nombre, 
                    dni: dni, 
                    password: password,
                    genero: genero
                })
                .where(eq(usuarios.id, Number(usuario!.id)));

            // Actualizar contexto global para que el menú refleje el nuevo nombre
            setUsuario({ ...usuario!, nick: nombre });
            
            setEditando(false);
            Alert.alert("Éxito", "Perfil actualizado correctamente");
        } catch (error) {
            Alert.alert("Error", "No se pudieron guardar los cambios");
        }
    };

    const { registrarVisita } = useAppContext();
       useFocusEffect(
          useCallback(() => {
            // Registramos la entrada a esta pantalla
            registrarVisita(db, "Mi Perfil");
          }, [usuario])
        );

    return (
        <LinearGradient colors={["#e0f7f9", "#ffffff"]} style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={{ flex: 1 }}>
                    {/* Cabecera */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={28} color="#0a3d62" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>MI PERFIL</Text>
                        <View style={{ width: 40 }} /> 
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.card}>
                            <View style={styles.avatarContainer}>
                                <MaterialCommunityIcons name="account-circle" size={100} color="#0a3d62" />
                                <Text style={styles.welcomeText}>Gestiona tu información personal</Text>
                            </View>

                            {/* Sección de Correo (Solo lectura) */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Correo Electrónico</Text>
                                <View style={styles.emailDisplay}>
                                    <MaterialCommunityIcons name="email-outline" size={20} color="#888" />
                                    <Text style={styles.emailText}>{email || "Cargando correo..."}</Text>
                                </View>
                            </View>

                            {/* Sección de Nombre */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nombre Completo</Text>
                                <TextInput 
                                    style={[styles.input, !editando && styles.disabledInput]} 
                                    value={nombre} 
                                    onChangeText={setNombre} 
                                    editable={editando}
                                    placeholder="Introduce tu nombre"
                                />
                            </View>

                            {/* Sección de DNI */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>DNI / Identificación</Text>
                                <TextInput 
                                    style={[styles.input, !editando && styles.disabledInput]} 
                                    value={dni} 
                                    onChangeText={setDni} 
                                    editable={editando}
                                    placeholder="Introduce tu DNI"
                                />
                            </View>

                            {/* Sección de Contraseña */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Contraseña</Text>
                                <TextInput 
                                    style={[styles.input, !editando && styles.disabledInput]} 
                                    value={password} 
                                    onChangeText={setPassword} 
                                    secureTextEntry={!editando}
                                    editable={editando}
                                    placeholder="Introduce tu contraseña"
                                />
                            </View>

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
                                              <View style={[
                                                styles.circle, 
                                                seleccionado && styles.circleSelected
                                              ]}>
                                                {/* Si está seleccionado, mostramos un puntito blanco en el centro */}
                                                {seleccionado && <View style={styles.innerCircle} />}
                                              </View>
                                              <Text style={[
                                                styles.genderLabel, 
                                                seleccionado && styles.genderLabelSelected
                                              ]}>
                                                {opcion.label}
                                              </Text>
                                            </TouchableOpacity>
                                          );
                                        })}
                                      </View>

                            {/* Lógica de Botones */}
                            {!editando ? (
                                <TouchableOpacity style={styles.mainBtn} onPress={() => setEditando(true)}>
                                    <MaterialCommunityIcons name="account-edit" size={20} color="white" />
                                    <Text style={styles.btnText}>EDITAR PERFIL</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.actionRow}>
                                    <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => setEditando(false)}>
                                        <Text style={styles.btnText}>CANCELAR</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={guardarCambios}>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
    backButton: { padding: 8, backgroundColor: 'white', borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
    headerTitle: { fontSize: 22, fontWeight: '900', color: '#0a3d62', letterSpacing: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    card: { backgroundColor: 'white', borderRadius: 35, padding: 25, elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 15 },
    avatarContainer: { alignItems: 'center', marginBottom: 30 },
    welcomeText: { fontSize: 14, color: '#777', marginTop: 5, fontStyle: 'italic' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, color: '#0a3d62', marginBottom: 8, fontWeight: '700', textTransform: 'uppercase' },
    input: { backgroundColor: '#f9f9f9', borderRadius: 15, padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#eee', color: '#333' },
    disabledInput: { backgroundColor: '#f2f2f2', color: '#999', borderColor: '#ececec' },
    emailDisplay: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#ececec' },
    emailText: { marginLeft: 10, fontSize: 16, color: '#777', fontWeight: '500' },
    mainBtn: { backgroundColor: '#0a3d62', flexDirection: 'row', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    actionRow: { flexDirection: 'row', marginTop: 10, gap: 10 },
    actionBtn: { flex: 1, padding: 18, borderRadius: 20, alignItems: 'center' },
    saveBtn: { backgroundColor: '#2ecc71' },
    cancelBtn: { backgroundColor: '#e74c3c' },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
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
    width: 30, // Un poco más pequeño al no llevar icono
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
    borderColor: "#0a3d62", // Borde del color principal
    backgroundColor: "#fff",
  },
  innerCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#0a3d62", // El punto central
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