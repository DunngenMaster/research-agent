// Shared types for the research workflow tool

export interface Paper {
  id: number;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  contributions: string[];
  artifacts: {
    datasets: string[];
    metrics: string[];
    equations: number;
    pseudocode: boolean;
  };
}

export interface WorkspaceStatus {
  status: 'creating' | 'ready' | 'running' | 'failed';
  tests: Array<{
    name: string;
    status: 'pending' | 'pass' | 'fail';
  }>;
}

export interface Assignment {
  description: string;
  deliverables: string[];
  rubric: string;
}
