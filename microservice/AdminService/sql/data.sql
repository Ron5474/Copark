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
    'accountStatus', 'inactive'
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
  'e5c592ed-2a4a-45b9-9802-c70c6914c6fd',
  jsonb_build_object(
    'name', 'UCSD Registrar',
    'email', 'registrar@ucsc.edu',
    'role', '["registrar"]'
  )
);

-- For OAuth Testing
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
  '4c0d7053-7bab-4494-8d42-d7384d983809',
  jsonb_build_object(
    'name', 'Bryant Oliver',
    'email', 'bcoliver@ucsc.edu',
    'picture' , 'https://www.google.com/img',
    'sub', '12345679',
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