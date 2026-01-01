import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Apps from './pages/Apps';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="apps" element={<Apps />} />
        <Route path="logs" element={<ComingSoon title="Logs" />} />
        <Route path="devtools" element={<ComingSoon title="Dev Tools" />} />
        <Route path="ai" element={<ComingSoon title="AI Providers" />} />
        <Route path="create" element={<ComingSoon title="Create App" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function ComingSoon({ title }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-400 mb-2">{title}</h2>
        <p className="text-gray-500">Coming in next milestone</p>
      </div>
    </div>
  );
}
