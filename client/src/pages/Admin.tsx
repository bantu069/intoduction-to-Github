import { useEffect, useState } from 'react';
import { authHeaders } from '../store/auth';

export default function Admin() {
  const [stock, setStock] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/stock', { headers: authHeaders() }).then((r) => r.json()).then(setStock);
    fetch('/api/admin/payments', { headers: authHeaders() }).then((r) => r.json()).then(setPayments);
    fetch('/api/admin/reviews', { headers: authHeaders() }).then((r) => r.json()).then(setReviews);
  }, []);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 24 }}>
      <h2>Admin Dashboard</h2>

      <section>
        <h3>Stock</h3>
        <ul>
          {stock.map((s) => (
            <li key={s.id}>{s.name} — Qty: {s.stockQty} — {s.isActive ? 'Active' : 'Inactive'}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Payments</h3>
        <ul>
          {payments.map((p) => (
            <li key={p.id}>Order #{p.orderId} — R {(p.amountCents / 100).toFixed(2)} — {p.method} — {p.status}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Reviews</h3>
        <ul>
          {reviews.map((r) => (
            <li key={r.id}>{r.itemName} — {r.userName}: {r.rating}/5 — {r.comment || ''}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
