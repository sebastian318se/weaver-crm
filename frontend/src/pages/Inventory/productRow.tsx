import './productRow.css'

type ProductProps = {
    id: number;
    name: string;
    brand: string;
    price: number;
    stock: number;
    capacity: number;
};

export default function ProductRow({
    name,
    brand,
    price,
    stock,
    capacity
}: ProductProps) {

    const stockPercent = (stock / capacity) * 100;

    const status =
        stockPercent <= 20
            ? "Low"
            : "In";

    return (
        <div className="productRow">
            <span>{name}</span>
            <span className='brand'>{brand}</span>
            <span className='price'>${price}</span>

            <div className="progressBar">
                <div
                    className="progressFill"
                    style={{ width: `${stockPercent}%` }}
                />
            </div>

            <span className={status}>{status} Stock</span>
        </div>
    );
}