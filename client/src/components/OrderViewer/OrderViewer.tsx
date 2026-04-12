import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSSERefresh } from '../../hooks/useSSE';
import { Order } from '../../types';
import './OrderViewer.css';

export default function OrderViewer() {
  const { apiFetch } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = useCallback(async () => {
    const res = await apiFetch('/api/orders');
    if (res.ok) {
      setOrders(await res.json());
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useSSERefresh(fetchOrders);

  const handleComplete = async (orderId: number) => {
    await apiFetch(`/api/orders/${orderId}/complete`, { method: 'POST' });
    fetchOrders();
  };

  if (orders.length === 0) {
    return (
      <div className="order-viewer">
        <h2 className="page-title">Ordenes Activas</h2>
        <p className="viewer-empty">No hay ordenes activas</p>
      </div>
    );
  }

  return (
    <div className="order-viewer">
      <h2 className="page-title">Ordenes Activas</h2>
      <div className="viewer-grid">
        {orders.map((order) => (
          <div key={order.id} className="order-card card">
            <div className="order-card-header">
              <div>
                <h3 className="order-table-name">{order.table_name}</h3>
                {order.table_notes && (
                  <span className="order-table-notes">{order.table_notes}</span>
                )}
              </div>
              <span className="order-time">
                {new Date(order.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="order-items-list">
              {order.items.map((item) => (
                <div key={item.id} className="viewer-item">
                  <span className={`badge badge-${item.type}`}>
                    {item.type === 'icecream' ? 'Helado' : item.type === 'milkshake' ? 'Malteada' : 'Agua'}
                  </span>
                  {item.type !== 'water' && (
                    <div className="viewer-item-details">
                      {item.cereal_names.length > 0 && (
                        <div><strong>Cereal:</strong> {item.cereal_names.join(', ')}</div>
                      )}
                      {item.topping_names.length > 0 && (
                        <div><strong>Topping:</strong> {item.topping_names.join(', ')}</div>
                      )}
                      {item.syrup_name && (
                        <div><strong>Salsa:</strong> {item.syrup_name}</div>
                      )}
                    </div>
                  )}
                  {item.notes && <div className="viewer-item-notes">{item.notes}</div>}
                </div>
              ))}
            </div>

            <button
              className="btn-success complete-btn"
              onClick={() => handleComplete(order.id)}
            >
              Completar Orden
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
