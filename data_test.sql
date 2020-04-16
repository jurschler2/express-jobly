\c jobly-test

DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS jobs;

CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees INTEGER,
    description text,
    logo_url text
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title text NOT NULL UNIQUE,
    salary FLOAT NOT NULL,
    equity FLOAT NOT NULL CHECK(equity <= 1),
    company_handle text NOT NULL REFERENCES companies (handle) ON DELETE CASCADE,
    date_posted timestamp without time zone NOT NULL DEFAULT current_timestamp
);