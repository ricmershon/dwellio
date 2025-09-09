import { useRef, useState, MouseEvent, useCallback } from "react";

import { ActionState } from "@/types";
import FormErrors from "@/ui/shared/form-errors";

const ImagePicker = ({ actionState }: { actionState: ActionState }) => {
    const [numImagesSelected, setNumImagesSelected] = useState(0);
    const imagePickerRef = useRef<HTMLInputElement>(null);

    const handleOpenImagePicker = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (imagePickerRef.current) {
            imagePickerRef.current.click();
        }
    }, []);

    const handlePickImages = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const imageFiles = event.target.files;
        if (imageFiles && imageFiles.length > 0) {
            setNumImagesSelected(imageFiles.length);
        }
    }, []);

    return (
        <div>
            <label htmlFor="images" className="form-section-label mb-2">
                Images (minimum 3)
            </label>
            <div className="relative flex flex-1 flex-shrink-0">
                <input
                    type="file"
                    id="images"
                    name="images"
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 text-white"
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
                <span className="text-sm absolute left-37 top-1/2 -translate-y-1/2">
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