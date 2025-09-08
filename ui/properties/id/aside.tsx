"use client";

import PropertyContactForm from "@/ui/properties/id/contact-form";
import { PropertyDocument } from "@/models";
import { withAuth, WithAuthProps } from "@/hocs/with-auth";

interface PropertyPageAsidePros extends WithAuthProps {
    property: PropertyDocument;
}

/**
 * Display contact form only if a user is logged in and the property owner
 * is not the user.
 */
const PropertyPageAside = ({ property, session }: PropertyPageAsidePros) => (
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
 
export default withAuth(PropertyPageAside);