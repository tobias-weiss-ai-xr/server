import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Documents } from './pages/Documents';
import { Services } from './pages/Services';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/services" element={<Services />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
