import { Outlet } from 'react-router-dom';

export function App() {
  return (
    <div>
      <header>
        <h1>Monotickets</h1>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
