import SalesRow from "./salesTableRow";
import './salesTable.css'
import { Calendar } from "lucide-react";

type ProductProps = {
    productId: number,
    productName: string,
    productPrice: number
}

type SaleItemProps = {
    product: ProductProps,
    productQuantity: number
}

type CustomerProps = {
    customerId: number,
    customerName: string
}

type SaleProps = {
    saleItems: SaleItemProps[],
    customer: CustomerProps | null,
    orderPrice: number,
    createdAt: string
}

export default function SalesTable({saleItems, customer, orderPrice, createdAt } : SaleProps) {

    if (!saleItems) return;

    return (
        <div className="salestablecontainer">

            <div className="containerheader">
                <div className="top">
                    <span>{customer?.customerName ?? "Unknown Customer"}</span>
                    <span className="totalprice">${orderPrice}</span>
                </div>
                <div className="date">
                    <Calendar size={18}/>
                    <span className="date"> {new Date(createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="tablerow">
                 {saleItems.map(item =>(
                    <SalesRow
                        key={item.product.productId}
                        product={item.product}
                        productQuantity={item.productQuantity}/>
                 ))}
            </div>

        </div>
    );
}