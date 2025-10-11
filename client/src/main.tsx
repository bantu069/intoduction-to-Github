import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './pages/App';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Menu /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'cart', element: <Cart /> },
      { path: 'orders', element: <Orders /> },
      { path: 'reviews', element: <Reviews /> },
      { path: 'profile', element: <Profile /> },
      { path: 'admin', element: <Admin /> }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
