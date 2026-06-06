import { useState } from "react";
import InventoryTable from "./inventoryTable";
import './inventory.css'
import { balls, clothing, grips, rackets, shoes, strings, other } from "./InventoryProps";

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
                    products={rackets}/>
                )}

                {activeTab === "Strings" && (
                   <InventoryTable
                    products={strings}/>
                )}

                {activeTab === "Grips" && (
                   <InventoryTable
                    products={grips}/>
                )}

                {activeTab === "Clothing" && (
                   <InventoryTable
                    products={clothing}/>
                )}

                {activeTab === "Shoes" && (
                   <InventoryTable
                    products={shoes}/>
                )}

                {activeTab === "Balls" && (
                   <InventoryTable
                    products={balls}/>
                )}

                {activeTab === "Other" && (
                   <InventoryTable
                    products={other}/>
                )}
            </div>
        </div>
    );
}