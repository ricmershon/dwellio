// Test data for property-related tests
const validPropertyFormData = {
    type: "apartment",
    name: "Beautiful Downtown Apartment - Perfect for Your Stay",
    description: "This stunning apartment features modern amenities and is located in the heart of downtown. Perfect for business travelers or vacation stays.",
    location: {
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        zipcode: "10001"
    },
    beds: "2",
    baths: "1",
    squareFeet: "1200",
    amenities: ["wifi", "parking", "air_conditioning", "heating", "kitchen", "laundry"],
    rates: {
        nightly: "250",
        weekly: "1500",
        monthly: "5000"
    },
    sellerInfo: {
        name: "John Doe Property Manager",
        email: "john.doe@example.com",
        phone: "555-123-4567"
    }
};

const mockPropertyDocument = {
    _id: "property123",
    ...validPropertyFormData,
    beds: 2,
    baths: 1,
    squareFeet: 1200,
    rates: {
        nightly: 250,
        weekly: 1500,
        monthly: 5000
    },
    owner: "user123",
    imagesData: []
};

const mockSessionUser = {
    id: "user123",
    email: "test@example.com",
    name: "Test User"
};

export {
    validPropertyFormData,
    mockPropertyDocument,
    mockSessionUser
};