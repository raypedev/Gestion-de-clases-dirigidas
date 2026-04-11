PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_usuarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`dni` text,
	`correo` text NOT NULL,
	`password` text DEFAULT '123456' NOT NULL,
	'genero' text DEFAULT 'Prefiero no decir' NOT NULL'
);
--> statement-breakpoint
INSERT INTO `__new_usuarios`("id", "nombre", "dni", "correo", "password", "genero") SELECT "id", "nombre", "dni", "correo", "password", "genero" FROM `usuarios`;--> statement-breakpoint
DROP TABLE `usuarios`;--> statement-breakpoint
ALTER TABLE `__new_usuarios` RENAME TO `usuarios`;--> statement-breakpoint
PRAGMA foreign_keys=ON;