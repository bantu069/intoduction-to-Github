import { useEffect, useState } from 'react';
import { authHeaders } from '../store/auth';

export default function Profile() {
  const [me, setMe] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { headers: authHeaders() }).then((r) => r.json()).then(setMe);
  }, []);

  if (!me) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Profile</h2>
      <div>Name: {me.name}</div>
      <div>Email: {me.email}</div>
      <div>Role: {me.role}</div>
      <div>Reward Points: {me.rewardPoints}</div>
    </div>
  );
}
