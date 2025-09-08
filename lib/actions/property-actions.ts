"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Types, startSession } from "mongoose";

import dbConnect from "@/lib/db-connect";
import { ActionStatus, type ActionState, type PropertyImageData } from "@/types";
import { uploadImages, destroyImages } from "@/lib/data/images-data";
import { toActionState } from "@/utils/to-action-state";
import { buildFormErrorMap } from "@/utils/build-form-error-map";
import { Property, PropertyDocument, User, UserDocument } from "@/models";
import { PropertyInput } from "@/schemas/property-schema";
import { requireSessionUser } from "@/utils/require-session-user";

// FIXME: fix difference between property id types
/**
 * Creates a new property.
 * 
 * @param {ActionState} _prevState - required by useActionState
 * @param {FormData} formData 
 * @returns Promise<ActionState> - ActionState may include form data in order to
 * repopulate the form if there"s an error.
 */
export const createProperty = async (_prevState: ActionState, formData: FormData) => {
    const sessionUser = await requireSessionUser();

    const rawImages = formData.getAll("images") as File[];
    const images = rawImages.filter(file => file.size > 0);

    const validationResults = PropertyInput.safeParse({
        type: formData.get("type"),
        name: formData.get("name"),
        description: formData.get("description"),
        location: {
            street: formData.get("location.street"),
            city: formData.get("location.city"),
            state: formData.get("location.state"),
            zipcode: formData.get("location.zipcode"),
        },
        beds: formData.get("beds"),
        baths: formData.get("baths"),
        squareFeet: formData.get("squareFeet"),
        amenities: formData.getAll("amenities"),
        rates: {
            nightly: formData.get("rates.nightly"),
            weekly: formData.get("rates.weekly"),
            monthly: formData.get("rates.monthly")
        },
        sellerInfo: {
            name: formData.get("sellerInfo.name"),
            email: formData.get("sellerInfo.email"),
            phone: formData.get("sellerInfo.phone"),            
        },
        imagesData: images
    });

    /**
     * Return immediately if form validation fails.
     */
    if (!validationResults.success) {
        const formErrorMap = buildFormErrorMap(validationResults.error.issues);
        return toActionState({
            formData: formData,
            formErrorMap: formErrorMap
        });
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
        return toActionState({
            message: `Failed to add a property: ${error}`,
            status: ActionStatus.ERROR,
            formData: formData
        });
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
    await requireSessionUser();

    /**
     * Confirm properties existence and verify ownwerhip.
     */
    await dbConnect();
    const property: PropertyDocument | null = await Property.findById(propertyId);
    if (!property) {
        return toActionState({
            status: ActionStatus.ERROR,
            message: "Property not found."
        });
    }

    const session = await startSession();

    try {
        await dbConnect();
        
        // Get the property and delete images from assets database.
        const property: PropertyDocument | null = await Property.findById(propertyId);
        if (!property) {
            return toActionState({
                status: ActionStatus.ERROR,
                message: "Property not found."
            });
        }
        destroyImages(property.imagesData!);

        session.startTransaction();

        const _id = new Types.ObjectId(propertyId);

        // Delete property
        const deleted = await Property.findByIdAndDelete(_id, { session });
        if (!deleted) {
            throw new Error("Property not found");
        }

        // Remove property ID from all users" favorites
        await User.updateMany(
            { favorites: _id },
            { $pull: { favorites: _id } },
            { session }
        );

        // Commit the transaction
        await session.commitTransaction();
    } catch (error) {
        console.error(`>>> Database error deleting a property: ${error}`);
        
        // Roll back changes after error
        await session.abortTransaction();
        return toActionState({
            status: ActionStatus.ERROR,
            message:  `Failed to delete property: ${error}`
        });
    } finally {
        session.endSession();
    }

    revalidatePath("/profile");
    return toActionState({
        status: ActionStatus.SUCCESS,
        message: "Property successfully deleted."
    });
}

/**
 * Updates a property.
 * 
 * @param {string} propertyId 
 * @param {ActionState} _prevState - required by useActionState
 * @param {FormData} formData 
 * @returns Promise<ActionState> - ActionState may include form data in order to
 * repopulate the form if there"s an error.
 */
export const updateProperty = async (
    propertyId: string,
    _prevState: ActionState,
    formData: FormData
) => {
    const sessionUser = await requireSessionUser();

    /**
     * Confirm property"s existence and verify ownership.
     */
    await dbConnect();
    const property: PropertyDocument | null = await Property.findById(propertyId);
    if (!property) {
        return toActionState({
            status: ActionStatus.ERROR,
            message: "Property not found."
        });
    }

    if (property.owner.toString() !== sessionUser.id) {
        return toActionState({
            status: ActionStatus.ERROR,
            message: "Not authorized to update property."
        });
    }

    /**
     * Remove `imagesData` from the data validation, extract property data and
     * update property.
     */
    const UpdateProperty = PropertyInput.omit({ imagesData: true });
    const validationResults = UpdateProperty.safeParse({
        type: formData.get("type"),
        name: formData.get("name"),
        description: formData.get("description"),
        location: {
            street: formData.get("location.street"),
            city: formData.get("location.city"),
            state: formData.get("location.state"),
            zipcode: formData.get("location.zipcode"),
        },
        beds: formData.get("beds"),
        baths: formData.get("baths"),
        squareFeet: formData.get("squareFeet"),
        amenities: formData.getAll("amenities"),
        rates: {
            nightly: formData.get("rates.nightly"),
            weekly: formData.get("rates.weekly"),
            monthly: formData.get("rates.monthly")
        },
        sellerInfo: {
            name: formData.get("sellerInfo.name"),
            email: formData.get("sellerInfo.email"),
            phone: formData.get("sellerInfo.phone"),            
        }
    });

    /**
     * Return immediately if form validation fails.
     */
    if (!validationResults.success) {
        const formErrorMap = buildFormErrorMap(validationResults.error.issues);
        return toActionState({
            formData: formData,
            formErrorMap: formErrorMap
        })
    }

    try {
        await Property.findByIdAndUpdate(propertyId, validationResults.data);
    } catch (error) {
        console.error(`>>> Database error updating a property: ${error}`);

        /**
         * Return form data so the form can be repopulated and the user does
         * not have to re-enter info.
         */
        return toActionState({
            status: ActionStatus.ERROR,
            message: `Failed to add a property: ${error}`,
            formData: formData
        });
    }

    revalidatePath("/", "layout");
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
    
    const sessionUser = await requireSessionUser();
    
    let user: UserDocument | null;
    let actionState: ActionState;
    
    try {
        await dbConnect();
        user = await User.findById(sessionUser.id);
        if (!user) {
            return toActionState({
                status: ActionStatus.ERROR,
                message: "User not found."
            });
        } 
    } catch (error) {
        console.error(`>>> Database error finding user: ${error}`);
        return toActionState({
            status: ActionStatus.ERROR,
            message: `Error finding user: ${error}`
        });
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
                message: "Removed from favorites",
                status: ActionStatus.SUCCESS,
                isFavorite: false
            }
        } else {
            updatedUser = await User.updateOne(
                { _id: user._id },
                { $push: { favorites: propertyId } }
            );
            actionState = {
                message: "Added to favorites",
                status: ActionStatus.SUCCESS,
                isFavorite: true
            }
        }
        if (updatedUser.modifiedCount !== 1) {
            console.error(`>>> Database error favoriting property`);
            return toActionState({
                status: ActionStatus.ERROR,
                message: "Error favoriting property"
            });
        }
    } catch (error) {
        console.error(`>>> Database error favoriting property: ${error}`)
        return toActionState({
            status: ActionStatus.ERROR,
            message: `Error favoriting property`
        });
    }

    revalidatePath("/properties/favorites", "page");
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
    
    const sessionUser = await requireSessionUser();
    
    let user: UserDocument | null;
    
    try {
        await dbConnect();
        user = await User.findById(sessionUser.id);
        if (!user) {
            return toActionState({
                status: ActionStatus.ERROR,
                message: "User not found."
            });
        } 
    } catch (error) {
        console.error(`>>> Database error finding user: ${error}`)
        return toActionState({
            status: ActionStatus.ERROR,
            message: `Error finding user: ${error}`,
        });
    }

    const isFavorite = user.favorites.includes(propertyObjectId);

    return toActionState({
        status: ActionStatus.SUCCESS,
        message: "Successfully fetched favorites status",
        isFavorite: isFavorite
    });
}