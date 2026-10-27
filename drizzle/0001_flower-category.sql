INSERT INTO categories (id, name) VALUES ('cicek', 'Çiçek') ON CONFLICT (id) DO NOTHING;
