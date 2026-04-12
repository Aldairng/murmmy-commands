import { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function PasswordSettings() {
  const { apiFetch } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const res = await apiFetch('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) {
      setMessage('Contrasena actualizada');
      setCurrentPassword('');
      setNewPassword('');
    } else {
      const data = await res.json();
      setError(data.error || 'Error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '350px' }}>
      {message && (
        <div style={{ background: 'rgba(46,204,113,0.15)', color: 'var(--success)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(231,76,60,0.15)', color: 'var(--danger)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '0.75rem' }}>
        <label>Contrasena actual</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label>Nueva contrasena</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={4}
        />
      </div>

      <button type="submit" className="btn-primary">
        Cambiar Contrasena
      </button>
    </form>
  );
}
