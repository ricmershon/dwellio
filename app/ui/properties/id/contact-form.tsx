'use client';

import { useActionState, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";

import { PropertyInterface } from "@/app/models";
import { ActionState } from "@/app/lib/definitions";
import { createMessage } from "@/app/lib/actions";
import { toast } from "react-toastify";

const PropertyContactForm = ({ property }: { property: PropertyInterface}) => {
    const initialState: ActionState = {};
    const [state, formAction, isPending] = useActionState(createMessage, initialState);

    useEffect(() => {
        if (state.status === 'ERROR') {
            toast.error(state.message);
        } else if (state.status === 'SUCCESS') {
            toast.success(state.message);
        }
    }, [state.message, state.status]);
    
    return (
        <>
            {state.status === 'SUCCESS' ? (
                <p className='text-green-500 mb-4'>Your message has been sent.</p>
                
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-6">Contact Property Manager</h3>
                    <form action={formAction}>
                        <div className="mb-4">
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
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="name"
                            >
                                Name:
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="email"
                            >
                                Email:
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="phone"
                            >
                                Phone:
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="phone"
                                name="phone"
                                type="text"
                                placeholder="Enter your phone number"
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="body"
                            >
                                Message:
                            </label>
                            <textarea
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-44 focus:outline-none focus:shadow-outline"
                                id="body"
                                name="body"
                                placeholder="Enter your message"
                            />
                        </div>
                        <div>
                            <button
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline flex items-center justify-center"
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