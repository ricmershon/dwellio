'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import connectDB from "@/app/config/database-config";
import { Property } from "@/app/models/property-model";
import { getSessionUser } from "@/app/utils/get-session-user";
import { uploadImages } from "./cloudinary";

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