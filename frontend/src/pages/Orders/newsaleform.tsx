import { useState } from "react";
import { useEffect } from "react";
import './newsaleform.css'
import InputDropdown from "./inputdropdown";

type saleBoxProps = {
    action: () => void;
    onSaleCreated: () => void;
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

export default function NewSaleBox({action, onSaleCreated}: saleBoxProps) {

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


    useEffect(() => {
        if (customerSearch.length < 2) {
            setCustomers([]);
            return;
        }

        fetch(`http://localhost:5000/api/customers/search?query=${customerSearch}`)
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
            })
    }, [customerSearch, selectedCustomer])

    useEffect(() => {
        if (productSearch.length < 2) {
            setProducts([]);
            return;
        }

        fetch(`http://localhost:5000/api/inventory/search?query=${productSearch}`)
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
            })
    }, [productSearch, selectedProduct])

    const handleAddProduct = () => {

        if (!selectedProduct || productCount === 0) return;

        setFinalProducts(prev => [
            ...prev,
            {
                productName: selectedProduct.label,
                productId: selectedProduct!.id,
                quantity: productCount,
                price: selectedProduct.price
            }
        ]);
    }


    async function handleSubmit() {

        if (!selectedCustomer || finalProducts.length === 0) return;

        const sale = {
            customerId: selectedCustomer.id,
            
            status: 0, // Collected

            saleItems: finalProducts.map(finalProduct => 
                ({productId: finalProduct.productId, 
                productQuantity: finalProduct.quantity})),
            
            orderPrice: finalProducts.reduce(
                (total, product) => 
                    total + product.price * product.quantity, 0)
        };

        console.log(sale);

        const response = await fetch("http://localhost:5000/api/sales", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(sale)
        });

        if (response.ok) {
            console.log("Sale added to db.");
        }

        onSaleCreated();
        action();
        setProductCount(1);
        setProductSearch(""); setProducts([]); setSelectedProduct(null);
    }

    return (
        <div>
            <div className="formcontainer">

                <div className="formcontents">

                    <div className="newOrderTopRow">
                        <span className='addnewspan'>Add New Sale</span>
                        <button onClick={() => {handleAddProduct()}}>
                            Add Product to Sale
                        </button>
                    </div>
                    
                    <div className="forminputs">
                        <div className="forminput">
                            <span>Customer:</span>
                            <InputDropdown
                                inputPlaceholder="Search customer..."
                                list="customers"
                                search={customerSearch}
                                entries={customerEntries}
                                setSearch={setCustomerSearch}
                                setSelected={setSelectedCustomer}
                                counter={false}
                            />
                        </div>
                        <div className="forminput">
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
                        <div key={finalProduct.productId}>
                            <span>{finalProduct.productName} × {finalProduct.quantity}</span>
                        </div>
                    ))}
                    </div>

                    {finalProducts.length > 0 && (<hr />)}

                    <div className="formbuttons">
                        <button 
                            className='addsale'
                            onClick={handleSubmit}>
                                Add Sale
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