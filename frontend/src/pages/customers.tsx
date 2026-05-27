import LookupTable from "../components/lookuptable";
import CustomerBox from "../components/customerbox";
import './customers.css'

export default function Customers() {
    return (
        <div>
            <div className="pageHeader">
                <h2>Customer Management</h2>
                <a>Track all customer history and relationships</a>
                <hr />
            </div>
            <div className="customerlookup">
                <LookupTable/>
                <span className="spanTag">Most Recent Customers:</span>
                <CustomerBox
                    name="Sebastian Ferrari"
                    email="sebastianbferrari@gmail.com"
                    phone="(51)12345-1234"
                    metric="$1240"
                    racketsstrung="8"
                    lastvisit="05-25-2026"
                />
                <CustomerBox
                    name="Marcelo Ferrari"
                    email="marcelofavaferrari@gmail.com"
                    phone="(51)12345-1234"
                    metric="$2480"
                    racketsstrung="16"
                    lastvisit="05-26-2026"
                />
            </div>
        </div>
    );
}