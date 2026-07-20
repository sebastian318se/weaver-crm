import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from 'react';
import './newproductform.css'

type NewProductBoxProps = {
    action: () => void;
    onCustomerCreated: () => void;
    existingProduct?: Record<string, any> | null;
    existingProductType?: string;
}

type FieldConfig = {
    title: string;
    placeholder?: string;
    key: string;
    type: "text" | "numeric" | "decimal" | "select" | "checkbox";
    options?: string[];
    required?: boolean;
};

// Turns "ExtraSmall" into "Extra Small" for select labels
function humanize(value: string): string {
    return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export default function NewProductBox({action, onCustomerCreated, existingProduct, existingProductType} : NewProductBoxProps){

    const [formData, setFormData] = useState<Record<string, any>>({
        name: "",
        brand: "",
        price: "",
        stockAmount: "",
        stockCapacity: "",
        notes: "",
        productAcquisitionPrice: "",
        productImageUrl: "",
        productModel: ""
    })

    const [discriminator, setDiscriminator] = useState("")

    const isEditing = existingProduct != null;

    // Type-specific fields, matching each Product subclass exactly
    const fields: Record<string, FieldConfig[]> = {
        racket: [
            { title: "String Pattern", placeholder: "e.g. 16x19", key: "stringPattern", type: "text"},
            { title: "Grip Size", placeholder: "e.g. L3, 4 3/8, etc.", key: "gripSize", type: "text" },
            { title: "Head Size (sq in)", placeholder: "e.g. 98", key: "headSize", type: "numeric", required: true },
            { title: "Weight (g)", placeholder: "e.g. 305", key: "weight", type: "numeric", required: true },
            { title: "Swing Weight", placeholder: "e.g. 320", key: "swingWeight", type: "numeric" },
            { title: "Beam Thickness (mm)", placeholder: "e.g. 24", key: "beamThickness", type: "numeric" },
            { title: "Stiffness (Flex)", placeholder: "e.g. 63", key: "flex", type: "numeric" },
            { title: "Length (in)", placeholder: "e.g. 27", key: "length", type: "decimal" }
        ],
        string: [
            { title: "Material", key: "material", type: "select", options: ["Gut", "Polyester", "Nylon", "Multifilament"] },
            { title: "Store Owned", key: "isStoreOwned", type: "checkbox" },
            { title: "Gauge", placeholder: "e.g. 1.25", key: "gauge", type: "decimal", required: true }
        ],
        grip: [
            { title: "Type", key: "type", type: "select", options: ["Overgrip", "CushionGrip", "LeatherCushionGrip"], required: true }
        ],
        clothing: [
            { title: "Type", key: "type", type: "select", options: ["Shirt", "Shorts", "Hoodie", "Pants", "Hat", "Wristband", "Headband", "Socks", "Other"], required: true },
            { title: "Size", key: "size", type: "select", options: ["ExtraSmall", "Small", "Medium", "Large", "ExtraLarge", "Other"], required: true }
        ],
        shoes: [
            { title: "Surface", key: "shoeSurface", type: "select", options: ["Hard", "Clay", "Grass", "Mixed"], required: true },
            { title: "Size", placeholder: "e.g. 10.5", key: "size", type: "decimal", required: true }
        ],
        balls: [
            { title: "Surface", key: "ballSurface", type: "select", options: ["Hard", "Clay", "Grass", "Mixed"], required: true }
        ],
        other: []
    }

    // Pre-fill form whenever we're handed a product to edit; reset otherwise
    useEffect(() => {
        if (existingProduct) {
            setDiscriminator(existingProductType ?? "");

            const base: Record<string, any> = {
                name: existingProduct.productName ?? "",
                brand: existingProduct.productBrand ?? "",
                price: existingProduct.productPrice?.toString() ?? "",
                stockAmount: existingProduct.productStockAmount?.toString() ?? "",
                stockCapacity: existingProduct.productStockCapacity?.toString() ?? "",
                notes: existingProduct.notes ?? "",
                productAcquisitionPrice: existingProduct.productAcquisitionPrice?.toString() ?? "",
                productImageUrl: existingProduct.productImageUrl ?? "",
                productModel: existingProduct.productModel ?? ""
            };

            const typeFields = fields[existingProductType ?? ""] ?? [];
            typeFields.forEach(field => {
                const raw = existingProduct[field.key];
                if (field.type === "checkbox") {
                    base[field.key] = raw ?? true;
                } else {
                    base[field.key] = raw?.toString() ?? "";
                }
            });

            setFormData(base);
        } else {
            setFormData({
                name: "",
                brand: "",
                price: "",
                stockAmount: "",
                stockCapacity: "",
                notes: "",
                productAcquisitionPrice: "",
                productImageUrl: "",
                productModel: ""
            });
            setDiscriminator("");
        }
    }, [existingProduct, existingProductType]);

    // Validation function
    function validateForm(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (!formData.name.trim()) errors.push("Product name is required");
        if (!formData.brand.trim()) errors.push("Brand is required");
        if (!formData.price.toString().trim()) errors.push("Price is required");
        if (formData.price && isNaN(Number(formData.price))) errors.push("Price must be a valid number");
        if (!formData.stockAmount.toString().trim()) errors.push("Stock amount is required");
        if (formData.stockAmount && isNaN(Number(formData.stockAmount))) errors.push("Stock amount must be a valid number");
        if (!formData.stockCapacity.toString().trim()) errors.push("Stock capacity is required");
        if (formData.stockCapacity && isNaN(Number(formData.stockCapacity))) errors.push("Stock capacity must be a valid number");
        if (!discriminator || discriminator === "") errors.push("Product type is required");
        if (formData.productAcquisitionPrice && isNaN(Number(formData.productAcquisitionPrice))) errors.push("Acquisition price must be a valid number");

        // Type-specific required fields (non-nullable on the model)
        const typeFields = fields[discriminator] ?? [];
        typeFields.forEach(field => {
            if (!field.required) return;
            const value = formData[field.key];
            if (field.type === "checkbox") return; // booleans always have a value
            if (value === undefined || value === null || value.toString().trim() === "") {
                errors.push(`${field.title} is required for this product type`);
            }
        });

        return { isValid: errors.length === 0, errors };
    }

    async function handleSubmit() {
        try {
            const validation = validateForm();
            if (!validation.isValid) {
                console.warn("Form validation failed:", validation.errors);
                alert("Please fill in all required fields:\n" + validation.errors.join("\n"));
                return;
            }

            // Build base product object with required fields.
            // When editing, start from the full existing product so PutItem's
            // SetValues(updatedProduct) doesn't null out fields we're not touching here.
            const product: Record<string, any> = {
                discriminator: discriminator,
                ...(isEditing ? existingProduct : {}),
                productName: formData.name.trim(),
                productBrand: formData.brand.trim(),
                productPrice: Number(formData.price),
                productStockAmount: Number(formData.stockAmount),
                productStockCapacity: Number(formData.stockCapacity),
                notes: formData.notes.trim() || null,
                productImageUrl: formData.productImageUrl?.trim() || null,
                productModel: formData.productModel?.trim() || null,
                productAcquisitionPrice: Number(formData.productAcquisitionPrice),
                isDeleted: isEditing ? (existingProduct!.isDeleted ?? false) : false
            };

            // Add discriminator-specific fields, converting to the right JS type
            const typeFields = fields[discriminator] ?? [];
            typeFields.forEach(field => {
                const raw = formData[field.key];

                if (field.type === "checkbox") {
                    product[field.key] = raw ?? false;
                    return;
                }

                if (raw === "" || raw === null || raw === undefined) {
                    product[field.key] = null;
                    return;
                }

                if (field.type === "numeric" || field.type === "decimal") {
                    product[field.key] = Number(raw);
                } else {
                    // text or select (enum name as string)
                    product[field.key] = raw;
                }
            });

            const url = isEditing
                ? `http://localhost:5000/api/inventory/${existingProduct!.productId}`
                : `http://localhost:5000/api/inventory/${discriminator}`;

            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(product)
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            console.log(isEditing ? "Product updated." : "Product added to db.");
            onCustomerCreated();
            
            setFormData({
                name: "",
                brand: "",
                price: "",
                stockAmount: "",
                stockCapacity: "",
                notes: "",
                productAcquisitionPrice: "",
                productImageUrl: "",
                productModel: ""
            });
            setDiscriminator("");
            action();

        } catch (error) {
            console.error("Error saving product:", error);
            alert(isEditing ? "Failed to update product. Please try again." : "Failed to add product. Please try again.");
        }
    }

    const inputMappers: FieldConfig[] = [
        { title: "Product Name", placeholder: "Enter product name...", key: "name", type: "text" },
        { title: "Brand", placeholder: "Enter product brand...", key: "brand", type: "text" },
        { title: "Price", placeholder: "e.g. 200", key: "price", type: "decimal" },
        { title: "Stock to Add", placeholder: "Number of items owned", key: "stockAmount", type: "numeric" },
        { title: "In-Store Stock Capacity", placeholder: "Highest possible in-stock count of the item", key: "stockCapacity", type: "numeric" },
        { title: "Acquisition Price", placeholder: "Product expense", key: "productAcquisitionPrice", type: "decimal" },
        { title: "Model (Optional)", placeholder: "e.g. Pro Staff 97", key: "productModel", type: "text" },
        { title: "Image URL (Optional)", placeholder: "https://...", key: "productImageUrl", type: "text" },
        { title: "Notes (Optional)", placeholder: "Notes about this product", key: "notes", type: "text" }
    ]

    function handleGenericChange(mode: string, key: string, rawValue: string) {
        let value = rawValue;

        if (mode === "numeric") {
            value = value.replace(/\D/g, "");
        }

        if (mode === "decimal") {
            value = value
                .replace(/[^0-9.]/g, "")
                .replace(/(\..*)\./g, "$1");
        }

        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    }

    return (
        <div>
            <div className="formcontainer">

                <div className="productformcontents">

                    <span className='addnewproductspan'>{isEditing ? "Edit Product" : "Create New Product"}</span>
                    
                    <div className="productforminputs">

                    {/* GENERAL UN-NULLABLE PARAMETERS */}
                        <div className='productforminput'>
                            <span>Product Type</span>
                            <select
                                onChange={(e) => setDiscriminator(e.target.value)}
                                value={discriminator}
                                disabled={isEditing}
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
                                    type="text"
                                    maxLength={64}
                                    inputMode={inputMapper.type === "numeric" || inputMapper.type === "decimal" ? "numeric" : "text"}
                                    value={formData[inputMapper.key] ?? ""}
                                    placeholder={inputMapper.placeholder}
                                    onChange={(e) => handleGenericChange(inputMapper.type, inputMapper.key, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                    {/* FIELD SPECIFIC PARAMETERS */}
                        {fields[discriminator] && fields[discriminator].length > 0 && (
                            <div className='forminput forminput--optional-header'>
                                <span>Additional Fields:</span>
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
                                    <span>{field.title}{field.required ? " *" : ""}</span>

                                    {field.type === "select" && (
                                        <select
                                            value={formData[field.key] ?? ""}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                [field.key]: e.target.value
                                            }))}
                                        >
                                            <option value="">Select...</option>
                                            {field.options?.map(opt => (
                                                <option key={opt} value={opt}>{humanize(opt)}</option>
                                            ))}
                                        </select>
                                    )}

                                    {field.type === "checkbox" && (
                                        <input
                                            type="checkbox"
                                            checked={formData[field.key] ?? true}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                [field.key]: e.target.checked
                                            }))}
                                        />
                                    )}

                                    {(field.type === "text" || field.type === "numeric" || field.type === "decimal") && (
                                        <input
                                            type="text"
                                            inputMode={field.type === "numeric" || field.type === "decimal" ? "numeric" : "text"}
                                            value={formData[field.key] ?? ""}
                                            placeholder={field.placeholder}
                                            onChange={(e) => handleGenericChange(field.type, field.key, e.target.value)}
                                        />
                                    )}

                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                    </div>
                
                {/* CHECKOUT BUTTONS */}
                    <div className="productformbuttons">
                        <button 
                            className='addproduct'
                            onClick={handleSubmit}>
                                {isEditing ? "Save Changes" : "Add Product"}
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