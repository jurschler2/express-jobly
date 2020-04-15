\c jobly-test

DROP TABLE IF EXISTS companies CASCADE;

CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees INTEGER,
    description text,
    logo_url text
);