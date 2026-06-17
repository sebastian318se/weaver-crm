import SalesTable from "./salesTable";
import { useEffect, useState } from "react";
import './orders.css'
import LookupTable from "../../components/lookuptable";
import SjTable from "./sjTable";

interface Sale{

}

interface StringJob{

}

export default function Orders() {

    const [activeTab, setActiveTab] = useState("orderstab");
    


    const [sales, setSales] = useState<Sale[]>([]);
    const fetchSales = async () => {
        const response = await fetch("http://localhost:5000/api/sales");
        const data = await response.json();

        setSales(data);
    }
    useEffect(() => {
        fetchSales();
    }, [setSales]);



    const [stringjobs, setStringjobs] = useState<StringJob[]>([]);
    const fetchStringJob = async () => {
        const response = await fetch("http://localhost:5000/api/strung");
        const data = await response.json();

        setStringjobs(data);
    }
    useEffect(() => {
        fetchStringJob();
    }, [setStringjobs]);



    return (
        <div>
            <div className="pageHeader">
                <h2>Order History</h2>
                <span>Manage current and past stringjobs and orders</span>
                <hr />
            </div>
            
            <div className="orders">
                <div className="tabButtons">
                    <button
                        className={activeTab === "orderstab" ? "tabactive" : "tab"}
                        onClick={() => setActiveTab("orderstab")}>
                            String Jobs
                    </button>

                    <button 
                        className={activeTab === "salestab" ? "tabactive" : "tab"}
                        onClick={() => setActiveTab("salestab")}>
                            Sales
                    </button>

                </div>

                <br />
                
                {activeTab === "orderstab" && (

                    <div className="salescontainer">

                        <LookupTable/>

                        <div className="sjgrid">

                            {stringjobs.map((job) => (
                                <SjTable
                                key={job.orderId}
                                {...job}/>
                            ))}

                        </div>
                    </div>
                )}

                {activeTab === "salestab" && (
                    
                    <div className="salescontainer">

                        <LookupTable/>
                    
                        <div className="salesgrid">

                            {sales.map((sale) => (
                                <SalesTable
                                    key={sale.orderId}
                                    {...sale}/>
                            ))}

                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}