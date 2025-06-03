-- This file is not included in the submission archive, anything you do here is just for manual "testing" via the Swagger UI --

----- Your insert statements go below here -----
\connect perm;

INSERT INTO location (id, data) VALUES
  (
    'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5',
    jsonb_build_object(
      'name', 'UCSC Campus'
    )
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

INSERT INTO type (id, location, data) VALUES
  (
    '7604a7e6-6127-4b48-b24a-25a7f8bb8353',
    'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5',
    jsonb_build_object(
      'name', 'zone',
      'area', '999'
    )
  );

INSERT INTO type (id, location, data) VALUES
  (
    'e6a7230d-3842-4a11-96e4-6715e1185a25',
    'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5',
    jsonb_build_object(
      'name', 'lot',
      'area', 'ANY',
      'daily', jsonb_build_object(
        'price', 15
      ),
      'quarterly', jsonb_build_object(
        'price', 200,
        'activeDate', '2025-03-31T00:00:00-07:00',
        'expireDate', '2025-06-12T23:59:59-07:00'
      ),
      'yearly', jsonb_build_object(
        'price', 500,
        'activeDate', '2024-09-21T00:00:00-07:00',
        'expireDate', '2025-06-12T23:59:59-07:00'
      )
    )
  );

INSERT INTO type (id, location, data) VALUES
  (
    'b7a7d5d0-1b8f-4b02-a012-5c667ef2ecb1',
    'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5',
    jsonb_build_object(
      'name', 'lot',
      'area', 'A',
      'daily', jsonb_build_object(
        'price', 12
      ),
      'quarterly', jsonb_build_object(
        'price', 150,
        'activeDate', '2025-03-31T00:00:00-07:00',
        'expireDate', '2025-06-12T23:59:59-07:00'
      ),
      'yearly', jsonb_build_object(
        'price', 350,
        'activeDate', '2024-09-21T00:00:00-07:00',
        'expireDate', '2025-06-12T23:59:59-07:00'
      )
    )
  );

INSERT INTO type (id, location, data) VALUES
  (
    '93e3c80a-95ca-4f21-803a-2680b4d1994e',
    'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5',
    jsonb_build_object(
      'name', 'lot',
      'area', 'B',
      'daily', jsonb_build_object(
        'price', 10
      ),
      'quarterly', jsonb_build_object(
        'price', 120,
        'activeDate', '2025-03-31T00:00:00-07:00',
        'expireDate', '2025-06-12T23:59:59-07:00'
      ),
      'yearly', jsonb_build_object(
        'price', 300,
        'activeDate', '2024-09-21T00:00:00-07:00',
        'expireDate', '2025-06-12T23:59:59-07:00'
      )
    )
  );

INSERT INTO type (id, location, data) VALUES
  (
    '1a6fc438-e678-426a-a5fd-44cd6740ffb2',
    'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5',
    jsonb_build_object(
      'name', 'lot',
      'area', 'C',
      'daily', jsonb_build_object(
        'price', 8
      ),
      'quarterly', jsonb_build_object(
        'price', 100,
        'activeDate', '2025-03-31T00:00:00-07:00',
        'expireDate', '2025-06-12T23:59:59-07:00'
      ),
      'yearly', jsonb_build_object(
        'price', 250,
        'activeDate', '2024-09-21T00:00:00-07:00',
        'expireDate', '2025-06-12T23:59:59-07:00'
      )
    )
  );

INSERT INTO type (id, location, data) VALUES
  (
    'f1a4a8d3-8c3e-4e30-b37f-bf90cd41972b',
    'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5',
    jsonb_build_object(
      'name', 'lot',
      'area', 'R',
      'daily', jsonb_build_object(
        'price', 6
      ),
      'quarterly', jsonb_build_object(
        'price', 80,
        'activeDate', '2025-03-31T00:00:00-07:00',
        'expireDate', '2025-06-12T23:59:59-07:00'
      ),
      'yearly', jsonb_build_object(
        'price', 200,
        'activeDate', '2024-09-21T00:00:00-07:00',
        'expireDate', '2025-06-12T23:59:59-07:00'
      )
    )
  );

-- INSERT INTO type (id, location, data) VALUES
--   (
--     '94dcbb2d-a047-4f00-bba0-3d5c9a4c2887',
--     'd731ac38-5a5f-4cea-be89-cfc8ce69f1d5',
--     jsonb_build_object(
--       'name', 'lot',
--       'area', 'T'
--     )
--   );

INSERT INTO permit (vehicle, type, data) VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  'e314f688-d150-411e-aa4f-38e679112e0e',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '1 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate', to_char((now() - interval '1 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate', to_char((now() + interval '1 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', '123',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 2.45,
      'total', 2.95
    ),
    'durationType', 'zone',
    'paymentMethod', 'credit'
  )
);

INSERT INTO permit (vehicle, type, data) VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  '39f48f9f-2693-446b-ad98-f72298bc7bbe',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '3 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate', to_char((now() - interval '3 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate', to_char((now() + interval '1 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', '123',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 19.00,
      'total', 19.50
    ),
    'durationType', 'zone',
    'paymentMethod', 'credit'
  )
);

INSERT INTO permit (vehicle, type, data) VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  '39f48f9f-2693-446b-ad98-f72298bc7bbe',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '5 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate', to_char((now() - interval '5 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate', to_char((now() + interval '15 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', '123',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 99.00,
      'total', 99.50
    ),
    'durationType', 'zone',
    'paymentMethod', 'credit'
  )
);

INSERT INTO permit (vehicle, type, data) VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  'f26adf21-f967-4283-8417-8e0db1ef14bd',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '3 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate', to_char((now() - interval '3 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate', to_char((now() + interval '1 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', '123',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 19.00,
      'total', 19.50
    ),
    'durationType', 'zone',
    'paymentMethod', 'credit'
  )
);

INSERT INTO permit (vehicle, type, data) VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  'f26adf21-f967-4283-8417-8e0db1ef14bd',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '2 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate', to_char((now() - interval '2 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate', to_char((now() + interval '5 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', '123',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 19.00,
      'total', 19.50
    ),
    'durationType', 'zone',
    'paymentMethod', 'credit'
  )
);

-- changed it to R from 123 and the duration to daily
INSERT INTO permit (vehicle, type, data) VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  'f1a4a8d3-8c3e-4e30-b37f-bf90cd41972b',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '2 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate', to_char((now() - interval '2 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate', to_char((now() + interval '5 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', 'R',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 19.00,
      'total', 19.50
    ),
    'durationType', 'daily',
    'paymentMethod', 'credit'
  )
);

INSERT INTO permit (vehicle, type, data) VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  '1a6fc438-e678-426a-a5fd-44cd6740ffb2',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '10 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate', to_char((now() - interval '10 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate', to_char((now() + interval '355 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', 'C',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 200.00,
      'total', 200.50
    ),
    'durationType', 'yearly',
    'paymentMethod', 'credit'
  )
);


INSERT INTO permit (vehicle, type, data) VALUES (
  'b69c877b-cfde-430c-8856-a2354d2e0d06',
  '1a6fc438-e678-426a-a5fd-44cd6740ffb2',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '10 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate', to_char((now() - interval '10 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate', to_char((now() + interval '355 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', 'C',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 200.00,
      'total', 200.50
    ),
    'durationType', 'yearly',
    'paymentMethod', 'credit'
  )
);

-- Additional data for lot ANY with duration yearly (5 purchases)
INSERT INTO permit (vehicle, type, data) VALUES (
  'd1cc6477-cc4d-42fa-adcc-1bf7ec54d849',
  'e6a7230d-3842-4a11-96e4-6715e1185a25',  -- lot ANY
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '40 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate',   to_char((now() - interval '40 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate',   to_char((now() + interval '325 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', 'ANY',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 500.00,
      'total', 500.50
    ),
    'durationType', 'yearly',
    'paymentMethod', 'credit'
  )
);

INSERT INTO permit (vehicle, type, data) VALUES (
  'd818c096-5d9e-4e43-8a7d-c9a7a956ad7e',
  'e6a7230d-3842-4a11-96e4-6715e1185a25',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '35 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate',   to_char((now() - interval '35 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate',   to_char((now() + interval '330 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', 'ANY',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 500.00,
      'total', 500.50
    ),
    'durationType', 'yearly',
    'paymentMethod', 'credit'
  )
);

INSERT INTO permit (vehicle, type, data) VALUES (
  'd2b79fce-8c97-44d9-99d3-43a96c803824',
  'e6a7230d-3842-4a11-96e4-6715e1185a25',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '30 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate',   to_char((now() - interval '30 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate',   to_char((now() + interval '335 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', 'ANY',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 500.00,
      'total', 500.50
    ),
    'durationType', 'yearly',
    'paymentMethod', 'credit'
  )
);

INSERT INTO permit (vehicle, type, data) VALUES (
  'f4af720a-2a51-4f34-a165-21c65ec51af0',
  'e6a7230d-3842-4a11-96e4-6715e1185a25',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '25 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate',   to_char((now() - interval '25 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate',   to_char((now() + interval '340 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', 'ANY',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 500.00,
      'total', 500.50
    ),
    'durationType', 'yearly',
    'paymentMethod', 'credit'
  )
);

INSERT INTO permit (vehicle, type, data) VALUES (
  'e222f227-04b7-4c80-a1b5-0a93d623e22f',
  'e6a7230d-3842-4a11-96e4-6715e1185a25',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '20 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate',   to_char((now() - interval '20 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate',   to_char((now() + interval '345 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', 'ANY',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 500.00,
      'total', 500.50
    ),
    'durationType', 'yearly',
    'paymentMethod', 'credit'
  )
);

INSERT INTO permit (vehicle, type, data) VALUES (
  '6af1d0de-56d1-42c0-9603-2d3e74c3423c',
  'e6a7230d-3842-4a11-96e4-6715e1185a25',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '15 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate',   to_char((now() - interval '15 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate',   to_char((now() + interval '75 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', 'ANY',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 200.00,
      'total', 200.50
    ),
    'durationType', 'quarterly',
    'paymentMethod', 'credit'
  )
);

INSERT INTO permit (vehicle, type, data) VALUES (
  'ff32e571-77ea-4021-92ac-09662a6aac98',
  'e6a7230d-3842-4a11-96e4-6715e1185a25',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '15 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate',   to_char((now() - interval '15 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate',   to_char((now() + interval '75 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', 'ANY',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 15.00,
      'total', 15.50
    ),
    'durationType', 'daily',
    'paymentMethod', 'credit'
  )
);

-- Additional data for lot A with duration quarterly (3 purchases)
INSERT INTO permit (vehicle, type, data) VALUES (
  '6af1d0de-56d1-42c0-9603-2d3e74c3423c',
  'b7a7d5d0-1b8f-4b02-a012-5c667ef2ecb1',  -- lot A
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '15 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate',   to_char((now() - interval '15 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate',   to_char((now() + interval '75 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', 'A',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 150.00,
      'total', 150.50
    ),
    'durationType', 'quarterly',
    'paymentMethod', 'credit'
  )
);

INSERT INTO permit (vehicle, type, data) VALUES (
  'ff32e571-77ea-4021-92ac-09662a6aac98',
  'b7a7d5d0-1b8f-4b02-a012-5c667ef2ecb1',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '10 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate',   to_char((now() - interval '10 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate',   to_char((now() + interval '80 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', 'A',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 150.00,
      'total', 150.50
    ),
    'durationType', 'quarterly',
    'paymentMethod', 'credit'
  )
);

INSERT INTO permit (vehicle, type, data) VALUES (
  '57955cc7-ac05-4d08-a934-6ba34daf70a2',
  'b7a7d5d0-1b8f-4b02-a012-5c667ef2ecb1',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '5 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate',   to_char((now() - interval '5 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate',   to_char((now() + interval '85 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', 'A',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 150.00,
      'total', 150.50
    ),
    'durationType', 'quarterly',
    'paymentMethod', 'credit'
  )
);

-- Additional data for lot B with duration daily (2 purchases)
INSERT INTO permit (vehicle, type, data) VALUES (
  '2bfe2b7d-68b5-4623-b86e-383a43cc8cc4',
  '93e3c80a-95ca-4f21-803a-2680b4d1994e',  -- lot B
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '2 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate',   to_char((now() - interval '2 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate',   to_char((now() + interval '1 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', 'B',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 10.00,
      'total', 10.50
    ),
    'durationType', 'daily',
    'paymentMethod', 'credit'
  )
);

INSERT INTO permit (vehicle, type, data) VALUES (
  '734af2a0-dd4b-4f68-b3e4-b214842d0143',
  '93e3c80a-95ca-4f21-803a-2680b4d1994e',
  jsonb_build_object(
    'purchaseDate', to_char((now() - interval '1 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'activeDate',   to_char((now() - interval '1 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'expireDate',   to_char((now() + interval '1 day'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'area', 'B',
    'receipt', jsonb_build_object(
      'service', 0.50,
      'subTotal', 10.00,
      'total', 10.50
    ),
    'durationType', 'daily',
    'paymentMethod', 'credit'
  )
);
