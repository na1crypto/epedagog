-- E-PEDAGOG Seed Data
-- Default admin user (password: admin123, bcrypt hash)

INSERT INTO users (full_name, email, password_hash, role, subject, phone, is_active)
VALUES
  ('Adminov Admin', 'admin@epedagog.uz', '$2b$12$LJ3m4ys3uz0b5dGDKq0zPOFHXnFX9vBt7yS2N8vKfGxLpV3dW5IHe', 'admin', NULL, '+998901234567', true),
  ('Karimov Olimjon', 'olimjon@epedagog.uz', '$2b$12$LJ3m4ys3uz0b5dGDKq0zPOFHXnFX9vBt7yS2N8vKfGxLpV3dW5IHe', 'pedagog', 'Matematika', '+998901234568', true),
  ('Rahimova Nilufar', 'nilufar@epedagog.uz', '$2b$12$LJ3m4ys3uz0b5dGDKq0zPOFHXnFX9vBt7yS2N8vKfGxLpV3dW5IHe', 'pedagog', 'Ingliz tili', '+998901234569', true),
  ('Toshmatov Sardor', 'sardor@epedagog.uz', '$2b$12$LJ3m4ys3uz0b5dGDKq0zPOFHXnFX9vBt7yS2N8vKfGxLpV3dW5IHe', 'pedagog', 'Fizika', '+998901234570', true),
  ('Mehmon Foydalanuvchi', 'mehmon@epedagog.uz', '$2b$12$LJ3m4ys3uz0b5dGDKq0zPOFHXnFX9vBt7yS2N8vKfGxLpV3dW5IHe', 'mehmon', NULL, NULL, true)
ON CONFLICT (email) DO NOTHING;
