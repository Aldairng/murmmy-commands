import Database, { Database as DatabaseType } from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'commandas.db');
const db: DatabaseType = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tables_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      position_row INTEGER DEFAULT 0,
      position_col INTEGER DEFAULT 0,
      notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS cereals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('especial','clasico')),
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS toppings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS syrups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cereal_ids TEXT DEFAULT '[]',
      topping_ids TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER NOT NULL REFERENCES tables_config(id),
      status TEXT DEFAULT 'active' CHECK(status IN ('active','completed')),
      created_at TEXT DEFAULT (datetime('now','localtime')),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('icecream','milkshake','water')),
      cereal_ids TEXT DEFAULT '[]',
      topping_ids TEXT DEFAULT '[]',
      syrup_id INTEGER REFERENCES syrups(id),
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  // Migration: add favorite_id to order_items if it doesn't exist
  try {
    db.exec('ALTER TABLE order_items ADD COLUMN favorite_id INTEGER REFERENCES favorites(id)');
  } catch {
    // Column already exists, safe to ignore
  }

  // Migration: add prep status tracking columns
  try {
    db.exec(`ALTER TABLE order_items ADD COLUMN prep_status TEXT DEFAULT 'new' CHECK(prep_status IN ('new','making','completed'))`);
  } catch { /* already exists */ }
  try {
    db.exec('ALTER TABLE order_items ADD COLUMN prep_started_at TEXT');
  } catch { /* already exists */ }
  try {
    db.exec('ALTER TABLE order_items ADD COLUMN prep_completed_at TEXT');
  } catch { /* already exists */ }

  seed();
}

function seed() {
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
  if (userCount.c > 0) return;

  const tx = db.transaction(() => {
    // User
    const hash = bcrypt.hashSync('murmmy2026', 10);
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('murmmy-orderer', hash);

    // Tables
    db.prepare('INSERT INTO tables_config (name, position_row, position_col, notes) VALUES (?, ?, ?, ?)').run('Mesa 1', 0, 0, '');
    db.prepare('INSERT INTO tables_config (name, position_row, position_col, notes) VALUES (?, ?, ?, ?)').run('Mesa 2', 0, 1, '');
    db.prepare('INSERT INTO tables_config (name, position_row, position_col, notes) VALUES (?, ?, ?, ?)').run('Mesa 3', 0, 2, '');

    // Cereals - Especiales
    const especialCereals = [
      'Oreos Puffs', 'Reeses Puffs', 'Cinnamon Toast Crunch', "S'mores",
      'Fruity Pebbles Marshmallow', 'Cookie Crisp', 'Lucky Charms',
      'Flips Chocolate', 'Flips Dulce Leche', 'KitKat'
    ];
    especialCereals.forEach((name, i) => {
      db.prepare('INSERT INTO cereals (name, category, sort_order) VALUES (?, ?, ?)').run(name, 'especial', i);
    });

    // Cereals - Clásicos
    const clasicoCereals = ['Choco Krispis', 'Zucaritas', 'Froot Loops', 'Milo'];
    clasicoCereals.forEach((name, i) => {
      db.prepare('INSERT INTO cereals (name, category, sort_order) VALUES (?, ?, ?)').run(name, 'clasico', i);
    });

    // Toppings
    const toppings = [
      'Oreos', 'Galletas Milo', 'Brownie Chocorramo', 'Minichips',
      'Galleta Sultana', 'Chokis', 'Masmelos', 'Mamut', 'Quipitos',
      'KitKat', 'M&Ms'
    ];
    toppings.forEach((name, i) => {
      db.prepare('INSERT INTO toppings (name, sort_order) VALUES (?, ?)').run(name, i);
    });

    // Syrups
    const syrups = ['Chocolate', 'Arequipe', 'Nutella', 'Lecherita', 'Caramelo'];
    syrups.forEach((name, i) => {
      db.prepare('INSERT INTO syrups (name, sort_order) VALUES (?, ?)').run(name, i);
    });

    // Favorites - need to look up cereal/topping IDs by name
    const getCerealId = db.prepare('SELECT id FROM cereals WHERE name = ?');
    const getToppingId = db.prepare('SELECT id FROM toppings WHERE name = ?');

    const favorites = [
      {
        name: 'Canela Dulce',
        cereals: ['Cinnamon Toast Crunch', 'Zucaritas'],
        toppings: ['Brownie Chocorramo'],
      },
      {
        name: 'Oreo Crunch',
        cereals: ['Oreos Puffs', 'Choco Krispis'],
        toppings: ['Galleta Sultana'],
      },
      {
        name: 'Cookie Monster',
        cereals: ['Cookie Crisp', 'Zucaritas'],
        toppings: ['Oreos'],
      },
      {
        name: 'Reeses Crujiente',
        cereals: ['Reeses Puffs', 'Choco Krispis'],
        toppings: ['Quipitos'],
      },
    ];

    favorites.forEach((fav) => {
      const cerealIds = fav.cereals.map((n) => (getCerealId.get(n) as { id: number }).id);
      const toppingIds = fav.toppings.map((n) => (getToppingId.get(n) as { id: number }).id);
      db.prepare('INSERT INTO favorites (name, cereal_ids, topping_ids) VALUES (?, ?, ?)').run(
        fav.name,
        JSON.stringify(cerealIds),
        JSON.stringify(toppingIds)
      );
    });
  });

  tx();
  console.log('Database seeded successfully');
}

export default db;
