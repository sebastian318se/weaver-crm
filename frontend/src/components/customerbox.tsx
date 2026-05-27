import { Mail, Phone, Calendar } from 'lucide-react';
import './customerbox.css';

type CustomerBoxProps = {
    name: string,
    email: string,
    phone: string,
    metric: string,
    racketsstrung: string
    lastvisit: string
};

export default function CustomerBox({name, email, phone, lastvisit, metric, racketsstrung} : CustomerBoxProps) {
    return (
        <div className='customerBox'>
            <div className='upperSection'>
                <span>{name}</span> <span className='metric'>{metric}</span>
            </div>
            <div className='lowerSection'>
                <div className='lowerLeftSection'>
                    <div className='center'><Mail size={16}/> <span>{email}</span></div>
                    <div className='center'><Phone size={16}/> <span>{phone}</span></div>
                    <div className='center'><Calendar size={16}/> <span>Last visit: {lastvisit}</span></div>
                </div>
                <div>
                    <span>{racketsstrung} rackets strung</span>
                </div>
            </div>
        </div>
    );
}