import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', (_req, res) => {
  const toppings = db.prepare('SELECT * FROM toppings ORDER BY sort_order').all();
  res.json(toppings);
});

router.post('/', (req, res) => {
  const { name, sort_order = 0 } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  const result = db.prepare('INSERT INTO toppings (name, sort_order) VALUES (?, ?)').run(name, sort_order);
  const topping = db.prepare('SELECT * FROM toppings WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(topping);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, sort_order } = req.body;
  db.prepare('UPDATE toppings SET name = COALESCE(?, name), sort_order = COALESCE(?, sort_order) WHERE id = ?').run(name, sort_order, id);
  const topping = db.prepare('SELECT * FROM toppings WHERE id = ?').get(id);
  if (!topping) {
    res.status(404).json({ error: 'Topping not found' });
    return;
  }
  res.json(topping);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM toppings WHERE id = ?').run(req.params.id);
  res.json({ message: 'Topping deleted' });
});

export default router;
