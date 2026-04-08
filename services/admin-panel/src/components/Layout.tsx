import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/users', label: 'Users' },
  { path: '/documents', label: 'Documents' },
  { path: '/services', label: 'Services' },
  { path: '/settings', label: 'Settings' },
];

export function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav
        style={{
          width: 240,
          backgroundColor: 'var(--wo-gray-900)',
          color: 'white',
          padding: '1.5rem 0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid var(--wo-gray-700)' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>World Office</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--wo-gray-300)' }}>Admin Panel</p>
        </div>
        <ul style={{ listStyle: 'none', padding: '1rem 0', flex: 1 }}>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '0.625rem 1.5rem',
                  color: isActive ? 'white' : 'var(--wo-gray-300)',
                  backgroundColor: isActive ? 'var(--wo-blue-700)' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  transition: 'background-color 0.15s',
                })}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
