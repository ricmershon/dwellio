"use client";

import { useActionState, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { LuRefreshCw } from "react-icons/lu";
import clsx from "clsx";

import { PropertyDocument } from "@/models";
import { ActionState } from "@/types/types";
import { createMessage } from "@/lib/actions/message-actions";
import { toast } from "react-toastify";
import Input from "@/ui/shared/input";
import InputErrors from "@/ui/shared/input-errors";

interface PropertyContactFormProps {
    property: PropertyDocument
    userName: string | null | undefined;
    userEmail: string | null | undefined
}

const PropertyContactForm = ({ property, userName, userEmail }: PropertyContactFormProps) => {
    const [actionState, formAction, isPending] = useActionState(createMessage, {} as ActionState);

    /**
     * Toast message for success or error.
     */
    useEffect(() => {
        if (actionState.status) {
            toast[actionState.status](actionState.message);
        }
    }, [actionState]);
    
    return (
        <>
            <div className="bg-white p-4 rounded-md shadow-xl">
                <h3 className="mb-2 text-md text-gray-700">Contact Property Manager</h3>
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
                        id="name"
                        name="name"
                        type="text"
                        label="Name"
                        placeholder="Enter your name"
                        labelSize="text-sm"
                        defaultValue={(userName! || actionState.formData?.get("name") || "") as string}
                        errors={actionState.formErrorMap?.name}
                    />

                    <Input
                        inputType="input"
                        id="email"
                        name="email"
                        type="tel"
                        label="Email"
                        labelSize="text-sm"
                        placeholder="Enter your email"
                        defaultValue={(userEmail! || actionState.formData?.get("email") || "") as string}
                        errors={actionState.formErrorMap?.email}
                    />

                    <Input
                        inputType="input"
                        id="phone"
                        name="phone"
                        type="tel"
                        label="Phone"
                        labelSize="text-sm"
                        placeholder="Enter your phone number"
                        defaultValue={(actionState.formData?.get("phone") || "") as string}
                        errors={actionState.formErrorMap?.phone}
                    />

                    <Input
                        inputType="textarea"
                        id="body"
                        name="body"
                        label="Message"
                        labelSize="text-sm"
                        placeholder="Enter your message"
                        defaultValue={(actionState.formData?.get("body") || "") as string}
                        errors={actionState.formErrorMap?.body}
                    />
                    {actionState.formErrorMap && Object.keys(actionState.formErrorMap).length > 0 && <InputErrors />}
                    <div>
                        <button
                        className={clsx(
                            "flex gap-1 btn btn-primary w-full justify-center",
                            {
                                "hover:cursor-not-allowed": isPending,
                                "hover:cursor-pointer": !isPending
                            }
                        )}
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <LuRefreshCw className="btn-pending-icon icon-spin"/>
                            ) : (
                                <FaPaperPlane className="mr-2" />
                            )}
                            Send Message
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
 
export default PropertyContactForm;