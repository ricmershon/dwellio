'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Types } from "mongoose";

import dbConnect from "@/app/config/database-config";
import type { ActionState, PropertyImageData } from "@/app/lib/definitions";
import { uploadImages, destroyImages } from "@/app/lib/cloudinary";
import { getSessionUser } from "@/app/utils/get-session-user";
import { toActionState } from "@/app/utils/to-action-state";
import { buildFormErrorMap } from "@/app/utils/build-form-error-map";
import { Property, PropertyDocument, User, UserDocument } from "@/app/models";
import { PropertyInput } from "@/app/schemas/property-schema";

// FIXME: fix difference between property id types
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

/**
 * Deletes a property.
 * 
 * @param {string} propertyId - id of the property to be deleted.
 * @returns Promise<ActionState>
 */
export const deleteProperty = async (propertyId: string) => {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    /**
     * Confirm properties existence and verify ownwerhip.
     */
    const property: PropertyDocument | null = await Property.findById(propertyId);
    if (!property) {
        return toActionState('Property not found.', 'ERROR');
    }

    if (property.owner.toString() !== sessionUser.id) {
        return toActionState('Not authorized to delete peoperty.', 'ERROR');
    }

    try {
        await dbConnect();

        destroyImages(property.imagesData!);
        await property.deleteOne();
    } catch (error) {
        console.error(`>>> Database error deleting a property: ${error}`);
        
        return toActionState(
            `Failed to add a property: ${error}`,
            'ERROR',
            undefined,
            undefined
        );
    }

    revalidatePath('/profile');
    return toActionState('Property successfully deleted.', 'SUCCESS');
}

/**
 * Updates a property.
 * 
 * @param {string} propertyId 
 * @param {ActionState} _prevState - required by useActionState
 * @param {FormData} formData 
 * @returns Promise<ActionState> - ActionState may include form data in order to
 * repopulate the form if there's an error.
 */
export const updateProperty = async (
    propertyId: string,
    _prevState: ActionState,
    formData: FormData
) => {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    /**
     * Confirm property's existence and verify ownership.
     */
    const property: PropertyDocument | null = await Property.findById(propertyId);
    if (!property) {
        return toActionState('Property not found.', 'ERROR');
    }

    if (property.owner.toString() !== sessionUser.id) {
        return toActionState('Not authorized to update property.', 'ERROR');
    }

    /**
     * Remove `imagesData` from the data validation, extract property data and
     * update property.
     */
    const UpdateProperty = PropertyInput.omit({ imagesData: true });
    const validationResults = UpdateProperty.safeParse({
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
    });

    /**
     * Return immediately if form validation fails.
     */
    if (!validationResults.success) {
        const formErrorMap = buildFormErrorMap(validationResults.error.issues);
        return {
            formData: formData,
            formErrorMap: formErrorMap
        } as ActionState
    }

    try {
        await dbConnect();

        await Property.findByIdAndUpdate(propertyId, validationResults.data);
    } catch (error) {
        console.error(`>>> Database error updating a property: ${error}`);

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

    revalidatePath('/', 'layout');
    redirect(`/properties/${propertyId}`);
}

/**
 * Sets favorite on a property.
 * 
 * @param {string} propertyId 
 * @returns Promise<ActionState>
 */
export const favoriteProperty = async (propertyId: string) => {
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
        console.error(`>>> Database error finding user: ${error}`);
        return toActionState(
            `Error finding user: ${error}`,
            'ERROR',
        );
    }

    const isFavorite = user.favorites.includes(propertyObjectId);

    try {
        let updatedUser;

        if (isFavorite) {
            updatedUser = await User.updateOne(
                { _id: user._id },
                { $pull: { favorites: propertyId } }
            );
            actionState = {
                message: 'Removed from favorites',
                status: 'SUCCESS',
                isFavorite: false
            }
        } else {
            updatedUser = await User.updateOne(
                { _id: user._id },
                { $push: { favorites: propertyId } }
            );
            actionState = {
                message: 'Added to favorites',
                status: 'SUCCESS',
                isFavorite: true
            }
        }
        if (updatedUser.modifiedCount !== 1) {
            console.error(`>>> Database error favoriting property`);
            return toActionState('Error favoriting property', 'ERROR');
        }
    } catch (error) {
        console.error(`>>> Database error favoriting property: ${error}`)
        return toActionState(`Error favoriting property`, 'ERROR');
    }

    revalidatePath('/properties/favorites', 'page');
    return actionState;
}

/**
 * Gets favorite status for a property.
 * 
 * @param {string} propertyId - property on which favorite is being set or unset.
 * @returns Promise<ActionState>
 */
export const getFavoriteStatus = async (propertyId: string) => {
    const propertyObjectId = new Types.ObjectId(propertyId);
    
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }
    
    let user: UserDocument | null;
    
    try {
        await dbConnect();
        user = await User.findById(sessionUser.id);
        if (!user) {
            return toActionState('User not found.', 'ERROR');
        } 
    } catch (error) {
        console.error(`>>> Database error finding user: ${error}`)
        return toActionState(
            `Error finding user: ${error}`,
            'ERROR',
        );
    }

    const isFavorite = user.favorites.includes(propertyObjectId);

    return toActionState('Successfully fetched favorites status', 'SUCCESS', isFavorite);
}