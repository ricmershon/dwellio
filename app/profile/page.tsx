import Image from "next/image";
import { Metadata } from "next";
import { cookies } from 'next/headers';

import profileDefaultImage from '@/assets/images/profile.png';
import { getSessionUser } from "@/app/utils/get-session-user";
import { fetchPropertiesByUserId } from "@/app/lib/data/property-data";
import ProfileProperties from "@/app/ui/profile/profile-properties";
import { PropertyDocument } from "@/app/models";
import Breadcrumbs from "@/app/ui/shared/breadcrumbs";

export const metadata: Metadata = {
    title: 'Profile'
}

const ProfilePage = async () => {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    // Read viewport width cookie written by the client to inform server-side logic
    const cookieStore = await cookies();
    const vwCookie = cookieStore.get('vw')?.value;
    const viewportWidth = vwCookie ? Number(vwCookie) : 0;

    const properties: PropertyDocument[] = await fetchPropertiesByUserId(sessionUser.id, viewportWidth);
    // viewportWidth is available here to pass into server-side fetches or tailor queries if needed
        
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Profile', href: '/profile', active: true }
                ]}
            />
            <div className="mt-5">
                <div className="container-xl lg:container m-auto">
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 md:mx-5">
                            <h1 className="text-[20px] font-semibold mb-5">About me</h1>
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
                            <h1 className="mt-5 md:mt-0 text-[20px] font-semibold mb-5">My listings</h1>
                            {<ProfileProperties properties={properties} />}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
 
export default ProfilePage;