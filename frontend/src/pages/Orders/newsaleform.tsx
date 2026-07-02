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
}

export default function NewSaleBox({action, onSaleCreated}: saleBoxProps) {

    const [customerSearch, setCustomerSearch] = useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [productSearch, setProductSearch] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState(null);


    // Normalize names and id's
    const customerEntries = customers.map(customer => ({
        id: customer.customerId,
        label: customer.customerName
    }));
    const productEntries = products.map(product => ({
        id: product.productId,
        label: product.productName
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
    
    async function handleSubmit() {
        const sale = {
            customerId: selectedCustomer.customerId,
            productId: selectedProduct.productId
        };

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
    }

    return (
        <div>
            <div className="formcontainer">

                <div className="formcontents">

                    <span className='addnewspan'>Add New Sale</span>
                    
                    <div className="forminputs">
                        <InputDropdown
                            inputPlaceholder="Search customer..."
                            list="customers"
                            search={customerSearch}
                            setSearch={setCustomerSearch}
                            entries={customerEntries}
                            setSelected={setSelectedCustomer}
                        />
                         <InputDropdown
                            inputPlaceholder="Search product..."
                            list="products"
                            search={productSearch}
                            setSearch={setProductSearch}
                            entries={productEntries}
                            setSelected={setSelectedProduct}
                        />
                    </div>

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