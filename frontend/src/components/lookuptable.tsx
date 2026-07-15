import { useState, useEffect, useRef } from 'react';
import './lookuptable.css';

type LookUpProp = {
    action: () => void; // Receives void function from .tsx call
    onEntryCreated: () => void;
    onSearch: (query: string) => void; // Reports current search query to parent
    debounceMs?: number; // 300ms input to api delay 
}

export default function LookupTable({ action, onEntryCreated, onSearch, debounceMs = 300 }: LookUpProp){
    const [query, setQuery] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            onSearch(query);
        }, debounceMs);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, debounceMs, onSearch]);

    return (
        <div className="lookuptable">
            <div className='inputs'>
                <input
                    type="text"
                    placeholder="        Search entries by name, email or phone..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button
                    className="addnewbutton"
                    onClick={action}>
                        Add New +   
                </button>
            </div>
        </div>
    );
}