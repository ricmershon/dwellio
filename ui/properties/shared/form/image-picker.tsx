import { useRef, useState, MouseEvent, useEffect } from "react";

import { ActionState, ActionStatus } from "@/types/types";
import FormErrors from "@/ui/shared/form-errors";

const ImagePicker = ({ actionState }: { actionState: ActionState }) => {
    const [imageFiles, setImageFiles] = useState<File[]>()
    const [numImagesSelected, setNumImagesSelected] = useState(0);
    const imagePickerRef = useRef<HTMLInputElement>(null);

    const handleOpenImagePicker = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        imagePickerRef.current?.click();
    }

    const handlePickImages = (event: React.ChangeEvent<HTMLInputElement>) => {
        const imageFilesList = event.target.files;
        if (!imageFilesList || imageFilesList.length === 0) {
            return;
        }

        setImageFiles(Array.from(imageFilesList))
        setNumImagesSelected(imageFilesList.length);
    }

    useEffect(() => {
        const isError = 
            actionState?.status === ActionStatus.ERROR ||
            Boolean(actionState?.formErrorMap);

        if (!isError || !imagePickerRef.current || !imageFiles || imageFiles?.length === 0) {
            return;
        }

        /**
         * Repopulate input with saved File[] DataTransfer
         */
        const dataTransfer = new DataTransfer();
        for (const file of imageFiles) {
            dataTransfer.items.add(file);
        }

        (imagePickerRef.current as HTMLInputElement & {imageFiles: FileList}).files =
            dataTransfer.files;

        setNumImagesSelected(imageFiles.length);
    }, [])


    return (
        <div>
            <label htmlFor="images" className="mb-2 block font-medium text-gray-700">
                Images (minimum 5)
            </label>
            <div className="relative flex flex-1 flex-shrink-0">
                <input
                    type="file"
                    id="images"
                    name="images"
                    className=" w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white text-white"
                    accept="image/*"
                    multiple
                    aria-describedby="images-error"
                    ref={imagePickerRef}
                    onChange={handlePickImages}
                />
                <button
                    id="images-button"
                    className="btn btn-primary text-sm rounded-sm py-1 px-5 absolute left-[6px] top-1/2 -translate-y-1/2"
                    onClick={handleOpenImagePicker}
                >
                    Select Images
                </button>
                <span className="text-sm absolute left-37  top-1/2 -translate-y-1/2">
                    {numImagesSelected > 0 ? `${numImagesSelected} images selected` : "First image selected is main photo"}
                </span>
            </div>
            {actionState.formErrorMap?.imagesData &&
                <FormErrors
                    errors={actionState.formErrorMap.imagesData}
                    id="images"
                />
            }
        </div>
    );
}
 
export default ImagePicker;