import { Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function Nav() {
  const { user, logout } = useAuthStore();
  return (
    <div>
      <nav style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #eee' }}>
        <Link to="/">Menu</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/reviews">Reviews</Link>
        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
        <span style={{ marginLeft: 'auto' }} />
        {user ? (
          <>
            <Link to="/profile">{user.name} ({user.rewardPoints} pts)</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
      <Outlet />
    </div>
  );
}
