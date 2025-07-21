'use client';

import { useActionState, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";

import { PropertyDocument } from "@/app/models";
import { ActionState } from "@/app/lib/definitions";
import { createMessage } from "@/app/lib/actions/message-actions";
import { toast } from "react-toastify";
import Input from "@/app/ui/shared/input";

interface PropertyContactFormProps {
    property: PropertyDocument
    userName: string | null | undefined;
    userEmail: string | null | undefined
}

const PropertyContactForm = ({ property, userName, userEmail }: PropertyContactFormProps) => {
    const [actionState, formAction, isPending] = useActionState(createMessage, {} as ActionState);

    /**
     * Toast message for error.
     */
    useEffect(() => {
        if (actionState.status === 'ERROR') {
            toast.error(actionState.message);
        }
    }, [actionState.message, actionState.status]);
    
    return (
        <>
            {actionState.status === 'SUCCESS' ? (
                <p className='text-green-500 mb-4'>Your message has been sent.</p>
                
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="mb-4 text-md text-gray-700">Contact Property Manager</h3>
                    <form action={formAction}>
                        <input
                            type="hidden"
                            id="property"
                            name="property"
                            defaultValue={(property._id as string)}
                        />
                        <input
                            type="hidden"
                            id="recipient"
                            name="recipient"
                            defaultValue={property.owner.toString()}
                        />
                        
                        <Input
                            inputType="input"
                            id='name'
                            name="name"
                            type='text'
                            label="Name"
                            placeholder="Enter your name"
                            labelSize="text-sm"
                            defaultValue={(userName! || actionState.formData?.get("name") || "") as string}
                            errors={actionState.formErrorMap?.name}
                        />

                        <Input
                            inputType="input"
                            id='email'
                            name="email"
                            type='tel'
                            label="Email"
                            labelSize="text-sm"
                            placeholder="Enter your email"
                            defaultValue={(userEmail! || actionState.formData?.get("email") || "") as string}
                            errors={actionState.formErrorMap?.email}
                        />

                        <Input
                            inputType="input"
                            id='phone'
                            name="phone"
                            type='tel'
                            label="Phone"
                            labelSize="text-sm"
                            placeholder="Enter your phone number"
                            defaultValue={(actionState.formData?.get("phone") || "") as string}
                            errors={actionState.formErrorMap?.phone}
                        />

                        <Input
                            inputType="textarea"
                            id='body'
                            name="body"
                            label="Message"
                            labelSize="text-sm"
                            placeholder="Enter your message"
                            defaultValue={(actionState.formData?.get("body") || "") as string}
                            errors={actionState.formErrorMap?.body}
                        />

                        <div>
                            <button
                                className={`flex gap-1 h-10 items-center justify-center rounded-lg w-full bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 ${isPending ? 'hover:cursor-not-allowed' : 'hover:cursor-pointer'}`}
                                type="submit"
                                disabled={isPending}
                            >
                                <FaPaperPlane className="mr-2" />{' '}
                                {isPending ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
 
export default PropertyContactForm;