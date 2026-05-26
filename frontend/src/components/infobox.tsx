import type { LucideIcon } from 'lucide-react';
import './infobox.css';

type InfoBoxProps = {
    icon: LucideIcon;
    metric: string;
    info: string;
    value: string;
};

export default function InfoBox({icon: Icon, metric, info, value} : InfoBoxProps) {
    return (
        <div className='infoBox'>
            <div className='topSection'>
                <Icon size={22}/> <span>{metric}</span>
            </div>

            <div className='mainText'>
                <span>{value}</span>
            </div>
            <div className='underText'>
                <span>{info}</span>
            </div>
        </div>
    );
}