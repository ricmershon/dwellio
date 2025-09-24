// Mock for Cloudinary v2 module (external dependency)
export const v2 = {
    config: jest.fn(),
    uploader: {
        upload: jest.fn().mockResolvedValue({
            secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test.jpg',
            public_id: 'test_image',
            width: 1200,
            height: 800,
        }),
        destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    },
    api: {
        delete_resources: jest.fn().mockResolvedValue({ deleted: {} }),
    },
};

const cloudinary = { v2 };
export default cloudinary;