-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 22-07-2024 a las 04:05:30
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `prediccion_matriculas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prerrequisitos`
--

CREATE TABLE `prerrequisitos` (
  `codigo_curso` varchar(7) NOT NULL,
  `nombre_curso` varchar(100) NOT NULL,
  `aprobados_curso` smallint(4) NOT NULL,
  `semestre_curso` varchar(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prerrequisitos_especiales`
--

CREATE TABLE `prerrequisitos_especiales` (
  `cui` varchar(8) NOT NULL,
  `estado` varchar(11) NOT NULL,
  `codigo_curso` varchar(7) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vacantes`
--

CREATE TABLE `vacantes` (
  `codigo_curso` varchar(7) NOT NULL,
  `nombre_curso` varchar(100) NOT NULL,
  `vacantes` smallint(4) DEFAULT NULL,
  `prerrequisitos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`prerrequisitos`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vacantes`
--

INSERT INTO `vacantes` (`codigo_curso`, `nombre_curso`, `vacantes`, `prerrequisitos`) VALUES
('1701212', 'PROGRAMACION WEB 1', NULL, '[\"1701106\"]'),
('1701213', 'FUNDAMENTOS DE PROGRAMACION 2', NULL, '[\"1701106\"]'),
('1702226', 'ESTADISTICA MATEMATICA, PROBABILIDADES Y METODOS EMPIRICOS', NULL, '[\"1702119\"]'),
('1702227', 'ARQUITECTURA DE COMPUTADORAS', NULL, '[\"1702124\"]'),
('1702229', 'INTERACCION HUMANO COMPUTADOR', NULL, '[\"1702118\", \"1702122\"]'),
('1702231', 'ANALISIS Y DISENO DE ALGORITMOS', NULL, '[\"1702124\"]'),
('1703239', 'REDES Y COMUNICACION DE DATOS', NULL, '[\"1702227\"]'),
('1703240', 'TECNOLOGIA DE OBJETOS', NULL, '[\"1703135\"]'),
('1703241', 'SISTEMAS OPERATIVOS', NULL, '[\"1703134\"]'),
('1703243', 'CONSTRUCCION DE SOFTWARE', NULL, '[\"1703135\", \"1703136\"]'),
('1703244', 'METODOS NUMERICOS', NULL, '[\"1703138\"]'),
('1704252', 'GESTION DE PROYECTOS DE SOFTWARE', NULL, '[\"1704149\"]'),
('1704254', 'CALIDAD DE SOFTWARE', NULL, '[\"1704151\"]'),
('1704260', 'ASPECTOS FORMALES DE ESPECIFICACION Y VERIFICACION', NULL, '[\"1703136\"]'),
('1705270', 'TOPICOS AVANZADOS EN INGENIERIA DE SOFTWARE', NULL, '[\"1705165\"]'),
('1705273', 'PROYECTO DE INGENIERIA DE SOFTWARE 2', NULL, '[\"1705161\"]'),
('1705274', 'GESTION DE SISTEMAS Y TECNOLOGIAS DE INFORMACION (E)', NULL, '[\"1705167\"]'),
('1705275', 'DESARROLLO DE SOFTWARE PARA JUEGOS (E)', NULL, '[\"1705168\"]'),
('1705276', 'PLATAFORMAS EMERGENTES (E)', NULL, '[\"1705169\"]');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `prerrequisitos`
--
ALTER TABLE `prerrequisitos`
  ADD PRIMARY KEY (`codigo_curso`);

--
-- Indices de la tabla `prerrequisitos_especiales`
--
ALTER TABLE `prerrequisitos_especiales`
  ADD PRIMARY KEY (`cui`);

--
-- Indices de la tabla `vacantes`
--
ALTER TABLE `vacantes`
  ADD PRIMARY KEY (`codigo_curso`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;