import PropertiesList from "@/app/ui/properties/properties-list";

const FeaturedProperties = async () => (
    <>
        <h2 className="mb-4 text-xl font-bold">Featured Properties</h2>
        <PropertiesList featured={true} />
    </>
)

export default FeaturedProperties;