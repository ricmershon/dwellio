import { Document, Schema, Types, model, models } from 'mongoose';

export interface Rates {
    nightly?: number;
    weekly?: number;
    monthly?: number
}

export interface PropertyInterface extends Document {
    owner: Types.ObjectId;
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
    amenities?: string[];
    rates: Rates;
    seller_info: {
        name: string;
        email: string;
        phone: string
    };
    images: string[];
    is_featured?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PropertySchema = new Schema({
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

const Property = models.Property || model<PropertyInterface>('Property', PropertySchema);
export default Property;