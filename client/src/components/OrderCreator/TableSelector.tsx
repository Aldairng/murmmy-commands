import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Table, Order } from '../../types';
import TableWorkspace from './TableWorkspace';
import './TableSelector.css';

export default function TableSelector() {
  const { apiFetch } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const fetchTables = useCallback(async () => {
    const res = await apiFetch('/api/tables');
    if (res.ok) {
      const data = await res.json();
      setTables(data);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  if (selectedTable) {
    return (
      <TableWorkspace
        table={selectedTable}
        onBack={() => setSelectedTable(null)}
      />
    );
  }

  return (
    <div className="table-selector">
      <h2 className="page-title">Seleccionar Mesa</h2>
      <div className="tables-grid">
        {tables.map((table) => (
          <button
            key={table.id}
            className="table-card card"
            onClick={() => setSelectedTable(table)}
          >
            <span className="table-name">{table.name}</span>
            {table.notes && <span className="table-notes">{table.notes}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
