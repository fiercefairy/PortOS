import { HeartPulse, Beer } from 'lucide-react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px' }}>
      <p style={{ color: '#9ca3af', marginBottom: 4 }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color ?? entry.fill, margin: '2px 0' }}>
          {entry.name}: {entry.value != null ? Math.round(entry.value * 100) / 100 : '—'}
          {entry.dataKey === 'hrv' ? ' ms' : 'g'}
        </p>
      ))}
    </div>
  );
};

function computeSummary(dailyData) {
  const drinkingDays = dailyData.filter(d => d.alcoholGrams != null && d.alcoholGrams > 0 && d.hrv != null);
  const soberDays = dailyData.filter(d => (d.alcoholGrams == null || d.alcoholGrams === 0) && d.hrv != null);

  if (drinkingDays.length === 0) return 'No alcohol data recorded in this period.';
  if (soberDays.length === 0) return 'No sober days recorded in this period.';

  const avgHrvDrinking = Math.round(drinkingDays.reduce((sum, d) => sum + d.hrv, 0) / drinkingDays.length);
  const avgHrvSober = Math.round(soberDays.reduce((sum, d) => sum + d.hrv, 0) / soberDays.length);
  const percentDiff = avgHrvSober > 0
    ? Math.abs(((avgHrvSober - avgHrvDrinking) / avgHrvSober) * 100).toFixed(0)
    : '0';

  return `HRV averages ${avgHrvDrinking}ms on drinking days vs ${avgHrvSober}ms on sober days (${percentDiff}% difference)`;
}

export default function AlcoholHrvCorrelation({ data, range }) {
  const dailyData = data?.dailyData ?? [];

  if (dailyData.length < 14) {
    return (
      <div className="bg-port-card border border-port-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <HeartPulse size={16} className="text-port-success" />
          <Beer size={16} className="text-port-warning" />
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Alcohol vs HRV</h3>
        </div>
        <p className="text-gray-400 text-sm">
          Need 14+ days of data for correlations — {dailyData.length} days so far.
        </p>
      </div>
    );
  }

  const chartData = dailyData.map(d => ({
    date: d.date?.slice(5) ?? d.date,
    hrv: d.hrv,
    alcohol: d.alcoholGrams
  }));

  const summary = computeSummary(dailyData);

  return (
    <div className="bg-port-card border border-port-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <HeartPulse size={16} className="text-port-success" />
        <Beer size={16} className="text-port-warning" />
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Alcohol vs HRV</h3>
        <span className="text-xs text-gray-600 ml-1">({range})</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 40, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis
            yAxisId="hrv"
            orientation="left"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            width={40}
            label={{ value: 'HRV (ms)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 10 }}
          />
          <YAxis
            yAxisId="alcohol"
            orientation="right"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            width={40}
            label={{ value: 'Alcohol (g)', angle: 90, position: 'insideRight', fill: '#9ca3af', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
          <Line
            yAxisId="hrv"
            type="monotone"
            dataKey="hrv"
            name="HRV"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Bar
            yAxisId="alcohol"
            dataKey="alcohol"
            name="Alcohol"
            fill="#f59e0b"
            opacity={0.7}
            maxBarSize={12}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <p className="text-sm text-gray-400 mt-3 border-t border-port-border pt-3">{summary}</p>
    </div>
  );
}
