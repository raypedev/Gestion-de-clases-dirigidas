import React, { Dispatch, SetStateAction, createContext, useContext, useState } from 'react';

export type Usuario={
    id: string,
    nick: string,
    rol?: string
}

export interface AppContextType{

    listaUsuarios: Usuario[],

    setListaUsuarios: Dispatch<SetStateAction<Usuario[]>>

    //Al añadir usuario, si el usuario es correcto, se guarda en el contexto 
    // para poder usarlo en otras pantallas sin necesidad de volver a consultar la base de datos
    usuario: Usuario | null,
    setUsuario: Dispatch<SetStateAction<Usuario | null>>
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

const AppContextProvider = (props: any) => {
    const [listaUsuarios, setListaUsuarios] = useState<Usuario[]>([]);
    const [usuario, setUsuario] = useState<Usuario | null>(null);

    const contextValues: AppContextType = {

        listaUsuarios: listaUsuarios,
        setListaUsuarios: setListaUsuarios,
        usuario: usuario,
        setUsuario: setUsuario
    }
  return (
    <AppContext.Provider value={contextValues}>
        {props.children}
    </AppContext.Provider>
  )
}

export const useAppContext = () =>{
    return useContext(AppContext); 
}

export default AppContextProvider