import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import { getWorkspace, runWorkspaceStep, getPaper, generateCode, explainPaperSection } from '../api/client';

const Workspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workspace, setWorkspace] = useState<any>(null);
  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [runningStep, setRunningStep] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ [key: string]: string }>({});
  const [expandedSection, setExpandedSection] = useState<string | null>('abstract');
  const [activeTab, setActiveTab] = useState<'terminal' | 'tests' | 'requirements' | 'data'>('tests');
  const [code, setCode] = useState<string>('# Your implementation code here\nimport numpy as np\nimport torch\n\n# Start coding...');
  const [chatMessages, setChatMessages] = useState<Array<{role: string, text: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [generatingCode, setGeneratingCode] = useState(false);
  const [agentProgress, setAgentProgress] = useState<string>('');
  const [generatedData, setGeneratedData] = useState<string>('');
  const [generatedTests, setGeneratedTests] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');
  const [easyExplanation, setEasyExplanation] = useState<string>('');
  const [summaryPoints, setSummaryPoints] = useState<Array<{ point: string; explanation: string }>>([]);
  const [expandedBullet, setExpandedBullet] = useState<number | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanationError, setExplanationError] = useState('');
  const [leftTab, setLeftTab] = useState<'index' | 'explanation'>('index');

  const fetchWorkspace = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getWorkspace(id);
      setWorkspace(data);
      
      if (data.paper_id) {
        const paperData = await getPaper(data.paper_id);
        setPaper(paperData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [id]);

  useEffect(() => {
    if (workspace?.paper_id && !easyExplanation && !loadingExplanation) {
      loadEasyExplanation();
    }
  }, [workspace?.paper_id]);

  const loadEasyExplanation = async () => {
    if (!workspace?.paper_id) return;
    try {
      setLoadingExplanation(true);
      setExplanationError('');
      const result = await explainPaperSection(workspace.paper_id, 'abstract');
      setEasyExplanation(result.explanation);
      setSummaryPoints(Array.isArray(result.summary_points) ? result.summary_points : []);
    } catch (err) {
      console.error('Failed to load explanation:', err);
      setExplanationError('Could not load explanation. Retry below.');
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleRunStep = async (stepName: string) => {
    if (!id) return;
    try {
      setRunningStep(stepName);
      setError('');
      const result = await runWorkspaceStep(id, stepName);
      
      if (result.last_step_stdout) {
        setLogs(prev => ({ ...prev, [stepName]: result.last_step_stdout }));
      }
      
      await fetchWorkspace();
    } catch (err: any) {
      setError(err.message || `Failed to run ${stepName}`);
    } finally {
      setRunningStep(null);
    }
  };

  const handleRunAll = async () => {
    if (!id) return;
    try {
      setRunningStep('run_all');
      setError('');
      setActiveTab('terminal');
      const result = await runWorkspaceStep(id, 'run_all');
      
      if (result.last_step_stdout) {
        setLogs(prev => ({ ...prev, 'run_all': result.last_step_stdout }));
      }
      
      await fetchWorkspace();
    } catch (err: any) {
      setError(err.message || 'Failed to run all steps');
    } finally {
      setRunningStep(null);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'I can help you understand this paper and implement the solution. What would you like to know?' 
      }]);
    }, 500);
    setChatInput('');
  };

  const handleGenerateCode = async () => {
    if (!workspace?.paper_id) return;
    try {
      setGeneratingCode(true);
      setError('');
      setAgentProgress('Agent 1: Analyzing requirements...');
      
      const result = await generateCode(workspace.paper_id);
      
      if (result.success) {
        setAgentProgress('All agents completed!');
        setRequirements(result.requirements || '');
        setCode(result.code || '');
        setGeneratedTests(result.tests || '');
        setActiveTab('terminal');
        setLogs(prev => ({
          ...prev,
          'code_generation': `=== Code Generation Complete ===\n\n${result.agents_executed?.join('\n') || ''}\n\nCheck the code editor for generated implementation.`
        }));
      } else {
        setError(result.error || 'Failed to generate code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate code');
    } finally {
      setGeneratingCode(false);
      setAgentProgress('');
    }
  };

  if (loading) return <Loader />;
  if (error && !workspace) return <div className="container"><div className="error">{error}</div></div>;
  if (!workspace) return <div className="container"><div>Workspace not found</div></div>;

  const steps = workspace.steps || [];
  const sections = paper ? [
    { key: 'abstract', label: 'Abstract', content: paper.abstract },
    { key: 'introduction', label: 'Introduction', content: Array.isArray(paper.sections) ? paper.sections.find((s: any) => s.title?.toLowerCase().includes('introduction'))?.content : null || 'Not available' },
    { key: 'methodology', label: 'Methodology', content: Array.isArray(paper.sections) ? paper.sections.find((s: any) => s.title?.toLowerCase().includes('method'))?.content : null || 'Not available' },
    { key: 'results', label: 'Results', content: Array.isArray(paper.sections) ? paper.sections.find((s: any) => s.title?.toLowerCase().includes('result'))?.content : null || 'Not available' },
  ] : [{ key: 'abstract', label: 'Abstract', content: 'Loading...' }];

  const bullets = summaryPoints.length > 0
    ? summaryPoints.map(p => `${p.point}\n${p.explanation}`)
    : (easyExplanation ? easyExplanation.split('\n\n').filter(b => b.trim()) : []);

  const workspaceError = workspace?.error;
  const statusPill = workspace?.status ? `${workspace.status}` : 'Unknown';

  return (
    <div className="workspace-shell">
      <div className="left-panel">
        <div className="left-tabs">
          <div className={`left-tab ${leftTab === 'index' ? 'active' : ''}`} onClick={() => setLeftTab('index')}>Index</div>
          <div className={`left-tab ${leftTab === 'explanation' ? 'active' : ''}`} onClick={() => setLeftTab('explanation')}>Explanation</div>
        </div>

        {leftTab === 'index' ? (
          <div className="panel left-section">
            <div className="section-header">Research Paper</div>
            <div className="section-list">
              {sections.map(section => (
                <div key={section.key}>
                  <div
                    className={`section-item ${expandedSection === section.key ? 'active' : ''}`}
                    onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                  >
                    <span>{section.label}</span>
                    <span>{expandedSection === section.key ? '▼' : '▶'}</span>
                  </div>
                  {expandedSection === section.key && (
                    <div className="section-body">
                      {section.content || 'No content available for this section.'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="panel left-section">
            <div className="section-header">Easy Explanation</div>
            <div className="section-list">
              {loadingExplanation ? (
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <Loader />
                  <p className="muted tiny">Loading explanation...</p>
                </div>
              ) : explanationError ? (
                <div className="inline-error">
                  {explanationError} <button className="action-button secondary" style={{ padding: '4px 8px', marginLeft: '6px' }} onClick={loadEasyExplanation}>Retry</button>
                </div>
              ) : bullets.length > 0 ? (
                bullets.map((bullet, index) => (
                  <div key={index}>
                    <div
                      className={`easy-bullet ${expandedBullet === index ? 'expanded' : ''}`}
                      onClick={() => setExpandedBullet(expandedBullet === index ? null : index)}
                    >
                      <span style={{ flex: 1 }}>{bullet.split('\n')[0].replace(/\*\*/g, '').substring(0, 70)}...</span>
                      <span style={{ fontSize: '10px' }}>{expandedBullet === index ? '▼' : '▶'}</span>
                    </div>
                    {expandedBullet === index && (
                      <div className="easy-body">{bullet}</div>
                    )}
                  </div>
                ))
              ) : (
                <p className="muted tiny">Bullets will appear after explanation loads.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="top-panel">
        <div className="paper-meta">
          <div className="paper-title">{paper?.title || 'Paper title pending extraction'}</div>
          <div className="paper-submeta">Workspace {workspace.workspace_id} · Status: {statusPill}</div>
          {workspaceError && <div className="inline-error" style={{ marginTop: '6px' }}>Workspace provider error: {workspaceError}</div>}
        </div>
        <div className="action-bar">
          <button className="action-button" onClick={handleGenerateCode} disabled={generatingCode}>
            {generatingCode ? 'Generating...' : 'Generate Code'}
          </button>
          <button className="action-button secondary" onClick={handleRunAll} disabled={runningStep !== null}>
            {runningStep ? 'Running tests...' : 'Run All Tests'}
          </button>
        </div>
      </div>

      <div className="main-panel">
        <div className="code-header">
          <div className="code-title">model.py</div>
          {agentProgress && <div className="pill">{agentProgress}</div>}
        </div>
        <div className="code-surface">
          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="bottom-panel">
        <div className="tab-strip">
          <div className={`tab ${activeTab === 'tests' ? 'active' : ''}`} onClick={() => setActiveTab('tests')}>Test Cases</div>
          <div className={`tab ${activeTab === 'terminal' ? 'active' : ''}`} onClick={() => setActiveTab('terminal')}>Terminal</div>
          {requirements && <div className={`tab ${activeTab === 'requirements' ? 'active' : ''}`} onClick={() => setActiveTab('requirements')}>Requirements</div>}
          {generatedTests && <div className={`tab ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}>Tests/Data</div>}
        </div>
        <div className="tab-body">
          {activeTab === 'tests' ? (
            <div>
              {steps.map((step: any) => (
                <div key={step.name} className={`test-card ${step.status.toLowerCase()}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{step.name}</strong> <StatusBadge status={step.status} style={{ marginLeft: '8px' }} />
                    </div>
                    {(step.status === 'PENDING' || step.status === 'FAILED') && (
                      <button className="action-button secondary" onClick={() => handleRunStep(step.name)} disabled={runningStep !== null} style={{ padding: '6px 10px' }}>
                        {step.status === 'FAILED' ? 'Retry' : 'Run'}
                      </button>
                    )}
                  </div>
                  {logs[step.name] && (
                    <div className="log-output" style={{ marginTop: '6px' }}>{logs[step.name]}</div>
                  )}
                </div>
              ))}
              {steps.length === 0 && <div className="muted tiny">No tests registered yet.</div>}
            </div>
          ) : activeTab === 'requirements' ? (
            <div className="log-output">{requirements || 'No requirements analysis yet. Click Generate Code to start.'}</div>
          ) : activeTab === 'data' ? (
            <div className="log-output">{generatedTests || 'No generated tests or data helpers yet.'}</div>
          ) : (
            <div className="log-output">{logs['run_all'] || logs['code_generation'] || logs[Object.keys(logs)[0]] || 'No output yet. Run a test to see results.'}</div>
          )}
        </div>
      </div>

      <div className="right-panel">
        <div className="chat-header">AI Assistant</div>
        <div className="chat-messages">
          {chatMessages.length === 0 ? (
            <div className="chat-bubble" style={{ opacity: 0.7 }}>
              Ask me anything about the paper or your implementation...
            </div>
          ) : (
            chatMessages.map((msg, idx) => (
              <div key={idx} className="chat-bubble">
                <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '12px' }}>
                  {msg.role === 'user' ? 'You' : 'AI'}
                </div>
                <div style={{ fontSize: '13px' }}>{msg.text}</div>
              </div>
            ))
          )}
        </div>
        <div className="chat-input">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            placeholder="Ask about the paper..."
            rows={3}
          />
          <button className="action-button" onClick={handleSendMessage} style={{ width: '100%' }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
