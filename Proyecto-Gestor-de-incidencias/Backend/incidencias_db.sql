-- =============================================
-- CREAR BASE DE DATOS Y TABLAS (VERSION LIMPIA)
-- =============================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS incidencias_db;
USE incidencias_db;

-- Eliminar tablas si existen (para empezar limpio)
DROP TABLE IF EXISTS incidencias;
DROP TABLE IF EXISTS usuarios;

-- Crear tabla incidencias
CREATE TABLE incidencias (
  id INT NOT NULL AUTO_INCREMENT,
  fecha DATE NOT NULL,
  descripcion VARCHAR(45) NOT NULL,
  tipo ENUM('telematica','presencial') NOT NULL,
  prioridad TINYINT NOT NULL,
  tiempo_estimado INT NOT NULL,
  tecnico_asignado VARCHAR(100) NOT NULL,
  creado_por VARCHAR(50) DEFAULT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_fecha (fecha),
  KEY idx_tecnico (tecnico_asignado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear tabla usuarios
CREATE TABLE usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  clave VARCHAR(6) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar un usuario de prueba (opcional)
-- INSERT INTO usuarios (nombre, clave) VALUES 
-- ('ADMIN', 'ABC123'),
-- ('TECNICO1', 'XYZ789');

-- Verificar que todo se creo correctamente
SHOW TABLES;
SELECT * FROM usuarios;
TRUNCATE TABLE usuarios;

SELECT * FROM incidencias;
TRUNCATE TABLE incidencias;