import { useState, useEffect, useCallback } from 'react';
import { HeartPulse, Eye, Dna, Scale } from 'lucide-react';
import * as api from '../../../services/api';
import BrailleSpinner from '../../BrailleSpinner';
import BloodTestCard from '../BloodTestCard';
import BodyCompChart from '../BodyCompChart';

export default function BloodTab() {
  const [bloodData, setBloodData] = useState(null);
  const [epigeneticData, setEpigeneticData] = useState(null);
  const [eyeData, setEyeData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [blood, epigenetic, eyes] = await Promise.all([
      api.getBloodTests().catch(() => ({ tests: [] })),
      api.getEpigeneticTests().catch(() => ({ tests: [] })),
      api.getEyeExams().catch(() => ({ exams: [] }))
    ]);
    setBloodData(blood);
    setEpigeneticData(epigenetic);
    setEyeData(eyes);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <BrailleSpinner text="Loading health data" />
      </div>
    );
  }

  const bloodTests = bloodData?.tests || [];
  const epigeneticTests = epigeneticData?.tests || [];
  const eyeExams = eyeData?.exams || [];
  const latestEpigenetic = epigeneticTests[epigeneticTests.length - 1];

  return (
    <div className="space-y-6">
      {/* Epigenetic Age Summary */}
      {latestEpigenetic && (
        <div className="bg-port-card border border-port-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Dna size={18} className="text-purple-400" />
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Epigenetic Age</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Chronological</p>
              <p className="text-2xl font-mono font-bold text-gray-300">{latestEpigenetic.chronologicalAge}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Biological</p>
              <p className={`text-2xl font-mono font-bold ${
                latestEpigenetic.biologicalAge < latestEpigenetic.chronologicalAge
                  ? 'text-port-success' : 'text-port-error'
              }`}>
                {latestEpigenetic.biologicalAge}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Pace of Aging</p>
              <p className={`text-2xl font-mono font-bold ${
                latestEpigenetic.paceOfAging < 1 ? 'text-port-success' : 'text-port-error'
              }`}>
                {latestEpigenetic.paceOfAging}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Test Date</p>
              <p className="text-lg font-mono text-gray-400">{latestEpigenetic.date}</p>
            </div>
          </div>

          {/* Organ Scores */}
          {latestEpigenetic.organScores && (
            <div className="mt-4 pt-4 border-t border-port-border">
              <p className="text-xs text-gray-500 uppercase mb-2">Organ Scores (biological age)</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {Object.entries(latestEpigenetic.organScores).map(([organ, age]) => (
                  <div key={organ} className="flex items-baseline justify-between gap-2 px-2 py-1 rounded bg-port-bg/50">
                    <span className="text-xs text-gray-400 capitalize">{organ}</span>
                    <span className={`text-sm font-mono font-medium ${
                      age < latestEpigenetic.chronologicalAge ? 'text-port-success' : 'text-port-error'
                    }`}>
                      {age}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History */}
          {epigeneticTests.length > 1 && (
            <div className="mt-4 pt-4 border-t border-port-border">
              <p className="text-xs text-gray-500 uppercase mb-2">History</p>
              <div className="space-y-1">
                {epigeneticTests.map((test, i) => (
                  <div key={i} className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500 font-mono w-24">{test.date}</span>
                    <span className="text-gray-400">Bio: {test.biologicalAge}</span>
                    <span className="text-gray-400">Pace: {test.paceOfAging}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Body Composition Chart */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Scale size={18} className="text-port-accent" />
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Body Composition</h3>
        </div>
        <BodyCompChart />
      </div>

      {/* Blood Tests */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <HeartPulse size={18} className="text-red-400" />
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Blood Tests ({bloodTests.length})
          </h3>
        </div>
        {bloodTests.length === 0 ? (
          <div className="bg-port-card border border-port-border rounded-xl p-6">
            <p className="text-gray-500 text-sm">No blood test data. Import your health spreadsheet or add tests manually.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...bloodTests].reverse().map((test, i) => (
              <BloodTestCard key={i} test={test} />
            ))}
          </div>
        )}
      </div>

      {/* Eye Exams */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Eye size={18} className="text-blue-400" />
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Eye Prescriptions ({eyeExams.length})
          </h3>
        </div>
        {eyeExams.length === 0 ? (
          <div className="bg-port-card border border-port-border rounded-xl p-6">
            <p className="text-gray-500 text-sm">No eye exam data. Import your health spreadsheet or add exams manually.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...eyeExams].reverse().map((exam, i) => (
              <div key={i} className="bg-port-card border border-port-border rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">{exam.date}</h4>
                <div className="grid grid-cols-2 gap-4">
                  {['right', 'left'].map(side => {
                    const eye = exam[side];
                    if (!eye) return null;
                    return (
                      <div key={side}>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                          {side === 'right' ? 'OD (Right)' : 'OS (Left)'}
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          {eye.sphere != null && (
                            <div>
                              <span className="text-xs text-gray-600">SPH</span>
                              <p className="font-mono text-gray-300">{eye.sphere > 0 ? '+' : ''}{eye.sphere}</p>
                            </div>
                          )}
                          {eye.cylinder != null && (
                            <div>
                              <span className="text-xs text-gray-600">CYL</span>
                              <p className="font-mono text-gray-300">{eye.cylinder > 0 ? '+' : ''}{eye.cylinder}</p>
                            </div>
                          )}
                          {eye.axis != null && (
                            <div>
                              <span className="text-xs text-gray-600">AXIS</span>
                              <p className="font-mono text-gray-300">{eye.axis}°</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {exam.add != null && (
                  <div className="mt-2 pt-2 border-t border-port-border">
                    <span className="text-xs text-gray-600">ADD</span>
                    <span className="font-mono text-gray-300 ml-2">+{exam.add}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
