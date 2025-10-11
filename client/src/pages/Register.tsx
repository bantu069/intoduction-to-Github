import { useState } from 'react';
import { useAuthStore } from '../store/auth';

export default function Register() {
  const { setAuth } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Register failed');
      setAuth(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ padding: 16, display: 'grid', gap: 8 }}>
      <h2>Register</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Create account</button>
    </form>
  );
}
