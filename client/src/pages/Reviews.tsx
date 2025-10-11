import { useEffect, useState } from 'react';

export default function Reviews() {
  const [itemId, setItemId] = useState<number>(0);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (itemId > 0) {
      fetch(`/api/reviews/item/${itemId}`).then((r) => r.json()).then(setReviews);
    }
  }, [itemId]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Reviews</h2>
      <div>
        <input type="number" placeholder="Item ID" value={itemId || ''} onChange={(e) => setItemId(Number(e.target.value))} />
      </div>
      <ul>
        {reviews.map((r) => (
          <li key={r.id}>{r.userName}: {r.rating}/5 — {r.comment || ''}</li>
        ))}
      </ul>
    </div>
  );
}
