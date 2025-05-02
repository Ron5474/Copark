-- Your schema DDL (create table statements etc.) from Assignment 2 goes below here
DROP TABLE IF EXISTS account CASCADE;
CREATE TABLE member(
    id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
    data jsonb
);