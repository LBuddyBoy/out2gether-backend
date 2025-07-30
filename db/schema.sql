CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

DROP TABLE IF EXISTS favorite_posts;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS post_locations;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id serial PRIMARY KEY,
    username text NOT NULL UNIQUE,
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    avatar_url text NOT NULL DEFAULT 'https://www.gravatar.com/avatar/?d=mp&s=64',
    geolocation_latitude double precision,
    geolocation_longitude double precision,
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
    date date NOT NULL,
    image_url text NOT NULL DEFAULT 'https://via.placeholder.com/300'
);

CREATE TABLE post_locations(
    post_id int PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
    address text NOT NULL,
    country text NOT NULL,
    state text NOT NULL,
    city text NOT NULL,
    zip_code varchar(20) NOT NULL,
    geolocation_latitude double precision NOT NULL,
    geolocation_longitude double precision NOT NULL
);

CREATE TABLE cart_items(
    post_id int REFERENCES posts(id) ON DELETE CASCADE,
    owner_id int REFERENCES users(id) ON DELETE CASCADE,
    quantity int NOT NULL DEFAULT 1,
    PRIMARY KEY (post_id, owner_id)
);

CREATE TABLE favorite_posts(
    post_id int REFERENCES posts(id) ON DELETE CASCADE,
    user_id int REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, user_id)
);

-- earth_distance(ll_to_earth(102.039900, 18.672900), ll_to_earth(-140.367800, -56.644500));
--  13989518.293139538