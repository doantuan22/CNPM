import { Link, Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <>
      <header>
        <nav style={{ display: 'flex', gap: 16, padding: 16 }}>
          <Link to="/">Home</Link>
          <Link to="/hotels">Hotels</Link>
          <Link to="/bookings">Bookings</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </>
  );
}
