import LookupTable from "../../components/lookuptable";
import ProductRow from "./productRow";
import './inventoryTable.css'

type Product = {
    id: number;
    name: string;
    brand: string;
    price: number;
    stock: number;
    capacity: number;
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
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    brand={product.brand}
                    price={product.price}
                    stock={product.stock}
                    capacity={product.capacity}
                />
            ))}
        </div>
    );
}