import Image from "next/image";
import { Metadata } from "next";

import profileDefaultImage from "@/assets/images/profile.png";
import { fetchPropertiesByUserId } from "@/lib/data/property-data";
import ProfileProperties from "@/ui/profile/profile-properties";
import { PropertyDocument } from "@/models";
import Breadcrumbs from "@/ui/shared/breadcrumbs";
import { requireSessionUser } from "@/utils/require-session-user";

export const metadata: Metadata = {
    title: "Profile"
}

const ProfilePage = async () => {
    const sessionUser = await requireSessionUser();
    console.log(`>>> PROFILE PAGE: ${sessionUser.email}`);
    const properties: PropertyDocument[] = await fetchPropertiesByUserId(sessionUser.id!);
        
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Profile", href: "/profile", active: true }
                ]}
            />
            <div className="mt-5">
                <div className="container-xl lg:container m-auto">
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 md:mx-5">
                            <h1 className="heading">About me</h1>
                            <div className="rounded-3xl bg-white p-6 shadow-xl mb-4 flex flex-col items-center">
                                <Image
                                    className="size-14 md:size-20 rounded-full mx-auto md:mx-0 mb-2"
                                    src={sessionUser.image || profileDefaultImage}
                                    alt="User"
                                    height={200}
                                    width={200}
                                />
                            <h2>
                                {sessionUser.name}
                            </h2>
                            <h2 className="text-xs">
                                {sessionUser.email}
                            </h2>
                            </div>

                        </div>

                        <div className="md:w-3/4 md:mx-5">
                            <h1 className="heading mt-5 md:mt-0">My listings</h1>
                            {<ProfileProperties properties={properties} />}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
 
export default ProfilePage;