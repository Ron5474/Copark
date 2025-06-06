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
  'e314f688-d150-411e-aa4f-4b0e6e56319d',
  '8dc65233-c590-45b7-9b10-a5b049600901',
  jsonb_build_object(
    'issuedDate', NOW() - INTERVAL '1 minute',
    'violation', 'accidental speeding',
    'fine', 500,
    'ticketStatus', 'accepted',
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
  '431b3711-73bb-4c90-afcf-59116217c0db',
  jsonb_build_object(
    'issuedDate', NOW() - INTERVAL '1 day',
    'violation', 'Eating while driving',
    'fine', 2,
    'ticketStatus', 'unpaid',
    'images', '[]'
  )
);

INSERT INTO ticket (id, vehicle, enforcer, data)
VALUES (
  '6b5531a5-5ba9-419b-98bb-eda4b0eb2953',
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  '431b3711-73bb-4c90-afcf-59116217c0db',
  jsonb_build_object(
    'issuedDate', NOW() - INTERVAL '1 day',
    'violation', 'this is a challenged ticket that will be accepted',
    'fine', 2,
    'ticketStatus', 'challenged',
    'images', '[]',
    'note', 'this is a note for the ticket that will be accepted',
    'challengeReason', 'this is a reason for the challenge (good reason, will be accepted)'
  )
);

INSERT INTO ticket (id, vehicle, enforcer, data)
VALUES (
  '08639453-71e7-4407-86d0-56c8eb1d8419',
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  '431b3711-73bb-4c90-afcf-59116217c0db',
  jsonb_build_object(
    'issuedDate', NOW() - INTERVAL '1 day',
    'violation', 'this is a challenged ticket that will be rejected',
    'fine', 2,
    'ticketStatus', 'challenged',
    'images', '[]',
    'note', 'this is a note for the ticket that will be rejected',
    'challengeReason', 'this is a reason for the challenge (bad reason, will be rejected)'
  )
);

INSERT INTO ticket (vehicle, enforcer, data)
VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  '431b3711-73bb-4c90-afcf-59116217c0db',
  jsonb_build_object(
    'issuedDate', NOW() - INTERVAL '2 day',
    'violation', 'destroying the sun',
    'fine', 2,
    'ticketStatus', 'unpaid',
    'images', '[]',
    'note', 'HE OBLITERATED THE SUN'
  )
);

INSERT INTO ticket (vehicle, enforcer, data)
VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  '431b3711-73bb-4c90-afcf-59116217c0db',
  jsonb_build_object(
    'issuedDate', NOW() - INTERVAL '3 day',
    'violation', 'jaywalking',
    'fine', 10,
    'ticketStatus', 'unpaid',
    'images', '[]',
    'note', 'Crossed the street illegally'
  )
);

INSERT INTO ticket (vehicle, enforcer, data)
VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  '431b3711-73bb-4c90-afcf-59116217c0db',
  jsonb_build_object(
    'issuedDate', NOW() - INTERVAL '4 day',
    'violation', 'illegal u-turn',
    'fine', 75,
    'ticketStatus', 'unpaid',
    'images', '[]',
    'note', 'Performed u-turn at no u-turn sign'
  )
);

INSERT INTO ticket (vehicle, enforcer, data)
VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  '431b3711-73bb-4c90-afcf-59116217c0db',
  jsonb_build_object(
    'issuedDate', NOW() - INTERVAL '4 day',
    'violation', 'smuggling illegal goods',
    'fine', 75,
    'ticketStatus', 'unpaid',
    'images', '[]',
    'note', 'yohoho, this is a pirate ship, we smuggle illegal goods'
  )
);

INSERT INTO ticket (vehicle, enforcer, data)
VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  '8dc65233-c590-45b7-9b10-a5b049600901',
  jsonb_build_object(
    'issuedDate', NOW() - INTERVAL '4 day',
    'violation', 'drinking and driving',
    'fine', 200,
    'ticketStatus', 'unpaid',
    'images', '[]',
    'note', 'Alcohol test was positive, driver was under the influence'
  )
);

INSERT INTO ticket (vehicle, enforcer, data)
VALUES (
  '2351f78f-6c7f-4e0a-a1cf-5d79baedf2f5',
  '431b3711-73bb-4c90-afcf-59116217c0db',
  jsonb_build_object(
    'issuedDate', NOW() - INTERVAL '5 day',
    'violation', 'running a red light',
    'fine', 150,
    'ticketStatus', 'unpaid',
    'images', '[]',
    'note', 'Did not stop at red light'
  )
);