import { useState } from "react";
import InventoryTable from "./inventoryTable";
import './inventory.css'


export default function Inventory() {

        const products = [
        {
            id: 1,
            name: "Babolat Pure Aero 98",
            brand: "Babolat",
            price: 305.00,
            stock: 2,
            capacity: 20
        },
        {
            id: 2,
            name: "Wilson Pro Staff 97",
            brand: "Wilson",
            price: 295,
            stock: 15,
            capacity: 20
        },
        {
            id: 3,
            name: "Head Speed Pro 98",
            brand: "Head",
            price: 305,
            stock: 1,
            capacity: 15
        }
    ];


    const [activeTab, setActiveTab] = useState("rackets");
    const tabs = [
        "Rackets",
        "Strings",
        "Grips",
        "Clothing",
        "Shoes",
        "Balls",
        "Other"
    ]
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

                {activeTab === "Rackets" && (
                    <InventoryTable
                    products={products}/>
                )}

                {activeTab === "Strings" && (
                    <h2>Orders</h2>
                )}
            </div>
        </div>
    );
}