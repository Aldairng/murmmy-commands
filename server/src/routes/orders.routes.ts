import { Router } from 'express';
import db from '../db';
import { broadcast } from '../sse';

const router = Router();

// Get active orders (with items and resolved ingredient names)
router.get('/', (_req, res) => {
  const orders = db.prepare('SELECT o.*, tc.name as table_name, tc.notes as table_notes FROM orders o JOIN tables_config tc ON o.table_id = tc.id WHERE o.status = ? ORDER BY o.created_at').all('active');
  const ordersWithItems = (orders as any[]).map((order) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at').all(order.id);
    return { ...order, items: resolveItems(items as any[]) };
  }).filter((order) => order.items.length > 0);
  res.json(ordersWithItems);
});

// Get completed orders (history)
router.get('/history', (req, res) => {
  const { date } = req.query;
  let query = 'SELECT o.*, tc.name as table_name, tc.notes as table_notes FROM orders o JOIN tables_config tc ON o.table_id = tc.id WHERE o.status = ?';
  const params: any[] = ['completed'];

  if (date) {
    query += ' AND DATE(o.completed_at) = ?';
    params.push(date);
  }

  query += ' ORDER BY o.completed_at DESC';
  const orders = db.prepare(query).all(...params);
  const ordersWithItems = (orders as any[]).map((order) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at').all(order.id);
    return { ...order, items: resolveItems(items as any[]) };
  });
  res.json(ordersWithItems);
});

// Get history stats (averages)
router.get('/history/stats', (req, res) => {
  const { date } = req.query;

  // Last 10 icecream avg
  const avgIcecreamLast10 = db.prepare(`
    SELECT AVG(
      (julianday(oi.prep_completed_at) - julianday(oi.prep_started_at)) * 86400
    ) as avg_seconds
    FROM (
      SELECT prep_started_at, prep_completed_at FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed' AND oi.type = 'icecream'
        AND oi.prep_started_at IS NOT NULL AND oi.prep_completed_at IS NOT NULL
      ORDER BY oi.prep_completed_at DESC LIMIT 10
    ) oi
  `).get() as { avg_seconds: number | null };

  // Last 10 milkshake avg
  const avgMilkshakeLast10 = db.prepare(`
    SELECT AVG(
      (julianday(oi.prep_completed_at) - julianday(oi.prep_started_at)) * 86400
    ) as avg_seconds
    FROM (
      SELECT prep_started_at, prep_completed_at FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed' AND oi.type = 'milkshake'
        AND oi.prep_started_at IS NOT NULL AND oi.prep_completed_at IS NOT NULL
      ORDER BY oi.prep_completed_at DESC LIMIT 10
    ) oi
  `).get() as { avg_seconds: number | null };

  // Period avg (filtered date or current month)
  let periodWhere: string;
  const periodParams: any[] = [];

  if (date) {
    periodWhere = `AND DATE(o.completed_at) = ?`;
    periodParams.push(date);
  } else {
    periodWhere = `AND strftime('%Y-%m', o.completed_at) = strftime('%Y-%m', 'now', 'localtime')`;
  }

  const avgIcecreamPeriod = db.prepare(`
    SELECT AVG(
      (julianday(oi.prep_completed_at) - julianday(oi.prep_started_at)) * 86400
    ) as avg_seconds
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'completed' AND oi.type = 'icecream'
      AND oi.prep_started_at IS NOT NULL AND oi.prep_completed_at IS NOT NULL
      ${periodWhere}
  `).get(...periodParams) as { avg_seconds: number | null };

  const avgMilkshakePeriod = db.prepare(`
    SELECT AVG(
      (julianday(oi.prep_completed_at) - julianday(oi.prep_started_at)) * 86400
    ) as avg_seconds
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'completed' AND oi.type = 'milkshake'
      AND oi.prep_started_at IS NOT NULL AND oi.prep_completed_at IS NOT NULL
      ${periodWhere}
  `).get(...periodParams) as { avg_seconds: number | null };

  res.json({
    icecream_last10: avgIcecreamLast10.avg_seconds !== null ? Math.round(avgIcecreamLast10.avg_seconds) : null,
    milkshake_last10: avgMilkshakeLast10.avg_seconds !== null ? Math.round(avgMilkshakeLast10.avg_seconds) : null,
    icecream_period: avgIcecreamPeriod.avg_seconds !== null ? Math.round(avgIcecreamPeriod.avg_seconds) : null,
    milkshake_period: avgMilkshakePeriod.avg_seconds !== null ? Math.round(avgMilkshakePeriod.avg_seconds) : null,
  });
});

// Get or create the active order for a table
router.get('/table/:tableId', (req, res) => {
  const { tableId } = req.params;
  let order = db.prepare('SELECT * FROM orders WHERE table_id = ? AND status = ?').get(tableId, 'active') as any;

  if (!order) {
    const result = db.prepare('INSERT INTO orders (table_id, status) VALUES (?, ?)').run(tableId, 'active');
    order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at').all(order.id);
  res.json({ ...order, items: resolveItems(items as any[]) });
});

// Add item to an order
router.post('/:orderId/items', (req, res) => {
  const { orderId } = req.params;
  const { type, cereal_ids = [], topping_ids = [], syrup_id = null, notes = '', favorite_id = null } = req.body;

  if (!type) {
    res.status(400).json({ error: 'Type is required' });
    return;
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const result = db.prepare(
    'INSERT INTO order_items (order_id, type, cereal_ids, topping_ids, syrup_id, notes, favorite_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(orderId, type, JSON.stringify(cereal_ids), JSON.stringify(topping_ids), syrup_id, notes, favorite_id);

  const item = db.prepare('SELECT * FROM order_items WHERE id = ?').get(result.lastInsertRowid);
  const resolvedItems = resolveItems([item as any]);

  broadcast({ type: 'item_created', data: { orderId: Number(orderId), item: resolvedItems[0] } });
  res.status(201).json(resolvedItems[0]);
});

// Update an item
router.put('/:orderId/items/:itemId', (req, res) => {
  const { orderId, itemId } = req.params;
  const { type, cereal_ids, topping_ids, syrup_id, notes, favorite_id } = req.body;

  const existing = db.prepare('SELECT * FROM order_items WHERE id = ? AND order_id = ?').get(itemId, orderId);
  if (!existing) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  db.prepare(
    'UPDATE order_items SET type = COALESCE(?, type), cereal_ids = COALESCE(?, cereal_ids), topping_ids = COALESCE(?, topping_ids), syrup_id = ?, notes = COALESCE(?, notes), favorite_id = ? WHERE id = ?'
  ).run(
    type,
    cereal_ids ? JSON.stringify(cereal_ids) : null,
    topping_ids ? JSON.stringify(topping_ids) : null,
    syrup_id !== undefined ? syrup_id : (existing as any).syrup_id,
    notes,
    favorite_id !== undefined ? favorite_id : (existing as any).favorite_id,
    itemId
  );

  const item = db.prepare('SELECT * FROM order_items WHERE id = ?').get(itemId);
  const resolvedItems = resolveItems([item as any]);

  broadcast({ type: 'item_updated', data: { orderId: Number(orderId), item: resolvedItems[0] } });
  res.json(resolvedItems[0]);
});

// Delete an item
router.delete('/:orderId/items/:itemId', (req, res) => {
  const { orderId, itemId } = req.params;
  db.prepare('DELETE FROM order_items WHERE id = ? AND order_id = ?').run(itemId, orderId);

  // If no items left, delete the order too
  const remaining = db.prepare('SELECT COUNT(*) as c FROM order_items WHERE order_id = ?').get(orderId) as { c: number };
  if (remaining.c === 0) {
    db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);
  }

  broadcast({ type: 'item_deleted', data: { orderId: Number(orderId), itemId: Number(itemId) } });
  res.json({ message: 'Item deleted' });
});

// Advance prep status for a single item (new → making → completed)
router.patch('/:orderId/items/:itemId/status', (req, res) => {
  const { orderId, itemId } = req.params;
  const existing = db.prepare('SELECT * FROM order_items WHERE id = ? AND order_id = ?').get(itemId, orderId) as any;
  if (!existing) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const current = existing.prep_status ?? 'new';
  if (current === 'completed') {
    res.status(400).json({ error: 'Item already completed' });
    return;
  }

  let updateSql: string;
  const now = `datetime('now','localtime')`;

  if (current === 'new') {
    updateSql = `UPDATE order_items SET prep_status = 'making', prep_started_at = ${now} WHERE id = ?`;
  } else {
    updateSql = `UPDATE order_items SET prep_status = 'completed', prep_completed_at = ${now} WHERE id = ?`;
  }

  db.prepare(updateSql).run(itemId);
  const updated = db.prepare('SELECT * FROM order_items WHERE id = ?').get(itemId);
  const resolvedItems = resolveItems([updated as any]);

  broadcast({ type: 'item_status_updated', data: { orderId: Number(orderId), item: resolvedItems[0] } });
  res.json(resolvedItems[0]);
});

// Mark order as completed
router.post('/:orderId/complete', (req, res) => {
  const { orderId } = req.params;
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND status = ?').get(orderId, 'active');
  if (!order) {
    res.status(404).json({ error: 'Active order not found' });
    return;
  }

  db.prepare("UPDATE orders SET status = 'completed', completed_at = datetime('now','localtime') WHERE id = ?").run(orderId);
  const updated = db.prepare('SELECT o.*, tc.name as table_name, tc.notes as table_notes FROM orders o JOIN tables_config tc ON o.table_id = tc.id WHERE o.id = ?').get(orderId);

  broadcast({ type: 'order_completed', data: updated });
  res.json(updated);
});

// Helper: resolve ingredient names from IDs
function resolveItems(items: any[]) {
  const cerealCache = new Map<number, string>();
  const toppingCache = new Map<number, string>();
  const syrupCache = new Map<number, string>();
  const favoriteCache = new Map<number, string>();

  return items.map((item) => {
    const cerealIds: number[] = typeof item.cereal_ids === 'string' ? JSON.parse(item.cereal_ids) : item.cereal_ids || [];
    const toppingIds: number[] = typeof item.topping_ids === 'string' ? JSON.parse(item.topping_ids) : item.topping_ids || [];

    const cerealNames = cerealIds.map((id) => {
      if (!cerealCache.has(id)) {
        const c = db.prepare('SELECT name FROM cereals WHERE id = ?').get(id) as { name: string } | undefined;
        cerealCache.set(id, c?.name || 'Unknown');
      }
      return cerealCache.get(id)!;
    });

    const toppingNames = toppingIds.map((id) => {
      if (!toppingCache.has(id)) {
        const t = db.prepare('SELECT name FROM toppings WHERE id = ?').get(id) as { name: string } | undefined;
        toppingCache.set(id, t?.name || 'Unknown');
      }
      return toppingCache.get(id)!;
    });

    let syrupName: string | null = null;
    if (item.syrup_id) {
      if (!syrupCache.has(item.syrup_id)) {
        const s = db.prepare('SELECT name FROM syrups WHERE id = ?').get(item.syrup_id) as { name: string } | undefined;
        syrupCache.set(item.syrup_id, s?.name || 'Unknown');
      }
      syrupName = syrupCache.get(item.syrup_id)!;
    }

    let favoriteName: string | null = null;
    if (item.favorite_id) {
      if (!favoriteCache.has(item.favorite_id)) {
        const f = db.prepare('SELECT name FROM favorites WHERE id = ?').get(item.favorite_id) as { name: string } | undefined;
        favoriteCache.set(item.favorite_id, f?.name || 'Unknown');
      }
      favoriteName = favoriteCache.get(item.favorite_id)!;
    }

    return {
      ...item,
      cereal_ids: cerealIds,
      topping_ids: toppingIds,
      cereal_names: cerealNames,
      topping_names: toppingNames,
      syrup_name: syrupName,
      favorite_name: favoriteName,
      prep_status: (item.prep_status ?? 'new') as 'new' | 'making' | 'completed',
      prep_started_at: item.prep_started_at ?? null,
      prep_completed_at: item.prep_completed_at ?? null,
    };
  });
}

export default router;
