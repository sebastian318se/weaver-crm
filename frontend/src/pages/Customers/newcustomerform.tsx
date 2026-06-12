import './newcustomerform.css'

export default function NewCustomerBox(){

    const inputMappers = [
        {
            title: "Full Name",
            inputinfo: "John Smith"
        },
        {
            title: "Email",
            inputinfo: "john@email.com"
        },
        {
            title: "Phone",
            inputinfo: "(123) 1234-5678"
        },
        {
            title: "Notes (Optional)",
            inputinfo: "Preferred string tension, etc."
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
                                <input placeholder={inputMapper.inputinfo} />
                            </div>
                        ))}

                    </div>

                    <div className="formbuttons">
                        <button className='addcustomer'>Add Customer</button>
                        <button className='cancel'>Cancel</button>
                    </div>

                </div>
            </div>
        </div>
    );
}