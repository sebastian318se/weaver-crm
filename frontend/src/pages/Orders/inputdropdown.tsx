interface Customer {
    customerName: string;
    customerId: number;
}

interface Product {
    productName: string;
    productId: number;
}

type dropdownEntry = {
    id: number;
    label: string;
}

type dropdownProps = {
    inputPlaceholder: string;

    list: string;

    search: string;
    setSearch: (value: string) => void;

    entries: dropdownEntry[];
    setSelected: (selected: dropdownEntry | null) => void;
}

export default function InputDropdown({inputPlaceholder, list, search, setSearch, setSelected, entries} : dropdownProps){
        
    return (
        <div>
            <input
                autoComplete="off"
                
                placeholder={inputPlaceholder}

                list={list}
                value={search}

                onChange={(e) => {
                    const value = e.target.value;
                    setSearch(value);
                    setSelected(null);
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
        </div>
    );
}