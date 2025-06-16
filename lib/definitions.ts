export interface Property {
    _id: string;
    owner: string;
    name: string;
    type: string;
    description: string;
    location: {
        street: string;
        city: string;
        state: string;
        zipcode: string;
    };
    beds: number;
    baths: number;
    square_feet: number;
    amenities: Array<string>;
    rates: {
        nightly?: number;
        weekly?: number;
        monthly?: number
    };
    seller_info: {
      name: string;
      email: string;
      phone: string;
    };
    images: Array<string>;
    is_featured: boolean;
    createdAt: string;
    updatedAt: string;
}