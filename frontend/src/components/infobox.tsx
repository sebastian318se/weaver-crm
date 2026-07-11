import type { LucideIcon } from 'lucide-react';
import './infobox.css';

type InfoBoxProps = {
    icon: LucideIcon;
    metric: string;
    info: string;
    value: string;
    classname: string;
};

export default function InfoBox({icon: Icon, metric, info, value, classname = ""} : InfoBoxProps) {
    return (
        <button className='infoBox'>
            <div className='topSection'>
                <Icon size={18}/> <span>{metric}</span>
            </div>
            <div className='mainText'>
                <div className={classname}>
                    <span>{value}</span>
                </div>
            </div>
            <div className='underText'>
                <span>{info}</span>
            </div>
        </button>
    );
}