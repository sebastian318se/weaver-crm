import { Calendar } from "lucide-react";
import './sjTable.css'

type SjProps = {
    orderId: number,
    customerId: number,
    customerName: string,
    racketId: number,
    racketName: string,
    stringId: number,
    stringName: string,
    stringPrice: number,
    sjPrice: number,
    sjStatus: string
    horizTension: number,
    vertTension: number,
    dueDate: string
}

export default function SjTable({
    customerName,
    racketName,
    stringName,
    stringPrice,
    sjPrice,
    sjStatus,
    horizTension,
    vertTension,
    dueDate,
}: SjProps) {

    const finalTension = vertTension === horizTension ? 
        `${vertTension}` 
        : `${vertTension} × ${horizTension}`;
        // Only diplay both tensions when they are different
    
    return (
        <div className="sjtablecontainer">

            
            <div className="topRow">
                <span>{customerName}</span>
                <span className="sjprice">${stringPrice + sjPrice}</span>
            </div>

            <div className="status">
                <span className={sjStatus.replaceAll(" ", "")}>{sjStatus}</span>
            </div>

            <div className="middleSection">
                <span>Racket: {racketName}</span>
                <span>String: {stringName} - ${stringPrice}</span>
                <span>Tension: {finalTension}</span>
            </div>

            <div className="date">
                <Calendar size={18}/>
                <span>{dueDate}</span>
            </div>
        </div>
    );
}