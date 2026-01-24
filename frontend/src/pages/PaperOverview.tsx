import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import { getPaper, createWorkspace, explainPaperSection } from '../api/client';

const PaperOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'abstract' | 'artifacts'>('overview');
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [summaryPoints, setSummaryPoints] = useState<Array<{ point: string; explanation: string }>>([]);

  useEffect(() => {
    const fetchPaper = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getPaper(id);
        setPaper(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load paper');
      } finally {
        setLoading(false);
      }
    };
    fetchPaper();
  }, [id]);

  const handleCreateWorkspace = async () => {
    if (!id) return;
    try {
      setCreating(true);
      const workspace = await createWorkspace(id);
      navigate(`/workspace/${workspace.workspace_id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  const handleExplain = async () => {
    if (!id) return;
    try {
      setExplaining(true);
      setError('');
      setActiveTab('abstract'); // Switch to abstract tab first
      const result = await explainPaperSection(id, 'abstract');
      console.log('Explanation result:', result); // Debug log
      setExplanation(result.explanation);
      setSummaryPoints(Array.isArray(result.summary_points) ? result.summary_points : []);
    } catch (err: any) {
      console.error('Explanation error:', err); // Debug log
      setError(err.message || 'Failed to generate explanation');
    } finally {
      setExplaining(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="container"><div className="error">{error}</div></div>;
  if (!paper) return <div className="container"><div>Paper not found</div></div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '40px 0' }}>
        <div className="container" style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '12px', fontWeight: '700' }}>
            {paper.title || 'Research Paper'}
          </h1>
          <div style={{ fontSize: '16px', opacity: 0.95, marginBottom: '8px' }}>
            {paper.authors?.join(', ') || 'Unknown Authors'}
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px', opacity: 0.9 }}>
            <span>Year: {paper.year || 'Unknown Year'}</span>
            <span>Venue: {paper.venue || 'Unknown Venue'}</span>
            <span><StatusBadge status={paper.status} /></span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e1e4e8', padding: '16px 0' }}>
        <div className="container" style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleExplain}
              disabled={explaining}
              style={{ padding: '10px 20px', background: explaining ? '#cbd5e0' : '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: explaining ? 'not-allowed' : 'pointer', fontWeight: '500' }}
            >
              {explaining ? 'Generating...' : 'Explain in Easy Language'}
            </button>
            <button style={{ padding: '10px 20px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              Build Implementation Plan
            </button>
            <button 
              onClick={handleCreateWorkspace} 
              disabled={creating}
              style={{ padding: '10px 20px', background: creating ? '#cbd5e0' : '#f6ad55', color: 'white', border: 'none', borderRadius: '6px', cursor: creating ? 'not-allowed' : 'pointer', fontWeight: '500' }}
            >
              {creating ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #e1e4e8', marginBottom: '24px' }}>
          <div 
            onClick={() => setActiveTab('overview')}
            style={{ 
              padding: '12px 24px', 
              cursor: 'pointer', 
              borderBottom: activeTab === 'overview' ? '3px solid #667eea' : 'none',
              fontWeight: activeTab === 'overview' ? '600' : '400',
              color: activeTab === 'overview' ? '#667eea' : '#586069'
            }}
          >
            Overview
          </div>
          <div 
            onClick={() => setActiveTab('abstract')}
            style={{ 
              padding: '12px 24px', 
              cursor: 'pointer', 
              borderBottom: activeTab === 'abstract' ? '3px solid #667eea' : 'none',
              fontWeight: activeTab === 'abstract' ? '600' : '400',
              color: activeTab === 'abstract' ? '#667eea' : '#586069'
            }}
          >
            Abstract
          </div>
          <div 
            onClick={() => setActiveTab('artifacts')}
            style={{ 
              padding: '12px 24px', 
              cursor: 'pointer', 
              borderBottom: activeTab === 'artifacts' ? '3px solid #667eea' : 'none',
              fontWeight: activeTab === 'artifacts' ? '600' : '400',
              color: activeTab === 'artifacts' ? '#667eea' : '#586069'
            }}
          >
            Artifacts
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Main Content */}
            <div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#1a202c' }}>Abstract</h2>
                <p style={{ lineHeight: '1.8', color: '#4a5568' }}>
                  {paper.abstract || 'No abstract available'}
                </p>
              </div>

              <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#1a202c' }}>Key Highlights</h2>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {paper.metrics && paper.metrics.length > 0 && (
                    <div style={{ padding: '12px', background: '#f0fff4', borderRadius: '6px', borderLeft: '4px solid #48bb78' }}>
                      <strong style={{ color: '#2d3748' }}>Metrics Used:</strong>
                      <span style={{ marginLeft: '8px', color: '#4a5568' }}>{paper.metrics.join(', ')}</span>
                    </div>
                  )}
                  {paper.datasets && paper.datasets.length > 0 && (
                    <div style={{ padding: '12px', background: '#ebf8ff', borderRadius: '6px', borderLeft: '4px solid #4299e1' }}>
                      <strong style={{ color: '#2d3748' }}>Datasets:</strong>
                      <span style={{ marginLeft: '8px', color: '#4a5568' }}>{paper.datasets.join(', ')}</span>
                    </div>
                  )}
                  {paper.equations_count > 0 && (
                    <div style={{ padding: '12px', background: '#fef5e7', borderRadius: '6px', borderLeft: '4px solid #f6ad55' }}>
                      <strong style={{ color: '#2d3748' }}>Mathematical Content:</strong>
                      <span style={{ marginLeft: '8px', color: '#4a5568' }}>{paper.equations_count} equations detected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#1a202c', fontWeight: '600' }}>Paper Stats</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#718096' }}>Pages</span>
                    <strong style={{ color: '#2d3748' }}>{paper.page_count || 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#718096' }}>Equations</span>
                    <strong style={{ color: '#2d3748' }}>{paper.equations_count || 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#718096' }}>Has Code</span>
                    <strong style={{ color: '#2d3748' }}>{paper.pseudocode_found ? '✓ Yes' : '✗ No'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ color: '#718096' }}>Status</span>
                    <StatusBadge status={paper.status} />
                  </div>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', padding: '24px', color: 'white' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600' }}>Ready to Start?</h3>
                <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '16px' }}>
                  Create a workspace to begin implementing this paper with AI-assisted guidance.
                </p>
                <button 
                  onClick={handleCreateWorkspace}
                  disabled={creating}
                  style={{ width: '100%', padding: '12px', background: 'white', color: '#667eea', border: 'none', borderRadius: '6px', cursor: creating ? 'not-allowed' : 'pointer', fontWeight: '600' }}
                >
                  {creating ? 'Creating...' : 'Start Implementation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'abstract' && (
          <div style={{ background: 'white', borderRadius: '8px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '900px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#1a202c' }}>Abstract</h2>
            <p style={{ lineHeight: '1.9', fontSize: '16px', color: '#4a5568' }}>
              {paper.abstract || 'No abstract available'}
            </p>
            {summaryPoints.length > 0 && (
              <div style={{ marginTop: '24px', padding: '20px', background: '#f0f9ff', borderLeft: '4px solid #667eea', borderRadius: '4px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#1a202c' }}>Easy Explanation (JSON bullets)</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {summaryPoints.map((item, idx) => (
                    <div key={idx} style={{ background: 'white', borderRadius: '6px', padding: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <div style={{ fontWeight: 600, color: '#1a202c', marginBottom: '6px' }}>{item.point || `Point ${idx + 1}`}</div>
                      <div style={{ color: '#4a5568', lineHeight: 1.6 }}>{item.explanation || ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {explanation && summaryPoints.length === 0 && (
              <div style={{ marginTop: '24px', padding: '20px', background: '#f0f9ff', borderLeft: '4px solid #667eea', borderRadius: '4px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#1a202c' }}>Easy Explanation</h3>
                <div style={{ lineHeight: '1.8', fontSize: '15px', color: '#4a5568', whiteSpace: 'pre-wrap' }}>
                  {explanation}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'artifacts' && (
          <div style={{ background: 'white', borderRadius: '8px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#1a202c' }}>Detected Artifacts</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#f7fafc', borderRadius: '6px' }}>
                <strong style={{ color: '#2d3748' }}>Metrics:</strong>
                <p style={{ marginTop: '8px', color: '#4a5568' }}>
                  {paper.metrics && paper.metrics.length > 0 ? paper.metrics.join(', ') : 'None detected'}
                </p>
              </div>
              <div style={{ padding: '16px', background: '#f7fafc', borderRadius: '6px' }}>
                <strong style={{ color: '#2d3748' }}>Datasets:</strong>
                <p style={{ marginTop: '8px', color: '#4a5568' }}>
                  {paper.datasets && paper.datasets.length > 0 ? paper.datasets.join(', ') : 'None detected'}
                </p>
              </div>
              <div style={{ padding: '16px', background: '#f7fafc', borderRadius: '6px' }}>
                <strong style={{ color: '#2d3748' }}>Equations:</strong>
                <p style={{ marginTop: '8px', color: '#4a5568' }}>
                  {paper.equations_count || 0} mathematical equations found
                </p>
              </div>
              <div style={{ padding: '16px', background: '#f7fafc', borderRadius: '6px' }}>
                <strong style={{ color: '#2d3748' }}>Pseudocode:</strong>
                <p style={{ marginTop: '8px', color: '#4a5568' }}>
                  {paper.pseudocode_found ? 'Algorithm pseudocode detected in the paper' : 'No pseudocode found'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperOverview;
