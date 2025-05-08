\connect auth;

DROP TABLE IF EXISTS account CASCADE;
CREATE TABLE account(
    id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),
    data jsonb
);