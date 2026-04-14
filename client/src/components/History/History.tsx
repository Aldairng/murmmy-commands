import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';
import './History.css';

interface Stats {
  icecream_last10: number | null;
  milkshake_last10: number | null;
  icecream_period: number | null;
  milkshake_period: number | null;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function calcDuration(startedAt: string | null, completedAt: string | null): number | null {
  if (!startedAt || !completedAt) return null;
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  if (isNaN(start) || isNaN(end)) return null;
  return Math.round((end - start) / 1000);
}

export default function History() {
  const { apiFetch } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [dateFilter, setDateFilter] = useState('');

  const fetchHistory = useCallback(async () => {
    const params = dateFilter ? `?date=${dateFilter}` : '';
    const [ordersRes, statsRes] = await Promise.all([
      apiFetch(`/api/orders/history${params}`),
      apiFetch(`/api/orders/history/stats${params}`),
    ]);
    if (ordersRes.ok) setOrders(await ordersRes.json());
    if (statsRes.ok) setStats(await statsRes.json());
  }, [apiFetch, dateFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Group by date
  const grouped = orders.reduce<Record<string, Order[]>>((acc, order) => {
    const date = order.completed_at
      ? new Date(order.completed_at).toLocaleDateString('es-CO')
      : 'Sin fecha';
    if (!acc[date]) acc[date] = [];
    acc[date].push(order);
    return acc;
  }, {});

  const periodLabel = dateFilter ? 'Dia' : 'Mes';

  return (
    <div className="history">
      <h2 className="page-title">Historial</h2>

      {/* Stats */}
      {stats && (
        <div className="history-stats">
          <div className="stat-card card">
            <span className="stat-label">Helado (ult. 10)</span>
            <span className="stat-value">{stats.icecream_last10 !== null ? formatDuration(stats.icecream_last10) : '—'}</span>
          </div>
          <div className="stat-card card">
            <span className="stat-label">Malteada (ult. 10)</span>
            <span className="stat-value">{stats.milkshake_last10 !== null ? formatDuration(stats.milkshake_last10) : '—'}</span>
          </div>
          <div className="stat-card card">
            <span className="stat-label">Helado ({periodLabel})</span>
            <span className="stat-value">{stats.icecream_period !== null ? formatDuration(stats.icecream_period) : '—'}</span>
          </div>
          <div className="stat-card card">
            <span className="stat-label">Malteada ({periodLabel})</span>
            <span className="stat-value">{stats.milkshake_period !== null ? formatDuration(stats.milkshake_period) : '—'}</span>
          </div>
        </div>
      )}

      <div className="history-filter">
        <label>Filtrar por fecha</label>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{ width: '200px' }}
        />
        {dateFilter && (
          <button className="btn-secondary" onClick={() => setDateFilter('')}>
            Limpiar
          </button>
        )}
      </div>

      {orders.length === 0 && (
        <p className="history-empty">No hay ordenes en el historial</p>
      )}

      {Object.entries(grouped).map(([date, dateOrders]) => (
        <div key={date} className="history-date-group">
          <h3 className="history-date">{date}</h3>
          <div className="history-orders">
            {dateOrders.map((order) => (
              <div key={order.id} className="history-order card">
                <div className="history-order-header">
                  <strong>{order.table_name}</strong>
                  <span className="order-time">
                    {order.completed_at &&
                      new Date(order.completed_at).toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </span>
                </div>
                <div className="history-items">
                  {order.items.map((item) => {
                    const duration = calcDuration(item.prep_started_at, item.prep_completed_at);
                    return (
                      <div key={item.id} className="history-item">
                        <span className={`badge badge-${item.type}`}>
                          {item.type === 'icecream' ? 'Helado' : item.type === 'milkshake' ? 'Malteada' : 'Agua'}
                        </span>
                        {item.type !== 'water' && (
                          <span className="history-item-detail">
                            {item.cereal_names.join(', ')}
                            {item.topping_names.length > 0 && ` + ${item.topping_names.join(', ')}`}
                            {item.syrup_name && ` / ${item.syrup_name}`}
                          </span>
                        )}
                        {item.type !== 'water' && duration !== null && (
                          <span className="history-item-duration">{formatDuration(duration)}</span>
                        )}
                        {item.notes && <span className="history-item-notes">{item.notes}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
