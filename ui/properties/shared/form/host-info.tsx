import { useSession } from "next-auth/react";

import { ActionState } from "@/types/types";
import FormErrors from "@/ui/shared/form-errors";
import { PropertyDocument } from "@/models";

interface HostInfoProps {
    actionState: ActionState;
    property?: PropertyDocument;
}
const HostInfo = ({ actionState, property }: HostInfoProps) => {
    const { data: session } = useSession();

    return (
        <div className="mb-4">
            <h2 className="block text-gray-700 font-bold mb-1">
                Host Information
            </h2>
            <div className="mb-3">
                <label
                    htmlFor="seller_name"
                    className="block text-sm text-gray-500 medium"
                >
                    Name
                </label>
                <input
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                    type="text"
                    id='seller_name'
                    name="sellerInfo.name"
                    placeholder="Name"
                    defaultValue={
                        (actionState.formData?.get("sellerInfo.name") || (
                            property ? property.sellerInfo.name : session?.user.name
                        )) as string
                    }                    
                    aria-describedby="seller_name-error"
                />
                {actionState.formErrorMap?.sellerInfo?.name &&
                    <FormErrors
                        errors={actionState.formErrorMap?.sellerInfo?.name}
                        id='seller_name'
                    />
                }
            </div>
            <div className="flex flex-wrap">
                <div className="w-full sm:w-1/2 mb-2 sm:mb-0 sm:pr-2">
                    <label
                        htmlFor="seller_email"
                        className="block text-sm text-gray-500 medium"
                    >
                        Email
                    </label>
                    <input
                        className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                        type="email"
                        id='seller_email'
                        name="sellerInfo.email"
                        placeholder="Email"
                        defaultValue={
                            (actionState.formData?.get("sellerInfo.email") || (
                                property ? property.sellerInfo.email : session?.user.email
                            )) as string
                        }                    
                        aria-describedby="seller_email-error"
                    />
                    {actionState.formErrorMap?.sellerInfo?.email &&
                        <FormErrors
                            errors={actionState.formErrorMap?.sellerInfo?.email}
                            id='seller_email'
                        />
                    }
                </div>
                <div className="w-full sm:w-1/2 sm:pl-2">
                    <label
                        htmlFor="seller_phone"
                        className="block text-sm text-gray-500 medium"
                    >
                        Phone
                    </label>
                    <input
                        className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                        type="tel"
                        id='seller_phone'
                        name="sellerInfo.phone"
                        defaultValue={
                            (actionState.formData?.get("sellerInfo.phone") || (
                                property ? property.sellerInfo.phone : ""
                            )) as string
                        }                    
                        aria-describedby="seller_phone-error"
                    />
                    {actionState.formErrorMap?.sellerInfo?.phone &&
                        <FormErrors
                            errors={actionState.formErrorMap?.sellerInfo?.phone}
                            id='seller_phone'
                        />
                    }
                </div>
            </div>
        </div>        
    );
}
export default HostInfo;