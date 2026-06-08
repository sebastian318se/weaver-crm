import SalesRow from "./salesTableRow";
import './salesTable.css'
import { Calendar } from "lucide-react";

type ProductProps = {
    productId: number,
    productName: string,
    productQuantity: number,
    productPrice: number
}

type SaleProps = {
    products: ProductProps[]
    customerId: number,
    customerName: string
    saleDate: string
}

export default function SalesTable({products, customerId, customerName, saleDate } : SaleProps) {

    const totalPrice = products.reduce(
        (total, product) => total + product.productPrice * product.productQuantity, 0 
        // Init total at 0 and then add every product's value
    );

    return (
        <div className="salestablecontainer">

            <div className="containerheader">
                <div className="top">
                    <span>{customerName}</span>
                    <span className="totalprice">${totalPrice}</span>
                </div>
                <div className="date">
                    <Calendar size={18}/>
                    <span className="date"> {saleDate}</span>
                </div>
            </div>

            <div className="tablerow">
                 {products.map(product =>(
                    <SalesRow
                        key={product.productId}
                        productId={product.productId}
                        productName={product.productName}
                        productQuantity={product.productQuantity}
                        productPrice={product.productPrice}/>
                 ))}
            </div>

        </div>
    );
}