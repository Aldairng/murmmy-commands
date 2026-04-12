import { useState } from 'react';
import TablesSettings from './TablesSettings';
import IngredientsSettings from './IngredientsSettings';
import FavoritesSettings from './FavoritesSettings';
import PasswordSettings from './PasswordSettings';
import './Settings.css';

type SettingsTab = 'tables' | 'ingredients' | 'favorites' | 'password';

export default function Settings() {
  const [tab, setTab] = useState<SettingsTab>('tables');

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: 'tables', label: 'Mesas' },
    { key: 'ingredients', label: 'Ingredientes' },
    { key: 'favorites', label: 'Favoritos' },
    { key: 'password', label: 'Contrasena' },
  ];

  return (
    <div className="settings">
      <h2 className="page-title">Ajustes</h2>
      <div className="settings-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`settings-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="settings-content">
        {tab === 'tables' && <TablesSettings />}
        {tab === 'ingredients' && <IngredientsSettings />}
        {tab === 'favorites' && <FavoritesSettings />}
        {tab === 'password' && <PasswordSettings />}
      </div>
    </div>
  );
}
