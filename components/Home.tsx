import React from 'react';
import { Notebook as NotebookType } from '../types';
import { Plus, MoreVertical, Book } from 'lucide-react';

interface HomeProps {
  notebooks: NotebookType[];
  onSelectNotebook: (notebook: NotebookType) => void;
  onCreateNotebook: () => void;
}

const Home: React.FC<HomeProps> = ({ notebooks, onSelectNotebook, onCreateNotebook }) => {
  
  // Hardcoded featured items to match the screenshot aesthetic
  const featured = [
    { id: 'f1', title: 'Can eyes reflect overall health?', sourceCount: 14, author: 'Google Research', image: 'https://picsum.photos/400/200?random=1' },
    { id: 'f2', title: 'How do scientists read genomes?', sourceCount: 36, author: 'Google Research', image: 'https://picsum.photos/400/200?random=2' },
    { id: 'f3', title: 'Global Trends 2025', sourceCount: 70, author: 'The Economist', image: 'https://picsum.photos/400/200?random=3' },
    { id: 'f4', title: 'Complete Works of Shakespeare', sourceCount: 45, author: 'Arts & Culture', image: 'https://picsum.photos/400/200?random=4' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                O
            </div>
            <span className="text-xl font-medium tracking-tight text-gray-800">OpenNotebookLM</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">I</div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Featured Section */}
        <section className="mb-12">
            <h2 className="text-lg font-normal text-gray-500 mb-6">Featured Notebooks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featured.map(item => (
                    <div key={item.id} className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all">
                        <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-4 h-4 bg-white/20 rounded-full backdrop-blur-sm" />
                                <span className="text-[10px] uppercase font-bold tracking-wider text-white/80">{item.author}</span>
                            </div>
                            <h3 className="text-white font-medium leading-snug mb-1">{item.title}</h3>
                            <span className="text-xs text-white/60">{item.sourceCount} sources</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Recent Section */}
        <section>
            <h2 className="text-lg font-normal text-gray-500 mb-6">Recent Notebooks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Create New Card */}
                <button 
                    onClick={onCreateNotebook}
                    className="h-48 border border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-4 bg-white hover:bg-gray-50 hover:border-blue-200 transition-all group"
                >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-gray-700">New Notebook</span>
                </button>

                {/* Existing Notebooks */}
                {notebooks.map(nb => (
                    <div 
                        key={nb.id} 
                        onClick={() => onSelectNotebook(nb)}
                        className="h-48 p-5 bg-[#F0F4F8] rounded-2xl cursor-pointer hover:shadow-md transition-all relative flex flex-col justify-between group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                                <Book className="w-5 h-5 text-blue-500" />
                            </div>
                            <button className="p-1 hover:bg-black/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                        
                        <div>
                            <h3 className="font-medium text-gray-800 text-lg mb-1 truncate">{nb.title}</h3>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                <span>{new Date(nb.updatedAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{nb.sources.length} sources</span>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </section>

      </div>
    </div>
  );
};

export default Home;