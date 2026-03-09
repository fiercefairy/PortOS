import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import * as api from '../../services/api';
import socket from '../../services/socket';
import EventDetail from './EventDetail';

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const cells = [];
  // Leading empty cells
  for (let i = 0; i < startOffset; i++) {
    const d = new Date(year, month, -startOffset + i + 1);
    cells.push({ date: d, isCurrentMonth: false });
  }
  // Current month
  for (let i = 1; i <= totalDays; i++) {
    cells.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  // Trailing empty cells to fill 6 rows
  while (cells.length < 42) {
    const d = new Date(year, month + 1, cells.length - startOffset - totalDays + 1);
    cells.push({ date: d, isCurrentMonth: false });
  }
  return cells;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthView({ accounts }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const cells = getMonthGrid(year, month);
  const monthLabel = new Date(year, month).toLocaleDateString([], { month: 'long', year: 'numeric' });

  const fetchEvents = useCallback(async () => {
    const startDate = cells[0].date.toISOString();
    const endDate = new Date(cells[cells.length - 1].date.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const data = await api.getCalendarEvents({ startDate, endDate, limit: 500 }).catch(() => ({ events: [] }));
    setEvents(data?.events || []);
    setLoading(false);
  }, [year, month]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => {
    socket.on('calendar:sync:completed', fetchEvents);
    return () => socket.off('calendar:sync:completed', fetchEvents);
  }, [fetchEvents]);

  const navigate = (dir) => {
    setLoading(true);
    if (dir === -1) {
      if (month === 0) { setMonth(11); setYear(y => y - 1); }
      else setMonth(m => m - 1);
    } else {
      if (month === 11) { setMonth(0); setYear(y => y + 1); }
      else setMonth(m => m + 1);
    }
  };

  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setLoading(true);
  };

  // Group events by day string
  const eventsByDay = {};
  for (const event of events) {
    const dayKey = new Date(event.startTime).toDateString();
    if (!eventsByDay[dayKey]) eventsByDay[dayKey] = [];
    eventsByDay[dayKey].push(event);
  }

  const todayStr = now.toDateString();

  return (
    <div className="space-y-4">
      {/* Nav header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-port-border transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => navigate(1)} className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-port-border transition-colors">
            <ChevronRight size={18} />
          </button>
          <h2 className="text-lg font-semibold text-white ml-2">{monthLabel}</h2>
        </div>
        <button onClick={goToday} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-port-card border border-port-border rounded hover:bg-port-border transition-colors">
          Today
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={24} className="text-port-accent animate-spin" />
        </div>
      ) : (
        <div className="border border-port-border rounded-lg overflow-hidden bg-port-card">
          {/* Day name headers */}
          <div className="grid grid-cols-7 border-b border-port-border">
            {DAY_NAMES.map(name => (
              <div key={name} className="text-center py-2 text-xs font-medium text-gray-400">
                {name}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              const dayStr = cell.date.toDateString();
              const dayEvents = eventsByDay[dayStr] || [];
              const isToday = dayStr === todayStr;
              return (
                <div
                  key={i}
                  className={`min-h-[80px] p-1 border-b border-r border-port-border/50 ${
                    !cell.isCurrentMonth ? 'bg-port-bg/50' : ''
                  } ${i % 7 === 6 ? 'border-r-0' : ''}`}
                >
                  <div className={`text-xs mb-0.5 ${
                    isToday
                      ? 'bg-port-accent text-white rounded-full w-6 h-6 flex items-center justify-center'
                      : cell.isCurrentMonth ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {cell.date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(event => (
                      <button
                        key={`${event.accountId}-${event.id}`}
                        onClick={() => setSelectedEvent(event)}
                        className="w-full text-left px-1 py-0.5 bg-port-accent/15 text-port-accent rounded text-[10px] truncate hover:bg-port-accent/25 transition-colors"
                      >
                        {!event.isAllDay && (
                          <span className="text-gray-500 mr-1">
                            {new Date(event.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        )}
                        {event.title}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-gray-500 pl-1">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedEvent && <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}
