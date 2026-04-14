import { useState, useEffect, useRef } from 'react';
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
  const [selectedSyrup, setSelectedSyrup] = useState<number | null>(editingItem?.syrup_id ?? null);
  const [selectedFavoriteId, setSelectedFavoriteId] = useState<number | null>(editingItem?.favorite_id || null);
  const [notes, setNotes] = useState(editingItem?.notes || '');

  // Explicit "none" choices — only true when waiter actively picks them
  const [noTopping, setNoTopping] = useState(editingItem ? editingItem.topping_ids.length === 0 : false);
  const [noSyrup, setNoSyrup] = useState(editingItem ? editingItem.syrup_id === null : false);

  // Show validation errors only after first attempt
  const [attempted, setAttempted] = useState(false);
  const cerealRef = useRef<HTMLDivElement>(null);
  const toppingRef = useRef<HTMLDivElement>(null);
  const syrupRef = useRef<HTMLDivElement>(null);

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
    setNoTopping(false);
    setSelectedToppings((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleNoTopping = () => {
    setSelectedFavoriteId(null);
    setNoTopping(true);
    setSelectedToppings([]);
  };

  const handleSelectSyrup = (id: number) => {
    setNoSyrup(false);
    setSelectedSyrup(id);
  };

  const handleNoSyrup = () => {
    setNoSyrup(true);
    setSelectedSyrup(null);
  };

  const applyFavorite = (fav: Favorite) => {
    const cerealIds = typeof fav.cereal_ids === 'string' ? JSON.parse(fav.cereal_ids) : fav.cereal_ids;
    const toppingIds = typeof fav.topping_ids === 'string' ? JSON.parse(fav.topping_ids) : fav.topping_ids;
    setSelectedCereals(cerealIds);
    setSelectedToppings(toppingIds);
    setSelectedFavoriteId(fav.id);
    setNoTopping(toppingIds.length === 0);
  };

  const isWater = type === 'water';
  const cerealValid = isWater || selectedCereals.length > 0;
  const toppingValid = isWater || noTopping || selectedToppings.length > 0;
  const syrupValid = isWater || noSyrup || selectedSyrup !== null;
  const canSave = cerealValid && toppingValid && syrupValid;

  const handleSave = () => {
    if (!canSave) {
      setAttempted(true);
      const firstInvalid = !cerealValid ? cerealRef : !toppingValid ? toppingRef : syrupRef;
      firstInvalid.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onSave({ type, cereal_ids: selectedCereals, topping_ids: selectedToppings, syrup_id: selectedSyrup, favorite_id: selectedFavoriteId, notes });
  };

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
                  setNoTopping(false);
                  setNoSyrup(false);
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
          <div className="builder-section" ref={cerealRef}>
            <div className={`section-title ${attempted && !cerealValid ? 'section-title--error' : ''}`}>
              Cereales - Especiales
            </div>
            {attempted && !cerealValid && (
              <div className="section-error-msg">Selecciona al menos un cereal</div>
            )}
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
            <div className={`section-title ${attempted && !cerealValid ? 'section-title--error' : ''}`}>
              Cereales - Clasicos
            </div>
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
          <div className="builder-section" ref={toppingRef}>
            <div className={`section-title ${attempted && !toppingValid ? 'section-title--error' : ''}`}>
              Toppings
            </div>
            {attempted && !toppingValid && (
              <div className="section-error-msg">Selecciona un topping o "Sin topping"</div>
            )}
            <div className="checkbox-group">
              <label className={`checkbox-item ${noTopping ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={noTopping}
                  onChange={handleNoTopping}
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
          <div className="builder-section" ref={syrupRef}>
            <div className={`section-title ${attempted && !syrupValid ? 'section-title--error' : ''}`}>
              Salsa
            </div>
            {attempted && !syrupValid && (
              <div className="section-error-msg">Selecciona una salsa o "Sin salsa"</div>
            )}
            <div className="checkbox-group">
              <label className={`checkbox-item ${noSyrup ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="syrup"
                  checked={noSyrup}
                  onChange={handleNoSyrup}
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
                    onChange={() => handleSelectSyrup(s.id)}
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
        <button className="btn-primary" onClick={handleSave}>
          {editingItem ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
