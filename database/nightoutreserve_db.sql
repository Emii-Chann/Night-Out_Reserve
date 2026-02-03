-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Feb 03. 19:59
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `nightoutreserve_db`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `asztalok`
--

CREATE TABLE `asztalok` (
  `szorakozohely_id` int(11) NOT NULL,
  `asztal_szam` int(11) NOT NULL,
  `ferohely` int(11) NOT NULL DEFAULT 4
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `asztal_foglalasok`
--

CREATE TABLE `asztal_foglalasok` (
  `asztal_foglalas_id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `szorakozohely_id` int(11) NOT NULL,
  `asztal_szam` int(11) NOT NULL,
  `letszam` int(11) NOT NULL,
  `kezdet` datetime NOT NULL,
  `vege` datetime NOT NULL,
  `allapot` enum('FÜGGŐ','JÓVÁHAGYVA','LEMONDVA','TELJESÍTVE') NOT NULL DEFAULT 'FÜGGŐ',
  `letrehozva_at` datetime NOT NULL DEFAULT current_timestamp(),
  `torolve_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eseményindítók `asztal_foglalasok`
--
DELIMITER $$
CREATE TRIGGER `trg_asztal_foglalas_ins` BEFORE INSERT ON `asztal_foglalasok` FOR EACH ROW BEGIN
  IF EXISTS (
    SELECT 1
    FROM asztal_foglalasok af
    WHERE af.szorakozohely_id = NEW.szorakozohely_id
      AND af.asztal_szam = NEW.asztal_szam
      AND af.torolve_at IS NULL
      AND af.allapot IN ('FÜGGŐ','JÓVÁHAGYVA')
      AND af.kezdet < NEW.vege
      AND af.vege > NEW.kezdet
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ütközés: az asztal már foglalt ebben az időpontban.';
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_asztal_foglalas_upd` BEFORE UPDATE ON `asztal_foglalasok` FOR EACH ROW BEGIN
  IF EXISTS (
    SELECT 1
    FROM asztal_foglalasok af
    WHERE af.asztal_foglalas_id <> NEW.asztal_foglalas_id
      AND af.szorakozohely_id = NEW.szorakozohely_id
      AND af.asztal_szam = NEW.asztal_szam
      AND af.torolve_at IS NULL
      AND af.allapot IN ('FÜGGŐ','JÓVÁHAGYVA')
      AND af.kezdet < NEW.vege
      AND af.vege > NEW.kezdet
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ütközés: az asztal már foglalt ebben az időpontban.';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalok`
--

CREATE TABLE `felhasznalok` (
  `id` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefon` varchar(30) DEFAULT NULL,
  `jelszo` varchar(60) NOT NULL,
  `letrehozva_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `torolve_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `hely_foglalasok`
--

CREATE TABLE `hely_foglalasok` (
  `hely_foglalas_id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `szorakozohely_id` int(11) NOT NULL,
  `letszam` int(11) NOT NULL,
  `kezdet` datetime NOT NULL,
  `vege` datetime NOT NULL,
  `allapot` enum('FÜGGŐ','JÓVÁHAGYVA','LEMONDVA','TELJESÍTVE') NOT NULL DEFAULT 'FÜGGŐ',
  `megjegyzes` text DEFAULT NULL,
  `letrehozva_at` datetime NOT NULL DEFAULT current_timestamp(),
  `torolve_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatekok`
--

CREATE TABLE `jatekok` (
  `id` int(11) NOT NULL,
  `nev` varchar(80) NOT NULL,
  `leiras` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatek_foglalasok`
--

CREATE TABLE `jatek_foglalasok` (
  `jatek_foglalas_id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `szorakozohely_id` int(11) NOT NULL,
  `jatek_id` int(11) NOT NULL,
  `kezdet` datetime NOT NULL,
  `vege` datetime NOT NULL,
  `allapot` enum('FÜGGŐ','JÓVÁHAGYVA','LEMONDVA','TELJESÍTVE') NOT NULL DEFAULT 'FÜGGŐ',
  `letrehozva_at` datetime NOT NULL DEFAULT current_timestamp(),
  `torolve_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eseményindítók `jatek_foglalasok`
--
DELIMITER $$
CREATE TRIGGER `trg_jatek_foglalas_ins` BEFORE INSERT ON `jatek_foglalasok` FOR EACH ROW BEGIN
  DECLARE kapacitas INT;

  SELECT darab INTO kapacitas
  FROM jatek_szorakozohelyhez
  WHERE szorakozohely_id = NEW.szorakozohely_id
    AND jatek_id = NEW.jatek_id;

  IF kapacitas IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nincs ilyen játék ehhez a szórakozóhelyhez.';
  END IF;

  IF (
    SELECT COUNT(*)
    FROM jatek_foglalasok jf
    WHERE jf.szorakozohely_id = NEW.szorakozohely_id
      AND jf.jatek_id = NEW.jatek_id
      AND jf.torolve_at IS NULL
      AND jf.allapot IN ('FÜGGŐ','JÓVÁHAGYVA')
      AND jf.kezdet < NEW.vege
      AND jf.vege > NEW.kezdet
  ) >= kapacitas THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ütközés: nincs szabad játékelem ebben az időpontban.';
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_jatek_foglalas_upd` BEFORE UPDATE ON `jatek_foglalasok` FOR EACH ROW BEGIN
  DECLARE kapacitas INT;

  SELECT darab INTO kapacitas
  FROM jatek_szorakozohelyhez
  WHERE szorakozohely_id = NEW.szorakozohely_id
    AND jatek_id = NEW.jatek_id;

  IF kapacitas IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nincs ilyen játék ehhez a szórakozóhelyhez.';
  END IF;

  IF (
    SELECT COUNT(*)
    FROM jatek_foglalasok jf
    WHERE jf.jatek_foglalas_id <> NEW.jatek_foglalas_id
      AND jf.szorakozohely_id = NEW.szorakozohely_id
      AND jf.jatek_id = NEW.jatek_id
      AND jf.torolve_at IS NULL
      AND jf.allapot IN ('FÜGGŐ','JÓVÁHAGYVA')
      AND jf.kezdet < NEW.vege
      AND jf.vege > NEW.kezdet
  ) >= kapacitas THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ütközés: nincs szabad játékelem ebben az időpontban.';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatek_szorakozohelyhez`
--

CREATE TABLE `jatek_szorakozohelyhez` (
  `szorakozohely_id` int(11) NOT NULL,
  `jatek_id` int(11) NOT NULL,
  `darab` int(11) NOT NULL DEFAULT 1,
  `ar_ora` int(11) DEFAULT NULL,
  `min_idotartam_perc` int(11) NOT NULL DEFAULT 60
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `szorakozohelyek`
--

CREATE TABLE `szorakozohelyek` (
  `id` int(11) NOT NULL,
  `tulaj_id` int(11) NOT NULL,
  `nev` varchar(120) NOT NULL,
  `cim` varchar(200) NOT NULL,
  `varos` varchar(80) NOT NULL,
  `leiras` text DEFAULT NULL,
  `nyitvatartas` varchar(200) DEFAULT NULL,
  `asztalok_szama` int(11) NOT NULL DEFAULT 0,
  `letrehozva_at` datetime NOT NULL DEFAULT current_timestamp(),
  `torolve_at` datetime DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tulajokadatai`
--

CREATE TABLE `tulajokadatai` (
  `id` int(11) NOT NULL,
  `teljes_nev` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefon` varchar(30) DEFAULT NULL,
  `cegnev` varchar(150) DEFAULT NULL,
  `letrehozva_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tulajokbelepes`
--

CREATE TABLE `tulajokbelepes` (
  `tulaj_id` int(11) NOT NULL,
  `felhasznalonev` varchar(100) NOT NULL,
  `jelszo` varchar(60) NOT NULL,
  `utolso_belepes` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `asztalok`
--
ALTER TABLE `asztalok`
  ADD PRIMARY KEY (`szorakozohely_id`,`asztal_szam`);

--
-- A tábla indexei `asztal_foglalasok`
--
ALTER TABLE `asztal_foglalasok`
  ADD PRIMARY KEY (`asztal_foglalas_id`),
  ADD KEY `fk_asztalfog_user` (`felhasznalo_id`),
  ADD KEY `fk_asztalfog_asztal` (`szorakozohely_id`,`asztal_szam`);

--
-- A tábla indexei `felhasznalok`
--
ALTER TABLE `felhasznalok`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A tábla indexei `hely_foglalasok`
--
ALTER TABLE `hely_foglalasok`
  ADD PRIMARY KEY (`hely_foglalas_id`),
  ADD KEY `fk_helyfog_user` (`felhasznalo_id`),
  ADD KEY `fk_helyfog_hely` (`szorakozohely_id`);

--
-- A tábla indexei `jatekok`
--
ALTER TABLE `jatekok`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nev` (`nev`);

--
-- A tábla indexei `jatek_foglalasok`
--
ALTER TABLE `jatek_foglalasok`
  ADD PRIMARY KEY (`jatek_foglalas_id`),
  ADD KEY `fk_jatekfog_user` (`felhasznalo_id`),
  ADD KEY `fk_jatekfog_js_hely` (`szorakozohely_id`,`jatek_id`);

--
-- A tábla indexei `jatek_szorakozohelyhez`
--
ALTER TABLE `jatek_szorakozohelyhez`
  ADD PRIMARY KEY (`szorakozohely_id`,`jatek_id`),
  ADD KEY `fk_js_jatek` (`jatek_id`);

--
-- A tábla indexei `szorakozohelyek`
--
ALTER TABLE `szorakozohelyek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_hely_tulaj` (`tulaj_id`);

--
-- A tábla indexei `tulajokadatai`
--
ALTER TABLE `tulajokadatai`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A tábla indexei `tulajokbelepes`
--
ALTER TABLE `tulajokbelepes`
  ADD UNIQUE KEY `tulaj_id` (`tulaj_id`),
  ADD UNIQUE KEY `felhasznalonev` (`felhasznalonev`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `asztal_foglalasok`
--
ALTER TABLE `asztal_foglalasok`
  MODIFY `asztal_foglalas_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `felhasznalok`
--
ALTER TABLE `felhasznalok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `hely_foglalasok`
--
ALTER TABLE `hely_foglalasok`
  MODIFY `hely_foglalas_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `jatekok`
--
ALTER TABLE `jatekok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `jatek_foglalasok`
--
ALTER TABLE `jatek_foglalasok`
  MODIFY `jatek_foglalas_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `szorakozohelyek`
--
ALTER TABLE `szorakozohelyek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `tulajokadatai`
--
ALTER TABLE `tulajokadatai`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `asztalok`
--
ALTER TABLE `asztalok`
  ADD CONSTRAINT `fk_asztal_hely` FOREIGN KEY (`szorakozohely_id`) REFERENCES `szorakozohelyek` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `asztal_foglalasok`
--
ALTER TABLE `asztal_foglalasok`
  ADD CONSTRAINT `fk_asztalfog_asztal` FOREIGN KEY (`szorakozohely_id`,`asztal_szam`) REFERENCES `asztalok` (`szorakozohely_id`, `asztal_szam`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_asztalfog_user` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `hely_foglalasok`
--
ALTER TABLE `hely_foglalasok`
  ADD CONSTRAINT `fk_helyfog_hely` FOREIGN KEY (`szorakozohely_id`) REFERENCES `szorakozohelyek` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_helyfog_user` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `jatek_foglalasok`
--
ALTER TABLE `jatek_foglalasok`
  ADD CONSTRAINT `fk_jatekfog_js_hely` FOREIGN KEY (`szorakozohely_id`,`jatek_id`) REFERENCES `jatek_szorakozohelyhez` (`szorakozohely_id`, `jatek_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_jatekfog_user` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `jatek_szorakozohelyhez`
--
ALTER TABLE `jatek_szorakozohelyhez`
  ADD CONSTRAINT `fk_js_hely` FOREIGN KEY (`szorakozohely_id`) REFERENCES `szorakozohelyek` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_js_jatek` FOREIGN KEY (`jatek_id`) REFERENCES `jatekok` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `szorakozohelyek`
--
ALTER TABLE `szorakozohelyek`
  ADD CONSTRAINT `fk_hely_tulaj` FOREIGN KEY (`tulaj_id`) REFERENCES `tulajokadatai` (`id`);

--
-- Megkötések a táblához `tulajokbelepes`
--
ALTER TABLE `tulajokbelepes`
  ADD CONSTRAINT `fk_tulaj_belepes` FOREIGN KEY (`tulaj_id`) REFERENCES `tulajokadatai` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
