'use client';

import { useSession } from "next-auth/react";

import PropertyContactForm from "@/ui/properties/id/contact-form";
import { PropertyDocument } from "@/models";

const PropertyPageAside = ({ property }: { property: PropertyDocument }) => {
    const { data: session } = useSession();

    /**
     * Display favorite button only if a user is logged in. Display contact form
     * only if a user is logged in and the property owner is not the user.
     */
    return (
        <aside>
            {session && session.user.id !== property.owner.toString() && (
                <PropertyContactForm
                    property={property}
                    userName={session.user.name}
                    userEmail={session.user.email}
                />
            )}
        </aside>
    );
}
 
export default PropertyPageAside;