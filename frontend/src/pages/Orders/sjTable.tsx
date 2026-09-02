import { Calendar, Check, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
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
    onEdit: (orderId: number) => void;
    onDelete: (orderId: number) => void;
};

export default function SjTable({
    orderId,
    customer,
    racket,
    tennisString,
    orderPrice,
    status,
    mainTension,
    crossTension,
    expectedAt,
    createdAt,
    onEdit,
    onDelete
}: SjProps) {

    const [showActions, setShowActions] = useState(false);

    const finalTension = mainTension === crossTension 
                ? `${mainTension}` 
                : `${mainTension} × ${crossTension}`;
    // Only diplay both tensions when they are different

    const handleRowClick = () => {
        setShowActions(prev => !prev);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowActions(false);
        onEdit(orderId);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowActions(false);
        onDelete(orderId);
    };

    return (
        <div className="sjtablecontainer" onClick={handleRowClick}>

            <div className="topRow">
                <span>{customer?.customerName ?? "Unknown customer"}</span>
                <span className="sjprice">${orderPrice}</span>
            </div>

            <div className="status">
                <span className={status.replaceAll(" ", "")}>{status}</span>
            </div>

            <div className="middleSection">
                <span>Racket: {racket?.productName ?? "N/A"}</span>
                <span>String: {tennisString ? `${tennisString.productName} - $${tennisString.productPrice}` : "N/A"}</span>
                <span>Tension: {finalTension}</span>
            </div>

            <div className="datedisplay">

                <div className="date">
                    <Calendar size={18}/>
                    <span>Order date: {expectedAt ? new Date(createdAt).toLocaleDateString("en-US") : ""}</span>
                </div>

                <div className="date">
                    <Check size={18}/>
                    <span>Expected at: {expectedAt ? new Date(expectedAt).toLocaleDateString("en-US") : ""}</span>
                </div>
            </div>

            {showActions && (
                <div className='sjRowActions' onClick={(e) => e.stopPropagation()}>
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