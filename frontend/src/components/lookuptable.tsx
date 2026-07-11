import './lookuptable.css';

type LookUpProp = {
    action: () => void; // Receives void function from .tsx call
    onEntryCreated: () => void;
}

export default function LookupTable({action, onEntryCreated}: LookUpProp){
    return (
        <div className="lookuptable">

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