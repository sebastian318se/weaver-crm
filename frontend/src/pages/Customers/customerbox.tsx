import { Mail, Phone, Calendar } from 'lucide-react';
import './customerbox.css';

type CustomerBoxProps = {
    customerid: number
    name: string,
    email: string,
    phone: string,
    totalSpent?: number,
    racketsstrung?: number,
    lastvisit: string
};

export default function CustomerBox({customerid, name, email, phone, lastvisit, totalSpent, racketsstrung} : CustomerBoxProps) {
    
    return (
        <div className='customerBox'>
            <div className='upperSection'>
                <span>{name}</span> 
                
                {totalSpent === null ? 
                (<span className='metric'>$0</span>) : 
                (<span className='metric'>${totalSpent}</span>)}

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
                    {racketsstrung === null ?
                    (<span>0 rackets strung</span>) :
                    (<span>{racketsstrung} rackets strung</span>)}
                </div>
            </div>
        </div>
    );
}