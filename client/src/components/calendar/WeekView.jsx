import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import * as api from '../../services/api';
import socket from '../../services/socket';
import EventDetail from './EventDetail';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am to 10pm

function formatHour(hour) {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function getEventPosition(event) {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const top = ((startMinutes - 360) / 60) * 48; // 48px per hour, starting at 6am
  const height = Math.max(((endMinutes - startMinutes) / 60) * 48, 18);
  return { top: Math.max(top, 0), height };
}

export default function WeekView() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const weekDays = getWeekDays(weekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const fetchEvents = useCallback(async () => {
    const data = await api.getCalendarEvents({
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
      limit: 200
    }).catch(() => ({ events: [] }));
    setEvents(data?.events || []);
    setLoading(false);
  }, [weekStart.getTime()]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => {
    socket.on('calendar:sync:completed', fetchEvents);
    return () => socket.off('calendar:sync:completed', fetchEvents);
  }, [fetchEvents]);

  const navigate = (weeks) => {
    setWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + weeks * 7);
      return d;
    });
    setLoading(true);
  };

  const goToday = () => {
    setWeekStart(getWeekStart(new Date()));
    setLoading(true);
  };

  // Group events by day
  const eventsByDay = weekDays.map(day => {
    const dayStr = day.toDateString();
    return events.filter(e => new Date(e.startTime).toDateString() === dayStr);
  });

  const allDayByDay = weekDays.map(day => {
    const dayStr = day.toDateString();
    return events.filter(e => e.isAllDay && new Date(e.startTime).toDateString() === dayStr);
  });

  const now = new Date();
  const todayStr = now.toDateString();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMinutes - 360) / 60) * 48;

  const weekLabel = `${weekDays[0].toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`;

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
          <h2 className="text-lg font-semibold text-white ml-2">{weekLabel}</h2>
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
        <div className="border border-port-border rounded-lg overflow-auto bg-port-card">
          {/* Day headers */}
          <div className="flex border-b border-port-border sticky top-0 bg-port-card z-10">
            <div className="w-14 shrink-0" />
            {weekDays.map((day, i) => {
              const isToday = day.toDateString() === todayStr;
              return (
                <div
                  key={i}
                  className={`flex-1 text-center py-2 text-xs font-medium border-l border-port-border ${isToday ? 'text-port-accent' : 'text-gray-400'}`}
                >
                  <div>{day.toLocaleDateString([], { weekday: 'short' })}</div>
                  <div className={`text-lg ${isToday ? 'bg-port-accent text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* All-day row */}
          {allDayByDay.some(d => d.length > 0) && (
            <div className="flex border-b border-port-border">
              <div className="w-14 shrink-0 text-[10px] text-gray-500 text-right pr-1 pt-1">All day</div>
              {allDayByDay.map((dayEvents, i) => (
                <div key={i} className="flex-1 border-l border-port-border p-0.5 min-h-[28px]">
                  {dayEvents.map(event => (
                    <button
                      key={`${event.accountId}-${event.id}`}
                      onClick={() => setSelectedEvent(event)}
                      className="w-full text-left px-1 py-0.5 bg-port-accent/15 text-port-accent rounded text-[10px] truncate hover:bg-port-accent/25 transition-colors"
                    >
                      {event.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Time grid */}
          <div className="relative">
            {HOURS.map(hour => (
              <div key={hour} className="flex border-b border-port-border/50 last:border-b-0" style={{ height: 48 }}>
                <div className="w-14 shrink-0 text-[10px] text-gray-500 text-right pr-1 -mt-1.5">
                  {formatHour(hour)}
                </div>
                {weekDays.map((_, i) => (
                  <div key={i} className="flex-1 border-l border-port-border/50" />
                ))}
              </div>
            ))}

            {/* Events overlay per column */}
            <div className="absolute top-0 bottom-0 left-14 right-0 flex">
              {eventsByDay.map((dayEvents, dayIndex) => {
                const isToday = weekDays[dayIndex].toDateString() === todayStr;
                return (
                  <div key={dayIndex} className="flex-1 relative border-l border-port-border/50">
                    {dayEvents.filter(e => !e.isAllDay).map(event => {
                      const { top, height } = getEventPosition(event);
                      return (
                        <button
                          key={`${event.accountId}-${event.id}`}
                          onClick={() => setSelectedEvent(event)}
                          className="absolute left-0.5 right-0.5 px-1 py-0.5 bg-port-accent/20 border-l-2 border-port-accent rounded text-left overflow-hidden hover:bg-port-accent/30 transition-colors"
                          style={{ top, height, minHeight: 18 }}
                        >
                          <div className="text-[10px] font-medium text-white truncate">{event.title}</div>
                        </button>
                      );
                    })}
                    {/* Current time line */}
                    {isToday && nowTop >= 0 && nowTop <= HOURS.length * 48 && (
                      <div className="absolute left-0 right-0 flex items-center pointer-events-none z-10" style={{ top: nowTop }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-port-error -ml-0.5" />
                        <div className="flex-1 h-px bg-port-error" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedEvent && <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}
