import { z } from 'zod';

const PropertyTypesEnum = z.enum([
    'Apartment',
    'Cabin',
    'Condo',
    'Cottage',
    'House',
    'Room',
    'Studio',
    'Other'
]);

const USstateCodes = z.enum([
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
    'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
], {
    message: 'Enter a United States two letter state code.'
});

const USzipCode = z.string()
    .regex(/^\d{5}(-\d{4})?$/, { message: 'Invalid ZIP code format.' });

export const RatesSchema = z.object({
    nightly: z.number().optional(),
    weekly: z.number().optional(),
    monthly: z.number().optional()
})
    .refine(
        (rates) => rates.nightly != null || rates.weekly != null || rates.monthly != null,
        { message: 'At least one rate (nightly, weekly, or monthly) must be provided.' }
    );

export const PropertyInputSchema = z.object({
    name: z.string()
        .min(10, { message: 'Name must be at least 10 characters long.' }),
    type: PropertyTypesEnum,
    description: z.string()
        .min(20, { message: 'Description must be at least 20 characters long.' })
        .optional(),
    location: z.object({
        street: z.string()
            .min(10, { message: 'Street must be at least 10 characters long.' }),
        city: z.string()
            .min(2, { message: 'Street must be at least 2 characters long.' }),
        state: USstateCodes,
        zipcode: USzipCode
    }),
    beds: z.number()
        .gt(0, { message: 'Property must have at least one bed.' }),
    baths: z.number()
        .gt(0, { message: 'Property must have at least one bath.' }),
    square_feet: z.number()
        .gt(250, { message: 'Property must have at least 250 square feet.' }),
    amenities: z.array(z.string())
        .min(5, { message: 'Please select at least 5 amenities.' }),
    rates: RatesSchema,
    seller_info: z.object({
        name: z.string()
            .min(5, { message: 'Name must be at least 5 characters.' }),
        email: z.email({ message: 'Enter a valid email address.' }),
        phone: z.string()
    }),
    imagesData: z.array(z.instanceof(File))
        .min(1, { message: 'Please select at least one image.' })
});

export type PropertyInput = z.infer<typeof PropertyInputSchema>;