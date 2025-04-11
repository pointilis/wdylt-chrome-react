import logo from './logo.svg';
import './App.css';
import { createHashRouter, Navigate, Outlet, redirect, RouterProvider } from 'react-router';
import Home from './screens/Home';
import Tags from './screens/Tags';
import Archive from './screens/Archive';
import History from './screens/History';
import Register from './screens/Register';
import { useEffect, useState } from 'react';
import Login from './screens/Login';

const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/notes",
    element: <History />,
  },
  {
    path: "/tags",
    element: <Outlet />,
    children: [
      {
        index: true,
        element: <Tags />,
      },
      {
        path: ':termId',
        element: <Archive />,
      }
    ]
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
