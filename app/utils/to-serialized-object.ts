import { MessageInterface, PropertyInterface } from "@/app/models";

// TODO: need a cleaner solution
export const toSerializedOjbect = (object: PropertyInterface | MessageInterface) => (
    JSON.parse(JSON.stringify(object))
);