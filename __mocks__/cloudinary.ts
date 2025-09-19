export const v2 = {
    config: jest.fn(),
    uploader: {
        upload: jest.fn().mockResolvedValue({
            secure_url: 'https://mock-cloudinary-url.com/image.jpg',
            public_id: 'mock-public-id'
        }),
        destroy: jest.fn().mockResolvedValue({ result: 'ok' })
    }
}