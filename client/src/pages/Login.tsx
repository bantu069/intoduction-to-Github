import { useState } from 'react';
import { useAuthStore } from '../store/auth';

export default function Login() {
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setAuth(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ padding: 16, display: 'grid', gap: 8 }}>
      <h2>Login</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
