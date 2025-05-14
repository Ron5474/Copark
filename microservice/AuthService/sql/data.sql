-- This file is not included in the submission archive, anything you do here is just for manual "testing" via the Swagger UI --

----- Your insert statements go below here -----
\connect auth;

INSERT INTO account(id, data)
VALUES (
  '3662998e-a053-4789-b34a-4491468f56d6',
  jsonb_build_object(
    'name', 'Jason Xiong',
    'email', 'jxiong0822@outlook.com',
    'phone' , '123-456-7890',
    'pwhash', crypt('password1', gen_salt('bf')),
    'role', '["admin"]',
    'accountStatus', 'active'
  )
);

INSERT INTO account(data)
VALUES (
  jsonb_build_object(
    'name', 'Ronak Patel',
    'email', 'ronak@books.com',
    'phone' , '123-456-7890',
    'pwhash', crypt('password1', gen_salt('bf')),
    'role', '["admin"]',
    'accountStatus', 'active'
  )
);

INSERT INTO account(id, data)
VALUES (
  'abe405c6-7400-4d23-9f86-00ead15729f5',
  jsonb_build_object(
    'name', 'Antioch PD',
    'email', 'apd@pd.com',
    'role', '["police"]'
  )
);

INSERT INTO account(id, data)
VALUES (
  '39f48f9f-2693-446b-ad98-8e0db1ef14bd',
  jsonb_build_object(
    'name', 'Ronak Patel',
    'email', 'roapatel@ucsc.edu',
    'picture' , 'https://www.google.com/img',
    'sub', '12345678',
    'role', '["driver"]',
    'accountStatus', 'active'
  )
);

INSERT INTO account(id, data)
VALUES (
  '8dc65233-c590-45b7-9b10-a5b049600901',
  jsonb_build_object(
    'name', 'Enforcer 1',
    'email', 'enforcer1@outlook.com',
    'phone' , '123-456-7890',
    'pwhash', crypt('password1', gen_salt('bf')),
    'role', '["enforcement"]',
    'accountStatus', 'active'
  )
);

INSERT INTO account(id, data)
VALUES (
  '0f99f921-594e-4387-9d05-e6e80d8aa54a',
  jsonb_build_object(
    'name', 'Static Driver 1',
    'email', 'staticdriver1@outlook.com',
    'phone' , '123-456-7890',
    'pwhash', crypt('password1', gen_salt('bf')),
    'role', '["driver"]',
    'accountStatus', 'active'
  )
);

INSERT INTO account(data)
VALUES (
  jsonb_build_object(
    'name', 'Enforcer 2',
    'email', 'enforcer2@outlook.com',
    'phone' , '123-456-7890',
    'pwhash', crypt('password1', gen_salt('bf')),
    'role', '["enforcement"]',
    'accountStatus', 'active'
  )
);

INSERT INTO account(data)
VALUES (
  jsonb_build_object(
    'name', 'Driver 1',
    'email', 'driver1@outlook.com',
    'phone' , '123-456-7890',
    'pwhash', crypt('password1', gen_salt('bf')),
    'role', '["driver"]',
    'accountStatus', 'active'
  )
);

INSERT INTO account(data)
VALUES (
  jsonb_build_object(
    'name', 'Driver 2',
    'email', 'driver2@outlook.com',
    'phone' , '123-456-7890',
    'pwhash', crypt('password1', gen_salt('bf')),
    'role', '["driver"]',
    'accountStatus', 'active'
  )
);

INSERT INTO account(id, data)
VALUES (
  'b1eab387-1000-4ee3-a746-d59366e44f06',
  jsonb_build_object(
    'name', 'Bad Driver 1',
    'email', 'baddriver1@outlook.com',
    'phone' , '123-456-7890',
    'pwhash', crypt('password1', gen_salt('bf')),
    'role', '["driver"]',
    'accountStatus', 'active'
  )
);