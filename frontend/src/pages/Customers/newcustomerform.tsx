import { useState } from 'react';
import './newcustomerform.css'

type customerBoxProps = {
    action: () => void;
    onCustomerCreated: () => void;
}

export default function NewCustomerBox({action, onCustomerCreated} : customerBoxProps){

    const [name, setName] = useState<string | null>(null);
    const [phone, setPhone] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [notes, setNotes] = useState<string | null>(null);

    async function handleSubmit() {
        const customer = {
            customerName: name,
            customerPhone: phone,
            customerEmail: email,
            customerNotes: notes
        };

        const response = await fetch("http://localhost:5000/api/customers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(customer)
        });

        if (response.ok) {
            console.log("Customer added to db.");
        }

        onCustomerCreated();
        setName(null); setPhone(null); setEmail(null); setNotes(null);
        action();
    }

    const inputMappers = [
        {
            title: "Full Name",
            inputinfo: "John Smith",
            setter: setName,
            value: name
        },
        {
            title: "Email",
            inputinfo: "john@email.com",
            setter: setPhone,
            value: phone
        },
        {
            title: "Phone",
            inputinfo: "(123) 1234-5678",
            setter: setEmail,
            value: email
        },
        {
            title: "Notes (Optional)",
            inputinfo: "Preferred string tension, etc.",
            setter: setNotes,
            value: notes
        }
    ]

    return (
        <div>
            <div className="formcontainer">

                <div className="formcontents">

                    <span className='addnewspan'>Add New Customer</span>
                    
                    <div className="forminputs">

                        {inputMappers.map(inputMapper => (
                            <div className="forminput">
                                <span>{inputMapper.title}</span>
                                <input 
                                    value={inputMapper.value ?? ""}
                                    placeholder={inputMapper.inputinfo}
                                    onChange={(e) => inputMapper.setter(e.target.value)}
                                />
                            </div>
                        ))}

                    </div>

                    <div className="formbuttons">
                        <button 
                            className='addcustomer'
                            onClick={handleSubmit}>
                                Add Customer
                            </button>
                        <button 
                            className='cancel'
                            onClick={action}>
                                Cancel
                            </button>
                    </div>

                </div>
            </div>
        </div>
    );
}