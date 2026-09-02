import SalesRow from "./salesTableRow";
import './salesTable.css'
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

type ProductProps = {
    productId: number,
    productName: string,
    productPrice: number
}

type SaleItemProps = {
    product: ProductProps | null,
    productQuantity: number
}

type CustomerProps = {
    customerId: number,
    customerName: string
}

type SaleProps = {
    orderId: number,
    saleItems: SaleItemProps[],
    customer: CustomerProps | null,
    orderPrice: number,
    createdAt: string,
    onEdit: (orderId: number) => void,
    onDelete: (orderId: number) => void
}

export default function SalesTable({saleItems, customer, orderPrice, createdAt, orderId, onEdit, onDelete } : SaleProps) {

    if (!saleItems) return;

    const [showActions, setShowActions] = useState(false);

    const handleContainerClick = () => {
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

        <div className="salestablecontainer" onClick={handleContainerClick}>

            <div className="containerheader">

                <div className="top">
                    <span>{customer?.customerName ?? "Unknown Customer"}</span>
                    <span className="totalprice">${orderPrice}</span>
                </div>

                <div className="date">
                    <Calendar size={15}/>
                    <span className="date"> {new Date(createdAt).toLocaleDateString("en-US")}</span>
                </div>
            </div>

            <div className="tablerow">
                {saleItems
                .filter(item => item.product !== null)
                .map(item =>(
                    <SalesRow
                    key={item.product!.productId}
                    product={item.product!}
                    productQuantity={item.productQuantity}/>
                ))}
            </div>

            {showActions && (
                <div className='saleRowActions' onClick={(e) => e.stopPropagation()}>
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