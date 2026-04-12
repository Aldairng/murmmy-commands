import { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import { ModuleType } from '../../types';
import OrderCreator from '../OrderCreator/TableSelector';
import OrderViewer from '../OrderViewer/OrderViewer';
import Settings from '../Settings/Settings';
import History from '../History/History';
import './Layout.css';

export default function Layout() {
  const [currentModule, setCurrentModule] = useState<ModuleType>('creator');

  const renderModule = () => {
    switch (currentModule) {
      case 'creator':
        return <OrderCreator />;
      case 'viewer':
        return <OrderViewer />;
      case 'settings':
        return <Settings />;
      case 'history':
        return <History />;
    }
  };

  return (
    <div className="layout">
      <Sidebar currentModule={currentModule} onNavigate={setCurrentModule} />
      <main className="main-content">
        {renderModule()}
      </main>
    </div>
  );
}
