import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, MapPin } from 'lucide-react';
import * as api from '../../services/api';
import socket from '../../services/socket';
import EventDetail from './EventDetail';

const START_HOUR = 6;
const END_HOUR = 23;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR); // 6am to 10pm
const PX_PER_HOUR = 64;
const PX_PER_15MIN = PX_PER_HOUR / 4; // 16px per 15-min block
const START_MINUTES = START_HOUR * 60;

function formatHour(hour) {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

function getEventPosition(event) {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const top = ((startMinutes - START_MINUTES) / 60) * PX_PER_HOUR;
  const height = Math.max(((endMinutes - startMinutes) / 60) * PX_PER_HOUR, PX_PER_15MIN);
  return { top: Math.max(top, 0), height };
}

function formatDate(date) {
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function DayView() {
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = useCallback(async () => {
    const startDate = date.toISOString();
    const endDate = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const data = await api.getCalendarEvents({ startDate, endDate, limit: 200 }).catch(() => ({ events: [] }));
    setEvents(data?.events || []);
    setLoading(false);
  }, [date]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => {
    socket.on('calendar:sync:completed', fetchEvents);
    return () => socket.off('calendar:sync:completed', fetchEvents);
  }, [fetchEvents]);

  const navigate = (days) => {
    setDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + days);
      return d;
    });
    setLoading(true);
  };

  const goToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setDate(d);
    setLoading(true);
  };

  const allDayEvents = events.filter(e => e.isAllDay);
  const timedEvents = events.filter(e => !e.isAllDay);

  // Current time indicator
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMinutes - START_MINUTES) / 60) * PX_PER_HOUR;

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
          <h2 className="text-lg font-semibold text-white ml-2">{formatDate(date)}</h2>
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
        <>
          {/* All-day events */}
          {allDayEvents.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-gray-500 uppercase">All Day</span>
              {allDayEvents.map(event => (
                <button
                  key={`${event.accountId}-${event.id}`}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full text-left px-3 py-2 bg-port-accent/10 text-port-accent rounded text-sm hover:bg-port-accent/20 transition-colors"
                >
                  {event.title}
                </button>
              ))}
            </div>
          )}

          {/* Time grid */}
          <div className="relative border border-port-border rounded-lg overflow-hidden bg-port-card">
            {HOURS.map(hour => (
              <div key={hour} className="border-b border-port-border last:border-b-0" style={{ height: PX_PER_HOUR }}>
                <div className="flex h-full">
                  <div className="w-16 shrink-0 text-xs text-gray-500 text-right pr-2 pt-1">
                    {formatHour(hour)}
                  </div>
                  <div className="flex-1 border-l border-port-border flex flex-col">
                    {[0, 1, 2, 3].map(q => (
                      <div
                        key={q}
                        className={`flex-1 ${q > 0 ? 'border-t border-port-border/30' : ''}`}
                        style={{ height: PX_PER_15MIN }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Events overlay */}
            <div className="absolute top-0 left-16 right-0 bottom-0">
              {timedEvents.map(event => {
                const { top, height } = getEventPosition(event);
                return (
                  <button
                    key={`${event.accountId}-${event.id}`}
                    onClick={() => setSelectedEvent(event)}
                    className="absolute left-1 right-1 px-2 py-1 bg-port-accent/20 border-l-2 border-port-accent rounded text-left overflow-hidden hover:bg-port-accent/30 transition-colors"
                    style={{ top, height, minHeight: 24 }}
                  >
                    <div className="text-xs font-medium text-white truncate">{event.title}</div>
                    {height > 32 && event.location && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 truncate">
                        <MapPin size={10} /> {event.location}
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Current time line */}
              {isToday && nowTop >= 0 && nowTop <= HOURS.length * PX_PER_HOUR && (
                <div className="absolute left-0 right-0 flex items-center pointer-events-none" style={{ top: nowTop }}>
                  <div className="w-2 h-2 rounded-full bg-port-error -ml-1" />
                  <div className="flex-1 h-px bg-port-error" />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {selectedEvent && <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}
