import { Mail, Phone } from "lucide-react";
import SupportBox from "./supportbox";
import SupportCall from "./supportcall";

import './appsupport.css'
export default function Support() {
    return (
        <div>

            <div className="pageHeader">
                <h2>Support & Resources</h2>
                <span>Get help and learn more about Tennis CRM</span>
                <hr />
            </div>

            <div className="support">
                <SupportBox
                    icon={Phone}
                    title="Support Line"
                    value="+55 (051) 99516-1556"
                    emptyMessage="No support line provided at this time."
                    additionalInfo="Mon–Fri, 9:00 AM – 5:00 PM"
                />

                <SupportBox
                    icon={Mail}
                    title="General Support and Inquiries"
                    value="sebastianbferrari@gmail.com"
                    emptyMessage="No email support provided at this time."
                    additionalInfo="Responses are typically provided within 24 hours."
                />
                    
            </div>

            <div>
                <SupportCall/>
            </div>
        
        </div>
    );
}