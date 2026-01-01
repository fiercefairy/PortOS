import { Outlet, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/apps', label: 'Apps', icon: '📦' },
  { to: '/logs', label: 'Logs', icon: '📋' },
  { to: '/devtools', label: 'Dev Tools', icon: '🛠️' },
  { to: '/ai', label: 'AI Providers', icon: '🤖' },
  { to: '/create', label: 'Create App', icon: '➕' }
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-port-bg">
      {/* Header */}
      <header className="border-b border-port-border bg-port-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            <h1 className="text-xl font-bold text-white">Port OS</h1>
          </div>
          <div className="text-sm text-gray-500">
            Local Dev Portal
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-port-border bg-port-card/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-port-accent text-white'
                      : 'text-gray-400 hover:text-white hover:bg-port-border'
                  }`
                }
              >
                <span>{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
