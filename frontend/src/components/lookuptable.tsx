import './lookuptable.css';
import { Search } from 'lucide-react';

export default function LookupTable(){
    return (
        <div className="lookuptable">
            {/* USE STATE to check if its active and hide icon */}
            <div className='lookupicon'>
                <Search size={20}/>
            </div>
            <input
                type="text"
                placeholder="        Search entries by name, email or phone..."
            />
        </div>
    );
}