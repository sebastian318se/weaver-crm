import './lookuptable.css';
import { Search } from 'lucide-react';

type LookUpProp = {
    action: () => void; // Receives void function from customers.tsx call
}

export default function LookupTable({action}: LookUpProp){
    return (
        <div className="lookuptable">
            {/* USE STATE to check if its active and hide icon */}
            <div className='lookupicon'>
                <Search size={20}/>
            </div>
            <div className='inputs'>
                <input
                    type="text"
                    placeholder="        Search entries by name, email or phone..."
                />
                <button onClick={action}>Add New +   </button>
            </div>
        </div>
    );
}