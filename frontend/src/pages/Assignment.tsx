import React, { useState } from 'react';
import Card from '../components/Card';
import Loader from '../components/Loader';

const Assignment: React.FC = () => {
  const [difficulty, setDifficulty] = useState('Intro');
  const [type, setType] = useState('Coding');
  const [time, setTime] = useState('2h');
  const [tools, setTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState<any>(null);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAssignment({
        description: 'Implement the main algorithm and analyze results.',
        deliverables: ['Code', 'Report', 'Plots'],
        rubric: 'Correctness, clarity, reproducibility',
      });
    }, 1500);
  };

  const toolOptions = ['Jupyter', 'VS Code', 'PyTorch', 'TensorFlow', 'Docker'];

  return (
    <div className="container">
      <h1>Assignment Generator</h1>
      <Card>
        <div className="form-group">
          <label>Difficulty</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <option>Intro</option>
            <option>Grad</option>
            <option>Research</option>
          </select>
        </div>
        <div className="form-group">
          <label>Assignment Type</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option>Coding</option>
            <option>Theory</option>
            <option>Mixed</option>
          </select>
        </div>
        <div className="form-group">
          <label>Time Estimate</label>
          <select value={time} onChange={e => setTime(e.target.value)}>
            <option>2h</option>
            <option>6h</option>
            <option>2 weeks</option>
          </select>
        </div>
        <div className="form-group">
          <label>Allowed Tools</label>
          {toolOptions.map(tool => (
            <label key={tool} style={{ marginRight: 8 }}>
              <input
                type="checkbox"
                checked={tools.includes(tool)}
                onChange={e => {
                  if (e.target.checked) setTools([...tools, tool]);
                  else setTools(tools.filter(t => t !== tool));
                }}
              />
              {tool}
            </label>
          ))}
        </div>
        <button onClick={handleGenerate} disabled={loading}>Generate Assignment</button>
        {loading && <Loader />}
        {assignment && (
          <div className="output-preview">
            <h2>Assignment Description</h2>
            <p>{assignment.description}</p>
            <h3>Deliverables</h3>
            <ul>
              {assignment.deliverables.map((d: string, i: number) => <li key={i}>{d}</li>)}
            </ul>
            <h3>Grading Rubric</h3>
            <p>{assignment.rubric}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Assignment;
