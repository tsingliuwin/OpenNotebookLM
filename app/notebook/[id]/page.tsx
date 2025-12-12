'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Notebook as NotebookType } from '@/types';
import NotebookComponent from '@/components/Notebook';
import { getNotebookById, updateNotebook } from '@/lib/notebookStore';

export default function NotebookPage() {
    const params = useParams();
    const router = useRouter();
    const [notebook, setNotebook] = useState<NotebookType | null>(null);
    const [loading, setLoading] = useState(true);

    const notebookId = params.id as string;

    useEffect(() => {
        const found = getNotebookById(notebookId);
        setNotebook(found || null);
        setLoading(false);
    }, [notebookId]);

    const handleUpdateNotebook = (updated: NotebookType) => {
        updateNotebook(updated);
        setNotebook(updated);
    };

    const handleBack = () => {
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        );
    }

    if (!notebook) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
                <div className="text-gray-500">Notebook not found</div>
                <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <NotebookComponent
            notebook={notebook}
            onUpdateNotebook={handleUpdateNotebook}
            onBack={handleBack}
        />
    );
}
