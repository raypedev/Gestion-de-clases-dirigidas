import { drizzle } from "drizzle-orm/expo-sqlite";
import React, {
    Dispatch,
    SetStateAction,
    createContext,
    useContext,
    useState,
} from "react";
import { estadisticas } from "../db/schema";

export type Usuario = {
  id: number;
  nick: string;
  rol?: string;
  avatar?: string;
};

export interface AppContextType {
  listaUsuarios: Usuario[];
  setListaUsuarios: Dispatch<SetStateAction<Usuario[]>>;

  //Al añadir usuario, si el usuario es correcto, se guarda en el contexto
  // para poder usarlo en otras pantallas sin necesidad de volver a consultar la base de datos
  usuario: Usuario | null;
  setUsuario: Dispatch<SetStateAction<Usuario | null>>;

  // Función para registrar la visita a una pantalla, incrementando el contador en la tabla de estadísticas
  registrarVisita: (db: any, nombrePantalla: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

const AppContextProvider = (props: any) => {
  const [listaUsuarios, setListaUsuarios] = useState<Usuario[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // FUNCIÓN DE REGISTRO GLOBAL
  const registrarVisita = async (db: any, nombrePantalla: string) => {
    if (!usuario) return;

    const drizzleDb = drizzle(db);

    try {
      await drizzleDb.insert(estadisticas).values({
        nombre_pantalla: nombrePantalla,
        usuario_id: Number(usuario.id),
      });
      console.log(
        `🚀 Visita registrada: ${nombrePantalla} (User: ${usuario.id})`,
      );
    } catch (error) {
      console.error("Error al insertar visita:", error);
    }
  };

  const contextValues: AppContextType = {
    listaUsuarios: listaUsuarios,
    setListaUsuarios: setListaUsuarios,
    usuario: usuario,
    setUsuario: setUsuario,
    registrarVisita,
  };
  return (
    <AppContext.Provider value={contextValues}>
      {props.children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};

export default AppContextProvider;
