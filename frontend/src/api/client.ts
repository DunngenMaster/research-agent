// API client stub for REST endpoints
export async function uploadPaper(data: FormData) {
  // POST /api/papers/upload
  // Replace with real API call
  return Promise.resolve({ id: 1 });
}

export async function getPaper(id: number) {
  // GET /api/papers/:id
  return Promise.resolve({
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
  });
}

export async function createWorkspace(paperId: number) {
  // POST /api/workspace/create
  return Promise.resolve({ id: 1 });
}

export async function getWorkspaceStatus(id: number) {
  // GET /api/workspace/:id/status
  return Promise.resolve({
    status: 'ready',
    tests: [
      { name: 'Environment setup', status: 'pass' },
      { name: 'Shape test', status: 'pending' },
      { name: 'Loss test', status: 'pending' },
      { name: 'Overfit test', status: 'pending' },
    ],
  });
}

export async function generateAssignment(params: any) {
  // POST /api/assignment/generate
  return Promise.resolve({
    description: 'Implement the main algorithm and analyze results.',
    deliverables: ['Code', 'Report', 'Plots'],
    rubric: 'Correctness, clarity, reproducibility',
  });
}
