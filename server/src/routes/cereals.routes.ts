import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', (_req, res) => {
  const cereals = db.prepare('SELECT * FROM cereals ORDER BY category, sort_order').all();
  res.json(cereals);
});

router.post('/', (req, res) => {
  const { name, category, sort_order = 0 } = req.body;
  if (!name || !category) {
    res.status(400).json({ error: 'Name and category required' });
    return;
  }
  const result = db.prepare('INSERT INTO cereals (name, category, sort_order) VALUES (?, ?, ?)').run(name, category, sort_order);
  const cereal = db.prepare('SELECT * FROM cereals WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(cereal);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, category, sort_order } = req.body;
  db.prepare('UPDATE cereals SET name = COALESCE(?, name), category = COALESCE(?, category), sort_order = COALESCE(?, sort_order) WHERE id = ?').run(name, category, sort_order, id);
  const cereal = db.prepare('SELECT * FROM cereals WHERE id = ?').get(id);
  if (!cereal) {
    res.status(404).json({ error: 'Cereal not found' });
    return;
  }
  res.json(cereal);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM cereals WHERE id = ?').run(req.params.id);
  res.json({ message: 'Cereal deleted' });
});

export default router;
