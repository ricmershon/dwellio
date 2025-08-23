import { z } from "zod";

const PropertyTypesEnum = z.enum([
    "Apartment",
    "Cabin",
    "Chalet",
    "Condo",
    "Cottage",
    "House",
    "Room",
    "Studio",
    "Other"
], {
    message: "Select a property type."
});

const USstateCodes = z.enum([
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
    "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
    "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
    "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
], {
    message: "Enter a United States two letter state code."
});

const USzipCode = z.string()
    .regex(/^\d{5}(-\d{4})?$/, { message: "Invalid ZIP code format." });

const RateField = (label: string, minValue: number) => z.string()
    .trim()
    .transform((value) => (value === "" ? undefined : Number(value)))
    .refine((value) => value === undefined || !isNaN(value), {
        message: `${label} must be a number.`,
    })
    .refine((value) => value === undefined || value >= minValue, {
        message: `${label} must be at least $${minValue}.`,
    });

const RatesSchema = z.object({
    nightly: RateField("Nightly rate", 200),
    weekly: RateField("Weekly rate", 1000),
    monthly: RateField("Monthly rate", 3200),
}).refine(
    (rates) =>
        rates.nightly !== undefined ||
        rates.weekly !== undefined ||
        rates.monthly !== undefined,
    {
        message: "At least one rate must be provided.",
        path: [], // attach error to the whole object
    }
);


export const PropertyInput = z.object({
    name: z.string()
        .min(10, { message: "Name must be at least 10 characters long." }),
    type: PropertyTypesEnum,
    description: z.string()
        .min(20, { message: "Description must be at least 20 characters long." })
        .optional(),
    location: z.object({
        street: z.string()
            .min(10, { message: "Street must be at least 10 characters long." }),
        city: z.string()
            .min(2, { message: "City must be at least 2 characters long." }),
        state: USstateCodes,
        zipcode: USzipCode
    }),
    beds: z.coerce.number()
        .gt(0, { message: "Property must have at least one bed." }),
    baths: z.coerce.number()
        .gt(0, { message: "Property must have at least one bath." }),
    squareFeet: z.coerce.number()
        .gt(249, { message: "Property must have at least 250 square feet." }),
    amenities: z.array(z.string())
        .min(5, { message: "Select at least 5 amenities." }),
    rates: RatesSchema,
    sellerInfo: z.object({
        name: z.string()
            .min(5, { message: "Name must be at least 5 characters." }),
        email: z.email({ message: "Enter a valid email address." }),
        phone: z.string().nonempty({ message: "Phone number is required." })
    }),
    imagesData: z.array(z.instanceof(File))
        .min(5, { message: "Select at least five images." })
        .max(10, { message: "You can upload a maximum of 10 images."})
});

// Property Info specific schema for react-hook-form
export const PropertyInfoSchema = z.object({
    name: z.string()
        .min(10, { message: "Name must be at least 10 characters long." }),
    type: PropertyTypesEnum,
    description: z.string()
        .min(20, { message: "Description must be at least 20 characters long." })
        .optional(),
});

// Specs specific schema for react-hook-form
export const SpecsSchema = z.object({
    beds: z.coerce.number()
        .gt(0, { message: "Property must have at least one bed." }),
    baths: z.coerce.number()
        .gt(0, { message: "Property must have at least one bath." }),
    squareFeet: z.coerce.number()
        .gt(249, { message: "Property must have at least 250 square feet." }),
});

export type PropertyInputType = z.infer<typeof PropertyInput>;
export type PropertyInfoType = z.infer<typeof PropertyInfoSchema>;
export type SpecsType = z.infer<typeof SpecsSchema>;