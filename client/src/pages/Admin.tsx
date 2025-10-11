import { useEffect, useState } from 'react';
import { authHeaders } from '../store/auth';

export default function Admin() {
  const [stock, setStock] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<{ popularItems: any[]; frequentCustomers: any[] } | null>(null);
  const [sales, setSales] = useState<{ byDay: any[]; byMethod: any[] } | null>(null);

  useEffect(() => {
    fetch('/api/admin/stock', { headers: authHeaders() }).then((r) => r.json()).then(setStock);
    fetch('/api/admin/payments', { headers: authHeaders() }).then((r) => r.json()).then(setPayments);
    fetch('/api/admin/reviews', { headers: authHeaders() }).then((r) => r.json()).then(setReviews);
    fetch('/api/admin/analytics', { headers: authHeaders() }).then((r) => r.json()).then(setAnalytics);
    fetch('/api/admin/sales', { headers: authHeaders() }).then((r) => r.json()).then(setSales);
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

      <section>
        <h3>Analytics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <h4>Popular Items</h4>
            <ul>
              {analytics?.popularItems?.map((i) => (
                <li key={i.id}>{i.name} — {i.totalQty}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Frequent Customers</h4>
            <ul>
              {analytics?.frequentCustomers?.map((c) => (
                <li key={c.id}>{c.name} — {c.ordersCount} orders</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3>Sales</h3>
        <div>
          <h4>By Day</h4>
          <ul>
            {sales?.byDay?.map((d) => (
              <li key={d.day}>{d.day} — R {(d.totalCents / 100).toFixed(2)}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>By Method</h4>
          <ul>
            {sales?.byMethod?.map((m) => (
              <li key={m.method}>{m.method}: R {(m.totalCents / 100).toFixed(2)}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
