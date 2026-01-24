
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UploadPaper from './pages/UploadPaper';
import PaperOverview from './pages/PaperOverview';
import Workspace from './pages/Workspace';
import Assignment from './pages/Assignment';


function App() {
  return (
    <BrowserRouter>
      <div className="main-layout">
        <header>
          Research Workflow Tool
        </header>
        <Routes>
          <Route path="/" element={<UploadPaper />} />
          <Route path="/paper/:id" element={<PaperOverview />} />
          <Route path="/workspace/:id" element={<Workspace />} />
          <Route path="/assignment/:paperId" element={<Assignment />} />
        </Routes>
        <footer>
          &copy; {new Date().getFullYear()} Research Workflow Tool
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
