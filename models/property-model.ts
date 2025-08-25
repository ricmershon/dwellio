import { Document, Schema, Types, model, models } from "mongoose";

import { PropertyImageData } from "@/types/types";
import { PropertyInputType } from "@/schemas/property-schema";

export interface PropertyDocument extends Omit<PropertyInputType, "imagesData">, Document {
    owner: Types.ObjectId;
    isFeatured?: boolean;
    imagesData?: PropertyImageData[];
    createdAt: Date;
    updatedAt: Date;
}

const ImageSchema = new Schema({
    secureUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    height: { type: Number, required: true },
    width: { type: Number, required: true },
}, { _id: false });

const PropertySchema = new Schema<PropertyDocument>({
    owner: { type: Schema.Types.ObjectId, required: true, ref: "User" },
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
    squareFeet: { type: Number, required: true },
    amenities: [{ type: String }],
    rates: {
        nightly: Number,
        weekly: Number,
        monthly: Number
    },
    sellerInfo: {
        name: String,
        email: String,
        phone: String
    },
    imagesData: {
        type: [ImageSchema],
        required: true,
        validate: {
            validator: (value: PropertyImageData[]) => Array.isArray(value) && value.length > 2,
            message: "At least three images are required.",
        },
    },
    isFeatured: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Property = models.Property || model<PropertyDocument>("Property", PropertySchema);
export default Property;