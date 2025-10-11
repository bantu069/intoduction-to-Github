import { useEffect, useState } from 'react';
import { authHeaders } from '../store/auth';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [items, setItems] = useState<Record<number, any[]>>({});

  useEffect(() => {
    fetch('/api/orders', { headers: authHeaders() }).then((r) => r.json()).then(setOrders);
  }, []);

  async function loadItems(orderId: number) {
    if (items[orderId]) return;
    const res = await fetch(`/api/orders/${orderId}/items`, { headers: authHeaders() });
    const data = await res.json();
    setItems((prev) => ({ ...prev, [orderId]: data }));
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Orders</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {orders.map((o) => (
          <div key={o.id} style={{ border: '1px solid #eee', padding: 12 }}>
            <div>Order #{o.id} — {o.status} — R {(o.totalCents / 100).toFixed(2)}</div>
            <button onClick={() => loadItems(o.id)}>Show items</button>
            {items[o.id] && (
              <ul>
                {items[o.id].map((it) => (
                  <li key={it.id}>{it.itemName} x {it.quantity} — R {(it.priceCents / 100).toFixed(2)}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
