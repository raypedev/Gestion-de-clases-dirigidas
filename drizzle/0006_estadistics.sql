CREATE TABLE IF NOT EXISTS estadisticas (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  nombre_pantalla TEXT NOT NULL,
  usuario_id INTEGER NOT NULL,
  UNIQUE(nombre_pantalla, usuario_id)
);