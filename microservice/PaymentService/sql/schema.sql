-- Your schema DDL (create table statements etc.) from Assignment 2 goes below here
\connect auth;
DROP TABLE IF EXISTS payment CASCADE;
CREATE TABLE account(
    id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
    user UUID NOT NULL,
    data jsonb
);