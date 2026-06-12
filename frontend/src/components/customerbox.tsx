import { Mail, Phone, Calendar } from 'lucide-react';
import './customerbox.css';

type CustomerBoxProps = {
    customerid: number
    name: string,
    email: string,
    phone: string,
    metric: string,
    racketsstrung: number,
    lastvisit: string
};

export default function CustomerBox({customerid, name, email, phone, lastvisit, metric, racketsstrung} : CustomerBoxProps) {
    return (
        <div className='customerBox'>
            <div className='upperSection'>
                <span>{name}</span> <span className='metric'>{metric}</span>
            </div>
            <div className='lowerSection'>
                <div className='lowerLeftSection'>

                    {email != null &&
                        (<div className='center'><Mail size={16}/> <span>{email}</span></div>)
                    }

                    {phone != null &&
                        (<div className='center'><Phone size={16}/> <span>{phone}</span></div>)
                    }
                    <div className='center'><Calendar size={16}/> <span>Last visit: {lastvisit}</span></div>
                </div>
                <div>
                    <span>{racketsstrung} rackets strung</span>
                </div>
            </div>
        </div>
    );
}