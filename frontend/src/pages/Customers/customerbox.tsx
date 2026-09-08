import { Mail, Phone, Calendar, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import './customerbox.css';

type CustomerBoxProps = {
    customerid: number
    name: string,
    email: string,
    phone: string,
    totalSpent?: number,
    totalDue?: number,
    lastvisit: string,
    onEdit: (customerid: number) => void,
    onDelete: (customerid: number) => void
};

export default function CustomerBox({customerid, name, email, phone, lastvisit, totalSpent, totalDue, onEdit, onDelete} : CustomerBoxProps) {

    const [showActions, setShowActions] = useState(false);

    const handleBoxClick = () => {
        setShowActions(prev => !prev);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowActions(false);
        onEdit(customerid);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowActions(false);
        onDelete(customerid);
    };

    return (
        <div className='customerBox' onClick={handleBoxClick}>
            <div className='upperSection'>
                <span>{name}</span> 
                {totalDue === null ? 
                (<span className='metric'>Nothing due</span>) : 
                (<span className='metricDue'>${totalDue} due</span>)}
            </div>
            <div className='lowerSection'>
                <div className='lowerLeftSection'>

                    {(email != null && email != "") &&
                        (<div className='center'><Mail size={16}/> <span>{email}</span></div>)
                    }

                    {(phone != null && phone != "") &&
                        (<div className='center'><Phone size={16}/> <span>{phone}</span></div>)
                    }
                    <div className='center'><Calendar size={16}/> <span>Last visit: {lastvisit}</span></div>
                </div>
                <div>
                    {totalSpent === null ? 
                    (<span className='metric'>Total $0 spent</span>) : 
                    (<span className='metric'>Total ${totalSpent} spent</span>)}
                </div>
            </div>

            {showActions && (
                <div className='actionsRow' onClick={(e) => e.stopPropagation()}>
                    <button className='editBtn' onClick={handleEditClick}>
                        <Pencil size={14} /> Edit
                    </button>
                    <button className='deleteBtn' onClick={handleDeleteClick}>
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            )}
        </div>
    );
}