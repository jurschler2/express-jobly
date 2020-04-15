\c jobly

DROP TABLE IF EXISTS companies CASCADE;

CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees INTEGER,
    description text,
    logo_url text
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 2000,'Maker of OSX.', 'http://apple.com/apple_logo'),
         ('ibm', 'IBM', 5000, 'Big blue.', 'http://ibm.com/ibm_logo'),
         ('gene', 'Genentech', 1000, 'Makes cool bio stuff', 'http://genentech.com/genentech_logo');