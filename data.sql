\c jobly

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

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 2000,'Maker of OSX.', 'http://apple.com/apple_logo'),
         ('ibm', 'IBM', 5000, 'Big blue.', 'http://ibm.com/ibm_logo'),
         ('gene', 'Genentech', 1000, 'Makes cool bio stuff', 'http://genentech.com/genentech_logo');


INSERT INTO jobs
  VALUES (1, 'Software Engineer', 150000, .02, 'apple', current_timestamp),
         (2, 'Accountant', 50000, 0, 'apple', current_timestamp),
         (3, 'Chemist', 90000, .003, 'gene', current_timestamp)