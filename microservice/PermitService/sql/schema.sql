\connect perm;

DROP TABLE IF EXISTS zone CASCADE;
CREATE TABLE zone (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data JSONB NOT NULL
);

DROP TABLE IF EXISTS permit CASCADE;
CREATE TABLE permit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle UUID NOT NULL,
    zone UUID NOT NULL REFERENCES zone(id),
    data JSONB NOT NULL
);
