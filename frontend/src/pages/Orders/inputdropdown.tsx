import './inputdropdown.css';

type dropdownEntry = {
    id: number;
    label: string;
    price?: number;
}

type dropdownProps = {
    inputPlaceholder: string;

    list: string;

    search: string;
    setSearch: (value: string) => void;

    entries: dropdownEntry[];
    setSelected: (selected: dropdownEntry | null) => void;

    count?: number;
    setCount?: (count: number) => void;

    counter: boolean;
}

export default function InputDropdown({inputPlaceholder, list, search, setSearch, setSelected, entries, counter, count, setCount} : dropdownProps){
    
    return (
        <div className='dropdowninput'>
            <input
                autoComplete="off"
                
                placeholder={inputPlaceholder}

                list={list}
                value={search}

                onChange={(e) => {
                    const value = e.target.value;
                    setSearch(value);

                    // Check whether input exactly matches one of the fields
                    const match = entries.find(entry => entry.label === value);
                        if (match) {
                            setSelected(match);
                            console.log("when selected:", match)
                        } else {
                            setSelected(null);
                        }                
                }}
            />

            <datalist id={list}>
                {entries.map((entry) => 
                    <option 
                        value={entry.label}
                        key={entry.id}>
                            {entry.label}
                    </option>
                )}
            </datalist>

            {counter === true && (
                <div>
                    <input 
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder="amount"
                        onChange={(e) => 
                            {
                                const value = Number(e.target.value);
                                setCount(value);
                            }}
                        value={count}
                    />
                </div>
            )}
        </div>
    );
}