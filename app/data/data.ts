interface Amenity {
    id: string,
    value: string
}

export const Amenities: Amenity[] = [
    {
        id: 'wifi',
        value: 'WiFi',
    },
    {
        id: 'kitchen',
        value: 'Full kitchen',
    },
    {
        id: 'washer_dryer',
        value: 'Washer & Dryer',
    },
    {
        id: 'free_parking',
        value: 'Free Parking',
    },
    {
        id: 'pool',
        value: 'Swimming Pool',
    },
    {
        id: 'hot_tub',
        value: 'Hot Tub',
    },
    {
        id: 'beach_access',
        value: 'Beach Access',
    },
    {
        id: '24_7_security',
        value: '24/7 Security',
    },
    {
        id: 'wheelchair_accessible',
        value: 'Wheelchair Accessible',
    },
    {
        id: 'elevator_access',
        value: 'Elevator Access',
    },
    {
        id: 'dishwasher',
        value: 'Dishwasher',
    },
    {
        id: 'gym_fitness_center',
        value: 'Gym/Fitness Center',
    },
    {
        id: 'air_conditioning',
        value: 'Air Conditioning',
    },
    {
        id: 'balcony_patio',
        value: 'Balcony/Patio',
    },
    {
        id: 'smart_tv',
        value: 'Smart TV',
    },
    {
        id: 'high_speed_internet',
        value: 'High-Speed Internet',
    },
    {
        id: 'outdoor_grill_barbecue',
        value: 'Outdoor Grill/BBQ',
    },
    {
        id: 'coffee_maker',
        value: 'Coffee Maker',
    },
];

export const PropertyTypes = [
    { value: 'Apartment', label: 'Apartment'},
    { value: 'Cabin', label: 'Cabin'},
    { value: 'Condo', label: 'Condo'},
    { value: 'Cottage', label: 'Cottage'},
    { value: 'House', label: 'House'},
    { value: 'Room', label: 'Room'},
    { value: 'Studio', label: 'Studio'},
    { value: 'Other', label: 'Other'}
];