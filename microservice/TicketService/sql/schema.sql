-- Your schema DDL (create table statements etc.) from Assignment 2 goes below here
\connect ticket;
DROP TABLE IF EXISTS ticket CASCADE;
CREATE TABLE ticket(
    id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle UUID,
    enforcer UUID,
    data jsonb
);