import { useState, useEffect, useCallback } from 'react';
import { Beer, Plus, Trash2, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import * as api from '../../../services/api';
import BrailleSpinner from '../../BrailleSpinner';
import AlcoholChart from '../AlcoholChart';
import StandardDrinkCalculator from '../StandardDrinkCalculator';

const COMMON_DRINKS = [
  { name: 'Beer (12oz)', oz: 12, abv: 5 },
  { name: 'IPA (16oz)', oz: 16, abv: 6.5 },
  { name: 'Wine (5oz)', oz: 5, abv: 12 },
  { name: 'Spirit (1.5oz)', oz: 1.5, abv: 40 },
  { name: 'Cocktail (6oz)', oz: 6, abv: 15 },
  { name: 'Hard Seltzer (12oz)', oz: 12, abv: 5 },
  { name: 'Guinness (14.9oz)', oz: 14.9, abv: 4.2 }
];

const RISK_COLORS = {
  low: 'text-port-success',
  moderate: 'text-port-warning',
  high: 'text-port-error'
};

const RISK_BG = {
  low: 'bg-port-success/10 border-port-success/30',
  moderate: 'bg-port-warning/10 border-port-warning/30',
  high: 'bg-port-error/10 border-port-error/30'
};

export default function AlcoholTab() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [name, setName] = useState('');
  const [oz, setOz] = useState('');
  const [abv, setAbv] = useState('');
  const [count, setCount] = useState(1);
  const [date, setDate] = useState('');

  const fetchSummary = useCallback(async () => {
    const data = await api.getAlcoholSummary().catch(() => null);
    setSummary(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary, refreshKey]);

  const handleQuickAdd = async (drink) => {
    setLogging(true);
    await api.logAlcoholDrink({
      name: drink.name,
      oz: drink.oz,
      abv: drink.abv,
      count: 1,
      date: date || undefined
    }).catch(() => null);
    setLogging(false);
    setRefreshKey(k => k + 1);
  };

  const handleCustomAdd = async (e) => {
    e.preventDefault();
    if (!oz || !abv) return;
    setLogging(true);
    await api.logAlcoholDrink({
      name: name || '',
      oz: parseFloat(oz),
      abv: parseFloat(abv),
      count: count || 1,
      date: date || undefined
    }).catch(() => null);
    setLogging(false);
    setName('');
    setOz('');
    setAbv('');
    setCount(1);
    setRefreshKey(k => k + 1);
  };

  const handleRemove = async (entryDate, index) => {
    await api.removeAlcoholDrink(entryDate, index).catch(() => null);
    setRefreshKey(k => k + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <BrailleSpinner text="Loading" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rolling Averages Summary */}
      {summary && (
        <div className="bg-port-card border border-port-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Beer size={18} className="text-port-accent" />
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Alcohol Summary
              </h3>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${RISK_BG[summary.riskLevel]}`}>
              {summary.riskLevel === 'high' && <AlertTriangle size={12} />}
              {summary.riskLevel === 'low' && <TrendingDown size={12} />}
              {summary.riskLevel === 'moderate' && <TrendingUp size={12} />}
              <span className={RISK_COLORS[summary.riskLevel]}>
                {summary.riskLevel === 'low' ? 'Low Risk' : summary.riskLevel === 'moderate' ? 'Moderate Risk' : 'High Risk'}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <span className="text-xs text-gray-500">Today</span>
              <p className={`text-2xl font-bold ${summary.today > summary.thresholds.dailyMax ? 'text-port-error' : 'text-white'}`}>
                {summary.today}
              </p>
              <span className="text-xs text-gray-600">/ {summary.thresholds.dailyMax} max</span>
            </div>
            <div>
              <span className="text-xs text-gray-500">7-Day Avg</span>
              <p className="text-2xl font-bold text-white">{summary.avg7day}</p>
              <span className="text-xs text-gray-600">per day</span>
            </div>
            <div>
              <span className="text-xs text-gray-500">30-Day Avg</span>
              <p className="text-2xl font-bold text-white">{summary.avg30day}</p>
              <span className="text-xs text-gray-600">per day</span>
            </div>
            <div>
              <span className="text-xs text-gray-500">Weekly Total</span>
              <p className={`text-2xl font-bold ${summary.weeklyTotal > summary.thresholds.weeklyMax ? 'text-port-error' : 'text-white'}`}>
                {summary.weeklyTotal}
              </p>
              <span className="text-xs text-gray-600">/ {summary.thresholds.weeklyMax} max</span>
            </div>
            <div>
              <span className="text-xs text-gray-500">All-Time Avg</span>
              <p className="text-2xl font-bold text-gray-300">{summary.allTimeAvg}</p>
              <span className="text-xs text-gray-600">per day</span>
            </div>
          </div>
        </div>
      )}

      {/* Consumption Chart */}
      <AlcoholChart sex={summary?.sex} onRefreshKey={refreshKey} />

      {/* Log a Drink */}
      <div className="bg-port-card border border-port-border rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Log a Drink</h3>

        {/* Quick-add buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {COMMON_DRINKS.map(drink => (
            <button
              key={drink.name}
              onClick={() => handleQuickAdd(drink)}
              disabled={logging}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-port-border/50 text-gray-300 rounded-lg hover:bg-port-accent/10 hover:text-port-accent transition-colors disabled:opacity-50"
            >
              <Plus size={12} />
              {drink.name}
            </button>
          ))}
        </div>

        {/* Custom entry form */}
        <form onSubmit={handleCustomAdd} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs text-gray-500 block mb-1">Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Hazy IPA"
              className="w-full px-3 py-2 bg-port-bg border border-port-border rounded-lg text-sm text-white placeholder-gray-600"
            />
          </div>
          <div className="w-20">
            <label className="text-xs text-gray-500 block mb-1">Oz</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={oz}
              onChange={e => setOz(e.target.value)}
              required
              placeholder="12"
              className="w-full px-3 py-2 bg-port-bg border border-port-border rounded-lg text-sm text-white placeholder-gray-600"
            />
          </div>
          <div className="w-20">
            <label className="text-xs text-gray-500 block mb-1">ABV %</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={abv}
              onChange={e => setAbv(e.target.value)}
              required
              placeholder="5"
              className="w-full px-3 py-2 bg-port-bg border border-port-border rounded-lg text-sm text-white placeholder-gray-600"
            />
          </div>
          <div className="w-16">
            <label className="text-xs text-gray-500 block mb-1">Count</label>
            <input
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={e => setCount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-port-bg border border-port-border rounded-lg text-sm text-white"
            />
          </div>
          <div className="w-36">
            <label className="text-xs text-gray-500 block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-port-bg border border-port-border rounded-lg text-sm text-white"
            />
          </div>
          <button
            type="submit"
            disabled={logging || !oz || !abv}
            className="flex items-center gap-2 px-4 py-2 bg-port-accent text-white rounded-lg hover:bg-port-accent/80 disabled:opacity-50 transition-colors"
          >
            {logging ? <BrailleSpinner /> : <Plus size={16} />}
            Log
          </button>
        </form>
      </div>

      {/* Recent Drinks */}
      {summary?.recentEntries?.length > 0 && (
        <div className="bg-port-card border border-port-border rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Recent Drinks (7 days)
          </h3>
          <div className="space-y-3">
            {summary.recentEntries.map(entry => (
              <div key={entry.date} className="border border-port-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">{entry.date}</span>
                  <span className={`text-sm font-bold ${
                    entry.alcohol.standardDrinks > (summary.thresholds?.dailyMax || 2) ? 'text-port-error' : 'text-port-accent'
                  }`}>
                    {entry.alcohol.standardDrinks} std drinks
                  </span>
                </div>
                <div className="space-y-1">
                  {entry.alcohol.drinks.map((drink, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">
                        {drink.name || 'Unnamed'} — {drink.oz}oz @ {drink.abv}%
                        {drink.count > 1 && ` (x${drink.count})`}
                      </span>
                      <button
                        onClick={() => handleRemove(entry.date, idx)}
                        className="text-gray-600 hover:text-port-error transition-colors p-1"
                        title="Remove drink"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standard Drink Calculator */}
      <StandardDrinkCalculator />
    </div>
  );
}
