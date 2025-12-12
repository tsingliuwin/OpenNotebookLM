'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Clipboard, Link as LinkIcon, UploadCloud, Globe, Loader2, FileText, AlertCircle } from 'lucide-react';
import { Source } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface SourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddSource: (source: Source) => void;
    editingSource?: Source | null;
    onUpdateSource?: (source: Source) => void;
}

const SourceModal: React.FC<SourceModalProps> = ({
    isOpen,
    onClose,
    onAddSource,
    editingSource,
    onUpdateSource
}) => {
    const [activeTab, setActiveTab] = useState<'copied' | 'website' | 'upload'>('copied');
    const [inputText, setInputText] = useState('');
    const [inputTitle, setInputTitle] = useState('');

    const [inputUrl, setInputUrl] = useState('');
    const [isScraping, setIsScraping] = useState(false);
    const [isReadingFile, setIsReadingFile] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state when opening modal
    useEffect(() => {
        if (isOpen) {
            if (editingSource) {
                setInputTitle(editingSource.title);
                setInputText(editingSource.content);
                setActiveTab('copied');
            } else {
                setInputText('');
                setInputTitle('');
                setInputUrl('');
                setFileError(null);
                setActiveTab('copied');
            }
        }
    }, [isOpen, editingSource]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!inputText.trim()) return;

        if (editingSource && onUpdateSource) {
            // Update existing
            const updatedSource: Source = {
                ...editingSource,
                title: inputTitle || editingSource.title,
                content: inputText,
            };
            onUpdateSource(updatedSource);
        } else {
            // Create new
            const newSource: Source = {
                id: uuidv4(),
                title: inputTitle || `Source ${new Date().toLocaleTimeString()}`,
                type: 'copied',
                content: inputText,
                timestamp: Date.now(),
            };
            onAddSource(newSource);
        }
        resetAndClose();
    };

    const handleUrlAdd = async () => {
        if (!inputUrl.trim()) return;

        setIsScraping(true);

        // Simulate scraping delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Create a simulated source content based on the URL
        let hostname = inputUrl;
        try {
            hostname = new URL(inputUrl).hostname;
        } catch (e) {
            // Fallback if URL is invalid
        }

        const simulatedContent = `[Source content from ${inputUrl}]\n\nThis is a simulated extraction of content from the provided website. In a production environment, this application would perform a server-side fetch of the HTML content from ${inputUrl}, parse the main article body, and remove navigation elements, ads, and footers.\n\nSince this is a client-side demo, we are providing this placeholder text to demonstrate how the source would appear in the Notebook interface. You can now use this source to ask questions, generate summaries, or create audio overviews just like you would with real content.`;

        const newSource: Source = {
            id: uuidv4(),
            title: hostname,
            type: 'web',
            content: simulatedContent,
            timestamp: Date.now()
        };

        onAddSource(newSource);
        setIsScraping(false);
        resetAndClose();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = async (file: File) => {
        setIsReadingFile(true);
        setFileError(null);

        try {
            let content = '';
            const type = file.type === 'application/pdf' ? 'pdf' : 'text';

            if (file.type === 'application/pdf') {
                try {
                    // Dynamic import for client-side only
                    const pdfjsLib = await import('pdfjs-dist');
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

                    const arrayBuffer = await file.arrayBuffer();
                    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                    const pdf = await loadingTask.promise;

                    let fullText = "";
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        // @ts-ignore
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        fullText += `[Page ${i}]\n${pageText}\n\n`;
                    }
                    content = fullText;
                } catch (pdfError) {
                    console.error("PDF Error", pdfError);
                    throw new Error("Could not parse PDF file. Please try another file.");
                }
            } else if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
                content = await file.text();
            } else {
                throw new Error("Unsupported file type. Please upload a PDF, TXT, or MD file.");
            }

            if (!content.trim()) {
                throw new Error("The file appears to be empty or text could not be extracted.");
            }

            const newSource: Source = {
                id: uuidv4(),
                title: file.name,
                type: type,
                content: content,
                timestamp: Date.now()
            };

            onAddSource(newSource);
            resetAndClose();

        } catch (err: any) {
            setFileError(err.message || "Error reading file");
        } finally {
            setIsReadingFile(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const resetAndClose = () => {
        setInputText('');
        setInputTitle('');
        setInputUrl('');
        setIsScraping(false);
        setIsReadingFile(false);
        setFileError(null);
        setActiveTab('copied');
        onClose();
    };

    const isEditing = !!editingSource;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-medium text-gray-800">
                        {isEditing ? 'Edit Source' : 'Add Source'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs - Only show when NOT editing */}
                    {!isEditing && (
                        <div className="w-64 bg-gray-50 border-r border-gray-100 p-4 space-y-2 shrink-0">
                            <button
                                onClick={() => setActiveTab('copied')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'copied' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <Clipboard className="w-5 h-5" />
                                <span>Paste Text</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('website')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'website' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <LinkIcon className="w-5 h-5" />
                                <span>Website</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'upload' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <UploadCloud className="w-5 h-5" />
                                <span>Upload File</span>
                            </button>
                        </div>
                    )}

                    {/* Main Input Area */}
                    <div className="flex-1 p-8 flex flex-col bg-white overflow-y-auto">
                        {activeTab === 'copied' && (
                            <div className="flex flex-col h-full gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Source Title</label>
                                    <input
                                        type="text"
                                        value={inputTitle}
                                        onChange={(e) => setInputTitle(e.target.value)}
                                        placeholder="e.g. Meeting Notes, Biology Chapter 1"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                    <textarea
                                        className="flex-1 w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-gray-50 font-mono text-sm"
                                        placeholder="Paste your text content here..."
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleSave}
                                        disabled={!inputText.trim()}
                                        className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200"
                                    >
                                        {isEditing ? 'Save Changes' : 'Insert Source'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'website' && !isEditing && (
                            <div className="flex flex-col h-full justify-center max-w-lg mx-auto w-full gap-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-500">
                                        <Globe className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-900">Add Website</h3>
                                    <p className="text-gray-500 mt-2">Enter a URL to import text content from a web page.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                                    <input
                                        type="url"
                                        value={inputUrl}
                                        onChange={(e) => setInputUrl(e.target.value)}
                                        placeholder="https://example.com/article"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        autoFocus
                                    />
                                </div>

                                <button
                                    onClick={handleUrlAdd}
                                    disabled={!inputUrl.trim() || isScraping}
                                    className="w-full px-6 py-3.5 bg-gray-900 hover:bg-black text-white rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
                                >
                                    {isScraping ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Reading Website...</span>
                                        </>
                                    ) : (
                                        <span>Insert Source</span>
                                    )}
                                </button>

                                <div className="text-center text-xs text-gray-400">
                                    Note: This demo uses simulated content for external URLs.
                                </div>
                            </div>
                        )}

                        {activeTab === 'upload' && !isEditing && (
                            <div className="flex flex-col h-full justify-center max-w-lg mx-auto w-full gap-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-900">Upload Source</h3>
                                    <p className="text-gray-500 mt-2">Upload a PDF or text file to extract content.</p>
                                </div>

                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-colors ${isReadingFile ? 'border-gray-300 bg-gray-50 opacity-50' : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/30'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept=".pdf,.txt,.md"
                                        className="hidden"
                                    />

                                    {isReadingFile ? (
                                        <div className="py-8">
                                            <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
                                            <p className="text-gray-600 font-medium">Reading file...</p>
                                            <p className="text-xs text-gray-400 mt-1">This may take a moment for large PDFs</p>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-full shadow-sm hover:bg-gray-50 transition-all mb-4"
                                            >
                                                Select File
                                            </button>
                                            <p className="text-sm text-gray-500">or drag and drop PDF here</p>
                                            <p className="text-xs text-gray-400 mt-4">Supported: PDF, TXT, MD</p>
                                        </>
                                    )}
                                </div>

                                {fileError && (
                                    <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{fileError}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SourceModal;