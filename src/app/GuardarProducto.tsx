import { StyleSheet, Text, View, Button, Alert} from 'react-native'
import React from 'react'
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle, useLiveQuery } from 'drizzle-orm/expo-sqlite';
//import { personas, categorias, productos } from '../db/schema';
import { SafeAreaView } from 'react-native-safe-area-context';


const GuardarProducto = () => {
    const db = useSQLiteContext();

    /*
    const drizzleDb = drizzle(db, { schema: { personas } });
    const { data: listaCategorias } = useLiveQuery(drizzleDb.select().from(categorias));
    const { data: listaProductos } = useLiveQuery(drizzleDb.select().from(productos));

    async function almacenarCategoria(){
        let edadAleatoria = Math.trunc(Math.random()*100);
        let nombreAleatorio = "categoria_"+Math.trunc(Math.random()*10000);
        await drizzleDb.insert(categorias).values({ nombre: nombreAleatorio });
    }

    async function almacenarProducto(){
        let edadAleatoria = Math.trunc(Math.random()*100);
        let nombreAleatorio = "producto_"+Math.trunc(Math.random()*10000);
        let precioAleatorio = (Math.trunc(Math.random()*10000) ) / 100
        if( listaCategorias.length <= 0 ){
            Alert.alert("No hay categorías aún. No se guarda producto");
            return;
        }
        let posCategoria = Math.trunc(Math.random()*listaCategorias.length);
        let idCategoria = listaCategorias[posCategoria].id;

        await drizzleDb.insert(productos).values({ nombre: nombreAleatorio, precio: precioAleatorio, categoriaId: idCategoria });
    }
    */
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center' }}>



            {/*
            <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 20  }}>Guardar Categoría</Text>
            <Button title='Guardar Categoria' onPress={almacenarCategoria} />
            <View style={{marginTop:20, flex: 1}}>
                <Text>Lista de categorias guardadas:</Text>
                {listaCategorias?.map((p)=><Text key={p.id}>{JSON.stringify(p)} </Text>)}
            </View>
            <Button title='Guardar Producto' onPress={almacenarProducto} />
            <View style={{marginTop:20, flex: 1}}>
                <Text>Lista de productos guardadas:</Text>
                {listaProductos?.map((p)=><Text key={p.id}>{JSON.stringify(p)}</Text>)}
            </View>
            */}
        </SafeAreaView>
    )
}

export default GuardarProducto

const styles = StyleSheet.create({})