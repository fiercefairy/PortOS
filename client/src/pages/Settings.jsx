import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import BrailleSpinner from '../components/BrailleSpinner';
import { getSettings, updateSettings } from '../services/api';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [destPath, setDestPath] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [cronExpression, setCronExpression] = useState('0 2 * * *');

  useEffect(() => {
    getSettings().then(settings => {
      const backup = settings?.backup || {};
      setDestPath(backup.destPath || '');
      setEnabled(backup.enabled ?? false);
      setCronExpression(backup.cronExpression || '0 2 * * *');
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await updateSettings({ backup: { destPath, enabled, cronExpression } })
      .then(() => toast.success('Settings saved'))
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <BrailleSpinner text="Loading settings" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <div className="bg-port-card border border-port-border rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Backup</h2>

        <div className="space-y-1">
          <label className="block text-sm text-gray-400">Destination Path</label>
          <input
            type="text"
            value={destPath}
            onChange={e => setDestPath(e.target.value)}
            className="w-full bg-port-bg border border-port-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-port-accent"
            placeholder="/path/to/backups"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-400">Enabled</label>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative w-10 h-5 rounded-full transition-colors ${enabled ? 'bg-port-accent' : 'bg-port-border'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-gray-400">Schedule (cron)</label>
          <input
            type="text"
            value={cronExpression}
            onChange={e => setCronExpression(e.target.value)}
            className="w-full bg-port-bg border border-port-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-port-accent"
            placeholder="0 2 * * *"
          />
          <p className="text-xs text-gray-500">Default: 2:00 AM daily</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-port-accent hover:bg-port-accent/80 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? <BrailleSpinner /> : <Save size={16} />}
          Save
        </button>
      </div>
    </div>
  );
}
