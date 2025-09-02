import { MessageDocument, PropertyDocument } from "@/models";

// TODO: need a cleaner solution
export const toSerializedObject = (object: PropertyDocument | PropertyDocument[] | MessageDocument) => (
    JSON.parse(JSON.stringify(object))
);