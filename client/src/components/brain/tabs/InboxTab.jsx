import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../../../services/api';
import {
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Edit2,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  DESTINATIONS,
  STATUS_COLORS,
  getConfidenceColor,
  formatRelativeTime
} from '../constants';

export default function InboxTab({ onRefresh, settings }) {
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [entries, setEntries] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showNeedsReview, setShowNeedsReview] = useState(true);
  const [showFiled, setShowFiled] = useState(true);
  const [fixingId, setFixingId] = useState(null);
  const [fixDestination, setFixDestination] = useState('');
  const inputRef = useRef(null);

  const fetchInbox = useCallback(async () => {
    const data = await api.getBrainInbox().catch(() => ({ entries: [], counts: {} }));
    setEntries(data.entries || []);
    setCounts(data.counts || {});
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    const result = await api.captureBrainThought(inputText.trim()).catch(err => {
      toast.error(err.message || 'Failed to capture thought');
      return null;
    });
    setSending(false);

    if (result) {
      toast.success(result.message || 'Thought captured');
      setInputText('');
      fetchInbox();
      onRefresh?.();
    }
  };

  const handleResolve = async (entryId, destination) => {
    const result = await api.resolveBrainReview(entryId, destination).catch(err => {
      toast.error(err.message || 'Failed to resolve');
      return null;
    });

    if (result) {
      toast.success(`Filed to ${destination}`);
      fetchInbox();
      onRefresh?.();
    }
  };

  const handleRetry = async (entryId) => {
    const result = await api.retryBrainClassification(entryId).catch(err => {
      toast.error(err.message || 'Failed to retry');
      return null;
    });

    if (result) {
      toast.success(result.message || 'Reclassified');
      fetchInbox();
      onRefresh?.();
    }
  };

  const handleFix = async (entryId) => {
    if (!fixDestination) {
      toast.error('Select a destination');
      return;
    }

    const result = await api.fixBrainClassification(entryId, fixDestination).catch(err => {
      toast.error(err.message || 'Failed to fix');
      return null;
    });

    if (result) {
      toast.success(`Moved to ${fixDestination}`);
      setFixingId(null);
      setFixDestination('');
      fetchInbox();
      onRefresh?.();
    }
  };

  const needsReviewEntries = entries.filter(e => e.status === 'needs_review');
  const filedEntries = entries.filter(e => e.status === 'filed' || e.status === 'corrected');
  const errorEntries = entries.filter(e => e.status === 'error');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-port-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Capture input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="One thought at a time..."
            className="flex-1 px-4 py-3 bg-port-card border border-port-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-port-accent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="px-4 py-3 bg-port-accent hover:bg-port-accent/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Capture a thought. AI will classify and route it automatically.
          {settings?.confidenceThreshold && (
            <span> Confidence threshold: {Math.round(settings.confidenceThreshold * 100)}%</span>
          )}
        </p>
      </form>

      {/* Needs Review section */}
      {needsReviewEntries.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowNeedsReview(!showNeedsReview)}
            className="flex items-center gap-2 text-port-warning font-medium mb-2"
          >
            {showNeedsReview ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <AlertCircle size={16} />
            Needs Review ({needsReviewEntries.length})
          </button>

          {showNeedsReview && (
            <div className="space-y-2">
              {needsReviewEntries.map(entry => (
                <div
                  key={entry.id}
                  className="p-3 bg-port-card border border-port-warning/30 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white flex-1">{entry.capturedText}</p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatRelativeTime(entry.capturedAt)}
                    </span>
                  </div>

                  {entry.classification?.reasons && (
                    <p className="text-xs text-gray-500 mb-2">
                      {entry.classification.reasons.join(' • ')}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">Route to:</span>
                    {['people', 'projects', 'ideas', 'admin'].map(dest => {
                      const destInfo = DESTINATIONS[dest];
                      const Icon = destInfo.icon;
                      return (
                        <button
                          key={dest}
                          onClick={() => handleResolve(entry.id, dest)}
                          className={`flex items-center gap-1 px-2 py-1 text-xs rounded border ${destInfo.color} hover:opacity-80 transition-opacity`}
                        >
                          <Icon size={12} />
                          {destInfo.label}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handleRetry(entry.id)}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-port-border text-gray-400 hover:text-white transition-colors"
                    >
                      <RefreshCw size={12} />
                      Retry AI
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error entries */}
      {errorEntries.length > 0 && (
        <div className="mb-4">
          <div className="text-port-error font-medium mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            Errors ({errorEntries.length})
          </div>
          <div className="space-y-2">
            {errorEntries.map(entry => (
              <div
                key={entry.id}
                className="p-3 bg-port-card border border-port-error/30 rounded-lg"
              >
                <p className="text-white mb-1">{entry.capturedText}</p>
                <p className="text-xs text-port-error">{entry.error?.message || 'Unknown error'}</p>
                <button
                  onClick={() => handleRetry(entry.id)}
                  className="mt-2 flex items-center gap-1 px-2 py-1 text-xs rounded border border-port-border text-gray-400 hover:text-white transition-colors"
                >
                  <RefreshCw size={12} />
                  Retry
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filed entries */}
      <div>
        <button
          onClick={() => setShowFiled(!showFiled)}
          className="flex items-center gap-2 text-port-success font-medium mb-2"
        >
          {showFiled ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <CheckCircle size={16} />
          Filed ({filedEntries.length})
        </button>

        {showFiled && (
          <div className="space-y-2">
            {filedEntries.map(entry => {
              const destInfo = DESTINATIONS[entry.classification?.destination || 'unknown'];
              const DestIcon = destInfo.icon;
              const confidence = entry.classification?.confidence || 0;
              const isCorrected = entry.status === 'corrected';

              return (
                <div
                  key={entry.id}
                  className={`p-3 bg-port-card border rounded-lg ${
                    isCorrected ? 'border-blue-500/30' : 'border-port-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <p className="text-white">{entry.capturedText}</p>
                      {entry.classification?.title && (
                        <p className="text-sm text-gray-400 mt-1">
                          → {entry.classification.title}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatRelativeTime(entry.capturedAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded border ${destInfo.color}`}>
                      <DestIcon size={12} />
                      {destInfo.label}
                    </span>

                    <span className={`text-xs ${getConfidenceColor(confidence)}`}>
                      {Math.round(confidence * 100)}%
                    </span>

                    {isCorrected && (
                      <span className="text-xs text-blue-400">
                        (corrected from {entry.correction?.previousDestination})
                      </span>
                    )}

                    {entry.filed?.destinationId && (
                      <button
                        onClick={() => {
                          // Navigate to the record in memory tab
                          window.location.href = `/brain/memory?type=${entry.filed.destination}&id=${entry.filed.destinationId}`;
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-port-border text-gray-400 hover:text-white transition-colors"
                      >
                        <ExternalLink size={12} />
                        View
                      </button>
                    )}

                    {/* Fix button */}
                    {fixingId === entry.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={fixDestination}
                          onChange={(e) => setFixDestination(e.target.value)}
                          className="px-2 py-1 text-xs bg-port-bg border border-port-border rounded text-white"
                        >
                          <option value="">Select...</option>
                          {['people', 'projects', 'ideas', 'admin']
                            .filter(d => d !== entry.filed?.destination)
                            .map(d => (
                              <option key={d} value={d}>{DESTINATIONS[d].label}</option>
                            ))}
                        </select>
                        <button
                          onClick={() => handleFix(entry.id)}
                          className="px-2 py-1 text-xs rounded bg-port-accent/20 text-port-accent hover:bg-port-accent/30"
                        >
                          Move
                        </button>
                        <button
                          onClick={() => { setFixingId(null); setFixDestination(''); }}
                          className="px-2 py-1 text-xs text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setFixingId(entry.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-port-border text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit2 size={12} />
                        Fix
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filedEntries.length === 0 && (
              <p className="text-gray-500 text-sm">No filed entries yet. Start capturing thoughts above.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
