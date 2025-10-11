import { useAuthStore } from '../store/auth';
import { useCartStore } from '../store/cart';
import { authHeaders } from '../store/auth';

export default function Cart() {
  const { items, update, clear, totalCents } = useCartStore();
  const { user } = useAuthStore();

  async function checkout() {
    if (!user) {
      alert('Please login to checkout');
      return;
    }
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ items: items.map((i) => ({ itemId: i.itemId, quantity: i.quantity })) })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Order failed');
      return;
    }
    const pay = await fetch('/api/orders/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ orderId: data.orderId, method: 'CARD' })
    });
    const payData = await pay.json();
    if (!pay.ok) {
      alert(payData.error || 'Payment failed');
      return;
    }
    alert(`Paid. Reward points awarded: ${payData.rewardPointsAwarded}`);
    clear();
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Cart</h2>
      {items.length === 0 ? (
        <div>Cart is empty</div>
      ) : (
        <>
          <ul>
            {items.map((i) => (
              <li key={i.itemId}>
                {i.name} — R {(i.priceCents / 100).toFixed(2)} x{' '}
                <input
                  type="number"
                  min={1}
                  value={i.quantity}
                  onChange={(e) => update(i.itemId, Number(e.target.value))}
                  style={{ width: 60 }}
                />
              </li>
            ))}
          </ul>
          <div>Total: R {(totalCents() / 100).toFixed(2)}</div>
          <button onClick={checkout}>Checkout & Pay</button>
        </>
      )}
    </div>
  );
}
