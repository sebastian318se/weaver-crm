import InputDropdown from "./inputdropdown";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useState } from "react";
import { X } from "lucide-react";
import './newsaleform.css'

type saleBoxProps = {
    action: () => void;
    onSaleCreated: () => void;
    existingSale?: ExistingSale | null;
}

interface Customer {
    customerId: number;
    customerName: string;
}

interface Product {
    productId: number;
    productName: string;
    productPrice: number;
}

type ProductProps = {
    productName: string;
    productId: number;
    quantity: number;
    price: number;
}

type CustomerEntry = {
    id: number;
    label: string;
}

type ProductEntry = {
    id: number;
    label: string;
    price: number;
}

// Shape matches what Orders.tsx already fetches per sale
type ExistingSale = {
    orderId: number;
    customerId: number;
    customer: { customerId: number; customerName: string } | null;
    orderPrice: number;
    status: string;
    completedAt: string | null;
    isDeleted?: boolean;
    saleItems: {
        productId: number;
        productQuantity: number;
        product: { productId: number; productName: string; productPrice: number } | null;
    }[];
}

export default function NewSaleBox({action, onSaleCreated, existingSale}: saleBoxProps) {

    const { getToken } = useAuth();

    const isEditing = existingSale != null;

    const [customerSearch, setCustomerSearch] = useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] =
        useState<CustomerEntry | null>(null);

    const [productSearch, setProductSearch] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] =
        useState<ProductEntry | null>(null);

    const [productCount, setProductCount] = useState(1);
    
    const [finalProducts, setFinalProducts] = useState<ProductProps[]>([]);

    // Normalize names and id's
    const customerEntries = customers.map(customer => ({
        id: customer.customerId,
        label: customer.customerName
    }));
    const productEntries = products.map(product => ({
        id: product.productId,
        label: product.productName,
        price: product.productPrice
    }));

    // Pre-fill everything when handed a sale to edit; reset when cleared
    useEffect(() => {
        if (existingSale) {
            setSelectedCustomer(existingSale.customer
                ? { id: existingSale.customer.customerId, label: existingSale.customer.customerName }
                : { id: existingSale.customerId, label: "Unknown customer" });
            setCustomerSearch(existingSale.customer?.customerName ?? "");

            setFinalProducts(
                existingSale.saleItems
                    .filter(item => item.product !== null)
                    .map(item => ({
                        productName: item.product!.productName,
                        productId: item.product!.productId,
                        quantity: item.productQuantity,
                        price: item.product!.productPrice
                    }))
            );
        } else {
            setSelectedCustomer(null); setCustomerSearch("");
            setFinalProducts([]);
        }
    }, [existingSale]);

    const handleCustomerSearch = async () => {
        const token = await getToken({
            template: "api"
        });

        if (customerSearch.length < 2) {
            setCustomers([]);
            return;
        }

        fetch("https://weavercrm.com/api/customers/search?query=${customerSearch}`, {
            headers:{
                Authorization: `Bearer ${token}`
            }})
            .then(response => response.json())
            .then(data => {
                // Deduplication of results where name and email match by choosing only the first occurrence of an ID
                const uniqueCustomerEntries = data.filter(
                    (customer, index, self) =>
                        // If indexes match, the entry is doubled, and one of them is dropped
                        index === self.findIndex(
                            c => c.customerId === customer.customerId
                    )
                );

        setCustomers(uniqueCustomerEntries)
    })}

    useEffect(() => {
        handleCustomerSearch();
    }, [customerSearch, selectedCustomer])

    const handleProductSearch = async () => {
        const token = await getToken({
            template: "api"
        });

        if (productSearch.length < 2) {
            setProducts([]);
            return;
        }

        fetch("https://weavercrm.com/api/inventory/search?query=${productSearch}`, {
            headers:{
                Authorization: `Bearer ${token}`
            }})
            .then(response => response.json())
            .then(data => {
                const uniqueProductEntries = data.filter(
                    (product, index, self) =>
                        // If indexes match, the entry is doubled, and one of them is dropped
                        index === self.findIndex(
                            p => p.productId === product.productId
                    )
                );

        setProducts(uniqueProductEntries)
    })}

    useEffect(() => {
        handleProductSearch();
    }, [productSearch, selectedProduct])

    const handleAddProduct = () => {

        if (!selectedProduct || productCount === 0) return;

        // If this product is already in the list, bump its quantity instead of duplicating the row
        setFinalProducts(prev => {
            const existingIndex = prev.findIndex(p => p.productId === selectedProduct.id);
            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + productCount
                };
                return updated;
            }

            return [
                ...prev,
                {
                    productName: selectedProduct.label,
                    productId: selectedProduct!.id,
                    quantity: productCount,
                    price: selectedProduct.price
                }
            ];
        });
    }

    const handleRemoveProduct = (productId: number) => {
        setFinalProducts(prev => prev.filter(p => p.productId !== productId));
    }


    async function handleSubmit() {

        if (!selectedCustomer || finalProducts.length === 0) return;

        const token = await getToken({
            template: "api"
        });

        const saleItems = finalProducts.map(finalProduct => 
            ({productId: finalProduct.productId, 
            productQuantity: finalProduct.quantity}));

        const orderPrice = finalProducts.reduce(
            (total, product) => 
                total + product.price * product.quantity, 0);

        const url = isEditing
            ? "https://weavercrm.com/api/sales/${existingSale!.orderId}`
            : "https://weavercrm.com/api/sales";

        const sale = isEditing
            ? {
                ...existingSale,
                orderPrice: orderPrice,
                saleItems: saleItems,
                isDeleted: existingSale!.isDeleted ?? false
            }
            : {
                customerId: selectedCustomer.id,
                saleItems: saleItems,
                orderPrice: orderPrice
            };

        console.log(sale);

        const response = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(sale)
        });

        if (response.ok) {
            console.log(isEditing ? "Sale updated." : "Sale added to db.");
            console.log(response);
        }

        onSaleCreated();
        action();
        setProductCount(1);
        setProductSearch(""); setProducts([]); setSelectedProduct(null);
        setFinalProducts([]);
        setCustomerSearch(""); setCustomers([]); setSelectedCustomer(null);
    }

    return (
        <div>
            <div className="saleformcontainer">

                <div className="saleformcontents">

                    <div className="newOrderTopRow">
                        <span className='addnewspan'>{isEditing ? "Edit Sale" : "Add New Sale"}</span>
                        <button onClick={() => {handleAddProduct()}}>
                            Add Product to Sale
                        </button>
                    </div>
                    
                    <div className="saleforminputs">
                        <div className="saleforminput">
                            <span>Customer:</span>
                            {isEditing ? (
                                <input type="text" value={customerSearch} disabled />
                            ) : (
                                <InputDropdown
                                    inputPlaceholder="Search customer..."
                                    list="customers"
                                    search={customerSearch}
                                    entries={customerEntries}
                                    setSearch={setCustomerSearch}
                                    setSelected={setSelectedCustomer}
                                    counter={false}
                                />
                            )}
                        </div>
                        <div className="saleforminput">
                                <span>Add Product:</span>
                                <InputDropdown
                                    inputPlaceholder="Search product..."
                                    list="products"
                                    search={productSearch}
                                    entries={productEntries}
                                    setSearch={setProductSearch}
                                    setSelected={setSelectedProduct}
                                    counter={true}
                                    count={productCount}
                                    setCount={setProductCount}
                                />
                        </div>
                    </div>
                  
                    {finalProducts.length > 0 && (<hr />)}

                    <div className="addedProducts">
                    {finalProducts.map((finalProduct) => (
                        <div key={finalProduct.productId} className="addedProductRow">
                            <span>{finalProduct.productName} × {finalProduct.quantity}</span>
                            <span className="addedProductDivider">|</span>
                            <span className="addedProductPrice">${finalProduct.price * finalProduct.quantity}</span>
                            <button
                                className="removeProductBtn"
                                onClick={() => handleRemoveProduct(finalProduct.productId)}
                                title="Remove product"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    </div>

                    {finalProducts.length > 0 && (<hr />)}

                    <div className="saleformbuttons">
                        <button 
                            className='addsale'
                            onClick={handleSubmit}>
                                {isEditing ? "Save Changes" : "Add Sale"}
                        </button>
                        <button 
                            className='cancel'
                            onClick={action}>
                                Cancel
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}