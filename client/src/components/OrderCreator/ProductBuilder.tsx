import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Cereal, Topping, Syrup, Favorite, OrderItem } from '../../types';
import './ProductBuilder.css';

interface Props {
  editingItem: OrderItem | null;
  onSave: (data: {
    type: 'icecream' | 'milkshake' | 'water';
    cereal_ids: number[];
    topping_ids: number[];
    syrup_id: number | null;
    favorite_id: number | null;
    notes: string;
  }) => void;
  onClose: () => void;
}

export default function ProductBuilder({ editingItem, onSave, onClose }: Props) {
  const { apiFetch } = useAuth();
  const [cereals, setCereals] = useState<Cereal[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [syrups, setSyrups] = useState<Syrup[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const [type, setType] = useState<'icecream' | 'milkshake' | 'water'>(editingItem?.type || 'icecream');
  const [selectedCereals, setSelectedCereals] = useState<number[]>(editingItem?.cereal_ids || []);
  const [selectedToppings, setSelectedToppings] = useState<number[]>(editingItem?.topping_ids || []);
  const [selectedSyrup, setSelectedSyrup] = useState<number | null>(editingItem?.syrup_id || null);
  const [selectedFavoriteId, setSelectedFavoriteId] = useState<number | null>(editingItem?.favorite_id || null);
  const [notes, setNotes] = useState(editingItem?.notes || '');

  useEffect(() => {
    const load = async () => {
      const [cRes, tRes, sRes, fRes] = await Promise.all([
        apiFetch('/api/cereals'),
        apiFetch('/api/toppings'),
        apiFetch('/api/syrups'),
        apiFetch('/api/favorites'),
      ]);
      if (cRes.ok) setCereals(await cRes.json());
      if (tRes.ok) setToppings(await tRes.json());
      if (sRes.ok) setSyrups(await sRes.json());
      if (fRes.ok) setFavorites(await fRes.json());
    };
    load();
  }, [apiFetch]);

  const toggleCereal = (id: number) => {
    setSelectedFavoriteId(null);
    setSelectedCereals((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const toggleTopping = (id: number) => {
    setSelectedFavoriteId(null);
    setSelectedToppings((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const applyFavorite = (fav: Favorite) => {
    const cerealIds = typeof fav.cereal_ids === 'string' ? JSON.parse(fav.cereal_ids) : fav.cereal_ids;
    const toppingIds = typeof fav.topping_ids === 'string' ? JSON.parse(fav.topping_ids) : fav.topping_ids;
    setSelectedCereals(cerealIds);
    setSelectedToppings(toppingIds);
    setSelectedFavoriteId(fav.id);
  };

  const handleSave = () => {
    onSave({ type, cereal_ids: selectedCereals, topping_ids: selectedToppings, syrup_id: selectedSyrup, favorite_id: selectedFavoriteId, notes });
  };

  const isWater = type === 'water';
  const canSave = isWater || selectedCereals.length > 0;

  const especialCereals = cereals.filter((c) => c.category === 'especial');
  const clasicoCereals = cereals.filter((c) => c.category === 'clasico');

  return (
    <div className="product-builder">
      <div className="builder-header">
        <button className="btn-secondary" onClick={onClose}>
          &larr; Volver
        </button>
        <h2>{editingItem ? 'Editar Producto' : 'Nuevo Producto'}</h2>
      </div>

      {/* Type selection */}
      <div className="builder-section">
        <div className="section-title">Tipo</div>
        <div className="type-selector">
          {(['icecream', 'milkshake', 'water'] as const).map((t) => (
            <button
              key={t}
              className={`type-btn ${type === t ? 'active' : ''}`}
              onClick={() => {
                setType(t);
                if (t === 'water') {
                  setSelectedCereals([]);
                  setSelectedToppings([]);
                  setSelectedSyrup(null);
                }
              }}
            >
              {t === 'icecream' ? 'Helado' : t === 'milkshake' ? 'Malteada' : 'Agua'}
            </button>
          ))}
        </div>
      </div>

      {!isWater && (
        <>
          {/* Favorites */}
          {favorites.length > 0 && (
            <div className="builder-section">
              <div className="section-title">Favoritos</div>
              <div className="checkbox-group">
                {favorites.map((fav) => (
                  <button
                    key={fav.id}
                    className={`checkbox-item ${selectedFavoriteId === fav.id ? 'selected' : ''}`}
                    onClick={() => applyFavorite(fav)}
                  >
                    {fav.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cereals - Especiales */}
          <div className="builder-section">
            <div className="section-title">Cereales - Especiales</div>
            <div className="checkbox-group">
              {especialCereals.map((c) => (
                <label
                  key={c.id}
                  className={`checkbox-item ${selectedCereals.includes(c.id) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCereals.includes(c.id)}
                    onChange={() => toggleCereal(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          {/* Cereals - Clásicos */}
          <div className="builder-section">
            <div className="section-title">Cereales - Clasicos</div>
            <div className="checkbox-group">
              {clasicoCereals.map((c) => (
                <label
                  key={c.id}
                  className={`checkbox-item ${selectedCereals.includes(c.id) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCereals.includes(c.id)}
                    onChange={() => toggleCereal(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          {/* Toppings */}
          <div className="builder-section">
            <div className="section-title">Toppings</div>
            <div className="checkbox-group">
              <label className={`checkbox-item ${selectedToppings.length === 0 ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedToppings.length === 0}
                  onChange={() => setSelectedToppings([])}
                />
                Sin topping
              </label>
              {toppings.map((t) => (
                <label
                  key={t.id}
                  className={`checkbox-item ${selectedToppings.includes(t.id) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedToppings.includes(t.id)}
                    onChange={() => toggleTopping(t.id)}
                  />
                  {t.name}
                </label>
              ))}
            </div>
          </div>

          {/* Syrups */}
          <div className="builder-section">
            <div className="section-title">Salsa</div>
            <div className="checkbox-group">
              <label className={`checkbox-item ${selectedSyrup === null ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="syrup"
                  checked={selectedSyrup === null}
                  onChange={() => setSelectedSyrup(null)}
                />
                Sin salsa
              </label>
              {syrups.map((s) => (
                <label
                  key={s.id}
                  className={`checkbox-item ${selectedSyrup === s.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="syrup"
                    checked={selectedSyrup === s.id}
                    onChange={() => setSelectedSyrup(s.id)}
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Notes */}
      <div className="builder-section">
        <div className="section-title">Notas</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionales..."
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="builder-actions">
        <button className="btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn-primary" onClick={handleSave} disabled={!canSave}>
          {editingItem ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
