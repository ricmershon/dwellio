'use client';

import { useSession } from "next-auth/react";

import BookmarkPropertyButton from "@/app/ui/properties/id/bookmark-button";
import ShareButtons from "@/app/ui/properties/id/share-buttons";
import PropertyContactForm from "@/app/ui/properties/id/contact-form";
import { PropertyInterface } from "@/app/models";

interface PropertyPageAsideProps {
    property: PropertyInterface;
    propertyId: string;
}
const PropertyPageAside = ({ property, propertyId }: PropertyPageAsideProps) => {
    const { data: session } = useSession();

    return (
        <aside className="space-y-4">
            <BookmarkPropertyButton propertyId={propertyId} />
            <ShareButtons property={property} />
            {session?.user.id !== property.owner.toString() && (
                <PropertyContactForm property={property} />
            )}
        </aside>
    );
}
 
export default PropertyPageAside;