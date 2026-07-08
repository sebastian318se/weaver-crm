import { Calendar } from "lucide-react";
import './sjTable.css'

type Customer = {
    customerId: number;
    customerName: string;
};

type Racket = {
    productId: number;
    productName: string;
    headSize: number;
    stringPattern: string;
};

type TennisString = {
    productId: number;
    productName: string;
    gauge: number;
    productPrice: number;
};

type SjProps = {
    orderId: number;
    customerId: number;
    customer: Customer | null;
    racketId: number;
    racket: Racket | null;
    tennisStringId: number;
    tennisString: TennisString | null;
    orderPrice: number;
    status: string;
    createdAt: string;
    completedAt: string | null;
    expectedAt: string | null;
    mainTension: number;
    crossTension: number;
};

export default function SjTable({
    customer,
    racket,
    tennisString,
    orderPrice,
    status,
    mainTension,
    crossTension,
    expectedAt
}: SjProps) {

    const finalTension = mainTension === crossTension 
        ? `${mainTension}` 
        : `${mainTension} × ${crossTension}`;
        // Only diplay both tensions when they are different
    
    return (
        <div className="sjtablecontainer">

            
            <div className="topRow">
                <span>{customer.customerName}</span>
                <span className="sjprice">${orderPrice}</span>
            </div>

            <div className="status">
                <span className={status.replaceAll(" ", "")}>{status}</span>
            </div>

            <div className="middleSection">
                <span>Racket: {racket.productName}</span>
                <span>String: {tennisString.productName} - ${tennisString.productPrice}</span>
                <span>Tension: {finalTension}</span>
            </div>

            <div className="date">
                <Calendar size={18}/>
                <span>{expectedAt ? new Date(expectedAt).toLocaleDateString("en-GB") : ""}</span>
            </div>
        </div>
    );
}