import { useState, useEffect } from 'react';
import { RefreshCw, Compass, CheckCircle, ArrowRight, FolderSearch, FileText, Map } from 'lucide-react';
import BrailleSpinner from '../../BrailleSpinner';
import PhaseTimeline from '../../gsd/PhaseTimeline';
import GsdConcernsPanel from '../../cos/tabs/GsdConcernsPanel';
import * as api from '../../../services/api';

function GsdSetupGuide({ gsd, onRefresh }) {
  // Determine the current step based on what exists
  const steps = [
    {
      id: 'map',
      label: 'Map Codebase',
      command: '/gsd:map-codebase',
      description: 'Analyze your codebase structure with parallel mapper agents',
      done: gsd.hasCodebaseMap,
      icon: FolderSearch,
    },
    {
      id: 'project',
      label: 'Create Project',
      command: '/gsd:new-project',
      description: 'Initialize project with deep context gathering and PROJECT.md',
      done: gsd.hasProject,
      icon: FileText,
    },
    {
      id: 'roadmap',
      label: 'Plan Phases',
      command: '/gsd:plan-phase',
      description: 'Create a roadmap with phase breakdown and execution plans',
      done: gsd.hasRoadmap,
      icon: Map,
    },
  ];

  const currentStepIdx = steps.findIndex(s => !s.done);
  const currentStep = currentStepIdx >= 0 ? steps[currentStepIdx] : null;

  return (
    <div className="max-w-5xl">
      <div className="bg-port-card border border-port-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Compass size={24} className="text-port-accent" />
            <div>
              <h3 className="text-lg font-semibold text-white">GSD Project Setup</h3>
              <p className="text-sm text-gray-500">Follow the steps below to initialize GSD project tracking</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 bg-port-border hover:bg-port-border/80 text-white rounded-lg text-xs flex items-center gap-1"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Step indicators */}
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = idx === currentStepIdx;
            const isFuture = currentStepIdx >= 0 && idx > currentStepIdx;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  step.done
                    ? 'border-port-success/30 bg-port-success/5'
                    : isCurrent
                      ? 'border-port-accent/50 bg-port-accent/5'
                      : 'border-port-border bg-port-bg/50 opacity-50'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  step.done
                    ? 'bg-port-success/20 text-port-success'
                    : isCurrent
                      ? 'bg-port-accent/20 text-port-accent'
                      : 'bg-port-border text-gray-500'
                }`}>
                  {step.done ? <CheckCircle size={18} /> : <Icon size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${step.done ? 'text-port-success' : isCurrent ? 'text-white' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                    {step.done && <span className="text-xs text-port-success">Complete</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                </div>
                {isCurrent && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <ArrowRight size={14} className="text-port-accent" />
                    <code className="text-sm text-cyan-400 bg-port-bg px-2 py-1 rounded">{step.command}</code>
                  </div>
                )}
                {isFuture && !step.done && (
                  <code className="text-xs text-gray-600 bg-port-bg px-2 py-1 rounded flex-shrink-0">{step.command}</code>
                )}
              </div>
            );
          })}
        </div>

        {currentStep && (
          <p className="text-xs text-gray-500 mt-4">
            Run <code className="text-cyan-400">{currentStep.command}</code> in Claude Code from the app's repo to continue.
          </p>
        )}
      </div>
    </div>
  );
}

export default function GsdTab({ appId }) {
  const [project, setProject] = useState(null);
  const [gsdStatus, setGsdStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    // Fetch GSD status from documents endpoint (silent, no toast)
    const docsResp = await fetch(`/api/apps/${appId}/documents`).catch(() => null);
    const docsData = docsResp?.ok ? await docsResp.json().catch(() => null) : null;
    const gsd = docsData?.gsd || {};
    setGsdStatus(gsd);

    // Only fetch project data if we have a roadmap + state (full project)
    if (gsd.hasRoadmap && gsd.hasState) {
      const resp = await fetch(`/api/cos/gsd/projects/${appId}`).catch(() => null);
      if (resp?.ok) {
        const data = await resp.json().catch(() => null);
        setProject(data);
      }
    } else {
      setProject(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [appId]);

  if (loading) {
    return <BrailleSpinner text="Loading GSD project" />;
  }

  // Show setup guide if project isn't fully initialized
  if (!project) {
    return <GsdSetupGuide gsd={gsdStatus || {}} onRefresh={fetchData} />;
  }

  const phaseCount = project?.phases?.length || 0;
  const completedPhases = project?.phases?.filter(p => p.status === 'completed').length || 0;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">GSD Project</h3>
          <p className="text-sm text-gray-500">{completedPhases}/{phaseCount} phases completed</p>
        </div>
        <button
          onClick={fetchData}
          className="px-3 py-1.5 bg-port-border hover:bg-port-border/80 text-white rounded-lg text-xs flex items-center gap-1"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Phase Timeline */}
      {project?.phases && (
        <div className="bg-port-card border border-port-border rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Phases</h4>
          <PhaseTimeline phases={project.phases} />
        </div>
      )}

      {/* Concerns */}
      {project?.concerns && (
        <div className="bg-port-card border border-port-border rounded-lg p-4">
          <GsdConcernsPanel
            appId={appId}
            concerns={project.concerns}
            onTaskCreated={fetchData}
          />
        </div>
      )}

      {/* State Frontmatter */}
      {project?.state?.frontmatter && (
        <div className="bg-port-card border border-port-border rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">State</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(project.state.frontmatter).map(([key, value]) => (
              <div key={key} className="bg-port-bg rounded px-2 py-1">
                <span className="text-gray-500">{key}:</span>{' '}
                <span className="text-gray-300">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
