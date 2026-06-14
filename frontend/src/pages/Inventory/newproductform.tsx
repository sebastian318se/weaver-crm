import { useState } from 'react';
import './newproductform.css'

type customerBoxProps = {
    action: () => void;
    onCustomerCreated: () => void;
}

export default function NewProductBox({action, onCustomerCreated} : customerBoxProps){

    const [name, setName] = useState<string | null>(null);
    const [brand, setBrand] = useState<string | null>(null);
    const [price, setPrice] = useState<string | null>(null);
    
    const [stockAmount, setStockAmount] = useState<string | null>(null);
    const [stockCapacity, setStockCapacity] = useState<string | null>(null);

    const [discriminator, setDiscriminator] = useState("Racket")

    async function handleSubmit() {
        const product = {
            productName: name,
            productBrand: brand,
            productPrice: Number(price),

            productStockAmount: Number(stockAmount),
            productStockCapacity: Number(stockCapacity),

            discriminator: discriminator
        };

        const response = await fetch(`http://localhost:5000/api/inventory/${discriminator}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            console.log("Product added to db.");
        }

        onCustomerCreated();
        setName(null); setBrand(null); setPrice(null); setStockAmount(null); setStockCapacity(null); 
        action();
    }

    const inputMappers = [
        {
            title: "Product Name",
            inputinfo: "Yonex Ezone 98 2026",
            setter: setName,
            value: name
        },
        {
            title: "Brand",
            inputinfo: "Yonex",
            setter: setBrand,
            value: brand
        },
        {
            title: "Price",
            inputinfo: "305.00",
            setter: setPrice,
            value: price
        },
        {
            title: "Stock Owned",
            inputinfo: "15",
            setter: setStockAmount,
            value: stockAmount
        },
        {
            title: "In-Store Stock Capacity",
            inputinfo: "20",
            setter: setStockCapacity,
            value: stockCapacity
        }
    ]

    return (
        <div>
            <div className="formcontainer">

                <div className="formcontents">

                    <span className='addnewspan'>Create New Product</span>
                    
                    <div className="forminputs">
                        
                        <div className='forminput'>
                            <span>Product Type</span>
                            <select
                                onChange={(e) => setDiscriminator(e.target.value)}
                            >
                                <option value="racket">Racket</option>
                                <option value="string">String</option>
                                <option value="grip">Grip</option>
                                <option value="clothing">Clothing</option>
                                <option value="shoes">Shoes</option>
                                <option value="balls">Balls</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {inputMappers.map(inputMapper => (
                            <div className="forminput">
                                <span>{inputMapper.title}</span>
                                <input 
                                    value={inputMapper.value ?? ""}
                                    placeholder={inputMapper.inputinfo}
                                    onChange={(e) => inputMapper.setter(e.target.value)}
                                />
                            </div>
                        ))}

                    </div>

                    <div className="formbuttons">
                        <button 
                            className='addproduct'
                            onClick={handleSubmit}>
                                Add Product
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