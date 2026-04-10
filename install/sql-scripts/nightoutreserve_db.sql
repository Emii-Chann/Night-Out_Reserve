
DROP DATABASE IF EXISTS NightoutReserve_DB;

CREATE DATABASE NightoutReserve_DB
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE NightoutReserve_DB;


-- ------------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `asztalok`
--

CREATE TABLE `asztalok` (
  `szorakozohely_id` int(11) NOT NULL,
  `asztal_szam` int(11) NOT NULL,
  `ferohely` int(11) NOT NULL
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
  `allapot` enum('FUGGO', 'JOVAHAGYVA', 'LEMONDVA', 'TELJESITVE') NOT NULL DEFAULT 'FUGGO',
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
  `torolve` BOOLEAN DEFAULT FALSE,
  `torolve_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
  `allapot` enum('FUGGO', 'JOVAHAGYVA', 'LEMONDVA', 'TELJESITVE') NOT NULL DEFAULT 'FUGGO',
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
  `allapot` enum('FUGGO','JOVAHAGYVA','LEMONDVA','TELJESITVE') NOT NULL,
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


-- NIGHTOUTRESERVE – TELJES CRUD GYŰJTEMÉNY (MySQL STORED PROCEDURES)
-- ====================================================================
-- Kódolás: UTF-8
-- Megjegyzés: mindenhol a végleges – SOFT/HARD törléssel.

-- TARTALOM
-- --------
-- 1) HELY_FOGLALASOK CRUD
-- 2) JATEK_FOGLALASOK CRUD
-- 3) ASZTAL_FOGLALASOK CRUD
-- 4) FELHASZNALOK CRUD
-- 5) SZORAKOZOHELYEK CRUD
-- 6) ASZTALOK CRUD
-- 7) JATEKOK CRUD
-- 8) JATEK_SZORAKOZOHELYHEZ CRUD
-- 9) TULAJOKADATAI CRUD
-- 10) TULAJOKBELEPES CRUD




-- --------------------------------------------------
-- 1) HELY_FOGLALASOK (SOFT DELETE, külön IDŐPONT / ÁLLAPOT / MEGJEGYZÉS)
-- ------------------------------------------------

-- Beszúrás
DELIMITER $$
CREATE PROCEDURE hely_foglalas_hozzaad (
    IN p_felhasznalo_id INT,
    IN p_szorakozohely_id INT,
    IN p_letszam INT,
    IN p_kezdet DATETIME,
    IN p_vege DATETIME,
    IN p_megjegyzes TEXT
)
BEGIN
    INSERT INTO hely_foglalasok (felhasznalo_id, szorakozohely_id, letszam, kezdet, vege, megjegyzes)
    VALUES (p_felhasznalo_id, p_szorakozohely_id, p_letszam, p_kezdet, p_vege, p_megjegyzes);
END$$
DELIMITER ;

-- Lista (csak nem törölt)
DELIMITER $$
CREATE PROCEDURE hely_foglalas_lista ()
BEGIN
    SELECT h.hely_foglalas_id, h.felhasznalo_id, h.szorakozohely_id, h.letszam,
           h.kezdet, h.vege, h.allapot, h.megjegyzes, h.letrehozva_at
    FROM hely_foglalasok h
    WHERE h.torolve_at IS NULL
    ORDER BY h.kezdet DESC;
END$$
DELIMITER ;

-- Lekérés ID alapján
DELIMITER $$
CREATE PROCEDURE hely_foglalas_id_alapjan (IN p_hely_foglalas_id INT)
BEGIN
    SELECT h.hely_foglalas_id, h.felhasznalo_id, h.szorakozohely_id, h.letszam,
           h.kezdet, h.vege, h.allapot, h.megjegyzes, h.letrehozva_at, h.torolve_at
    FROM hely_foglalasok h
    WHERE h.hely_foglalas_id = p_hely_foglalas_id;
END$$
DELIMITER ;

-- Időpont módosítás
DELIMITER $$
CREATE PROCEDURE hely_foglalas_idopont_modosit (
    IN p_hely_foglalas_id INT,
    IN p_kezdet DATETIME,
    IN p_vege DATETIME
)
BEGIN
    UPDATE hely_foglalasok
    SET kezdet = p_kezdet,
        vege   = p_vege
    WHERE hely_foglalas_id = p_hely_foglalas_id;
END$$
DELIMITER ;

-- Állapot módosítás
DELIMITER $$
CREATE PROCEDURE hely_foglalas_allapot_modosit (
    IN p_hely_foglalas_id INT,
    IN p_allapot ENUM('FÜGGŐ','JÓVÁHAGYVA','LEMONDVA','TELJESÍTVE')
)
BEGIN
    UPDATE hely_foglalasok
    SET allapot = p_allapot
    WHERE hely_foglalas_id = p_hely_foglalas_id;
END$$
DELIMITER ;

-- Megjegyzés módosítás
DELIMITER $$
CREATE PROCEDURE hely_foglalas_megjegyzes_modosit (
    IN p_hely_foglalas_id INT,
    IN p_megjegyzes TEXT
)
BEGIN
    UPDATE hely_foglalasok
    SET megjegyzes = p_megjegyzes
    WHERE hely_foglalas_id = p_hely_foglalas_id;
END$$
DELIMITER ;

-- SOFT törlés
DELIMITER $$
CREATE PROCEDURE hely_foglalas_torol (IN p_hely_foglalas_id INT)
BEGIN
    UPDATE hely_foglalasok
    SET torolve_at = CURRENT_TIMESTAMP
    WHERE hely_foglalas_id = p_hely_foglalas_id;
END$$
DELIMITER ;

-- TESZT HÍVÁSOK
-- CALL hely_foglalas_hozzaad(1, 2, 4, '2026-01-15 20:00:00', '2026-01-15 22:00:00', 'szülinap');
-- CALL hely_foglalas_lista();
-- CALL hely_foglalas_id_alapjan(1);
-- CALL hely_foglalas_idopont_modosit(1, '2026-01-15 21:00:00', '2026-01-15 23:00:00');
-- CALL hely_foglalas_allapot_modosit(1, 'JÓVÁHAGYVA');
-- CALL hely_foglalas_megjegyzes_modosit(1, 'nagyobb társaság');
-- CALL hely_foglalas_torol(1);


-- ------------------------------------------------
-- 2) JATEK_FOGLALASOK (SOFT DELETE)
-- ------------------------------------------------

DELIMITER $$
CREATE PROCEDURE jatek_foglalas_hozzaad (
    IN p_felhasznalo_id INT,
    IN p_szorakozohely_id INT,
    IN p_jatek_id INT,
    IN p_kezdet DATETIME,
    IN p_vege DATETIME
)
BEGIN
    INSERT INTO jatek_foglalasok (felhasznalo_id, szorakozohely_id, jatek_id, kezdet, vege)
    VALUES (p_felhasznalo_id, p_szorakozohely_id, p_jatek_id, p_kezdet, p_vege);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE jatek_foglalas_lista ()
BEGIN
    SELECT jf.jatek_foglalas_id, jf.felhasznalo_id, jf.szorakozohely_id,
           jf.jatek_id, jf.kezdet, jf.vege, jf.allapot, jf.letrehozva_at
    FROM jatek_foglalasok jf
    WHERE jf.torolve_at IS NULL
    ORDER BY jf.kezdet DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE jatek_foglalas_id_alapjan (IN p_jatek_foglalas_id INT)
BEGIN
    SELECT jf.jatek_foglalas_id, jf.felhasznalo_id, jf.szorakozohely_id,
           jf.jatek_id, jf.kezdet, jf.vege, jf.allapot, jf.letrehozva_at, jf.torolve_at
    FROM jatek_foglalasok jf
    WHERE jf.jatek_foglalas_id = p_jatek_foglalas_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE jatek_foglalas_idopont_modosit (
    IN p_jatek_foglalas_id INT,
    IN p_kezdet DATETIME,
    IN p_vege DATETIME
)
BEGIN
    UPDATE jatek_foglalasok
    SET kezdet = p_kezdet,
        vege   = p_vege
    WHERE jatek_foglalas_id = p_jatek_foglalas_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE jatek_foglalas_allapot_modosit (
    IN p_jatek_foglalas_id INT,
    IN p_allapot ENUM('FÜGGŐ','JÓVÁHAGYVA','LEMONDVA','TELJESÍTVE')
)
BEGIN
    UPDATE jatek_foglalasok
    SET allapot = p_allapot
    WHERE jatek_foglalas_id = p_jatek_foglalas_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE jatek_foglalas_torol (IN p_jatek_foglalas_id INT)
BEGIN
    UPDATE jatek_foglalasok
    SET torolve_at = CURRENT_TIMESTAMP
    WHERE jatek_foglalas_id = p_jatek_foglalas_id;
END$$
DELIMITER ;

-- TESZT HÍVÁSOK
-- CALL jatek_foglalas_hozzaad(1, 2, 3, '2026-01-18 18:00:00', '2026-01-18 20:00:00');
-- CALL jatek_foglalas_lista();
-- CALL jatek_foglalas_id_alapjan(1);
-- CALL jatek_foglalas_idopont_modosit(1, '2026-01-18 19:00:00', '2026-01-18 21:00:00');
-- CALL jatek_foglalas_allapot_modosit(1, 'JÓVÁHAGYVA');
-- CALL jatek_foglalas_torol(1);


-- ------------------------------------------------
-- 3) ASZTAL_FOGLALASOK (SOFT DELETE, külön IDŐ / ÁLLAPOT / MEGJEGYZÉS)
-- ------------------------------------------------

DELIMITER $$
CREATE PROCEDURE asztal_foglalas_hozzaad (
    IN p_felhasznalo_id INT,
    IN p_szorakozohely_id INT,
    IN p_asztal_szam INT,
    IN p_letszam INT,
    IN p_kezdet DATETIME,
    IN p_vege DATETIME,
    IN p_megjegyzes TEXT
)
BEGIN
    INSERT INTO asztal_foglalasok (felhasznalo_id, szorakozohely_id, asztal_szam, letszam, kezdet, vege, megjegyzes)
    VALUES (p_felhasznalo_id, p_szorakozohely_id, p_asztal_szam, p_letszam, p_kezdet, p_vege, p_megjegyzes);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE asztal_foglalas_lista ()
BEGIN
    SELECT af.asztal_foglalas_id, af.felhasznalo_id, af.szorakozohely_id,
           af.asztal_szam, af.letszam, af.kezdet, af.vege, af.allapot,
           af.megjegyzes, af.letrehozva_at
    FROM asztal_foglalasok af
    WHERE af.torolve_at IS NULL
    ORDER BY af.kezdet DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE asztal_foglalas_id_alapjan (IN p_asztal_foglalas_id INT)
BEGIN
    SELECT af.asztal_foglalas_id, af.felhasznalo_id, af.szorakozohely_id,
           af.asztal_szam, af.letszam, af.kezdet, af.vege, af.allapot,
           af.megjegyzes, af.letrehozva_at, af.torolve_at
    FROM asztal_foglalasok af
    WHERE af.asztal_foglalas_id = p_asztal_foglalas_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE asztal_foglalas_idopont_modosit (
    IN p_asztal_foglalas_id INT,
    IN p_kezdet DATETIME,
    IN p_vege DATETIME
)
BEGIN
    UPDATE asztal_foglalasok
    SET kezdet = p_kezdet,
        vege   = p_vege
    WHERE asztal_foglalas_id = p_asztal_foglalas_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE asztal_foglalas_allapot_modosit (
    IN p_asztal_foglalas_id INT,
    IN p_allapot ENUM('FÜGGŐ','JÓVÁHAGYVA','LEMONDVA','TELJESÍTVE')
)
BEGIN
    UPDATE asztal_foglalasok
    SET allapot = p_allapot
    WHERE asztal_foglalas_id = p_asztal_foglalas_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE asztal_foglalas_megjegyzes_modosit (
    IN p_asztal_foglalas_id INT,
    IN p_megjegyzes TEXT
)
BEGIN
    UPDATE asztal_foglalasok
    SET megjegyzes = p_megjegyzes
    WHERE asztal_foglalas_id = p_asztal_foglalas_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE asztal_foglalas_torol (IN p_asztal_foglalas_id INT)
BEGIN
    UPDATE asztal_foglalasok
    SET torolve_at = CURRENT_TIMESTAMP
    WHERE asztal_foglalas_id = p_asztal_foglalas_id;
END$$
DELIMITER ;

-- TESZT HÍVÁSOK
-- CALL asztal_foglalas_hozzaad(1, 2, 5, 4, '2026-01-20 18:00:00', '2026-01-20 20:00:00', 'ablak mellé');
-- CALL asztal_foglalas_lista();
-- CALL asztal_foglalas_id_alapjan(1);
-- CALL asztal_foglalas_idopont_modosit(1, '2026-01-20 19:00:00', '2026-01-20 21:00:00');
-- CALL asztal_foglalas_allapot_modosit(1, 'JÓVÁHAGYVA');
-- CALL asztal_foglalas_megjegyzes_modosit(1, 'szülinap');
-- CALL asztal_foglalas_torol(1);


-- ------------------------------------------------
-- 4) FELHASZNALOK (HARD DELETE)
-- ------------------------------------------------

DELIMITER $$
CREATE PROCEDURE felhasznalo_hozzaad (
    IN p_nev VARCHAR(100),
    IN p_email VARCHAR(150),
    IN p_telefon VARCHAR(30),
    IN p_jelszo VARCHAR(60)
)
BEGIN
    INSERT INTO felhasznalok (nev, email, telefon, jelszo)
    VALUES (p_nev, p_email, p_telefon, p_jelszo);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE felhasznalo_lista ()
BEGIN
    SELECT f.id, f.nev, f.email, f.telefon, f.created_at
    FROM felhasznalok f
    ORDER BY f.created_at DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE felhasznalo_id_alapjan (IN p_id INT)
BEGIN
    SELECT f.id, f.nev, f.email, f.telefon, f.created_at
    FROM felhasznalok f
    WHERE f.id = p_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE felhasznalo_modosit (
    IN p_id INT,
    IN p_nev VARCHAR(100),
    IN p_email VARCHAR(150),
    IN p_telefon VARCHAR(30)
)
BEGIN
    UPDATE felhasznalok
    SET nev = p_nev,
        email = p_email,
        telefon = p_telefon
    WHERE id = p_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE felhasznalo_torol (IN p_id INT)
BEGIN
    DELETE FROM felhasznalok
    WHERE id = p_id;
END$$
DELIMITER ;

-- TESZT HÍVÁSOK
-- CALL felhasznalo_hozzaad('Teszt Elek', 'teszt@example.com', '06301234567', 'HASH123');
-- CALL felhasznalo_lista();
-- CALL felhasznalo_id_alapjan(1);
-- CALL felhasznalo_modosit(1, 'Teszt Béla', 'bela@example.com', '06309998888');
-- CALL felhasznalo_torol(1);


-- ------------------------------------------------
-- 5) SZORAKOZOHELYEK (SOFT DELETE)
-- ------------------------------------------------

DELIMITER $$
CREATE PROCEDURE szorakozohely_hozzaad (
    IN p_tulaj_id INT,
    IN p_nev VARCHAR(120),
    IN p_cim VARCHAR(200),
    IN p_varos VARCHAR(80),
    IN p_leiras TEXT,
    IN p_nyitvatartas VARCHAR(200)
)
BEGIN
    INSERT INTO szorakozohelyek (tulaj_id, nev, cim, varos, leiras, nyitvatartas)
    VALUES (p_tulaj_id, p_nev, p_cim, p_varos, p_leiras, p_nyitvatartas);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE szorakozohely_lista ()
BEGIN
    SELECT sz.id, sz.tulaj_id, sz.nev, sz.cim, sz.varos, sz.leiras, sz.nyitvatartas, sz.created_at
    FROM szorakozohelyek sz
    WHERE sz.torolve_at IS NULL
    ORDER BY sz.nev ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE szorakozohely_id_alapjan (IN p_id INT)
BEGIN
    SELECT sz.id, sz.tulaj_id, sz.nev, sz.cim, sz.varos, sz.leiras,
           sz.nyitvatartas, sz.created_at, sz.torolve_at
    FROM szorakozohelyek sz
    WHERE sz.id = p_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE szorakozohely_modosit (
    IN p_id INT,
    IN p_nev VARCHAR(120),
    IN p_cim VARCHAR(200),
    IN p_varos VARCHAR(80),
    IN p_leiras TEXT,
    IN p_nyitvatartas VARCHAR(200)
)
BEGIN
    UPDATE szorakozohelyek
    SET nev = p_nev,
        cim = p_cim,
        varos = p_varos,
        leiras = p_leiras,
        nyitvatartas = p_nyitvatartas
    WHERE id = p_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE szorakozohely_torol (IN p_id INT)
BEGIN
    UPDATE szorakozohelyek
    SET torolve_at = CURRENT_TIMESTAMP
    WHERE id = p_id;
END$$
DELIMITER ;

-- TESZT HÍVÁSOK
-- CALL szorakozohely_hozzaad(1, 'Fun Pub', 'Fő utca 12', 'Budapest', 'Céges események', '12:00-02:00');
-- CALL szorakozohely_lista();
-- CALL szorakozohely_id_alapjan(1);
-- CALL szorakozohely_modosit(1, 'Mega Pub', 'Fő utca 15', 'Budapest', 'Felújítva', '14:00-04:00');
-- CALL szorakozohely_torol(1);


-- ------------------------------------------------
-- 6) ASZTALOK (SOFT DELETE, összetett kulcs: szorakozohely_id + asztal_szam)
-- ------------------------------------------------

DELIMITER $$
CREATE PROCEDURE asztal_hozzaad (
    IN p_szorakozohely_id INT,
    IN p_asztal_szam INT,
    IN p_ferohely INT
)
BEGIN
    INSERT INTO asztalok (szorakozohely_id, asztal_szam, ferohely)
    VALUES (p_szorakozohely_id, p_asztal_szam, p_ferohely);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE asztal_lista (IN p_szorakozohely_id INT)
BEGIN
    SELECT a.szorakozohely_id, a.asztal_szam, a.ferohely
    FROM asztalok a
    WHERE a.szorakozohely_id = p_szorakozohely_id
      AND a.torolve_at IS NULL
    ORDER BY a.asztal_szam ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE asztal_adatok (
    IN p_szorakozohely_id INT,
    IN p_asztal_szam INT
)
BEGIN
    SELECT a.szorakozohely_id, a.asztal_szam, a.ferohely, a.torolve_at
    FROM asztalok a
    WHERE a.szorakozohely_id = p_szorakozohely_id
      AND a.asztal_szam = p_asztal_szam;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE asztal_modosit (
    IN p_szorakozohely_id INT,
    IN p_asztal_szam INT,
    IN p_ferohely INT
)
BEGIN
    UPDATE asztalok
    SET ferohely = p_ferohely
    WHERE szorakozohely_id = p_szorakozohely_id
      AND asztal_szam = p_asztal_szam;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE asztal_torol (
    IN p_szorakozohely_id INT,
    IN p_asztal_szam INT
)
BEGIN
    UPDATE asztalok
    SET torolve_at = CURRENT_TIMESTAMP
    WHERE szorakozohely_id = p_szorakozohely_id
      AND asztal_szam = p_asztal_szam;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE asztal_visszaallit (
    IN p_szorakozohely_id INT,
    IN p_asztal_szam INT
)
BEGIN
    UPDATE asztalok
    SET torolve_at = NULL
    WHERE szorakozohely_id = p_szorakozohely_id
      AND asztal_szam = p_asztal_szam;
END$$
DELIMITER ;

-- TESZT HÍVÁSOK
-- CALL asztal_hozzaad(2, 5, 4);
-- CALL asztal_lista(2);
-- CALL asztal_adatok(2, 5);
-- CALL asztal_modosit(2, 5, 6);
-- CALL asztal_torol(2, 5);
-- CALL asztal_visszaallit(2, 5);


-- ------------------------------------------------
-- 7) JATEKOK (SOFT DELETE, leiras = TEXT)
-- ------------------------------------------------

DELIMITER $$
CREATE PROCEDURE jatek_hozzaad (
    IN p_nev VARCHAR(80),
    IN p_leiras TEXT
)
BEGIN
    INSERT INTO jatekok (nev, leiras)
    VALUES (p_nev, p_leiras);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE jatek_lista ()
BEGIN
    SELECT j.id, j.nev, j.leiras
    FROM jatekok j
    WHERE j.torolve_at IS NULL
    ORDER BY j.nev ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE jatek_id_alapjan (IN p_id INT)
BEGIN
    SELECT j.id, j.nev, j.leiras, j.torolve_at
    FROM jatekok j
    WHERE j.id = p_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE jatek_modosit (
    IN p_id INT,
    IN p_nev VARCHAR(80),
    IN p_leiras TEXT
)
BEGIN
    UPDATE jatekok
    SET nev = p_nev,
        leiras = p_leiras
    WHERE id = p_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE jatek_torol (IN p_id INT)
BEGIN
    UPDATE jatekok
    SET torolve_at = CURRENT_TIMESTAMP
    WHERE id = p_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE jatek_visszaallit (IN p_id INT)
BEGIN
    UPDATE jatekok
    SET torolve_at = NULL
    WHERE id = p_id;
END$$
DELIMITER ;

-- TESZT
-- CALL jatek_hozzaad('Billiárd', 'Biliárdasztal dákókkal és golyókkal.');
-- CALL jatek_lista();
-- CALL jatek_id_alapjan(1);
-- CALL jatek_modosit(1, 'CSOCSÓ', 'Kétfős csocsóasztal Premier League matricával.');
-- CALL jatek_torol(1);
-- CALL jatek_visszaallit(1);


-- ------------------------------------------------
-- 8) JATEK_SZORAKOZOHELYHEZ (SOFT DELETE, összetett kulcs)
-- ------------------------------------------------

DELIMITER $$
CREATE PROCEDURE jatek_hely_hozzaad (
    IN p_szorakozohely_id INT,
    IN p_jatek_id INT,
    IN p_darab INT,
    IN p_ar_ora INT,
    IN p_min_ido INT
)
BEGIN
    INSERT INTO jatek_szorakozohelyhez (szorakozohely_id, jatek_id, darab, ar_ora, min_idotartam_perc)
    VALUES (p_szorakozohely_id, p_jatek_id, p_darab, p_ar_ora, p_min_ido);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE jatek_hely_lista (IN p_szorakozohely_id INT)
BEGIN
    SELECT js.szorakozohely_id, js.jatek_id, js.darab, js.ar_ora, js.min_idotartam_perc
    FROM jatek_szorakozohelyhez js
    WHERE js.szorakozohely_id = p_szorakozohely_id
      AND js.torolve_at IS NULL
    ORDER BY js.jatek_id ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE jatek_hely_adatok (
    IN p_szorakozohely_id INT,
    IN p_jatek_id INT
)
BEGIN
    SELECT js.szorakozohely_id, js.jatek_id, js.darab, js.ar_ora, js.min_idotartam_perc, js.torolve_at
    FROM jatek_szorakozohelyhez js
    WHERE js.szorakozohely_id = p_szorakozohely_id
      AND js.jatek_id = p_jatek_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE jatek_hely_modosit (
    IN p_szorakozohely_id INT,
    IN p_jatek_id INT,
    IN p_darab INT,
    IN p_ar_ora INT,
    IN p_min_ido INT
)
BEGIN
    UPDATE jatek_szorakozohelyhez
    SET darab = p_darab,
        ar_ora = p_ar_ora,
        min_idotartam_perc = p_min_ido
    WHERE szorakozohely_id = p_szorakozohely_id
      AND jatek_id = p_jatek_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE jatek_hely_torol (
    IN p_szorakozohely_id INT,
    IN p_jatek_id INT
)
BEGIN
    UPDATE jatek_szorakozohelyhez
    SET torolve_at = CURRENT_TIMESTAMP
    WHERE szorakozohely_id = p_szorakozohely_id
      AND jatek_id = p_jatek_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE jatek_hely_visszaallit (
    IN p_szorakozohely_id INT,
    IN p_jatek_id INT
)
BEGIN
    UPDATE jatek_szorakozohelyhez
    SET torolve_at = NULL
    WHERE szorakozohely_id = p_szorakozohely_id
      AND jatek_id = p_jatek_id;
END$$
DELIMITER ;

-- TESZT
-- CALL jatek_hely_hozzaad(2, 1, 3, 2500, 60);
-- CALL jatek_hely_lista(2);
-- CALL jatek_hely_adatok(2,1);
-- CALL jatek_hely_modosit(2,1,4,3000,90);
-- CALL jatek_hely_torol(2,1);
-- CALL jatek_hely_visszaallit(2,1);


-- ------------------------------------------------
-- 9) TULAJOKADATAI (SOFT DELETE)
-- ------------------------------------------------

DELIMITER $$
CREATE PROCEDURE tulaj_hozzaad (
    IN p_teljes_nev VARCHAR(100),
    IN p_email VARCHAR(150),
    IN p_telefon VARCHAR(30),
    IN p_cegnev VARCHAR(150)
)
BEGIN
    INSERT INTO tulajokadatai (teljes_nev, email, telefon, cegnev)
    VALUES (p_teljes_nev, p_email, p_telefon, p_cegnev);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE tulaj_lista ()
BEGIN
    SELECT t.id, t.teljes_nev, t.email, t.telefon, t.cegnev, t.created_at
    FROM tulajokadatai t
    WHERE t.torolve_at IS NULL
    ORDER BY t.teljes_nev ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE tulaj_id_alapjan (IN p_id INT)
BEGIN
    SELECT t.id, t.teljes_nev, t.email, t.telefon, t.cegnev, t.created_at, t.torolve_at
    FROM tulajokadatai t
    WHERE t.id = p_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE tulaj_modosit (
    IN p_id INT,
    IN p_teljes_nev VARCHAR(100),
    IN p_email VARCHAR(150),
    IN p_telefon VARCHAR(30),
    IN p_cegnev VARCHAR(150)
)
BEGIN
    UPDATE tulajokadatai
    SET teljes_nev = p_teljes_nev,
        email      = p_email,
        telefon    = p_telefon,
        cegnev     = p_cegnev
    WHERE id = p_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE tulaj_torol (IN p_id INT)
BEGIN
    UPDATE tulajokadatai
    SET torolve_at = CURRENT_TIMESTAMP
    WHERE id = p_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE tulaj_visszaallit (IN p_id INT)
BEGIN
    UPDATE tulajokadatai
    SET torolve_at = NULL
    WHERE id = p_id;
END$$
DELIMITER ;

-- TESZT
-- CALL tulaj_hozzaad('Teszt András','teszt@ceg.hu','06201234567','TesztCég Kft.');
-- CALL tulaj_lista();
-- CALL tulaj_id_alapjan(1);
-- CALL tulaj_modosit(1,'Új Név','uj@ceg.hu','06301231231','ÚjCég Kft.');
-- CALL tulaj_torol(1);
-- CALL tulaj_visszaallit(1);


-- ------------------------------------------------
-- 10) TULAJOKBELEPES (SOFT DELETE + LAST_LOGIN)
-- ------------------------------------------------

DELIMITER $$
CREATE PROCEDURE tulajbelepes_hozzaad (
    IN p_tulaj_id INT,
    IN p_felhasznalonev VARCHAR(60),
    IN p_jelszo_hash VARCHAR(60)
)
BEGIN
    INSERT INTO tulajokbelepes (tulaj_id, felhasznalonev, jelszo_hash)
    VALUES (p_tulaj_id, p_felhasznalonev, p_jelszo_hash);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE tulajbelepes_adatok (IN p_tulaj_id INT)
BEGIN
    SELECT tb.tulaj_id, tb.felhasznalonev, tb.jelszo_hash, tb.last_login, tb.torolve_at
    FROM tulajokbelepes tb
    WHERE tb.tulaj_id = p_tulaj_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE tulajbelepes_modosit (
    IN p_tulaj_id INT,
    IN p_felhasznalonev VARCHAR(60),
    IN p_jelszo_hash VARCHAR(60)
)
BEGIN
    UPDATE tulajokbelepes
    SET felhasznalonev = p_felhasznalonev,
        jelszo_hash    = p_jelszo_hash
    WHERE tulaj_id = p_tulaj_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE tulajbelepes_lastlogin_modosit (IN p_tulaj_id INT)
BEGIN
    UPDATE tulajokbelepes
    SET last_login = CURRENT_TIMESTAMP
    WHERE tulaj_id = p_tulaj_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE tulajbelepes_torol (IN p_tulaj_id INT)
BEGIN
    UPDATE tulajokbelepes
    SET torolve_at = CURRENT_TIMESTAMP
    WHERE tulaj_id = p_tulaj_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE tulajbelepes_visszaallit (IN p_tulaj_id INT)
BEGIN
    UPDATE tulajokbelepes
    SET torolve_at = NULL
    WHERE tulaj_id = p_tulaj_id;
END$$
DELIMITER ;

-- TESZT
-- CALL tulajbelepes_hozzaad('Teszt András','teszt@ceg.hu','06201234567','TesztCég Kft.');
-- CALL tulajbelepes_hozzaad(1,'tesztadmin','HASH123');
-- CALL tulajbelepes_adatok(1);
-- CALL tulajbelepes_modosit(1,'adminuser','HASH456');
-- CALL tulajbelepes_lastlogin_modosit(1);
-- CALL tulajbelepes_torol(1);
-- CALL tulajbelepes_visszaallit(1);

-- Login

DROP PROCEDURE IF EXISTS login;

DELIMITER //

CREATE PROCEDURE login(IN p_username VARCHAR(255))
BEGIN
    SELECT * FROM felhasznalok 
    WHERE nev = p_username COLLATE utf8mb4_unicode_ci 
       OR email = p_username COLLATE utf8mb4_unicode_ci;
END //

DELIMITER ;


INSERT INTO NightoutReserve_DB.tulajokadatai 
    (teljes_nev, email, telefon,letrehozva_at)
VALUES
    ('Kovács Péter', 'kovacs.peter@peldamail.hu', '+36301234567', CURRENT_TIMESTAMP),
    ('Nagy Anna', 'anna.nagy@peldamail.hu', '+36209876543',CURRENT_TIMESTAMP),
    ('Szabó Gábor', 'szabo.gabor@peldamail.hu', '+36705554433', CURRENT_TIMESTAMP),
    ('Tóth Zoltán', 'toth.zoltan@peldamail.hu', '+36301112233',CURRENT_TIMESTAMP);


INSERT INTO NightoutReserve_DB.szorakozohelyek 
    (tulaj_id, nev, cim, varos, leiras, nyitvatartas, asztalok_szama, letrehozva_at, torolve_at)
VALUES
    (1, 'Neon Bár', 'Király utca 12.', 'Pécs', 'Hangulatos koktélbár a belvárosban élőzenével.', '18:00 - 02:00', 15, CURRENT_TIMESTAMP, NULL),
    (2, 'Club Horizon', 'Petőfi Sándor sugárút 44.', 'Pécs', 'A város legnagyobb elektronikus zenei klubja.', '22:00 - 05:00', 30, CURRENT_TIMESTAMP, NULL),
    (3, 'Pince Borozó', 'Zsolnay Vilmos utca 8.', 'Pécs', 'Klasszikus borozó helyi borkülönlegességekkel.', '16:00 - 23:00', 10, CURRENT_TIMESTAMP, NULL),
    (1, 'Skyline Rooftop', 'Váci út 1.', 'Pécs', 'Exkluzív tetőterasz csodás kilátással és prémium italokkal.', '17:00 - 01:00', 25, CURRENT_TIMESTAMP, NULL),
    (4, 'Retro Kert', 'Kossuth Lajos tér 5.', 'Pécs', 'Szabadtéri szórakozóhely a 80-as és 90-es évek slágereivel.', '19:00 - 04:00', 40, CURRENT_TIMESTAMP, NULL);


-- 1. Játékok létrehozása
INSERT INTO NightoutReserve_DB.jatekok (nev, leiras) VALUES 
('Billiárd', 'Professzionális 9 lábas versenyasztal.'),
('Csocsó', 'Garlando versenycsocsó.'),
('Pingpong', 'Kiváló minőségű beltéri asztal.');

-- 2. Játékok hozzárendelése a szórakozóhelyhez (szorakozohely_id = 1)
-- Feltételezzük, hogy a játékok id-ja 1, 2, 3 lett.
INSERT INTO NightoutReserve_DB.jatek_szorakozohelyhez 
(szorakozohely_id, jatek_id, darab, ar_ora, min_idotartam_perc) VALUES 
(1, 1, 3, 2500, 60), -- 3 db billiárd, 2500 Ft/óra, min 1 óra
(1, 2, 2, 1500, 30), -- 2 db csocsó, 1500 Ft/óra, min 30 perc
(1, 3, 1, 2000, 60); -- 1 db pingpong, 2000 Ft/óra, min 1 óra

INSERT INTO NightoutReserve_DB.asztalok (szorakozohely_id, asztal_szam, ferohely) VALUES 
(1, 10, 2),
(1, 11, 4),
(1, 12, 6),
(1, 13, 2);


INSERT INTO tulajokbelepes (tulaj_id, felhasznalonev, jelszo, utolso_belepes) 
VALUES (1, 'tulajdonos@gmail.com', '$2a$12$m9rlaY65.eUtZUFyTaeTYeGK4cLSuZyyTSMh3Kky7T7KQa6HhBPMC', NOW());

ALTER TABLE tulajokbelepes 
ADD COLUMN szorakozohely_id INT,
ADD CONSTRAINT fk_tulaj_hely 
    FOREIGN KEY (szorakozohely_id) 
    REFERENCES szorakozohelyek(id);

UPDATE tulajokbelepes SET szorakozohely_id = 1 WHERE tulaj_id = 1;

-- -------------------------------------------------------

ALTER TABLE jatek_foglalasok 
DROP FOREIGN KEY fk_jatekfog_js_hely;
-- 1. Dobjuk ki a felesleges kapcsolótáblát!
DROP TABLE jatek_szorakozohelyhez;

-- 2. Tegyük bele a hiányzó oszlopokat közvetlenül a jatekok táblába!
ALTER TABLE jatekok
ADD COLUMN szorakozohely_id int(11) NOT NULL,
ADD COLUMN darab INT DEFAULT 1,
ADD COLUMN ar_ora INT
ADD COLUMN min_idotartam_perc INT DEFAULT 60;

DROP TRIGGER IF EXISTS trg_jatek_foglalas_ins;
DROP TRIGGER IF EXISTS trg_jatek_foglalas_upd;

DELIMITER //

-- 1. Az új INSERT Trigger
CREATE TRIGGER trg_jatek_foglalas_ins
BEFORE INSERT ON jatek_foglalasok
FOR EACH ROW
BEGIN
  DECLARE kapacitas INT;

  -- ITT A JAVÍTÁS: Már a 'jatekok' táblát kérdezzük!
  SELECT darab INTO kapacitas
  FROM jatekok
  WHERE id = NEW.jatek_id AND szorakozohely_id = NEW.szorakozohely_id;

  IF kapacitas IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nincs ilyen jatek ehhez a szorakozohelyhez.';
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
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Utkozes: nincs szabad jatekelem ebben az idopontban.';
  END IF;
END//

-- 2. Az új UPDATE Trigger
CREATE TRIGGER trg_jatek_foglalas_upd
BEFORE UPDATE ON jatek_foglalasok
FOR EACH ROW
BEGIN
  DECLARE kapacitas INT;

  -- ITT A JAVÍTÁS: Már a 'jatekok' táblát kérdezzük!
  SELECT darab INTO kapacitas
  FROM jatekok
  WHERE id = NEW.jatek_id AND szorakozohely_id = NEW.szorakozohely_id;

  IF kapacitas IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nincs ilyen jatek ehhez a szorakozohelyhez.';
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
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Utkozes: nincs szabad jatekelem ebben az idopontban.';
  END IF;
END//

DELIMITER ;

ALTER TABLE jatekok DROP INDEX nev;






-- vége