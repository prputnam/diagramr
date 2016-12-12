DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE EXTENSION CITEXT;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email CITEXT NOT NULL,
    password VARCHAR(60) NOT NULL,
    username CITEXT NOT NULL,
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
);

CREATE TABLE diagrams (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    diagram TEXT
);

CREATE TABLE user_diagrams (
    user_id INTEGER NOT NULL REFERENCES users (id),
    diagram_id INTEGER NOT NULL REFERENCES diagrams (id),
    CONSTRAINT user_diagram_pk PRIMARY KEY (user_id, diagram_id)
);

CREATE TABLE chat_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    diagram_id INTEGER REFERENCES diagrams (id),
    message_datetime TIMESTAMP NOT NULL,
    message TEXT NOT NULL
);


-- Add entry for lobby
INSERT INTO diagrams VALUES
(-1, 'Lobby', null);