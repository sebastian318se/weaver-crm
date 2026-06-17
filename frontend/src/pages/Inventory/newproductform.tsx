import { motion, AnimatePresence } from "framer-motion";
import { useState } from 'react';
import './newproductform.css'

type customerBoxProps = {
    action: () => void;
    onCustomerCreated: () => void;
}

export default function NewProductBox({action, onCustomerCreated} : customerBoxProps){

    const[formData, setFormData] = useState({
        name: null,
        brand: null,
        price: null,
        stockAmount: null,
        stockCapacity: null,
        notes: null
    }) 
    
    const [discriminator, setDiscriminator] = useState("")

    async function handleSubmit() {
        const product = {
            productName: formData.name,
            productBrand: formData.brand,
            productPrice: Number(formData.price),

            productStockAmount: Number(formData.stockAmount),
            productStockCapacity: Number(formData.stockCapacity),

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
        setFormData(null); 
        action();
    }

    const inputMappers = [
        {
            title: "Product Name",
            placeholder: "Enter product name...",
            key: "name"
        },
        {
            title: "Brand",
            placeholder: "Enter product brand...",
            key: "brand"
        },
        {
            title: "Price",
            placeholder: "e.g. 200",
            key: "price"
        },
        {
            title: "Stock Owned",
            placeholder: "Number of items owned",
            key: "stockAmount"
        },
        {
            title: "In-Store Stock Capacity",
            placeholder: "Highest possible in-stock count of the item",
            key: "stockCapacity"
        },
        {
            title: "Notes",
            placeholder: "Notes about this product",
            key: "notes"
        }
    ]

    const fields = {
        racket: [
            {title: "Weight", placeholder: "e.g. 305g", key: "weight"},
            {title: "String Pattern", placeholder: "e.g. 16x19", key: "stringPattern"},
            {title: "Grip Size", placeholder: "e.g. L3, 4 3/8, etc.", key: "gripSize"},
            {title: "Head Size", placeholder: "e.g. 98 sq. in.", key: "headSize"},
            {title: "Swing Weight", placeholder: "e.g. 320g", key:"swingWeight"},
            {title: "Beam Thickness", placeholder: "e.g. 23.8mm", key: "beamThickness"},
            {title: "Stiffness", placeholder: "e.g. 63RA", key: "flex"},
            {title: "Length", placeholder: "e.g. 27in", key:"length"}
        ],
        string: [
            {title: "Material", placeholder: "Polyester", key: "material"},
            {title: "Gauge", placeholder: "e.g. 17L", key: "gauge"},
            {title: "ADD CHECKBOX FOR REEL"}
        ],
    }

    return (
        <div>
            <div className="formcontainer">

                <div className="formcontents">

                    <span className='addnewspan'>Create New Product</span>
                    
                    <div className="forminputs">

                    {/* GENERAL UN-NULLABLE PARAMETERS */}
                        <div className='forminput'>
                            <span>Product Type</span>
                            <select
                                onChange={(e) => setDiscriminator(e.target.value)}
                                defaultValue="other"
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
                                    // Get values for that specific item.
                                    value={formData[inputMapper.key] ?? ""}
                                    placeholder={inputMapper.placeholder}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        // Set the key to desired (current) value
                                        [inputMapper.key]: e.target.value
                                    }))}
                                />
                            </div>
                        ))}

                    {/* FIELD SPECIFIC PARAMETERS */}
                        {fields[discriminator] && (
                            // Sorry for the cheap trick for anyone reading this lol!
                            <> <div></div><div></div><div></div>
                            <div className='forminput'>
                                <span>Optional Additional Fields:</span>
                            </div>
                             <div></div> </>
                        )}

                        <AnimatePresence mode="wait">
                            {fields[discriminator]?.map(field => (
                                <motion.div
                                    className="forminput"
                                    key={field.key}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <span>{field.title}</span>

                                    <input
                                        value={formData[field.key] ?? ""}
                                        placeholder={field.placeholder}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            [field.key]: e.target.value
                                        }))}
                                    />

                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                    </div>
                
                {/* CHECKOUT BUTTONS */}
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