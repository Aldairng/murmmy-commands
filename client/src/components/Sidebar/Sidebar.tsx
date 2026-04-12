import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ModuleType } from '../../types';
import './Sidebar.css';

interface Props {
  currentModule: ModuleType;
  onNavigate: (module: ModuleType) => void;
}

const NAV_ITEMS: { key: ModuleType; label: string; icon: string }[] = [
  { key: 'creator', label: 'Crear Orden', icon: '+' },
  { key: 'viewer', label: 'Ver Ordenes', icon: '=' },
  { key: 'history', label: 'Historial', icon: 'H' },
  { key: 'settings', label: 'Ajustes', icon: '*' },
];

export default function Sidebar({ currentModule, onNavigate }: Props) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-brand">Murmmy</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`sidebar-link ${currentModule === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link" onClick={toggleTheme}>
          <span className="sidebar-icon">{theme === 'dark' ? 'L' : 'D'}</span>
          <span className="sidebar-label">{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
        </button>
        <button className="sidebar-link" onClick={logout}>
          <span className="sidebar-icon">X</span>
          <span className="sidebar-label">Salir</span>
        </button>
      </div>
    </aside>
  );
}
