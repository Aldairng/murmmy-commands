import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSSERefresh } from '../../hooks/useSSE';
import { Order } from '../../types';
import './OrderViewer.css';

function calcDurationSeconds(startedAt: string | null, completedAt: string | null): number | null {
  if (!startedAt || !completedAt) return null;
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  if (isNaN(start) || isNaN(end)) return null;
  return Math.round((end - start) / 1000);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

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

  const advanceStatus = async (orderId: number, itemId: number) => {
    await apiFetch(`/api/orders/${orderId}/items/${itemId}/status`, { method: 'PATCH' });
    fetchOrders();
  };

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
              {order.items.map((item) => {
                const status = item.prep_status;
                const duration = calcDurationSeconds(item.prep_started_at, item.prep_completed_at);
                return (
                  <div key={item.id} className={`viewer-item viewer-item--${status}`}>
                    <div className="viewer-item-content">
                      <div className="viewer-item-header">
                        <span className={`badge badge-${item.type}`}>
                          {item.type === 'icecream' ? 'Helado' : item.type === 'milkshake' ? 'Malteada' : 'Agua'}
                        </span>
                        {item.type !== 'water' && (
                          <span className="viewer-item-combo">
                            {item.favorite_name ?? 'Crea tu Mezcla'}
                          </span>
                        )}
                        {item.type !== 'water' && !item.favorite_name && (() => {
                          const extraCereals = item.cereal_names.length - 1;
                          const extraToppings = item.topping_names.length - 1;
                          return (
                            <>
                              {extraCereals > 0 && (
                                <span className="viewer-extra-badge">+{extraCereals} Cereal</span>
                              )}
                              {extraToppings > 0 && (
                                <span className="viewer-extra-badge">+{extraToppings} Topping</span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      {item.type !== 'water' && (
                        <div className="viewer-item-details">
                          {item.cereal_names.length > 0 && (
                            <div className="viewer-ingredient-group">
                              <span className="viewer-ingredient-label">Cereal:</span>
                              {item.cereal_names.map((name) => (
                                <span key={name} className="viewer-ingredient-value">{name}</span>
                              ))}
                            </div>
                          )}
                          {item.topping_names.length > 0 && (
                            <div className="viewer-ingredient-group">
                              <span className="viewer-ingredient-label">Topping:</span>
                              {item.topping_names.map((name) => (
                                <span key={name} className="viewer-ingredient-value">{name}</span>
                              ))}
                            </div>
                          )}
                          {item.syrup_name && (
                            <div className="viewer-ingredient-group">
                              <span className="viewer-ingredient-label">Salsa:</span>
                              <span className="viewer-ingredient-value">{item.syrup_name}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {item.notes && <div className="viewer-item-notes">{item.notes}</div>}
                    </div>

                    {item.type !== 'water' && (
                      <div className="item-status-col">
                        <button
                          className={`item-status-btn item-status-btn--${status}`}
                          onClick={() => advanceStatus(order.id, item.id)}
                          disabled={status === 'completed'}
                        >
                          {status === 'new' && 'Nuevo'}
                          {status === 'making' && 'Haciendo'}
                          {status === 'completed' && 'Listo'}
                        </button>
                        {status === 'completed' && duration !== null && (
                          <span className="item-duration">{formatDuration(duration)}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
