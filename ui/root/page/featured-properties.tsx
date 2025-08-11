import PropertiesList from "@/ui/properties/properties-list";

const FeaturedProperties = async () => (
    <>
        <h1 className="heading">Featured Properties</h1>
        <PropertiesList featured={true} />
    </>
)

export default FeaturedProperties;