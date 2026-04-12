import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', (_req, res) => {
  const tables = db.prepare('SELECT * FROM tables_config ORDER BY position_row, position_col').all();
  res.json(tables);
});

router.post('/', (req, res) => {
  const { name, position_row = 0, position_col = 0, notes = '' } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  const result = db.prepare('INSERT INTO tables_config (name, position_row, position_col, notes) VALUES (?, ?, ?, ?)').run(name, position_row, position_col, notes);
  const table = db.prepare('SELECT * FROM tables_config WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(table);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, position_row, position_col, notes } = req.body;
  const existing = db.prepare('SELECT * FROM tables_config WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Table not found' });
    return;
  }
  db.prepare('UPDATE tables_config SET name = COALESCE(?, name), position_row = COALESCE(?, position_row), position_col = COALESCE(?, position_col), notes = COALESCE(?, notes) WHERE id = ?').run(name, position_row, position_col, notes, id);
  const table = db.prepare('SELECT * FROM tables_config WHERE id = ?').get(id);
  res.json(table);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const activeOrders = db.prepare('SELECT COUNT(*) as c FROM orders WHERE table_id = ? AND status = ?').get(id, 'active') as { c: number };
  if (activeOrders.c > 0) {
    res.status(400).json({ error: 'Cannot delete table with active orders' });
    return;
  }
  db.prepare('DELETE FROM tables_config WHERE id = ?').run(id);
  res.json({ message: 'Table deleted' });
});

export default router;
