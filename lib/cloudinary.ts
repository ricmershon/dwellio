import { v2 as cloudinary } from 'cloudinary';

import { PropertyImageData } from '@/types/types';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImages = async (images: File[]) => {
    const imagesData: PropertyImageData[] = [];

    for (const imageFile of images) {
        const imageBuffer = await imageFile.arrayBuffer();
        const imageArray = Array.from(new Uint8Array(imageBuffer));
        const imageData = Buffer.from(imageArray);

        const imageBase64 = imageData.toString('base64');

        try {
            const result = await cloudinary.uploader.upload(
                `data:image/png;base64,${imageBase64}`,
               { folder: 'dwellio' }
            );
            imagesData.push({
                secureUrl: result.secure_url,
                publicId: result.public_id
            });
        } catch (error) {
            console.error(`>>> Error uploading images: ${error}`);
            throw new Error(`Error uploading images: ${error}`);
        }
    }
    return imagesData;
}

export const destroyImages = async (imagesData: PropertyImageData[]) => {
    for (const imageData of imagesData) {
        try {
            const response = await cloudinary.uploader.destroy(imageData.publicId);
            if (response.result !== 'ok') {
                throw new Error('Error deleting image');
            }
        } catch (error) {
            console.error(`>>> Error deleting images: ${error}`);
            throw new Error(`Error deleting images: ${error}`);
        }
    }
}

export default cloudinary;