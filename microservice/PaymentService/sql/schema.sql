-- Your schema DDL (create table statements etc.) from Assignment 2 goes below here
\connect payment;
DROP TABLE IF EXISTS payments CASCADE;
CREATE TABLE payments(
    id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
    driver UUID NOT NULL,
    data jsonb
);