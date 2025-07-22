import { MessageDocument, PropertyDocument } from "@/app/models";

// TODO: need a cleaner solution
export const toSerializedOjbect = (object: PropertyDocument | PropertyDocument[] | MessageDocument) => (
    JSON.parse(JSON.stringify(object))
);