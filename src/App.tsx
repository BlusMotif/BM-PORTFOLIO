import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { FirebaseProvider } from './context/FirebaseContext';
import Portfolio from './pages/Portfolio';
import Admin from './pages/Admin';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Portfolio />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
]);

function App() {
  return (
    <FirebaseProvider>
      <RouterProvider router={router} />
    </FirebaseProvider>
  );
}

export default App;