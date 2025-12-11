import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Notebook as NotebookType, ViewState } from './types';
import Home from './components/Home';
import Notebook from './components/Notebook';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  
  // Mock Data
  const [notebooks, setNotebooks] = useState<NotebookType[]>([
    {
      id: '1',
      title: 'Computer Science Basics',
      updatedAt: Date.now() - 10000000,
      sources: [
        { 
            id: 's1', 
            title: 'Intro to Algorithms', 
            type: 'text', 
            content: 'An algorithm is a set of instructions for solving a problem or accomplishing a task. One common example of an algorithm is a recipe, which consists of specific instructions for preparing a dish or meal. Every computerized device uses algorithms to perform its functions.', 
            timestamp: Date.now() 
        }
      ],
      messages: [],
      notes: []
    },
    {
      id: '2',
      title: 'Tech Daily News',
      updatedAt: Date.now() - 86400000,
      sources: [],
      messages: [],
      notes: []
    }
  ]);

  const handleCreateNotebook = () => {
    const newNotebook: NotebookType = {
      id: uuidv4(),
      title: 'Untitled notebook',
      updatedAt: Date.now(),
      sources: [],
      messages: [],
      notes: []
    };
    setNotebooks([newNotebook, ...notebooks]);
    setActiveNotebookId(newNotebook.id);
    setCurrentView('notebook');
  };

  const handleSelectNotebook = (notebook: NotebookType) => {
    setActiveNotebookId(notebook.id);
    setCurrentView('notebook');
  };

  const handleUpdateActiveNotebook = (updatedNotebook: NotebookType) => {
    setNotebooks(prev => prev.map(nb => nb.id === updatedNotebook.id ? updatedNotebook : nb));
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setActiveNotebookId(null);
  };

  const activeNotebook = notebooks.find(n => n.id === activeNotebookId);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {currentView === 'home' && (
        <Home 
          notebooks={notebooks} 
          onSelectNotebook={handleSelectNotebook} 
          onCreateNotebook={handleCreateNotebook}
        />
      )}

      {currentView === 'notebook' && activeNotebook && (
        <Notebook 
          notebook={activeNotebook}
          onUpdateNotebook={handleUpdateActiveNotebook}
          onBack={handleBackToHome}
        />
      )}
    </div>
  );
};

export default App;