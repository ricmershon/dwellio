'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import connectDB from "@/app/config/database-config";
import { Property, PropertyInterfaceWithId } from "@/app/models/property-model";
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
        throw new Error('User ID is required')
    }

    const property: PropertyInterfaceWithId | null= await Property.findById(propertyId);
    if (!property) {
        throw new Error('Property not found');
    }

    // Verify ownwership
    if (property.owner.toString() !== sessionUser.id) {
        throw new Error('Not authorized to delete property')
    }

    // Extract public ID from image URLs
    const imagePublicIds = property.images.map((imageUrl) => {
        const parts = imageUrl.split('/');
            return parts.at(-1).split('.').at(0);
    });

    // Delete images from Cloudinary
    if (imagePublicIds.length > 0) {
        for (const imagePublicId of imagePublicIds) {
            await cloudinary.uploader.destroy(`dwellio/${imagePublicId}`)
        }
    }

    await property.deleteOne();

    revalidatePath('/', 'layout')
}