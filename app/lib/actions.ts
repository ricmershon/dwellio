'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Property } from "@/app/models/property-model";
import { PropertyInterfaceWithId } from "@/app/lib/definitions";
import connectDB from "@/app/config/database-config";
import { getSessionUser } from "@/app/utils/get-session-user";
import cloudinary, { uploadImages } from "@/app/lib/cloudinary";

export const addProperty = async (formData: FormData) => {
    await connectDB();

    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required')
    }

    const propertyData = {
        owner: sessionUser.id,
        type: formData.get('type'),
        name: formData.get('name'),
        description: formData.get('description'),
        location: {
            street: formData.get('location.street'),
            city: formData.get('location.city'),
            state: formData.get('location.state'),
            zipcode: formData.get('location.zipcode'),
        },
        beds: formData.get('beds'),
        baths: formData.get('baths'),
        square_feet: formData.get('square_feet'),
        amenities: formData.getAll('amenities'),
        rates: {
            nightly: formData.get('rates.nightly'),
            weekly: formData.get('rates.weekly'),
            monthly: formData.get('rates.monthly')
        },
        seller_info: {
            name: formData.get('seller_info.name'),
            email: formData.get('seller_info.email'),
            phone: formData.get('seller_info.phone'),            
        }
    }

    const propertyImages = await uploadImages((formData.getAll('images') as Array<File>));
    Object.assign(propertyData, { images: propertyImages });

    const newProprety = new Property(propertyData);
    await newProprety.save();

    revalidatePath('/', 'layout');
    redirect(`/properties/${newProprety._id}`);
}

export const deleteProperty = async (propertyId: string) => {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        return { message: 'User ID is required.', status: 'ERROR' }
    }

    const property: PropertyInterfaceWithId | null = await Property.findById(propertyId);
    if (!property) {
        return { message: 'Property not found.', status: 'ERROR' }
    }

    // Verify ownwership
    if (property.owner.toString() !== sessionUser.id) {
        return { message: 'Not authorized to delete property.', status: 'ERROR' }
    }

    // Extract public ID from image URLs
    const imagePublicIds = property.images.map((imageUrl) => {
        const parts = imageUrl.split('/');
        return parts.at(-1)!.split('.').at(0);
    });

    // Delete images from Cloudinary
    if (imagePublicIds.length > 0) {
        for (const imagePublicId of imagePublicIds) {
            await cloudinary.uploader.destroy(`dwellio/${imagePublicId}`)
        }
    }

    await property.deleteOne();

    revalidatePath('/profile');
    return { message: 'Property successfully deleted.', status: 'SUCCESS' };
}