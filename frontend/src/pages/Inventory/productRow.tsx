import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import './productRow.css'

type ProductProps = {
    id: number;
    name: string;
    brand: string;
    price: number;
    stock: number;
    capacity: number;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
};

export default function ProductRow({
    id,
    name,
    brand,
    price,
    stock,
    capacity,
    onEdit,
    onDelete
}: ProductProps) {

    const [showActions, setShowActions] = useState(false);

    const stockPercent = (stock / capacity) * 100;

    const status =
        stockPercent <= 30
            ? "Low"
            : "In";

    const handleRowClick = () => {
        setShowActions(prev => !prev);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowActions(false);
        onEdit(id);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowActions(false);
        onDelete(id);
    };

    return (
        <div className="productRow" onClick={handleRowClick}>
            <span>{name}</span>
            <span className='brand'>{brand}</span>
            <span className='price'>${price}</span>

            <div className='progressBarContainer'>                
                <div className="progressBar">
                    <div
                        className={status === "Low" ? "progressLow" : "progressIn"}
                        style={{ width: `${stockPercent}%` }}
                    />
                </div>
                <div className='progressOverlay'>
                    <span>{stock} / {capacity} in stock</span>
                </div>
            </div>

            {showActions ? (
                <div className='rowActions' onClick={(e) => e.stopPropagation()}>
                    <button className='editBtn' onClick={handleEditClick} title="Edit">
                        <Pencil size={14} /> Edit
                    </button>
                    <button className='deleteBtn' onClick={handleDeleteClick} title="Delete">
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            ) : (
                <span className={status}>{status} Stock</span>
            )}
        </div>
    );
}