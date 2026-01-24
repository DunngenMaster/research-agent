import React, { useState } from 'react';
import Card from '../components/Card';
import Loader from '../components/Loader';

const UploadPaper: React.FC = () => {
  const [pdf, setPdf] = useState<File | null>(null);
  const [arxivLink, setArxivLink] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      // On success, redirect to Paper Overview (simulate)
      window.location.href = '/paper/1';
    }, 1500);
  };

  return (
    <div className="container">
      <h1>Upload Research Paper</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>PDF Upload</label>
            <input type="file" accept="application/pdf" onChange={e => setPdf(e.target.files?.[0] || null)} />
          </div>
          <div className="form-group">
            <label>arXiv Link</label>
            <input type="url" value={arxivLink} onChange={e => setArxivLink(e.target.value)} placeholder="https://arxiv.org/abs/xxxx.xxxxx" />
          </div>
          <div className="form-group">
            <label>GitHub Repo (optional)</label>
            <input type="url" value={githubLink} onChange={e => setGithubLink(e.target.value)} placeholder="https://github.com/user/repo" />
          </div>
          <button type="submit" disabled={loading}>
            Analyze Paper
          </button>
        </form>
        {loading && <Loader />}
        {error && <div className="error">{error}</div>}
      </Card>
    </div>
  );
};

export default UploadPaper;
