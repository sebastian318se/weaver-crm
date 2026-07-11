import { motion, AnimatePresence } from "framer-motion";
import { useState } from 'react';
import './newproductform.css'

type NewProductBoxProps = {
    action: () => void;
    onCustomerCreated: () => void;
}

export default function NewProductBox({action, onCustomerCreated} : NewProductBoxProps){

    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        price: "",
        stockAmount: "",
        stockCapacity: "",
        notes: ""
    })

    const [gripType, setGripType] = useState("")

    const [discriminator, setDiscriminator] = useState("")

    // Validation function
    function validateForm(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!formData.name.trim()) errors.push("Product name is required");
        if (!formData.brand.trim()) errors.push("Brand is required");
        if (!formData.price.trim()) errors.push("Price is required");
        if (formData.price && isNaN(Number(formData.price))) errors.push("Price must be a valid number");
        if (!formData.stockAmount.trim()) errors.push("Stock amount is required");
        if (formData.stockAmount && isNaN(Number(formData.stockAmount))) errors.push("Stock amount must be a valid number");
        if (!formData.stockCapacity.trim()) errors.push("Stock capacity is required");
        if (formData.stockCapacity && isNaN(Number(formData.stockCapacity))) errors.push("Stock capacity must be a valid number");
        if (!discriminator || discriminator === "") errors.push("Product type is required");

        return { isValid: errors.length === 0, errors };
    }

    async function handleSubmit() {
        try {
            // Validate form
            const validation = validateForm();
            if (!validation.isValid) {
                console.warn("Form validation failed:", validation.errors);
                alert("Please fill in all required fields:\n" + validation.errors.join("\n"));
                return;
            }

            // Build base product object with required fields
            const product: Record<string, any> = {
                productName: formData.name.trim(),
                productBrand: formData.brand.trim(),
                productPrice: Number(formData.price),
                productStockAmount: Number(formData.stockAmount),
                productStockCapacity: Number(formData.stockCapacity),
                notes: formData.notes.trim() || null,
                discriminator: discriminator
            };

            // Add discriminator-specific fields if they exist and aren't empty
            if (fields[discriminator]) {
                fields[discriminator].forEach(field => {
                    const value = formData[field.key];
                    // Convert empty strings to null, keep other values as-is
                    product[field.key] = (value === "" || value === null) ? null : value;
                });
            }

            const response = await fetch(`http://localhost:5000/api/inventory/${discriminator}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(product)
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            console.log("Product added to db.");
            onCustomerCreated();
            
            // Reset form with empty strings
            setFormData({
                name: "",
                brand: "",
                price: "",
                stockAmount: "",
                stockCapacity: "",
                notes: ""
            });
            setDiscriminator("");
            action();

        } catch (error) {
            console.error("Error adding product:", error);
            alert("Failed to add product. Please try again.");
        }
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
        ],
    }

    return (
        <div>
            <div className="formcontainer">

                <div className="productformcontents">

                    <span className='addnewproductspan'>Create New Product</span>
                    
                    <div className="productforminputs">

                    {/* GENERAL UN-NULLABLE PARAMETERS */}
                        <div className='productforminput'>
                            <span>Product Type</span>
                            <select
                                onChange={(e) => setDiscriminator(e.target.value)}
                                value={discriminator}
                            >
                                <option value="">Select a product type...</option>
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
                            <div className="productforminput" key={inputMapper.key}>
                                <span>{inputMapper.title}</span>
                                <input 
                                    value={formData[inputMapper.key]}
                                    placeholder={inputMapper.placeholder}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        [inputMapper.key]: e.target.value
                                    }))}
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                    {/* FIELD SPECIFIC PARAMETERS */}
                        {fields[discriminator] && (
                            <div className='forminput forminput--optional-header'>
                                <span>Optional Additional Fields:</span>
                            </div>
                        )}
                    </div>

                    <div className="forminputs">
                        <AnimatePresence mode="wait">
                            {fields[discriminator]?.map(field => (
                                <motion.div
                                    className="productforminput"
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
                    <div className="productformbuttons">
                        <button 
                            className='addproduct'
                            onClick={handleSubmit}>
                                Add Product
                            </button>
                        <button 
                            className='cancelproduct'
                            onClick={action}>
                                Cancel
                            </button>
                    </div>

                </div>
            </div>
        </div>
    );
}