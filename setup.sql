CREATE EXTENSION citext;

CREATE TABLE users (
    id SERIAL NOT NULL,
    email CITEXT NOT NULL,
    password VARCHAR(60) NOT NULL,
    CONSTRAINT users_pk PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
)

CREATE TABLE diagram (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL
);

CREATE TABLE user_diagram (
    user_id INTEGER NOT NULL,
    diagram_id INTEGER NOT NULL,
    CONSTRAINT user_diagram_pk PRIMARY KEY (user_id, diagram_id)
);