import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import * as api from '../../services/api';
import BrailleSpinner from '../BrailleSpinner';

const VIEWS = [
  { id: '7d', label: '7 Days', days: 7 },
  { id: '30d', label: '30 Days', days: 30 },
  { id: '90d', label: '90 Days', days: 90 }
];

export default function AlcoholChart({ sex = 'male', onRefreshKey }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('30d');

  const dailyMax = sex === 'female' ? 1 : 2;

  const fetchData = useCallback(async () => {
    const days = VIEWS.find(v => v.id === view)?.days || 30;
    const from = new Date();
    from.setDate(from.getDate() - days);
    const fromStr = from.toISOString().split('T')[0];
    const toStr = new Date().toISOString().split('T')[0];

    const entries = await api.getDailyAlcohol(fromStr, toStr).catch(() => []);

    // Build chart data with all dates in range (fill zeros)
    const chartData = [];
    const dateMap = {};
    for (const entry of entries) {
      dateMap[entry.date] = entry.alcohol?.standardDrinks || 0;
    }

    const cursor = new Date(from);
    const end = new Date(toStr);
    while (cursor <= end) {
      const dateStr = cursor.toISOString().split('T')[0];
      chartData.push({
        date: dateStr,
        label: `${cursor.getMonth() + 1}/${cursor.getDate()}`,
        drinks: dateMap[dateStr] || 0
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    setData(chartData);
    setLoading(false);
  }, [view]);

  useEffect(() => {
    fetchData();
  }, [fetchData, onRefreshKey]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const drinks = payload[0].value;
    return (
      <div className="bg-port-card border border-port-border rounded-lg p-2 text-sm">
        <p className="text-gray-400">{label}</p>
        <p className={`font-semibold ${drinks > dailyMax ? 'text-port-error' : 'text-port-accent'}`}>
          {drinks} std drinks
        </p>
      </div>
    );
  };

  return (
    <div className="bg-port-card border border-port-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Daily Consumption
        </h3>
        <div className="flex gap-1">
          {VIEWS.map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                view === v.id
                  ? 'bg-port-accent/10 text-port-accent'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <BrailleSpinner text="Loading chart" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              interval={view === '7d' ? 0 : view === '30d' ? 2 : 6}
            />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={dailyMax}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{ value: 'Daily limit', fill: '#f59e0b', fontSize: 10, position: 'right' }}
            />
            <Bar
              dataKey="drinks"
              radius={[2, 2, 0, 0]}
              fill="#3b82f6"
              maxBarSize={view === '7d' ? 40 : view === '30d' ? 16 : 8}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
