import React from 'react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

const PaperOverview: React.FC = () => {
  // Mock data
  const paper = {
    title: 'Sample Paper Title',
    authors: ['Alice Smith', 'Bob Jones'],
    venue: 'ICML',
    year: 2025,
    contributions: [
      'Introduces a novel optimization algorithm',
      'Benchmarks on multiple datasets',
      'Open-source implementation provided',
    ],
    artifacts: {
      datasets: ['MNIST', 'CIFAR-10'],
      metrics: ['Accuracy', 'Loss'],
      equations: 5,
      pseudocode: true,
    },
  };

  return (
    <div className="container">
      <h1>Paper Overview</h1>
      <Card>
        <h2>Metadata</h2>
        <table>
          <tbody>
            <tr><td>Title</td><td>{paper.title}</td></tr>
            <tr><td>Authors</td><td>{paper.authors.join(', ')}</td></tr>
            <tr><td>Venue</td><td>{paper.venue}</td></tr>
            <tr><td>Year</td><td>{paper.year}</td></tr>
          </tbody>
        </table>
      </Card>
      <Card>
        <h2>Claimed Contributions</h2>
        <ul>
          {paper.contributions.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </Card>
      <Card>
        <h2>Detected Artifacts</h2>
        <table>
          <tbody>
            <tr><td>Datasets</td><td>{paper.artifacts.datasets.join(', ')}</td></tr>
            <tr><td>Metrics</td><td>{paper.artifacts.metrics.join(', ')}</td></tr>
            <tr><td>Equations Count</td><td>{paper.artifacts.equations}</td></tr>
            <tr><td>Pseudocode Found</td><td>{paper.artifacts.pseudocode ? 'Yes' : 'No'}</td></tr>
          </tbody>
        </table>
      </Card>
      <div className="actions">
        <button>Explain in Easy Language</button>
        <button>Build Implementation Plan</button>
        <button>Create Workspace</button>
      </div>
    </div>
  );
};

export default PaperOverview;
