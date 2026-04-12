import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';
import './History.css';

export default function History() {
  const { apiFetch } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateFilter, setDateFilter] = useState('');

  const fetchHistory = useCallback(async () => {
    const params = dateFilter ? `?date=${dateFilter}` : '';
    const res = await apiFetch(`/api/orders/history${params}`);
    if (res.ok) {
      setOrders(await res.json());
    }
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

  return (
    <div className="history">
      <h2 className="page-title">Historial</h2>

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
                  {order.items.map((item) => (
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
                      {item.notes && <span className="history-item-notes">{item.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
