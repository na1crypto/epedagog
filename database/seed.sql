-- E-PEDAGOG Seed Data
-- Default users (password: admin123 / pedagog123, bcrypt hash)

INSERT IGNORE INTO users (full_name, email, password_hash, role, subject, phone, is_active)
VALUES
  ('Adminov Admin', 'admin@epedagog.uz', '$2b$12$LJ3m4ys3uz0b5dGDKq0zPOFHXnFX9vBt7yS2N8vKfGxLpV3dW5IHe', 'admin', NULL, '+998901234567', 1),
  ('Karimov Olimjon', 'olimjon@epedagog.uz', '$2b$12$LJ3m4ys3uz0b5dGDKq0zPOFHXnFX9vBt7yS2N8vKfGxLpV3dW5IHe', 'pedagog', 'Matematika', '+998901234568', 1),
  ('Rahimova Nilufar', 'nilufar@epedagog.uz', '$2b$12$LJ3m4ys3uz0b5dGDKq0zPOFHXnFX9vBt7yS2N8vKfGxLpV3dW5IHe', 'pedagog', 'Ingliz tili', '+998901234569', 1),
  ('Toshmatov Sardor', 'sardor@epedagog.uz', '$2b$12$LJ3m4ys3uz0b5dGDKq0zPOFHXnFX9vBt7yS2N8vKfGxLpV3dW5IHe', 'pedagog', 'Fizika', '+998901234570', 1),
  ('Mehmon Foydalanuvchi', 'mehmon@epedagog.uz', '$2b$12$LJ3m4ys3uz0b5dGDKq0zPOFHXnFX9vBt7yS2N8vKfGxLpV3dW5IHe', 'mehmon', NULL, NULL, 1);
