'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ComparisonContextType {
    comparisonList: string[]; // Array of product IDs
    addToComparison: (productId: string) => void;
    removeFromComparison: (productId: string) => void;
    clearComparison: () => void;
    isInComparison: (productId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
    const [comparisonList, setComparisonList] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('gizmo_comparison');
        if (saved) {
            try {
                setComparisonList(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse comparison list', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('gizmo_comparison', JSON.stringify(comparisonList));
    }, [comparisonList]);

    const addToComparison = (productId: string) => {
        if (comparisonList.length >= 4) {
            alert('You can compare up to 4 products at a time.');
            return;
        }
        if (!comparisonList.includes(productId)) {
            setComparisonList([...comparisonList, productId]);
        }
    };

    const removeFromComparison = (productId: string) => {
        setComparisonList(comparisonList.filter(id => id !== productId));
    };

    const clearComparison = () => {
        setComparisonList([]);
    };

    const isInComparison = (productId: string) => {
        return comparisonList.includes(productId);
    };

    return (
        <ComparisonContext.Provider value={{
            comparisonList,
            addToComparison,
            removeFromComparison,
            clearComparison,
            isInComparison
        }}>
            {children}
        </ComparisonContext.Provider>
    );
}

export function useComparison() {
    const context = useContext(ComparisonContext);
    if (context === undefined) {
        throw new Error('useComparison must be used within a ComparisonProvider');
    }
    return context;
}
