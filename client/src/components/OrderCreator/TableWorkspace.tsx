import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSSERefresh } from '../../hooks/useSSE';
import { Table, Order, OrderItem } from '../../types';
import ProductBuilder from './ProductBuilder';
import './TableWorkspace.css';

interface Props {
  table: Table;
  onBack: () => void;
}

export default function TableWorkspace({ table, onBack }: Props) {
  const { apiFetch } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const fetchOrder = useCallback(async () => {
    const res = await apiFetch(`/api/orders/table/${table.id}`);
    if (res.ok) {
      const data = await res.json();
      setOrder(data);
    }
  }, [apiFetch, table.id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useSSERefresh(fetchOrder);

  const handleAddProduct = () => {
    setEditingItem(null);
    setShowBuilder(true);
  };

  const handleEditItem = (item: OrderItem) => {
    setEditingItem(item);
    setShowBuilder(true);
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!order) return;
    await apiFetch(`/api/orders/${order.id}/items/${itemId}`, { method: 'DELETE' });
    fetchOrder();
  };

  const handleBuilderSave = async (data: {
    type: 'icecream' | 'milkshake' | 'water';
    cereal_ids: number[];
    topping_ids: number[];
    syrup_id: number | null;
    notes: string;
  }) => {
    if (!order) return;

    if (editingItem) {
      await apiFetch(`/api/orders/${order.id}/items/${editingItem.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } else {
      await apiFetch(`/api/orders/${order.id}/items`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }

    setShowBuilder(false);
    setEditingItem(null);
    fetchOrder();
  };

  const handleBuilderClose = () => {
    setShowBuilder(false);
    setEditingItem(null);
  };

  if (showBuilder) {
    return (
      <ProductBuilder
        editingItem={editingItem}
        onSave={handleBuilderSave}
        onClose={handleBuilderClose}
      />
    );
  }

  return (
    <div className="table-workspace">
      <div className="workspace-header">
        <button className="btn-secondary" onClick={onBack}>
          &larr; Mesas
        </button>
        <h2>{table.name}</h2>
        {table.notes && <span className="workspace-notes">{table.notes}</span>}
      </div>

      <div className="workspace-items">
        {(!order || order.items.length === 0) && (
          <p className="workspace-empty">No hay productos en esta orden</p>
        )}
        {order?.items.map((item) => (
          <div key={item.id} className="item-card card">
            <div className="item-header">
              <span className={`badge badge-${item.type}`}>
                {item.type === 'icecream' ? 'Helado' : item.type === 'milkshake' ? 'Malteada' : 'Agua'}
              </span>
              <div className="item-actions">
                <button className="btn-secondary btn-sm" onClick={() => handleEditItem(item)}>
                  Editar
                </button>
                <button className="btn-danger btn-sm" onClick={() => handleDeleteItem(item.id)}>
                  Eliminar
                </button>
              </div>
            </div>
            {item.type !== 'water' && (
              <div className="item-details">
                {item.cereal_names.length > 0 && (
                  <div className="item-detail">
                    <span className="detail-label">Cereal:</span> {item.cereal_names.join(', ')}
                  </div>
                )}
                {item.topping_names.length > 0 && (
                  <div className="item-detail">
                    <span className="detail-label">Topping:</span> {item.topping_names.join(', ')}
                  </div>
                )}
                {item.syrup_name && (
                  <div className="item-detail">
                    <span className="detail-label">Salsa:</span> {item.syrup_name}
                  </div>
                )}
              </div>
            )}
            {item.notes && <div className="item-notes">{item.notes}</div>}
          </div>
        ))}
      </div>

      <div className="workspace-actions">
        <button className="btn-primary" onClick={handleAddProduct}>
          + Agregar Producto
        </button>
      </div>
    </div>
  );
}
