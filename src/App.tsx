import './App.css';
import { createHashRouter, Outlet, RouterProvider } from 'react-router';
import Home from './screens/Home';
import Tags from './screens/Tags';
import Archive from './screens/Archive';
import Note from './screens/Note';
import Register from './screens/Register';
import Login from './screens/Login';
import Todo from './screens/Todo';

const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/notes",
    element: <Note />,
  },
  {
    path: "/todos",
    element: <Todo />,
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
