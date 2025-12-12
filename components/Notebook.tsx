'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Plus, MessageSquare, FileText, Headphones, HelpCircle,
    BookOpen, MoreVertical, Send, CheckCircle2, Bot, User, Sparkles, Pencil, Trash2, AlertTriangle,
    Clipboard
} from 'lucide-react';
import { Notebook as NotebookType, Source, ChatMessage, NoteType, Note } from '@/types';
import SourceModal from './SourceModal';
import * as GeminiService from '@/services/geminiService';
import ReactMarkdown from 'react-markdown';

interface NotebookProps {
    notebook: NotebookType;
    onUpdateNotebook: (updated: NotebookType) => void;
    onBack: () => void;
}

const Notebook: React.FC<NotebookProps> = ({ notebook, onUpdateNotebook, onBack }) => {
    const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<Source | null>(null);
    const [sourceToDelete, setSourceToDelete] = useState<Source | null>(null);
    const [inputMessage, setInputMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeNote, setActiveNote] = useState<Note | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [notebook.messages]);

    const handleAddSource = (source: Source) => {
        onUpdateNotebook({
            ...notebook,
            sources: [source, ...notebook.sources],
            updatedAt: Date.now()
        });
    };

    const handleUpdateSource = (updatedSource: Source) => {
        const updatedSources = notebook.sources.map(s =>
            s.id === updatedSource.id ? updatedSource : s
        );
        onUpdateNotebook({
            ...notebook,
            sources: updatedSources,
            updatedAt: Date.now()
        });
        setEditingSource(null);
    };

    const executeDeleteSource = () => {
        if (!sourceToDelete) return;

        const updatedSources = notebook.sources.filter(s => s.id !== sourceToDelete.id);
        onUpdateNotebook({
            ...notebook,
            sources: updatedSources,
            updatedAt: Date.now()
        });
        setSourceToDelete(null);
    };

    const openAddSourceModal = () => {
        setEditingSource(null);
        setIsSourceModalOpen(true);
    };

    const openEditSourceModal = (source: Source, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSource(source);
        setIsSourceModalOpen(true);
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isProcessing) return;

        if (notebook.sources.length === 0) {
            alert("Please add a source first!");
            return;
        }

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: inputMessage,
            timestamp: Date.now()
        };

        // Optimistic update
        const tempHistory = [...notebook.messages, userMsg];
        onUpdateNotebook({
            ...notebook,
            messages: tempHistory
        });

        setInputMessage('');
        setIsProcessing(true);

        // Placeholder for AI response
        const aiMsgId = (Date.now() + 1).toString();
        const aiPlaceholder: ChatMessage = {
            id: aiMsgId,
            role: 'model',
            text: '',
            timestamp: Date.now(),
            isThinking: true
        };

        // Add thinking placeholder
        onUpdateNotebook({
            ...notebook,
            messages: [...tempHistory, aiPlaceholder]
        });

        let currentResponse = "";

        await GeminiService.streamChatResponse(
            notebook.sources,
            tempHistory,
            userMsg.text,
            (chunk) => {
                currentResponse += chunk;
                // Update the last message (AI response) progressively
                onUpdateNotebook({
                    ...notebook,
                    messages: [
                        ...tempHistory,
                        { ...aiPlaceholder, text: currentResponse, isThinking: false }
                    ]
                });
            }
        );

        setIsProcessing(false);
    };

    const handleGenerateNote = async (type: NoteType) => {
        if (notebook.sources.length === 0) return;

        const id = Date.now().toString();
        // Optimistic creation
        const newNote: Note = {
            id,
            title: type,
            type,
            content: "Generating..."
        };

        const updatedNotes = [newNote, ...notebook.notes];
        onUpdateNotebook({ ...notebook, notes: updatedNotes });
        setActiveNote(newNote); // Focus the new note

        const content = await GeminiService.generateStudioContent(notebook.sources, type);

        // Update with real content
        const finalizedNotes = updatedNotes.map(n => n.id === id ? { ...n, content } : n);

        const updatedNotebook = { ...notebook, notes: finalizedNotes };
        onUpdateNotebook(updatedNotebook);
        // Refresh active note view
        setActiveNote(finalizedNotes.find(n => n.id === id) || null);
    };

    return (
        <div className="h-screen flex flex-col bg-[#F9FAFB]">
            {/* Top Bar */}
            <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
                        <div className="w-5 h-5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-md" />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Notebook</span>
                        <span className="font-medium text-gray-800 leading-tight">{notebook.title}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Share</button>
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">I</div>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Column: Sources */}
                <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
                    <div className="p-4 flex items-center justify-between border-b border-gray-100">
                        <h3 className="font-medium text-gray-700">Sources</h3>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{notebook.sources.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        <button
                            onClick={openAddSourceModal}
                            className="w-full py-3 px-4 border border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-all group"
                        >
                            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Add Source</span>
                        </button>

                        {notebook.sources.map(source => (
                            <div key={source.id} className="p-3 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow cursor-pointer group relative overflow-hidden">
                                {/* Selection indicator stripe */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-start justify-between mb-1 pr-6">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        {source.type === 'web' && <LinkIcon className="w-3 h-3 text-gray-400" />}
                                        {source.type === 'copied' && <Clipboard className="w-3 h-3 text-gray-400" />}
                                        {(source.type === 'pdf' || source.type === 'text') && <FileText className="w-3 h-3 text-gray-400" />}
                                        <span className="font-medium text-sm text-gray-700 truncate">{source.title}</span>
                                    </div>
                                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                                </div>
                                <p className="text-xs text-gray-400 truncate pl-5">
                                    {source.content.substring(0, 40)}...
                                </p>

                                {/* Edit and Delete Buttons */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                                    <button
                                        onClick={(e) => openEditSourceModal(source, e)}
                                        className="p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                        title="Edit Source"
                                    >
                                        <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSourceToDelete(source);
                                        }}
                                        className="p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                        title="Delete Source"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Center Column: Chat / Main */}
                <main className="flex-1 flex flex-col relative bg-white">
                    {/* Empty State */}
                    {notebook.messages.length === 0 && notebook.sources.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-500 animate-pulse">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Add sources to get started</h2>
                            <p className="text-gray-500 max-w-md mb-8">
                                Upload documents, paste text, or add links. NotebookLM will instantly become an expert in the material you provide.
                            </p>
                            <button
                                onClick={openAddSourceModal}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium shadow-lg shadow-blue-200 transition-all hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Add Source
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Chat Stream */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
                                {notebook.messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <Sparkles className="w-12 h-12 mb-4 text-gray-200" />
                                        <p>Ask questions about your {notebook.sources.length} source(s).</p>
                                    </div>
                                )}
                                {notebook.messages.map((msg) => (
                                    <div key={msg.id} className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                        {msg.role === 'model' && (
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-400 rounded-full flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                                                <Bot className="w-5 h-5" />
                                            </div>
                                        )}
                                        <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                            <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                                                    ? 'bg-gray-100 text-gray-900 rounded-br-none'
                                                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                                }`}>
                                                {msg.isThinking ? (
                                                    <div className="flex gap-1 h-6 items-center">
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                    </div>
                                                ) : (
                                                    <ReactMarkdown
                                                        components={{
                                                            strong: ({ node, ...props }) => <span className="font-semibold text-blue-700" {...props} />,
                                                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
                                                        }}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 max-w-3xl mx-auto w-full">
                                <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-full px-2 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder={notebook.sources.length > 0 ? "Ask a question..." : "Add a source to start asking questions"}
                                        disabled={notebook.sources.length === 0}
                                        className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-gray-700 disabled:opacity-50"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputMessage.trim() || notebook.sources.length === 0 || isProcessing}
                                        className={`p-2 rounded-full transition-all ${inputMessage.trim()
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </main>

                {/* Right Column: Studio / Notes */}
                <aside className="w-80 bg-[#F8F9FA] border-l border-gray-200 flex flex-col shrink-0">
                    {/* Studio Header */}
                    <div className="p-4 border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0">
                        <h3 className="font-medium text-gray-800 mb-4">Notebook Guide</h3>

                        {/* Quick Actions Grid */}
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                onClick={() => handleGenerateNote(NoteType.PODCAST)}
                                disabled={notebook.sources.length === 0}
                                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left disabled:opacity-50"
                            >
                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                    <Headphones className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-800">Audio Overview</div>
                                    <div className="text-[10px] text-gray-500">Deep dive conversation</div>
                                </div>
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleGenerateNote(NoteType.FAQ)}
                                    disabled={notebook.sources.length === 0}
                                    className="flex-1 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all disabled:opacity-50"
                                >
                                    <HelpCircle className="w-5 h-5 text-orange-500 mb-1" />
                                    <span className="text-xs font-medium text-gray-700">FAQ</span>
                                </button>
                                <button
                                    onClick={() => handleGenerateNote(NoteType.STUDY_GUIDE)}
                                    disabled={notebook.sources.length === 0}
                                    className="flex-1 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all disabled:opacity-50"
                                >
                                    <BookOpen className="w-5 h-5 text-blue-500 mb-1" />
                                    <span className="text-xs font-medium text-gray-700">Guide</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Saved Notes List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Saved Notes</h4>
                        {notebook.notes.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                No notes generated yet.
                            </div>
                        )}
                        {notebook.notes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => setActiveNote(note)}
                                className={`p-4 bg-white rounded-xl border cursor-pointer transition-all ${activeNote?.id === note.id ? 'border-blue-500 shadow-md ring-1 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-600 uppercase">{note.type}</span>
                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="text-sm text-gray-600 line-clamp-3">
                                    {note.content.substring(0, 100)}...
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Note Detail Overlay (Simple implementation) */}
                    {activeNote && (
                        <div className="absolute inset-0 z-20 bg-white flex flex-col animate-slide-in-right">
                            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                <span className="font-semibold text-gray-700">{activeNote.type}</span>
                                <button onClick={() => setActiveNote(null)} className="text-gray-500 hover:text-gray-800">Close</button>
                            </div>
                            <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap font-serif leading-relaxed text-gray-800">
                                <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </aside>

            </div>

            <SourceModal
                isOpen={isSourceModalOpen}
                onClose={() => setIsSourceModalOpen(false)}
                onAddSource={handleAddSource}
                editingSource={editingSource}
                onUpdateSource={handleUpdateSource}
            />

            {/* Delete Confirmation Modal */}
            {sourceToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4 text-red-600">
                            <div className="p-2 bg-red-50 rounded-full">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Delete Source?</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            Are you sure you want to delete <span className="font-semibold text-gray-800">"{sourceToDelete.title}"</span>? This will remove it from your notebook context. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setSourceToDelete(null)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDeleteSource}
                                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                            >
                                Delete Source
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple Icon component for reuse if needed, but handled locally
const LinkIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
);

export default Notebook;