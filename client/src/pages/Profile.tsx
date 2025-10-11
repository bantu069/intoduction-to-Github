import { useEffect, useState } from 'react';
import { authHeaders } from '../store/auth';

export default function Profile() {
  const [me, setMe] = useState<any | null>(null);
  const [profile, setProfile] = useState<{ allergies: string; preferences: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', { headers: authHeaders() }).then((r) => r.json()).then(setMe);
    fetch('/api/auth/profile', { headers: authHeaders() }).then((r) => r.json()).then(setProfile);
  }, []);

  if (!me || !profile) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Profile</h2>
      <div>Name: {me.name}</div>
      <div>Email: {me.email}</div>
      <div>Role: {me.role}</div>
      <div>Reward Points: {me.rewardPoints}</div>

      <h3>Preferences</h3>
      <div style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
        <label>
          Allergies
          <textarea value={profile.allergies}
            onChange={(e) => setProfile({ ...profile!, allergies: e.target.value })}
            rows={3}
          />
        </label>
        <label>
          Preferences
          <textarea value={profile.preferences}
            onChange={(e) => setProfile({ ...profile!, preferences: e.target.value })}
            rows={3}
          />
        </label>
        <button disabled={saving} onClick={async () => {
          setSaving(true);
          const res = await fetch('/api/auth/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify(profile)
          });
          setSaving(false);
          if (!res.ok) {
            const d = await res.json();
            alert(d.error || 'Save failed');
          } else {
            alert('Saved');
          }
        }}>Save</button>
      </div>
    </div>
  );
}
