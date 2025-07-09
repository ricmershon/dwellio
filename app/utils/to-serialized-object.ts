import { MessageDocument, PropertyDocument } from "@/app/models";

// TODO: need a cleaner solution
export const toSerializedOjbect = (object: PropertyDocument | MessageDocument) => (
    JSON.parse(JSON.stringify(object))
);