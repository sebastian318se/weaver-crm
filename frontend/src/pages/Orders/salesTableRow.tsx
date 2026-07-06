import './salesTableRow.css'

type ProductProps = {
    productId: number,
    productName: string,
    productPrice: number
}

type EntryProps = {
    product: ProductProps,
    productQuantity: number
}

export default function SalesRow({product, productQuantity}: EntryProps) {
    return (
        <div className="salesrow">
            <span> {product.productName} × {productQuantity} </span>
            <span className='price'> ${product.productPrice * productQuantity} </span>
        </div>
    );
}