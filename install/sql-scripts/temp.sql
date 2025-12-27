-- some sql scripts
-- only for testing
DROP DATABASE IF EXISTS NightoutReserve_DB;

CREATE DATABASE NightoutReserve_DB
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE NightoutReserve_DB;


CREATE TABLE userprofiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50) NOT NULL UNIQUE,
    username VARCHAR(12) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    deletedAt DATETIME NULL
);

DELIMITER $$

CREATE PROCEDURE login(IN usernameIn VARCHAR(12))
BEGIN
    SELECT 
        id,
        email,
        username,
        password,
        createdAt,
        deletedAt
    FROM userprofiles
    WHERE username = usernameIn
      AND deletedAt IS NULL;
END $$

DELIMITER ;

INSERT INTO userprofiles (email, username, password, createdAt)
VALUES
(
    'john.doe@example.com',
    'johndoe',
    '$2a$12$8Xi5wSgjsehjAkHRBlSGJOBTkCCKLbeZ0oFndlrvh3oC3UUI0z9PC', -- Password123
    NOW()
);
