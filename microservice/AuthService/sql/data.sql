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