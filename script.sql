CREATE DATABASE skatepark;

\c skatepark;

CREATE TABLE skaters (
    id SERIAL, 
    email VARCHAR(50) NOT NULL,
    nombre VARCHAR(25) NOT NULL,
    password VARCHAR(25) NOT NULL, 
    anos_experiencia INT NOT NULL, 
    especialidad VARCHAR(50) NOT NULL, 
    foto VARCHAR(255) NOT NULL, 
    estado BOOLEAN NOT NULL
);

\dt 

\d skaters;

-- INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES ('skater1@correo.com', 'Skater 1', '123', 5, 'Vert Ramp', './public/uploads/tony.jpg', TRUE);
-- C:\Users\Andrea\Desktop\Beca Talento Digital\Modulo 8\dia 11 viernes 24 mayo - prueba\prueba_skatepark\public\uploads\tony.jpg 

-- INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES ('skater1@correo.com', 'Skater 1', '123', 5, 'Vert Ramp', '/uploads/tony.jpg', TRUE);
