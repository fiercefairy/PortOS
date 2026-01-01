import { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import * as api from '../services/api';

export default function Apps() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function getEmptyForm() {
    return {
      name: '',
      repoPath: '',
      type: 'vite+express',
      uiPort: '',
      apiPort: '',
      startCommands: 'npm run dev',
      pm2ProcessNames: '',
      editorCommand: 'code .'
    };
  }

  const fetchApps = async () => {
    const data = await api.getApps().catch(() => []);
    setApps(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const data = {
      name: formData.name,
      repoPath: formData.repoPath,
      type: formData.type,
      uiPort: formData.uiPort ? parseInt(formData.uiPort) : undefined,
      apiPort: formData.apiPort ? parseInt(formData.apiPort) : undefined,
      startCommands: formData.startCommands.split('\n').filter(Boolean),
      pm2ProcessNames: formData.pm2ProcessNames
        ? formData.pm2ProcessNames.split(',').map(s => s.trim()).filter(Boolean)
        : undefined,
      editorCommand: formData.editorCommand || undefined
    };

    if (editingApp) {
      await api.updateApp(editingApp.id, data).catch(err => {
        setError(err.message);
        throw err;
      });
    } else {
      await api.createApp(data).catch(err => {
        setError(err.message);
        throw err;
      });
    }

    setSaving(false);
    setShowForm(false);
    setEditingApp(null);
    setFormData(getEmptyForm());
    fetchApps();
  };

  const handleEdit = (app) => {
    setEditingApp(app);
    setFormData({
      name: app.name,
      repoPath: app.repoPath,
      type: app.type,
      uiPort: app.uiPort || '',
      apiPort: app.apiPort || '',
      startCommands: (app.startCommands || []).join('\n'),
      pm2ProcessNames: (app.pm2ProcessNames || []).join(', '),
      editorCommand: app.editorCommand || 'code .'
    });
    setShowForm(true);
  };

  const handleDelete = async (app) => {
    if (!confirm(`Delete "${app.name}"?`)) return;
    await api.deleteApp(app.id);
    fetchApps();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingApp(null);
    setFormData(getEmptyForm());
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Apps</h2>
          <p className="text-gray-500">Manage registered applications</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-port-accent hover:bg-port-accent/80 text-white rounded-lg transition-colors"
          >
            + Register App
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-port-card border border-port-border rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingApp ? 'Edit App' : 'Register New App'}
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-port-error/20 border border-port-error rounded-lg text-port-error text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-port-bg border border-port-border rounded-lg text-white focus:border-port-accent focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-port-bg border border-port-border rounded-lg text-white focus:border-port-accent focus:outline-none"
                >
                  <option value="vite+express">Vite + Express</option>
                  <option value="single-node-server">Single Node Server</option>
                  <option value="static">Static</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Repository Path *</label>
              <input
                type="text"
                value={formData.repoPath}
                onChange={e => setFormData({ ...formData, repoPath: e.target.value })}
                className="w-full px-3 py-2 bg-port-bg border border-port-border rounded-lg text-white focus:border-port-accent focus:outline-none"
                placeholder="/Users/you/projects/my-app"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">UI Port</label>
                <input
                  type="number"
                  value={formData.uiPort}
                  onChange={e => setFormData({ ...formData, uiPort: e.target.value })}
                  className="w-full px-3 py-2 bg-port-bg border border-port-border rounded-lg text-white focus:border-port-accent focus:outline-none"
                  placeholder="3000"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">API Port</label>
                <input
                  type="number"
                  value={formData.apiPort}
                  onChange={e => setFormData({ ...formData, apiPort: e.target.value })}
                  className="w-full px-3 py-2 bg-port-bg border border-port-border rounded-lg text-white focus:border-port-accent focus:outline-none"
                  placeholder="3001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Start Commands (one per line)
              </label>
              <textarea
                value={formData.startCommands}
                onChange={e => setFormData({ ...formData, startCommands: e.target.value })}
                className="w-full px-3 py-2 bg-port-bg border border-port-border rounded-lg text-white focus:border-port-accent focus:outline-none font-mono text-sm"
                rows={2}
                placeholder="npm run dev"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                PM2 Process Names (comma-separated)
              </label>
              <input
                type="text"
                value={formData.pm2ProcessNames}
                onChange={e => setFormData({ ...formData, pm2ProcessNames: e.target.value })}
                className="w-full px-3 py-2 bg-port-bg border border-port-border rounded-lg text-white focus:border-port-accent focus:outline-none"
                placeholder="my-app-ui, my-app-api"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Editor Command</label>
              <input
                type="text"
                value={formData.editorCommand}
                onChange={e => setFormData({ ...formData, editorCommand: e.target.value })}
                className="w-full px-3 py-2 bg-port-bg border border-port-border rounded-lg text-white focus:border-port-accent focus:outline-none"
                placeholder="code ."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-port-accent hover:bg-port-accent/80 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingApp ? 'Save Changes' : 'Register App'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-port-border hover:bg-port-border/80 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {apps.length === 0 ? (
        <div className="bg-port-card border border-port-border rounded-xl p-12 text-center">
          <p className="text-gray-500">No apps registered yet</p>
        </div>
      ) : (
        <div className="bg-port-card border border-port-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-port-border/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Ports</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-port-border">
                {apps.map(app => (
                  <tr key={app.id} className="hover:bg-port-border/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{app.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{app.repoPath}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{app.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {[app.uiPort, app.apiPort].filter(Boolean).join(', ') || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.overallStatus} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(app)}
                        className="text-sm text-port-accent hover:text-port-accent/80 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(app)}
                        className="text-sm text-port-error hover:text-port-error/80"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
