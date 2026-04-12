import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Favorite, Cereal, Topping } from '../../types';

export default function FavoritesSettings() {
  const { apiFetch } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [cereals, setCereals] = useState<Cereal[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formCereals, setFormCereals] = useState<number[]>([]);
  const [formToppings, setFormToppings] = useState<number[]>([]);

  const fetchAll = useCallback(async () => {
    const [fRes, cRes, tRes] = await Promise.all([
      apiFetch('/api/favorites'),
      apiFetch('/api/cereals'),
      apiFetch('/api/toppings'),
    ]);
    if (fRes.ok) setFavorites(await fRes.json());
    if (cRes.ok) setCereals(await cRes.json());
    if (tRes.ok) setToppings(await tRes.json());
  }, [apiFetch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const getCerealName = (id: number) => cereals.find((c) => c.id === id)?.name || '?';
  const getToppingName = (id: number) => toppings.find((t) => t.id === id)?.name || '?';

  const parseFavIds = (val: number[] | string): number[] =>
    typeof val === 'string' ? JSON.parse(val) : val;

  const handleEdit = (fav: Favorite) => {
    setEditingId(fav.id);
    setFormName(fav.name);
    setFormCereals(parseFavIds(fav.cereal_ids));
    setFormToppings(parseFavIds(fav.topping_ids));
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormName('');
    setFormCereals([]);
    setFormToppings([]);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    const body = { name: formName.trim(), cereal_ids: formCereals, topping_ids: formToppings };

    if (editingId) {
      await apiFetch(`/api/favorites/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await apiFetch('/api/favorites', { method: 'POST', body: JSON.stringify(body) });
    }
    setShowForm(false);
    fetchAll();
  };

  const handleDelete = async (id: number) => {
    await apiFetch(`/api/favorites/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const toggleCereal = (id: number) =>
    setFormCereals((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const toggleTopping = (id: number) =>
    setFormToppings((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

  if (showForm) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <button className="btn-secondary" onClick={() => setShowForm(false)}>&larr; Volver</button>
          <h3>{editingId ? 'Editar Favorito' : 'Nuevo Favorito'}</h3>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Nombre</label>
          <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nombre del favorito" />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div className="section-title">Cereales</div>
          <div className="checkbox-group">
            {cereals.map((c) => (
              <label key={c.id} className={`checkbox-item ${formCereals.includes(c.id) ? 'selected' : ''}`}>
                <input type="checkbox" checked={formCereals.includes(c.id)} onChange={() => toggleCereal(c.id)} />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div className="section-title">Toppings</div>
          <div className="checkbox-group">
            {toppings.map((t) => (
              <label key={t.id} className={`checkbox-item ${formToppings.includes(t.id) ? 'selected' : ''}`}>
                <input type="checkbox" checked={formToppings.includes(t.id)} onChange={() => toggleTopping(t.id)} />
                {t.name}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={!formName.trim()}>Guardar</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="settings-list">
        {favorites.map((fav) => {
          const cIds = parseFavIds(fav.cereal_ids);
          const tIds = parseFavIds(fav.topping_ids);
          return (
            <div key={fav.id} className="settings-item">
              <div className="settings-item-info" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="settings-item-name">{fav.name}</span>
                <span className="settings-item-meta">
                  {cIds.map(getCerealName).join(', ')}
                  {tIds.length > 0 && ` + ${tIds.map(getToppingName).join(', ')}`}
                </span>
              </div>
              <div className="settings-item-actions">
                <button className="btn-secondary btn-sm" onClick={() => handleEdit(fav)}>Editar</button>
                <button className="btn-danger btn-sm" onClick={() => handleDelete(fav.id)}>Eliminar</button>
              </div>
            </div>
          );
        })}
      </div>
      <button className="btn-primary" onClick={handleNew} style={{ marginTop: '0.75rem' }}>
        + Agregar Favorito
      </button>
    </div>
  );
}
