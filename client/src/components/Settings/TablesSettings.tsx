import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Table } from '../../types';

export default function TablesSettings() {
  const { apiFetch } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const fetchTables = useCallback(async () => {
    const res = await apiFetch('/api/tables');
    if (res.ok) setTables(await res.json());
  }, [apiFetch]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await apiFetch('/api/tables', {
      method: 'POST',
      body: JSON.stringify({ name: newName.trim(), position_row: 0, position_col: tables.length }),
    });
    setNewName('');
    fetchTables();
  };

  const handleDelete = async (id: number) => {
    const res = await apiFetch(`/api/tables/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Error deleting table');
      return;
    }
    fetchTables();
  };

  const startEdit = (table: Table) => {
    setEditingId(table.id);
    setEditName(table.name);
    setEditNotes(table.notes);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await apiFetch(`/api/tables/${editingId}`, {
      method: 'PUT',
      body: JSON.stringify({ name: editName.trim(), notes: editNotes }),
    });
    setEditingId(null);
    fetchTables();
  };

  return (
    <div>
      <div className="settings-list">
        {tables.map((table) => (
          <div key={table.id} className="settings-item">
            {editingId === table.id ? (
              <div className="settings-item-info" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '120px' }}
                  placeholder="Nombre"
                />
                <input
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  style={{ flex: 1, minWidth: '150px' }}
                  placeholder="Notas (ej: mesa cerca de la puerta)"
                />
              </div>
            ) : (
              <div className="settings-item-info">
                <span className="settings-item-name">{table.name}</span>
                {table.notes && <span className="settings-item-meta">{table.notes}</span>}
              </div>
            )}
            <div className="settings-item-actions">
              {editingId === table.id ? (
                <>
                  <button className="btn-primary btn-sm" onClick={handleSaveEdit}>Guardar</button>
                  <button className="btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancelar</button>
                </>
              ) : (
                <>
                  <button className="btn-secondary btn-sm" onClick={() => startEdit(table)}>Editar</button>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(table.id)}>Eliminar</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="settings-add-form">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nueva mesa..."
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn-primary" onClick={handleAdd}>
          Agregar Mesa
        </button>
      </div>
    </div>
  );
}
