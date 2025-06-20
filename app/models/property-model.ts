import { Schema, model, models } from 'mongoose';

import { PropertyInterface } from '@/app/lib/definitions';

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

// export const Property = models.Property || model('Property', PropertySchema);

export const Property = models.Property || model<PropertyInterface>('Property', PropertySchema);