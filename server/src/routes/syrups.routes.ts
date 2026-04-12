import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', (_req, res) => {
  const syrups = db.prepare('SELECT * FROM syrups ORDER BY sort_order').all();
  res.json(syrups);
});

router.post('/', (req, res) => {
  const { name, sort_order = 0 } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  const result = db.prepare('INSERT INTO syrups (name, sort_order) VALUES (?, ?)').run(name, sort_order);
  const syrup = db.prepare('SELECT * FROM syrups WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(syrup);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, sort_order } = req.body;
  db.prepare('UPDATE syrups SET name = COALESCE(?, name), sort_order = COALESCE(?, sort_order) WHERE id = ?').run(name, sort_order, id);
  const syrup = db.prepare('SELECT * FROM syrups WHERE id = ?').get(id);
  if (!syrup) {
    res.status(404).json({ error: 'Syrup not found' });
    return;
  }
  res.json(syrup);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM syrups WHERE id = ?').run(req.params.id);
  res.json({ message: 'Syrup deleted' });
});

export default router;
