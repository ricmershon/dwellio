'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Types } from "mongoose";

import dbConnect from "@/app/config/database-config";
import type { ActionState } from "@/app/lib/definitions";
import { Property, PropertyInterface, User, UserInterface } from "@/app/models";
import { getSessionUser } from "@/app/utils/get-session-user";
import cloudinary, { uploadImages } from "@/app/lib/cloudinary";
import { toActionState } from "@/app/utils/to-action-state";

// TODO: Add console logs to catch blocks
// TODO: Add error handling
// TODO: add try catch blocks
/**
 * 
 * 
 * @param formData 
 */
export const createProperty = async (formData: FormData) => {
    await dbConnect();

    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
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

    const propertyImages = await uploadImages((formData.getAll('images') as File[]));
    Object.assign(propertyData, { images: propertyImages });

    const newProprety = new Property(propertyData);
    await newProprety.save();

    revalidatePath('/', 'layout');
    redirect(`/properties/${newProprety._id}`);
}

export const deleteProperty = async (propertyId: string) => {
    await dbConnect();

    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    const property: PropertyInterface | null = await Property.findById(propertyId);
    if (!property) {
        return toActionState('Property not found.', 'ERROR');
    }

    // Verify ownwership
    if (property.owner.toString() !== sessionUser.id) {
        return toActionState('Not authorized to delete peoperty.', 'ERROR');
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
    return toActionState('Property successfully deleted.', 'SUCCESS');
}

// FIXME: Cabin or Cottage being saved CabinorCottage
export const updateProperty = async (
    propertyId: string,
    _prevState: ActionState,
    formData: FormData
) => {
    await dbConnect();
    
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    const property: PropertyInterface | null = await Property.findById(propertyId);
    if (!property) {
        return toActionState('Property not found.', 'ERROR');
    }

    // Verify ownwership
    if (property.owner.toString() !== sessionUser.id) {
        return toActionState('Not authorized to update property.', 'ERROR');
    }

    // Extract updated property data and update property
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

    await Property.findByIdAndUpdate(propertyId, propertyData);

    revalidatePath('/', 'layout');
    redirect(`/properties/${propertyId}`);
}

export const bookmarkProperty = async (propertyId: string) => {
    const propertyObjectId = new Types.ObjectId(propertyId);
    
    await dbConnect();

    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    let user: UserInterface | null;
    let actionState: ActionState;

    try {
        user = await User.findById(sessionUser.id);
        if (!user) {
            return toActionState('User not found.', 'ERROR');
        } 
    } catch (error) {
        throw new Error(`Error finding user: ${error}`);
    }

    const isBookmarked = user.bookmarks.includes(propertyObjectId);

    try {
        let updatedUser;

        if (isBookmarked) {
            updatedUser = await User.updateOne(
                { _id: user._id },
                { $pull: { bookmarks: propertyId } }
            );
            actionState = {
                message: 'Bookmark removed',
                status: 'SUCCESS',
                isBookmarked: false
            }
        } else {
            updatedUser = await User.updateOne(
                { _id: user._id },
                { $push: { bookmarks: propertyId } }
            );
            actionState = {
                message: 'Bookmark added',
                status: 'SUCCESS',
                isBookmarked: true
            }
        }
        if (updatedUser.modifiedCount !== 1) {
            return toActionState('Error updating user', 'ERROR');
        }
    } catch (error) {
        throw new Error(`Error updating user: ${error}`);
    }

    revalidatePath('/properties/bookmarked', 'page');

    return actionState;
}

export const getBookmarkStatus = async (propertyId: string) => {
    const propertyObjectId = new Types.ObjectId(propertyId);
    
    await dbConnect();

    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    let user: UserInterface | null;

    try {
        user = await User.findById(sessionUser.id);
        if (!user) {
            return toActionState('User not found.', 'ERROR');
        } 
    } catch (error) {
        throw new Error(`Error finding user: ${error}`)
    }

    const isBookmarked = user.bookmarks.includes(propertyObjectId);

    return toActionState('Successfully fetched bookmark status', 'SUCCESS', isBookmarked);
}