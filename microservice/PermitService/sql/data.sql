-- This file is not included in the submission archive, anything you do here is just for manual "testing" via the Swagger UI --

----- Your insert statements go below here -----
\connect perm;

INSERT INTO location (id, name) VALUES
  (
    'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5',
    'UCSC Campus'
  );

INSERT INTO type (id, location, data) VALUES
  (
    'e314f688-d150-411e-aa4f-38e679112e0e',
    'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5',
    jsonb_build_object(
      'name', 'zone',
      'area', '123',
      'weekday', jsonb_build_object(
        'hourly', 2.45,
        'openTime', '07:00',
        'closeTime', '20:00',
        'maxDuration', jsonb_build_object(
          'hours', 2,
          'minutes', 0
        )
      ),
      'weekend', jsonb_build_object(
        'hourly', 2.95,
        'openTime', '07:00',
        'closeTime', '20:00'
      )
    )
  );

INSERT INTO type (id, location, data) VALUES
  (
    '39f48f9f-2693-446b-ad98-f72298bc7bbe',
    'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5',
    jsonb_build_object(
      'name', 'zone',
      'area', '111',
      'weekday', jsonb_build_object(
        'hourly', 3.00,
        'openTime', '07:00',
        'closeTime', '20:00',
        'maxDuration', jsonb_build_object(
          'hours', 2,
          'minutes', 0
        )
      ),
      'weekend', jsonb_build_object(
        'hourly', 2.02,
        'openTime', '07:00',
        'closeTime', '20:00'
      )
    )
  );

INSERT INTO type (id, location, data) VALUES
  (
    'f26adf21-f967-4283-8417-8e0db1ef14bd',
    'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5',
    jsonb_build_object(
      'name', 'zone',
      'area', '27',
      'weekday', jsonb_build_object(
        'hourly', 2.02,
        'openTime', '07:00',
        'closeTime', '20:00'
      ),
      'weekend', jsonb_build_object()
    )
  );

INSERT INTO type (id, location, data) VALUES
  (
    '1d603a73-4b75-48d8-b677-48b81b7fa3f4',
    'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5',
    jsonb_build_object(
      'name', 'zone',
      'area', '101',
      'weekday', jsonb_build_object(
        'hourly', 2.50,
        'openTime', '00:00',
        'closeTime', '23:59'
      ),
      'weekend', jsonb_build_object(
        'hourly', 2.50,
        'openTime', '00:00',
        'closeTime', '23:59'
      )
    )
  );

INSERT INTO type (id, location, data) VALUES
  (
    '6fb2ad6d-431c-47e4-b5dd-81c3847f6ad6',
    'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5',
    jsonb_build_object(
      'name', 'zone',
      'area', '000',
      'weekday', jsonb_build_object(),
      'weekend', jsonb_build_object()
    )
  );

INSERT INTO permit (vehicle, zone, data) VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  'e314f688-d150-411e-aa4f-38e679112e0e',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '1 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate', to_char((now() - interval '1 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expiresDate', to_char((now() + interval '1 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 2.45,
      'total', 2.95
    ),
    'paymentMethod', 'credit'
  )
);