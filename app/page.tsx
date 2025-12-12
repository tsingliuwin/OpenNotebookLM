'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Notebook as NotebookType } from '@/types';
import Home from '@/components/Home';
import { getNotebooks, saveNotebooks, createNotebook } from '@/lib/notebookStore';

export default function Page() {
    const router = useRouter();
    const [notebooks, setNotebooks] = useState<NotebookType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 加载 notebooks
    useEffect(() => {
        setNotebooks(getNotebooks());
        setIsLoading(false);

        // 监听 notebooks 更新事件
        const handleUpdate = () => {
            setNotebooks(getNotebooks());
        };
        window.addEventListener('notebooksUpdated', handleUpdate);
        return () => window.removeEventListener('notebooksUpdated', handleUpdate);
    }, []);

    const handleCreateNotebook = () => {
        const newNotebook: NotebookType = {
            id: uuidv4(),
            title: 'Untitled notebook',
            updatedAt: Date.now(),
            sources: [],
            messages: [],
            notes: []
        };
        createNotebook(newNotebook);
        // 使用路由导航到新 notebook
        router.push(`/notebook/${newNotebook.id}`);
    };

    const handleSelectNotebook = (notebook: NotebookType) => {
        // 使用路由导航到 notebook 详情页
        router.push(`/notebook/${notebook.id}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            <Home
                notebooks={notebooks}
                onSelectNotebook={handleSelectNotebook}
                onCreateNotebook={handleCreateNotebook}
            />
        </div>
    );
}
