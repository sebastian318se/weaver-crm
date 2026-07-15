import { useEffect, useState } from "react";
import InventoryTable from "./inventoryTable";
import './inventory.css'
import LookupTable from "../../components/lookuptable";
import NewProductBox from "./newproductform";

interface Product {
    productId: number;
    productName: string;
    productBrand: string;
    productPrice: number;
    
    productStockAmount: number;
    productStockCapacity: number;
    lastModified: string;
}

export default function Inventory() {

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
            apilink: "http://localhost:5000/api/inventory/racket",
            data: rackets,
            setter: setRackets
        },
        {
            tab: "Strings",
            apilink: "http://localhost:5000/api/inventory/string",
            data: strings,
            setter: setStrings
        },
        {
            tab: "Grips",
            apilink: "http://localhost:5000/api/inventory/grip",
            data: grips,
            setter: setGrips
        },
        {
            tab: "Clothing",
            apilink: "http://localhost:5000/api/inventory/clothing",
            data: clothing,
            setter: setClothing
        },
        {
            tab: "Shoes",
            apilink: "http://localhost:5000/api/inventory/shoe",
            data: shoes,
            setter: setShoes
        },
        {
            tab: "Balls",
            apilink: "http://localhost:5000/api/inventory/ball",
            data: balls,
            setter: setBalls
        },
        {
            tab: "Other",
            apilink: "http://localhost:5000/api/inventory/other",
            data: other,
            setter: setOther
        }
    ]

    // Get data for active tab
    const fetchProducts = async () => {

        // Find active tab to use parameter
        const activeMapper = fetchMappers.find(
            mapper => mapper.tab === activeTab
        );

        if (!activeMapper) return;

        const response = await fetch(activeMapper.apilink);
        const data: Product[] = await response.json();

        activeMapper.setter(data);
    };

    // Searches globally, then narrows results down to whatever belongs to the active tab
    const searchProducts = async (query: string) => {
        if (!query.trim()) {
            setSearchResults(null);
            return;
        }

        const activeMapper = fetchMappers.find(
            mapper => mapper.tab === activeTab
        );

        if (!activeMapper) return;

        const response = await fetch(`http://localhost:5000/api/inventory/search?query=${encodeURIComponent(query)}`);

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
                        action={()=>setNewProductForm(false)}
                        onCustomerCreated={fetchProducts}
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
                                action={() => setNewProductForm(prev => !prev)}
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
                                />
                            )}
                        </div>
    )}

                </div>
            </div>
        </div>
    );
}