import React, { useState } from 'react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

const tests = [
  { name: 'Environment setup' },
  { name: 'Shape test' },
  { name: 'Loss test' },
  { name: 'Overfit test' },
];

const Workspace: React.FC = () => {
  const [status, setStatus] = useState<'creating' | 'ready' | 'running' | 'failed'>('ready');
  const [testStatus, setTestStatus] = useState<("pending" | "pass" | "fail")[]>(['pending', 'pending', 'pending', 'pending']);
  const [logsOpen, setLogsOpen] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const runTest = (idx: number) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newStatus = [...testStatus];
      newStatus[idx] = 'pass';
      setTestStatus(newStatus);
    }, 1200);
  };

  const rerunTest = (idx: number) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newStatus = [...testStatus];
      newStatus[idx] = 'pass';
      setTestStatus(newStatus);
    }, 1200);
  };

  return (
    <div className="container">
      <h1>Workspace</h1>
      <Card>
        <h2>Status</h2>
        <StatusBadge status={status} />
      </Card>
      <Card>
        <h2>Test Checklist</h2>
        <table>
          <thead>
            <tr>
              <th>Test</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test, idx) => (
              <tr key={test.name}>
                <td>{test.name}</td>
                <td><StatusBadge status={testStatus[idx]} /></td>
                <td>
                  {testStatus[idx] === 'pending' && <button onClick={() => runTest(idx)} disabled={loading}>Run next test</button>}
                  {testStatus[idx] === 'fail' && <button onClick={() => rerunTest(idx)} disabled={loading}>Re-run failed test</button>}
                  <button onClick={() => setLogsOpen(logsOpen === idx ? null : idx)}>View logs</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logsOpen !== null && (
          <div className="logs">
            <strong>Logs for {tests[logsOpen].name}:</strong>
            <pre>Test log output (mock)</pre>
          </div>
        )}
        {loading && <Loader />}
      </Card>
    </div>
  );
};

export default Workspace;
