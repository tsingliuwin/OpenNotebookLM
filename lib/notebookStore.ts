import { Notebook } from '@/types';

const DEFAULT_NOTEBOOKS: Notebook[] = [
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
];

const STORAGE_KEY = 'notebooks';

export const getNotebooks = (): Notebook[] => {
    if (typeof window === 'undefined') return DEFAULT_NOTEBOOKS;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return DEFAULT_NOTEBOOKS;
        }
    }
    return DEFAULT_NOTEBOOKS;
};

export const saveNotebooks = (notebooks: Notebook[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notebooks));
    // 触发自定义事件通知其他组件
    window.dispatchEvent(new CustomEvent('notebooksUpdated'));
};

export const getNotebookById = (id: string): Notebook | undefined => {
    const notebooks = getNotebooks();
    return notebooks.find(n => n.id === id);
};

export const updateNotebook = (updated: Notebook) => {
    const notebooks = getNotebooks();
    const updatedNotebooks = notebooks.map(nb =>
        nb.id === updated.id ? updated : nb
    );
    saveNotebooks(updatedNotebooks);
};

export const createNotebook = (notebook: Notebook) => {
    const notebooks = getNotebooks();
    saveNotebooks([notebook, ...notebooks]);
};
