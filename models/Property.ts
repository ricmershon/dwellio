import { Document, Schema, Types, model, models } from 'mongoose';
import { UserInterface } from './User';

export interface PropertyInterface extends Document {
    _id: Types.ObjectId;
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
    is_featured: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PropertySchema = new Schema({
    _id: Schema.Types.ObjectId,
    owner: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String  },
    location: {
        street: String,
        city: String,
        state: String,
        zipcode: String
    },
    beds: { type: Number, required: true },
    baths: { type: Number, required: true },
    square_feet: { type: Number, required: true },
    amenities: [{ type: String }],
    rates: {
        nightly: Number,
        weekly: Number,
        monthly: Number
    },
    seller_info: {
        name: String,
        email: String,
        phone: String
    },
    images: [{ type: String }],
    is_featured: { type: Boolean, default: false }
}, {
    timestamps: true
});

// export const Property = models.Property || model('Property', PropertySchema);

export const Property = models.Property || model<PropertyInterface>('Property', PropertySchema);