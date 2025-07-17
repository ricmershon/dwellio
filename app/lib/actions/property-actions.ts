'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Types } from "mongoose";

import dbConnect from "@/app/config/database-config";
import type { ActionState, PropertyImageData } from "@/app/lib/definitions";
import { Property, PropertyDocument, User, UserDocument } from "@/app/models";
import { getSessionUser } from "@/app/utils/get-session-user";
import { uploadImages, destroyImages } from "@/app/lib/cloudinary";
import { toActionState } from "@/app/utils/to-action-state";
import { PropertyInput } from "@/app/schemas/property-schema";
import { buildFormErrorMap } from "@/app/utils/build-form-error-map";

// TODO: Add console logs to catch blocks
// TODO: Add error handling
// TODO: add try catch blocks

/**
 * Creates a new property.
 * 
 * @param {ActionState} _prevState - required by useActionState
 * @param {FormData} formData 
 * @returns Promise<ActionState> - ActionState may include form data in order to
 * repopulate the form if there's an error.
 */
export const createProperty = async (_prevState: ActionState, formData: FormData) => {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
        throw new Error('User ID is required.')
    }

    const rawImages = formData.getAll('images') as File[];
    const images = rawImages.filter(file => file.size > 0);

    const validationResults = PropertyInput.safeParse({
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
        squareFeet: formData.get('squareFeet'),
        amenities: formData.getAll('amenities'),
        rates: {
            nightly: formData.get('rates.nightly'),
            weekly: formData.get('rates.weekly'),
            monthly: formData.get('rates.monthly')
        },
        sellerInfo: {
            name: formData.get('sellerInfo.name'),
            email: formData.get('sellerInfo.email'),
            phone: formData.get('sellerInfo.phone'),            
        },
        imagesData: images
    });

    /**
     * Return immediately if form validation fails.
     */
    if (!validationResults.success) {
        const formErrorMap = buildFormErrorMap(validationResults.error.issues);
        console.log(formErrorMap);
        return {
            formData: formData,
            formErrorMap: formErrorMap
        } as ActionState
    }

    /**
     * Create a property document that includes the data from `validationResults`
     * and removes the `imagesData` field and adds the `owner` field.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { imagesData, ...propertyDataWithoutImages } = validationResults.data;
    const propertyDocument = {
        ...propertyDataWithoutImages
    };
    Object.assign(propertyDocument, { owner: sessionUser.id });

    let newPropertyDocument: PropertyDocument;
    let newImagesData: PropertyImageData[] = [];

    try {
        await dbConnect();
        
        newImagesData = await uploadImages(rawImages);
        Object.assign(propertyDocument, { imagesData: newImagesData });
    
        newPropertyDocument = new Property(propertyDocument);
        await newPropertyDocument.save();
    } catch (error) {
        // Destroy the images just uploaded.
        if (newImagesData.length > 0) {
            destroyImages(newImagesData);
        }

        console.error(`>>> Database error adding a property: ${error}`);

        /**
         * Return form data so the form can be repopulated and the user does
         * not have to re-enter info.
         */
        return toActionState(
            `Failed to add a property: ${error}`,
            'ERROR',
            undefined,
            undefined,
            formData
        );
    }

    redirect(`/properties/${newPropertyDocument._id}`);
}

export const deleteProperty = async (propertyId: string) => {
    await dbConnect();

    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    const property: PropertyDocument | null = await Property.findById(propertyId);
    if (!property) {
        return toActionState('Property not found.', 'ERROR');
    }

    // Verify ownwership
    if (property.owner.toString() !== sessionUser.id) {
        return toActionState('Not authorized to delete peoperty.', 'ERROR');
    }

    destroyImages(property.imagesData!);

    await property.deleteOne();

    revalidatePath('/profile');
    return toActionState('Property successfully deleted.', 'SUCCESS');
}

// TODO: Form validation
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

    const property: PropertyDocument | null = await Property.findById(propertyId);
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
        squareFeet: formData.get('squareFeet'),
        amenities: formData.getAll('amenities'),
        rates: {
            nightly: formData.get('rates.nightly'),
            weekly: formData.get('rates.weekly'),
            monthly: formData.get('rates.monthly')
        },
        sellerInfo: {
            name: formData.get('sellerInfo.name'),
            email: formData.get('sellerInfo.email'),
            phone: formData.get('sellerInfo.phone'),            
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

    let user: UserDocument | null;
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

    let user: UserDocument | null;

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