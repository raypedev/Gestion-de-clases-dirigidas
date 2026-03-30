import { renderRouter, screen, fireEvent } from 'expo-router/testing-library';
import React from "react";
import { Text } from "react-native";

/**
 * Mock mínimo de las rutas reales
 * No renderiza toda la app, solo lo necesario
 */
describe("Navegación index → crearUsuario", () => {
  it("navega a la pantalla Crear Usuario al pulsar el botón", async () => {
    renderRouter(
      {
        index: require("../app/index").default,
        crearUsuario: require("../app/crearUsuario").default,
      },
      {
        initialUrl: "/",
      }
    );

    // Estamos en index
    expect(screen.getByText("crear usuario")).toBeTruthy();

    // Pulsamos el botón
    fireEvent.press(screen.getByTestId("btn-crear-usuario"));

    // Ahora debe renderizarse crearUsuario
    expect(
      await screen.findByText("Crear Usuario")
    ).toBeTruthy();
  });
});
