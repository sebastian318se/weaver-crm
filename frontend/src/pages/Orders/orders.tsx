import { act, useState } from "react";
import './orders.css'
export default function Orders() {

    const [activeTab, setActiveTab] = useState(1);

    return (
        <div>
            <div className="pageHeader">
                <h2>Order History</h2>
                <span>Manage current and past stringjobs and orders</span>
                < hr/>
            </div>
            
            <div className="orders">
                <div className="tabButtons">
                    <button
                        className={activeTab === 1 ? "tabactive" : "tab"}
                        onClick={() => setActiveTab(1)}>
                            String Jobs
                    </button>

                    <button 
                        className={activeTab === 2 ? "tabactive" : "tab"}
                        onClick={() => setActiveTab(2)}>
                            Orders
                    </button>

                </div>

                <br />
                
                {activeTab === 1 && (
                    <h2>String Jobs</h2>
                )}

                {activeTab === 2 && (
                    <h2>Orders</h2>
                )}
            </div>

        </div>
    );
}