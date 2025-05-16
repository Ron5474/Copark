-- This file is not included in the submission archive, anything you do here is just for manual "testing" via the Swagger UI --

----- Your insert statements go below here -----
\connect ticket;
INSERT INTO ticket (vehicle, enforcer, data)
VALUES (
  'e314f688-d150-411e-aa4f-4b0e6e56319d',
  '8dc65233-c590-45b7-9b10-a5b049600901',
  jsonb_build_object(
    'issuedDate', NOW() - INTERVAL '1 minute',
    'violation', 'speeding',
    'fine', 100,
    'ticketStatus', 'unpaid',
    'images', '[]'
  )
);

INSERT INTO ticket (vehicle, enforcer, data)
VALUES (
  'f26adf21-f967-4283-8417-f72298bc7bbe',
  '8dc65233-c590-45b7-9b10-a5b049600901',
  jsonb_build_object(
    'issuedDate', NOW(),
    'violation', 'parking',
    'fine', 50,
    'ticketStatus', 'unpaid',
    'images', '[]'
  )
);

INSERT INTO ticket (vehicle, enforcer, data)
VALUES (
  'b69c877b-cfde-430c-8856-a2354d2e0d06',
  '8dc65233-c590-45b7-9b10-a5b049600901',
  jsonb_build_object(
    'issuedDate', NOW(),
    'violation', 'parking',
    'fine', 50,
    'ticketStatus', 'unpaid',
    'images', '[]'
  )
);


INSERT INTO ticket (vehicle, enforcer, data)
VALUES (
  'f2d7800e-67ce-41aa-b1fe-38e679112e0e',
  '8dc65233-c590-45b7-9b10-a5b049600901',
  jsonb_build_object(
    'issuedDate', NOW(),
    'violation', 'parking',
    'fine', 6969696969,
    'ticketStatus', 'unpaid',
    'images', '[]'
  )
);


-- below are three tickets for bad driver

INSERT INTO ticket (vehicle, enforcer, data)
VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  '8dc65233-c590-45b7-9b10-a5b049600901',
  jsonb_build_object(
    'issuedDate', NOW(),
    'violation', 'hitting a pedestrian',
    'fine', 9999,
    'ticketStatus', 'unpaid',
    'images', '[]'
  )
);

INSERT INTO ticket (vehicle, enforcer, data)
VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  '8dc65233-c590-45b7-9b10-a5b049600901',
  jsonb_build_object(
    'issuedDate', NOW(),
    'violation', 'arson',
    'fine', 1234,
    'ticketStatus', 'unpaid',
    'images', '[]'
  )
);

INSERT INTO ticket (vehicle, enforcer, data)
VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  '8dc65233-c590-45b7-9b10-a5b049600901',
  jsonb_build_object(
    'issuedDate', NOW(),
    'violation', 'drag racing',
    'fine', 891237,
    'ticketStatus', 'unpaid',
    'images', '[]'
  )
);

INSERT INTO ticket (vehicle, enforcer, data)
VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  '8dc65233-c590-45b7-9b10-a5b049600901',
  jsonb_build_object(
    'issuedDate', NOW() - INTERVAL '1 day',
    'violation', 'Eating while driving',
    'fine', 2,
    'ticketStatus', 'unpaid',
    'images', '[]'
  )
);