\connect perm;

DROP TABLE IF EXISTS location CASCADE;
CREATE TABLE location (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data JSONB NOT NULL
);

DROP TABLE IF EXISTS type CASCADE;
CREATE TABLE type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location UUID NOT NULL REFERENCES location(id),
    data JSONB NOT NULL
);

DROP TABLE IF EXISTS permit CASCADE;
CREATE TABLE permit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle UUID NOT NULL,
    type UUID NOT NULL REFERENCES type(id),
    data JSONB NOT NULL
);
