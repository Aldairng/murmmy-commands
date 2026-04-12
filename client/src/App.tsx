import { useAuth } from './contexts/AuthContext';
import Login from './components/Login/Login';
import Layout from './components/Layout/Layout';

export default function App() {
  const { token } = useAuth();

  if (!token) {
    return <Login />;
  }

  return <Layout />;
}
