import { ActionState } from "@/types/types";
import Input from "@/ui/shared/input";

const ListNameAndDescription = ({ actionState }: { actionState: ActionState }) => (
    <>
        <Input
            inputType="input"
            id="name"
            name="name"
            type="text"
            label="Listing Name"
            placeholder="e.g., Beautiful Apartment in Miami"
            defaultValue={(actionState.formData?.get("name") || "") as string}
            errors={actionState.formErrorMap?.name}
        />
        <Input
            inputType="textarea"
            id="description"
            name="description"
            label="Description"
            placeholder="Add a description of your property"
            defaultValue={(actionState.formData?.get("description") || "") as string}
            errors={actionState.formErrorMap?.description}
        />
    </>
);
 
export default ListNameAndDescription;