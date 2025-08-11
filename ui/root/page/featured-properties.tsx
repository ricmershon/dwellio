import PropertiesList from "@/ui/properties/properties-list";
import { getViewportWidth } from "@/utils/get-viewport-width";

const FeaturedProperties = async () => {
    const viewportWidth = await getViewportWidth();

    return (
    <>
        <h1 className="heading">Featured Properties</h1>
        <PropertiesList featured={true} viewportWidth={viewportWidth} />
    </>
)
}
export default FeaturedProperties;