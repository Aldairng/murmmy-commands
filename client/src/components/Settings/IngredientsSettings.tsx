import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Cereal, Topping, Syrup } from '../../types';

export default function IngredientsSettings() {
  const { apiFetch } = useAuth();
  const [cereals, setCereals] = useState<Cereal[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [syrups, setSyrups] = useState<Syrup[]>([]);

  const [newCereal, setNewCereal] = useState('');
  const [newCerealCat, setNewCerealCat] = useState<'especial' | 'clasico'>('especial');
  const [newTopping, setNewTopping] = useState('');
  const [newSyrup, setNewSyrup] = useState('');

  const fetchAll = useCallback(async () => {
    const [cRes, tRes, sRes] = await Promise.all([
      apiFetch('/api/cereals'),
      apiFetch('/api/toppings'),
      apiFetch('/api/syrups'),
    ]);
    if (cRes.ok) setCereals(await cRes.json());
    if (tRes.ok) setToppings(await tRes.json());
    if (sRes.ok) setSyrups(await sRes.json());
  }, [apiFetch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addCereal = async () => {
    if (!newCereal.trim()) return;
    await apiFetch('/api/cereals', {
      method: 'POST',
      body: JSON.stringify({ name: newCereal.trim(), category: newCerealCat }),
    });
    setNewCereal('');
    fetchAll();
  };

  const addTopping = async () => {
    if (!newTopping.trim()) return;
    await apiFetch('/api/toppings', {
      method: 'POST',
      body: JSON.stringify({ name: newTopping.trim() }),
    });
    setNewTopping('');
    fetchAll();
  };

  const addSyrup = async () => {
    if (!newSyrup.trim()) return;
    await apiFetch('/api/syrups', {
      method: 'POST',
      body: JSON.stringify({ name: newSyrup.trim() }),
    });
    setNewSyrup('');
    fetchAll();
  };

  const deleteCereal = async (id: number) => {
    await apiFetch(`/api/cereals/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const deleteTopping = async (id: number) => {
    await apiFetch(`/api/toppings/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const deleteSyrup = async (id: number) => {
    await apiFetch(`/api/syrups/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const especialCereals = cereals.filter((c) => c.category === 'especial');
  const clasicoCereals = cereals.filter((c) => c.category === 'clasico');

  return (
    <div>
      {/* Cereals - Especiales */}
      <div className="settings-section">
        <h3>Cereales - Especiales</h3>
        <div className="settings-list">
          {especialCereals.map((c) => (
            <div key={c.id} className="settings-item">
              <span className="settings-item-name">{c.name}</span>
              <button className="btn-danger btn-sm" onClick={() => deleteCereal(c.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      </div>

      {/* Cereals - Clásicos */}
      <div className="settings-section">
        <h3>Cereales - Clasicos</h3>
        <div className="settings-list">
          {clasicoCereals.map((c) => (
            <div key={c.id} className="settings-item">
              <span className="settings-item-name">{c.name}</span>
              <button className="btn-danger btn-sm" onClick={() => deleteCereal(c.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      </div>

      {/* Add cereal form */}
      <div className="settings-add-form" style={{ marginBottom: '2rem' }}>
        <input
          value={newCereal}
          onChange={(e) => setNewCereal(e.target.value)}
          placeholder="Nuevo cereal..."
          onKeyDown={(e) => e.key === 'Enter' && addCereal()}
        />
        <select value={newCerealCat} onChange={(e) => setNewCerealCat(e.target.value as 'especial' | 'clasico')}>
          <option value="especial">Especial</option>
          <option value="clasico">Clasico</option>
        </select>
        <button className="btn-primary" onClick={addCereal}>Agregar</button>
      </div>

      {/* Toppings */}
      <div className="settings-section">
        <h3>Toppings</h3>
        <div className="settings-list">
          {toppings.map((t) => (
            <div key={t.id} className="settings-item">
              <span className="settings-item-name">{t.name}</span>
              <button className="btn-danger btn-sm" onClick={() => deleteTopping(t.id)}>Eliminar</button>
            </div>
          ))}
        </div>
        <div className="settings-add-form">
          <input
            value={newTopping}
            onChange={(e) => setNewTopping(e.target.value)}
            placeholder="Nuevo topping..."
            onKeyDown={(e) => e.key === 'Enter' && addTopping()}
          />
          <button className="btn-primary" onClick={addTopping}>Agregar</button>
        </div>
      </div>

      {/* Syrups */}
      <div className="settings-section" style={{ marginTop: '2rem' }}>
        <h3>Salsas</h3>
        <div className="settings-list">
          {syrups.map((s) => (
            <div key={s.id} className="settings-item">
              <span className="settings-item-name">{s.name}</span>
              <button className="btn-danger btn-sm" onClick={() => deleteSyrup(s.id)}>Eliminar</button>
            </div>
          ))}
        </div>
        <div className="settings-add-form">
          <input
            value={newSyrup}
            onChange={(e) => setNewSyrup(e.target.value)}
            placeholder="Nueva salsa..."
            onKeyDown={(e) => e.key === 'Enter' && addSyrup()}
          />
          <button className="btn-primary" onClick={addSyrup}>Agregar</button>
        </div>
      </div>
    </div>
  );
}
