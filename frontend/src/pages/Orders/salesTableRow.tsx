import './salesTableRow.css'

type EntryProps = {
    productId: number,
    productName: string,
    productQuantity: number,
    productPrice: number
}

export default function SalesRow({productId, productName, productQuantity, productPrice}: EntryProps) {
    return (
        <div className="salesrow">
            <span> {productName} × {productQuantity} </span>
            <span className='price'> ${productPrice * productQuantity} </span>
        </div>
    );
}