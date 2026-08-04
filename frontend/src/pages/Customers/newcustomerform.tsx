import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import './newcustomerform.css'

type ExistingCustomer = {
    customerId: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
};

type customerBoxProps = {
    action: () => void;
    onCustomerCreated: () => void;
    existingCustomer?: ExistingCustomer | null;
}

export default function NewCustomerBox({action, onCustomerCreated, existingCustomer} : customerBoxProps){

    const [name, setName] = useState<string | null>(null);
    const [phone, setPhone] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [notes, setNotes] = useState<string | null>(null);

    const isEditing = existingCustomer != null;

    const { getToken } = useAuth();

    // Pre-fill fields whenever we're handed a customer to edit (or reset when cleared)
    useEffect(() => {
        if (existingCustomer) {
            setName(existingCustomer.customerName ?? null);
            setEmail(existingCustomer.customerEmail ?? null);
            setPhone(existingCustomer.customerPhone ?? null);
        } else {
            setName(null); setEmail(null); setPhone(null); setNotes(null);
        }
    }, [existingCustomer]);

    async function handleSubmit() {
        const customer = {
            customerName: name,
            customerPhone: phone,
            customerEmail: email,
            customerNotes: notes,
            isDeleted: false
        };

        const token = await getToken({
            template: "api"
        });

        const url = isEditing
            ? `https://weavercrm.com/api/customers/${existingCustomer!.customerId}`
            : "https://weavercrm.com/api/customers";

        const response = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(customer)
        });

        if (response.ok) {
            console.log(isEditing ? "Customer updated." : "Customer added to db.");
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
            setter: setEmail,
            value: email
        },
        {
            title: "Phone",
            inputinfo: "(123) 1234-5678",
            setter: setPhone,
            value: phone
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
                    <span className='addnewspan'>{isEditing ? "Edit Customer" : "Add New Customer"}</span>
                    <div className="forminputs">
                        {inputMappers.map(inputMapper => (
                            <div className="forminput" key={inputMapper.title}>
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
                            {isEditing ? "Save Changes" : "Add Customer"}
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