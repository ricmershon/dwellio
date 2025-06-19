import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImages = async (images: Array<File>) => {
    const imageUrls: Array<string> = [];

    for (const imageFile of images) {
        const imageBuffer = await imageFile.arrayBuffer();
        const imageArray = Array.from(new Uint8Array(imageBuffer));
        const imageData = Buffer.from(imageArray);

        const imageBase64 = imageData.toString('base64');

        const result = await cloudinary.uploader.upload(
            `data:image/png;base64,${imageBase64}`,
           { folder: 'dwellio' }
        );

        imageUrls.push(result.secure_url);
    }
    return imageUrls;
}

export default cloudinary;