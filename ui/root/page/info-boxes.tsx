import InfoBox from "@/ui/root/page/info-box";

const InfoBoxes = () => (
    <section className="mt-8">
        <div className="container-xl lg:container m-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoBox
                    headingText="For Renters"
                    backgroundColor="bg-gray-100"
                    buttonInfo={{
                        link: "/properties",
                        styles: "bg-black hover:bg-gray-700",
                        text: "Browse Properties"
                    }}
                >
                    <p className="text-sm">
                        Find your dream rental property. Favorite properties and contact owners.
                    </p>
                </InfoBox>
                <InfoBox
                    headingText="For Property Owners"
                    backgroundColor="bg-blue-100"
                    buttonInfo={{
                        link: "/properties/add",
                        styles: "bg-blue-500 hover:bg-blue-600",
                        text: "Add Property"
                    }}
                >
                    <p className="text-sm">
                        Log in and rent your property.
                    </p>
                </InfoBox>
            </div>
        </div>
    </section>
);
 
export default InfoBoxes;