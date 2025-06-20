import { Document, Types } from 'mongoose';

export interface PropertyInterface extends Document {
    owner: UserInterface;
    name: string;
    type: string;
    description?: string;
    location: {
        street: string;
        city: string;
        state: string;
        zipcode: string
    };
    beds: number;
    baths: number;
    square_feet: number;
    amenities?: Array<string>;
    rates: {
        nightly?: number;
        weekly?: number;
        monthly?: number
    };
    seller_info: {
        name: string;
        email: string;
        phone: string
    };
    images: Array<string>;
    is_featured?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PropertyInterfaceWithId extends PropertyInterface {
    _id: Types.ObjectId
}
export interface UserInterface extends Document {
    username: string;
    email: string;
    image: string;
    bookmarks: Array<PropertyInterface>
}

export type ActionState = {
    message?: string | null;
    status?: 'SUCCESS' | 'ERROR' | null
}