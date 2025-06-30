export const toSerializedOjbect = (object) => (
    JSON.parse(JSON.stringify(object))
);