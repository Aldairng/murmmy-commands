import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', (_req, res) => {
  const favorites = db.prepare('SELECT * FROM favorites ORDER BY id').all();
  res.json(favorites);
});

router.post('/', (req, res) => {
  const { name, cereal_ids = [], topping_ids = [] } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  const result = db.prepare('INSERT INTO favorites (name, cereal_ids, topping_ids) VALUES (?, ?, ?)').run(
    name,
    JSON.stringify(cereal_ids),
    JSON.stringify(topping_ids)
  );
  const favorite = db.prepare('SELECT * FROM favorites WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(favorite);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, cereal_ids, topping_ids } = req.body;
  const existing = db.prepare('SELECT * FROM favorites WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Favorite not found' });
    return;
  }
  db.prepare('UPDATE favorites SET name = COALESCE(?, name), cereal_ids = COALESCE(?, cereal_ids), topping_ids = COALESCE(?, topping_ids) WHERE id = ?').run(
    name,
    cereal_ids ? JSON.stringify(cereal_ids) : null,
    topping_ids ? JSON.stringify(topping_ids) : null,
    id
  );
  const favorite = db.prepare('SELECT * FROM favorites WHERE id = ?').get(id);
  res.json(favorite);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM favorites WHERE id = ?').run(req.params.id);
  res.json({ message: 'Favorite deleted' });
});

export default router;
