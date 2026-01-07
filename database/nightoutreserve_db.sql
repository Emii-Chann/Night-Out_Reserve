-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Jan 07. 10:09
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
  `id` int(11) NOT NULL,
  `szorakozohely_id` int(11) NOT NULL,
  `asztal_szam` int(11) NOT NULL,
  `ferohely` int(11) NOT NULL DEFAULT 4,
  `aktiv` tinyint(1) NOT NULL DEFAULT 1
) ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalok`
--

CREATE TABLE `felhasznalok` (
  `id` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefon` varchar(30) DEFAULT NULL,
  `jelszo_hash` varchar(60) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `delete_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `foglalasok`
--

CREATE TABLE `foglalasok` (
  `id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `szorakozohely_id` int(11) DEFAULT NULL,
  `jatek_hely_id` int(11) DEFAULT NULL,
  `asztal_id` int(11) DEFAULT NULL,
  `kezdete` datetime NOT NULL,
  `vege` datetime NOT NULL,
  `foglalas_tipus` enum('HELY','JATEK','ASZTAL') NOT NULL,
  `letszam` int(11) DEFAULT NULL,
  `statusz` enum('PENDING','APPROVED','CANCELLED','DONE') NOT NULL DEFAULT 'PENDING',
  `megjegyzes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ;

--
-- Eseményindítók `foglalasok`
--
DELIMITER $$
CREATE TRIGGER `trg_no_game_overbook_ins` BEFORE INSERT ON `foglalasok` FOR EACH ROW BEGIN
  DECLARE cap INT;

  IF NEW.foglalas_tipus = 'JATEK' THEN
    SELECT darab INTO cap
    FROM jatekASzorakozohelyhez
    WHERE id = NEW.jatek_hely_id;

    IF (
      SELECT COUNT(*)
      FROM foglalasok f
      WHERE f.jatek_hely_id = NEW.jatek_hely_id
        AND f.statusz IN ('PENDING','APPROVED')
        AND f.kezdete < NEW.vege
        AND f.vege > NEW.kezdete
    ) >= cap THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ütközés: nincs szabad játékelem ebben az időben.';
    END IF;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_no_game_overbook_upd` BEFORE UPDATE ON `foglalasok` FOR EACH ROW BEGIN
  DECLARE cap INT;

  IF NEW.foglalas_tipus = 'JATEK' THEN
    SELECT darab INTO cap
    FROM jatekASzorakozohelyhez
    WHERE id = NEW.jatek_hely_id;

    IF (
      SELECT COUNT(*)
      FROM foglalasok f
      WHERE f.jatek_hely_id = NEW.jatek_hely_id
        AND f.statusz IN ('PENDING','APPROVED')
        AND f.id <> NEW.id
        AND f.kezdete < NEW.vege
        AND f.vege > NEW.kezdete
    ) >= cap THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ütközés: nincs szabad játékelem ebben az időben.';
    END IF;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_no_table_overlap_ins` BEFORE INSERT ON `foglalasok` FOR EACH ROW BEGIN
  IF NEW.foglalas_tipus = 'ASZTAL' THEN
    IF EXISTS (
      SELECT 1 FROM foglalasok f
      WHERE f.asztal_id = NEW.asztal_id
        AND f.statusz IN ('PENDING','APPROVED')
        AND f.kezdete < NEW.vege
        AND f.vege > NEW.kezdete
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ütközés: az asztal már foglalt ebben az időben.';
    END IF;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_no_table_overlap_upd` BEFORE UPDATE ON `foglalasok` FOR EACH ROW BEGIN
  IF NEW.foglalas_tipus = 'ASZTAL' THEN
    IF EXISTS (
      SELECT 1 FROM foglalasok f
      WHERE f.asztal_id = NEW.asztal_id
        AND f.statusz IN ('PENDING','APPROVED')
        AND f.id <> NEW.id
        AND f.kezdete < NEW.vege
        AND f.vege > NEW.kezdete
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ütközés: az asztal már foglalt ebben az időben.';
    END IF;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `jatekaszorakozohelyhez`
--

CREATE TABLE `jatekaszorakozohelyhez` (
  `id` int(11) NOT NULL,
  `szorakozohely_id` int(11) NOT NULL,
  `jatek_id` int(11) NOT NULL,
  `darab` int(11) NOT NULL DEFAULT 1,
  `ar_per_ora` int(11) DEFAULT NULL,
  `foglalhato` tinyint(1) NOT NULL DEFAULT 1,
  `min_idotartam_perc` int(11) NOT NULL DEFAULT 60
) ;

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
  `aktiv` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
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
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tulajokbelepes`
--

CREATE TABLE `tulajokbelepes` (
  `tulaj_id` int(11) NOT NULL,
  `felhasznalonev` varchar(60) NOT NULL,
  `jelszo_hash` varchar(60) NOT NULL,
  `last_login` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `asztalok`
--
ALTER TABLE `asztalok`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_hely_asztal` (`szorakozohely_id`,`asztal_szam`);

--
-- A tábla indexei `felhasznalok`
--
ALTER TABLE `felhasznalok`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A tábla indexei `foglalasok`
--
ALTER TABLE `foglalasok`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_fog_hely` (`szorakozohely_id`),
  ADD KEY `idx_fog_user` (`felhasznalo_id`),
  ADD KEY `idx_fog_asztal` (`asztal_id`),
  ADD KEY `idx_fog_jatekhely` (`jatek_hely_id`),
  ADD KEY `idx_fog_ido` (`kezdete`,`vege`);

--
-- A tábla indexei `jatekaszorakozohelyhez`
--
ALTER TABLE `jatekaszorakozohelyhez`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_hely_jatek` (`szorakozohely_id`,`jatek_id`),
  ADD KEY `fk_jh_jatek` (`jatek_id`);

--
-- A tábla indexei `jatekok`
--
ALTER TABLE `jatekok`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nev` (`nev`);

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
-- AUTO_INCREMENT a táblához `asztalok`
--
ALTER TABLE `asztalok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `felhasznalok`
--
ALTER TABLE `felhasznalok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `foglalasok`
--
ALTER TABLE `foglalasok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `jatekaszorakozohelyhez`
--
ALTER TABLE `jatekaszorakozohelyhez`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `jatekok`
--
ALTER TABLE `jatekok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
-- Megkötések a táblához `foglalasok`
--
ALTER TABLE `foglalasok`
  ADD CONSTRAINT `fk_fog_asztal` FOREIGN KEY (`asztal_id`) REFERENCES `asztalok` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fog_hely` FOREIGN KEY (`szorakozohely_id`) REFERENCES `szorakozohelyek` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fog_jatekhely` FOREIGN KEY (`jatek_hely_id`) REFERENCES `jatekaszorakozohelyhez` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fog_user` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `jatekaszorakozohelyhez`
--
ALTER TABLE `jatekaszorakozohelyhez`
  ADD CONSTRAINT `fk_jh_hely` FOREIGN KEY (`szorakozohely_id`) REFERENCES `szorakozohelyek` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_jh_jatek` FOREIGN KEY (`jatek_id`) REFERENCES `jatekok` (`id`);

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
