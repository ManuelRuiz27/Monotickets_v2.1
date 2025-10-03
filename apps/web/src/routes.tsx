import { createBrowserRouter } from 'react-router-dom';
import { App } from './App.js';
import { Login } from './pages/Login.js';
import { Dashboard } from './pages/Dashboard.js';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'login', element: <Login /> }
    ]
  }
]);
