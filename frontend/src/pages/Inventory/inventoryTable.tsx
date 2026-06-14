import LookupTable from "../../components/lookuptable";
import ProductRow from "./productRow";
import './inventoryTable.css'

type Product = {
    productId: number;
    productName: string;
    productBrand: string;
    productPrice: number;

    productStockAmount: number;
    productStockCapacity: number;
};

type Props = {
    products: Product[];
};

export default function InventoryTable({ products }: Props) {

    return (
        <div className="inventorytable">
            <div className="tablecontainer">
                <LookupTable />
            </div> {/* MAKE CUSTOM LOOKUP FOR THIS PAGE THE OTHER ONE AINT IT FOR HERE*/}

            <div className="initialRow">
                <span>Name</span>
                <span>Brand</span>
                <span>Price</span>
                <span>Stock</span>
                <span>Status</span>
            </div>

            {products.map(product => (
                <ProductRow
                    key={product.productId}
                    id={product.productId}
                    name={product.productName}
                    brand={product.productBrand}
                    price={product.productPrice}
                    stock={product.productStockAmount}
                    capacity={product.productStockCapacity}
                />
            ))}
        </div>
    );
}