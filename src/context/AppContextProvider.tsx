import React, { Dispatch, SetStateAction, createContext, useContext, useState } from 'react';

export type Usuario={
    id: string,
    nick: string,
    rol?: string
}

export interface AppContextType{

    listaUsuarios: Usuario[],

    setListaUsuarios: Dispatch<SetStateAction<Usuario[]>>
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

const AppContextProvider = (props: any) => {
    const [listaUsuarios, setListaUsuarios] = useState<Usuario[]>([]);


    const contextValues: AppContextType = {

        listaUsuarios: listaUsuarios,

        setListaUsuarios: setListaUsuarios
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