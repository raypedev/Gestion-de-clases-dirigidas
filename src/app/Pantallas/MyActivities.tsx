import { useAppContext } from "@/src/context/AppContextProvider";
import { actividades, inscripciones } from "@/src/db/schema";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ACTIVIDADES_REF = [
  {
    id: "1",
    name: "YOGA",
    day: "LUNES",
    time: "6:00 AM",
    icon: "meditation" as any,
  },
  {
    id: "2",
    name: "YOGA",
    day: "MIÉRCOLES",
    time: "6:00 AM",
    icon: "meditation" as any,
  },
  {
    id: "3",
    name: "ZUMBA",
    day: "MARTES",
    time: "10:00 AM",
    icon: "human-female-dance" as any,
  },
  {
    id: "4",
    name: "ZUMBA",
    day: "JUEVES",
    time: "7:00 PM",
    icon: "human-female-dance" as any,
  },
  {
    id: "5",
    name: "SPINNING",
    day: "VIERNES",
    time: "6:30 AM",
    icon: "bike" as any,
  },
  {
    id: "6",
    name: "SPINNING",
    day: "SÁBADO",
    time: "9:00 AM",
    icon: "bike" as any,
  },
];

export default function MyActivities() {
  const { usuario } = useAppContext();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);
  const [misActividades, setMisActividades] = useState<any[]>([]);

  // Cargar actividades
  const [listaActividades, setListaActividades] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const cargarActividades = async () => {
    try {
      setCargando(true);
      const res = await drizzleDb.select().from(actividades);
      setListaActividades(res);
      console.log("Actividades cargadas:", res.length);
      return res;
    } catch (error) {
      console.error("Error al cargar:", error);
    } finally {
      setCargando(false);
    }
  };

  /*
  useEffect(() => {
    const inicializarTodo = async () => {
      // Primero obtenemos todas las actividades y las guardamos en una constante
      const datosDeBD = await cargarActividades();
      // Si hay datos y hay un usuario, cargamos sus inscripciones pasándole los datos de A
      if (datosDeBD.length > 0 && usuario) {
        await cargarMisActividades();
      }
    };
    inicializarTodo();
  }, []);
*/

  useFocusEffect(
    useCallback(() => {
      refrescarTodo();
    }, []), // Se vuelve a ejecutar si cambias de pantalla
  );

  const refrescarTodo = async () => {
    try {
      setCargando(true);
      console.log("--- Iniciando Refresco Total ---");
      // A. Traemos TODAS las actividades de golpe
      const todas = await drizzleDb.select().from(actividades);
      setListaActividades(todas); // Para la lista general de la UI
      // B. Si no hay usuario, paramos (pero ya cargamos las actividades arriba)
      if (!usuario?.id) {
        console.log("No hay usuario logueado");
        return;
      }
      // C. Traemos las INSCRIPCIONES del usuario
      const misReservas = await drizzleDb
        .select()
        .from(inscripciones)
        .where(eq(inscripciones.usuarioId, Number(usuario.id)));
      console.log(`Inscripciones encontradas: ${misReservas.length}`);
      // D. HACEMOS EL CRUCE (El "Join" manual)
      // Usamos 'todas' (la variable local) para que sea instantáneo
      const vinculadas = misReservas
        .map((ins) => {
          const detalle = todas.find(
            (a) => String(a.id) === String(ins.actividadId),
          );
          return detalle ? { ...detalle, inscripcionId: ins.id } : null;
        })
        .filter((item) => item !== null);

      // E. Guardamos el resultado final en el estado
      setMisActividades(vinculadas);
      console.log("Carga finalizada con éxito.");
    } catch (error) {
      console.error("Error en refrescarTodo:", error);
      Alert.alert("Error", "No se pudieron sincronizar tus actividades");
    } finally {
      setCargando(false);
    }
  };
  /*
  useEffect(() => {
  cargarMisActividades
}, []);
*/

  const cargarMisActividades = async () => {
    // 1. Usamos el usuario del Contexto
    if (!usuario) return;
    try {
      // 2. Consultamos las inscripciones
      const res = await drizzleDb
        .select()
        .from(inscripciones)
        .where(eq(inscripciones.usuarioId, parseInt(usuario.id)));
      // 3. Cruzamos los datos usando 'listaCompleta'
      const datosCompletos = res
        .map((inscripcion) => {
          const info = listaActividades.find(
            (a) => parseInt(a.id) === inscripcion.actividadId,
          );
          return info ? { ...info, inscripcionId: inscripcion.id } : null;
        })
        .filter((item) => item !== null);

      setMisActividades(datosCompletos);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudieron cargar tus reservas");
    }
  };

  const confirmarAnulacion = (actividadId: string, nombre: string) => {
    Alert.alert(
      "Anular Reserva",
      `¿Estás seguro de que quieres anular tu reserva para ${nombre}?`,
      [
        { text: "No, mantener", style: "cancel" },
        {
          text: "Sí, anular",
          style: "destructive",
          onPress: () => handleAnular(actividadId),
        },
      ],
    );
  };

  const handleAnular = async (actividadId: string) => {
    try {
      // Eliminamos la fila donde coincidan el usuario y la actividad
      await drizzleDb
        .delete(inscripciones)
        .where(
          and(
            eq(inscripciones.usuarioId, parseInt(usuario!.id)),
            eq(inscripciones.actividadId, parseInt(actividadId)),
          ),
        );

      Alert.alert("Éxito", "Reserva anulada correctamente");
      cargarMisActividades(); // Recargamos la lista para que desaparezca la tarjeta
    } catch (error) {
      Alert.alert("Error", "No se pudo anular la reserva");
    }
  };

  return (
    <LinearGradient colors={["#e0f7f9", "#ffffff"]} style={styles.container}>
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
          <Text style={styles.headerTitle}>MIS RESERVAS</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {misActividades.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="calendar-remove"
                size={80}
                color="#ccc"
              />
              <Text style={styles.emptyText}>
                No tienes reservas activas en este momento.
              </Text>
            </View>
          ) : (
            misActividades.map((actividad, index) => (
              <View key={index} style={styles.activityCard}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons
                    name={actividad.icon}
                    size={30}
                    color="#0a3d62"
                  />
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.actName}>{actividad.nombre}</Text>
                  <Text style={styles.actDetail}>
                    {actividad.dia} • {actividad.hora}
                  </Text>
                </View>

                {/* BOTÓN DE ANULAR */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() =>
                    confirmarAnulacion(actividad.id, actividad.name)
                  }
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={24}
                    color="#e74c3c"
                  />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
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
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#0a3d62" },
  scrollContent: { padding: 20 },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 40,
  },
  activityCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  iconBox: {
    width: 50,
    height: 50,
    backgroundColor: "#fdf2f2",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  infoBox: { flex: 1, marginLeft: 15 },
  actName: { fontSize: 17, fontWeight: "bold", color: "#333" },
  actDetail: { fontSize: 13, color: "#777" },
  deleteBtn: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
});
