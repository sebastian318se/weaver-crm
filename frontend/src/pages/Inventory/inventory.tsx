import LookupTable from "../../components/lookuptable";
import InventoryTable from "./inventoryTable";
import NewProductBox from "./newproductform";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import './inventory.css'

interface Product {
    productId: number;
    productName: string;
    productBrand: string;
    productPrice: number;
    
    productStockAmount: number;
    productStockCapacity: number;
    lastModified: string;
    isDeleted?: boolean;
    notes?: string;
    productAcquisitionPrice?: number;
    [key: string]: any;
}

export default function Inventory() {

    const { getToken } = useAuth();

    const [activeTab, setActiveTab] = useState("Rackets");
    const tabs = [
        "Rackets",
        "Strings",
        "Grips",
        "Clothing",
        "Shoes",
        "Balls",
        "Other"
    ]

    // Maps each tab to its POST/discriminator value, used for both creating and editing
    const tabDiscriminatorMap: Record<string, string> = {
        Rackets: "racket",
        Strings: "string",
        Grips: "grip",
        Clothing: "clothing",
        Shoes: "shoes",
        Balls: "balls",
        Other: "other"
    };

    const [rackets, setRackets] = useState<Product[]>([]);
    const [strings, setStrings] = useState<Product[]>([]);
    const [grips, setGrips] = useState<Product[]>([]);
    const [clothing, setClothing] = useState<Product[]>([]);
    const [shoes, setShoes] = useState<Product[]>([]);
    const [balls, setBalls] = useState<Product[]>([]);
    const [other, setOther] = useState<Product[]>([]);

    // Holds tab-filtered search matches; null means "no active search, show full tab list"
    const [searchResults, setSearchResults] = useState<Product[] | null>(null);

    const fetchMappers = [
        {
            tab: "Rackets",
            apilink: "${API_URL}/api/inventory/racket",
            data: rackets,
            setter: setRackets
        },
        {
            tab: "Strings",
            apilink: "${API_URL}/api/inventory/string",
            data: strings,
            setter: setStrings
        },
        {
            tab: "Grips",
            apilink: "${API_URL}/api/inventory/grip",
            data: grips,
            setter: setGrips
        },
        {
            tab: "Clothing",
            apilink: "${API_URL}/api/inventory/clothing",
            data: clothing,
            setter: setClothing
        },
        {
            tab: "Shoes",
            apilink: "${API_URL}/api/inventory/shoe",
            data: shoes,
            setter: setShoes
        },
        {
            tab: "Balls",
            apilink: "${API_URL}/api/inventory/ball",
            data: balls,
            setter: setBalls
        },
        {
            tab: "Other",
            apilink: "${API_URL}/api/inventory/other",
            data: other,
            setter: setOther
        }
    ]

    // Get data for active tab
    const fetchProducts = async () => {

        const token = await getToken({
            template: "api"
        });

        // Find active tab to use parameter
        const activeMapper = fetchMappers.find(
            mapper => mapper.tab === activeTab
        );

        if (!activeMapper) return;

        const response = await fetch(activeMapper.apilink, {
            headers:{
                Authorization: `Bearer ${token}`
            }
        });
        const data: Product[] = await response.json();

        activeMapper.setter(data);
    };

    // Searches globally, then narrows results down to whatever belongs to the active tab
    const searchProducts = async (query: string) => {

        const token = await getToken({
            template: "api"
        });

        if (!query.trim()) {
            setSearchResults(null);
            return;
        }

        const activeMapper = fetchMappers.find(
            mapper => mapper.tab === activeTab
        );

        if (!activeMapper) return;

        const response = await fetch(`${API_URL}/api/inventory/search?query=${encodeURIComponent(query)}`, {
            headers:{
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // No match (404) or bad query (400) — treat as empty result set
            setSearchResults([]);
            return;
        }

        const data: Product[] = await response.json();

        // Endpoint searches all categories, so keep only items also present in this tab's fetched list
        const tabIds = new Set(activeMapper.data.map(p => p.productId));
        setSearchResults(data.filter(p => tabIds.has(p.productId)));
    };

    // Re-render component of the tab with the proper parameters
    useEffect(() => {
        fetchProducts();
        setSearchResults(null); // Clear any active search when switching tabs
        // Re-render whenever activeTab
    }, [activeTab]);

    const [newProductForm, setNewProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Fetch active tab
    const activeMapper = fetchMappers.find(
        mapper => mapper.tab === activeTab
    );

    // Use search results when a search is active, otherwise the full tab list
    const sourceProducts = searchResults !== null
        ? searchResults
        : (activeMapper ? activeMapper.data : []);

    // Define most recent entries (16) for active tab
    const sortedProducts = [...sourceProducts]
        .sort(
            (a, b) =>
                new Date(b.lastModified).getTime() -
                new Date(a.lastModified).getTime()
        )
        .slice(0, 16);

    const handleCloseForm = () => {
        setNewProductForm(false);
        setEditingProduct(null);
    };

    const handleEdit = (productId: number) => {
        // Look up in the active tab's full fetched list (not the sliced/sorted view)
        // so we have every field, including type-specific ones
        const target = activeMapper?.data.find(p => p.productId === productId);
        if (!target) return;

        setEditingProduct(target);
        setNewProductForm(true);
    };

    const handleDelete = async (productId: number) => {

        const token = await getToken({
            template: "api"
        });

        const target = activeMapper?.data.find(p => p.productId === productId);
        if (!target) return;

        const confirmed = window.confirm(`Delete ${target.productName}? The entry will become unavailable if you do.`);
        if (!confirmed) return;

        // Send the full existing product back (with isDeleted flipped) since
        // PutItem's SetValues overwrites every field with what's in the body
        const payload = {
            discriminator: tabDiscriminatorMap[activeTab],
            ...target,
            isDeleted: true
        };

        const response = await fetch(`${API_URL}/api/inventory/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            fetchProducts();
        }
    };

    return (
        <div>
            <div className="pageHeader">
                <h2>Inventory Management</h2>
                <span>Manage all store equipment and products</span>
                <hr />
            </div>

            <div className="inventorypage">
                <div className={`newproductdiv ${newProductForm ? "open" : ""}`}>
                    <NewProductBox
                        action={handleCloseForm}
                        onCustomerCreated={fetchProducts}
                        existingProduct={editingProduct}
                        existingProductType={editingProduct ? tabDiscriminatorMap[activeTab] : undefined}
                    />
                </div>
                
                <div className="inventory">
                    <div className="tabButtons">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                className={activeTab === tab ? "inventorytabactive" : "inventorytab"}
                                onClick={() => setActiveTab(tab)}>
                                    {tab}
                                </button>
                        ))}
                    </div>

                    <br />

                    {activeMapper && (
                        <div>
                            <LookupTable
                                action={() => {
                                    setEditingProduct(null); // Never open "Add New" with a stale edit loaded
                                    setNewProductForm(prev => !prev);
                                }}
                                onEntryCreated={fetchProducts}
                                onSearch={searchProducts}
                            />

                            {sortedProducts.length === 0 ? (
                                <div className="unpopulated">
                                    <span>
                                        There are no products of this category yet. Click add new to get started!
                                    </span>
                                </div>
                            ) : (
                                <InventoryTable
                                    products={sortedProducts}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            )}
                        </div>
    )}

                </div>
            </div>
        </div>
    );
}