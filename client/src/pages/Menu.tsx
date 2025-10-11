import { useEffect, useState } from 'react';
import { useCartStore } from '../store/cart';

export default function Menu() {
  const [items, setItems] = useState<any[]>([]);
  const { add } = useCartStore();

  useEffect(() => {
    fetch('/api/menu').then((r) => r.json()).then(setItems);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Menu</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((i) => (
          <div key={i.id} style={{ border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
            <div style={{ fontWeight: 'bold' }}>{i.name}</div>
            <div>{i.description}</div>
            <div>R {(i.priceCents / 100).toFixed(2)}</div>
            <button onClick={() => add({ itemId: i.id, name: i.name, priceCents: i.priceCents })}>
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
