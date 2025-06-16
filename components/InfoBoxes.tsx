import InfoBox from "@/components/InfoBox";

const InfoBoxes = () => (
    <section>
        <div className="container-xl lg:container m-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
                <InfoBox
                    headingText="For Renters"
                    backgroundColor="bg-gray-100"
                    buttonInfo={{
                        link: "/properties",
                        styles: "bg-black hover:bg-gray-700",
                        text: "Browse Properties"
                    }}
                >
                    Find your dream rental property. Bookmark properties and contact owners.
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
                    Find your dream rental property. Bookmark properties and contact owners.
                </InfoBox>
            </div>
        </div>
    </section>
);
 
export default InfoBoxes;