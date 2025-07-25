CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS post_locations;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id serial PRIMARY KEY,
    username text NOT NULL UNIQUE,
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    avatar_url text NOT NULL DEFAULT 'https://www.gravatar.com/avatar/?d=mp&s=64',
    geolocation_longitude decimal(9, 6),
    geolocation_latitude decimal(9, 6),
    is_admin boolean NOT NULL DEFAULT false
);

CREATE TABLE categories(
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text NOT NULL
);

CREATE TABLE posts(
    id serial PRIMARY KEY,
    created_at timestamp NOT NULL DEFAULT now(),
    user_id int REFERENCES users(id) ON DELETE CASCADE,
    category_id int REFERENCES categories(id) ON DELETE CASCADE,
    title text NOT NULL,
    body text NOT NULL,
    price decimal(10, 2) NOT NULL,
    date date NOT NULL
);

CREATE TABLE post_locations(
    post_id int PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
    address text NOT NULL,
    country text NOT NULL,
    state text NOT NULL,
    city text NOT NULL,
    zip_code varchar(20) NOT NULL,
    geolocation_longitude decimal(9, 6) NOT NULL,
    geolocation_latitude decimal(9, 6) NOT NULL
);
