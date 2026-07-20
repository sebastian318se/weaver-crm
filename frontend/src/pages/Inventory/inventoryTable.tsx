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
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
};

export default function InventoryTable({ products, onEdit, onDelete }: Props) {

    return (
        <div className="inventorypage">

            <div className="inventorytable">

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
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}