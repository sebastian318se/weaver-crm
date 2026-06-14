import { useEffect, useState } from "react";
import InventoryTable from "./inventoryTable";
import './inventory.css'

interface Product {
    productId: number;
    productName: string;
    productBrand: string;
    productPrice: number;
    
    productStockAmount: number;
    productStockCapacity: number;
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

    const fetchMappers = [
        {
            tab: "Rackets",
            apilink: "http://localhost:5000/api/inventory/rackets",
            data: rackets,
            setter: setRackets
        },
        {
            tab: "Strings",
            apilink: "http://localhost:5000/api/inventory/strings",
            data: strings,
            setter: setStrings
        },
        {
            tab: "Grips",
            apilink: "http://localhost:5000/api/inventory/grips",
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
            apilink: "http://localhost:5000/api/inventory/shoes",
            data: shoes,
            setter: setShoes
        },
        {
            tab: "Balls",
            apilink: "http://localhost:5000/api/inventory/balls",
            data: balls,
            setter: setBalls
        },
        {
            tab: "Other",
            apilink: "http://localhost:5000/api/inventory/misc",
            data: other,
            setter: setOther
        }
    ]

    // Re-render component of the tab with the proper parameters
    useEffect(() => {

        // Find active tab to use parameter
        const activeMapper = fetchMappers.find(
            mapper => mapper.tab === activeTab
        );

        if (!activeMapper) return;

        // Get data for active tab
        const fetchProducts = async () => {
            const response = await fetch(activeMapper.apilink);
            const data: Product[] = await response.json();

            activeMapper.setter(data);
        };

        fetchProducts();

        // Re-render whenever activeTab
    }, [activeTab]);

    return (
        <div>
            <div className="pageHeader">
                <h2>Inventory Management</h2>
                <span>Manage all store equipment and products</span>
                <hr />
            </div>
            <div className="inventory">
                <div className="tabButtons">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            className={activeTab === tab ? "tabactive" : "tab"}
                            onClick={() => setActiveTab(tab)}>
                                {tab}
                            </button>
                    ))}
                </div>

                <br />

                {fetchMappers.map((fetchMapper) => 
                    activeTab === fetchMapper.tab ? (
                        <InventoryTable
                            key={fetchMapper.tab}
                            products={fetchMapper.data}
                        />
                    ) : null
                )}

            </div>
        </div>
    );
}