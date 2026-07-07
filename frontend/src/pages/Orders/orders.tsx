import SalesTable from "./salesTable";
import { useEffect, useState } from "react";
import './orders.css'
import LookupTable from "../../components/lookuptable";
import SjTable from "./sjTable";
import NewSaleBox from "./newsaleform";
import NewSjBox from "./neworderform";

type ProductProps = {
    productId: number,
    productName: string,
    productQuantity: number,
    productPrice: number
}

interface SaleItem {
    productId: number;
    productQuantity: number;
}

interface Customer {
    customerId: number;
    customerName: string;
}

interface Sale {
    orderId: number;
    customerId: number;
    customer: Customer | null;
    orderPrice: number;
    status: number;
    createdAt: string;
    completedAt: string | null;
    isDeleted: boolean;
    saleItems: SaleItem[];
}

interface StringJob{

}

export default function Orders() {

    const [activeTab, setActiveTab] = useState("orderstab");

    const [sales, setSales] = useState<Sale[]>([]);

    const [showNewSaleBox, setShowNewSaleBox] = useState(false);
    const fetchSales = async () => {
        const response = await fetch("http://localhost:5000/api/sales");
        const data = await response.json();

        setSales(data);
    }
    useEffect(() => {
        fetchSales();
    }, []);



    const [stringjobs, setStringjobs] = useState<StringJob[]>([]);
    const fetchStringJob = async () => {
        const response = await fetch("http://localhost:5000/api/strung");
        const data = await response.json();

        setStringjobs(data);
    }
    useEffect(() => {
        fetchStringJob();
    }, []);



    return (
        <div>
            <div className="pageHeader">
                <h2>Order History</h2>
                <span>Manage current and past stringjobs and orders</span>
                <hr />
            </div>
            
            <div>
                <div className="ordersmargin">
                    <div className="tabButtons">
                        <button
                            className={activeTab === "orderstab" ? "tabactive" : "tab"}
                            onClick={() => setActiveTab("orderstab")}>
                                Orders
                        </button>

                        <button 
                            className={activeTab === "salestab" ? "tabactive" : "tab"}
                            onClick={() => setActiveTab("salestab")}>
                                Sales
                        </button>

                    </div>

                    <br />
                </div>
                {activeTab === "orderstab" && (
                    <div>
                        <div className={`newsalediv ${showNewSaleBox ? "open" : ""}`}>
                            <NewSjBox
                                action={() => setShowNewSaleBox(prev => !prev)}
                                onSaleCreated={fetchSales}
                            />
                        </div>

                        <div className="ordersmargin">
                            <div className="salescontainer">
                                
                                <LookupTable
                                    onEntryCreated={fetchSales}
                                    action={() => setShowNewSaleBox(prev => !prev)}/>

                                <div className="sjgrid">

                                    {stringjobs.map((job) => (
                                        <SjTable
                                        key={job.orderId}
                                        {...job}/>
                                    ))}

                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "salestab" && (
                    <div>
                        <div className={`newsalediv ${showNewSaleBox ? "open" : ""}`}>
                            <NewSaleBox
                                action={() => setShowNewSaleBox(prev => !prev)}
                                onSaleCreated={fetchSales}
                            />
                        </div>
                        <div className="ordersmargin">
                            <div className="salescontainer">

                                    <LookupTable
                                        action={()=> setShowNewSaleBox(prev => !prev)}
                                        onEntryCreated={fetchSales}/>
        
                            
                                <div className="salesgrid">

                                    {/* POPULATE THIS (throughout project)*/}
                                    {sales.length <= 0 && (<p>Nothing</p>)}
                                  
                                    {sales.map((sale) => (
                                        <SalesTable
                                            key={sale.orderId}
                                            {...sale}
                                        />
                                    ))}
                
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}