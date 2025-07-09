import { Document, Schema, Types, model, models } from 'mongoose';

import { ImageData, Rates } from '@/app/lib/definitions';

export interface PropertyDocument extends Document {
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
    imagesData: ImageData[];
    is_featured?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ImagesSchema = new Schema({
  secureUrl: { type: String, required: true },
  publicId: { type: String, required: true }
}, { _id: false });

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
    imagesData: {
      type: [ImagesSchema],
      required: true,
      validate: {
        validator: function (value: any[]) {
          return Array.isArray(value) && value.length > 0;
        },
        message: 'At least one image is required in imagesData.',
      },
    },
    is_featured: { type: Boolean, default: false }
}, {
    timestamps: true
});

// delete models.Property;
const Property = models.Property || model<PropertyDocument>('Property', PropertySchema);
export default Property;