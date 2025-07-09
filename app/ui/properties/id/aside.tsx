'use client';

import { useSession } from "next-auth/react";

import BookmarkPropertyButton from "@/app/ui/properties/id/bookmark-button";
import ShareButtons from "@/app/ui/properties/id/share-buttons";
import PropertyContactForm from "@/app/ui/properties/id/contact-form";
import { PropertyDocument } from "@/app/models";

interface PropertyPageAsideProps {
    property: PropertyDocument;
    propertyId: string;
}
const PropertyPageAside = ({ property, propertyId }: PropertyPageAsideProps) => {
    const { data: session } = useSession();

    /**
     * Display bookmark button only if a user is logged in. Display contact form
     * only if a user is logged in and the property owner is not the user.
     */
    return (
        <aside className="space-y-4">
            {session && <BookmarkPropertyButton propertyId={propertyId} />}
            <ShareButtons property={property} />
            {session && session.user.id !== property.owner.toString() && (
                <PropertyContactForm property={property} />
            )}
        </aside>
    );
}
 
export default PropertyPageAside;