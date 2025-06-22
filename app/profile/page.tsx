import Image from "next/image";

import profileDefaultImage from '@/assets/images/profile.png';
import { getSessionUser } from "@/app/utils/get-session-user";
import { fetchPropertiesByUserId } from "@/app/lib/data";
import ProfileProperties from "@/app/components/ProfileProperties";
import { PropertyInterface } from "@/app/models";

const ProfilePage = async () => {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required')
    }

    const properties = await fetchPropertiesByUserId(sessionUser.id);

    /**
     * An object passed from a server component to a client component must be a plain
     * object. Convert the Mongoose document to a plain object before passing to
     * client component.
     */
    const plainProperties: Array<PropertyInterface> = JSON.parse(JSON.stringify(properties));
        
    return (
        <main>
            <section className="bg-blue-50">
                <div className="container m-auto py-24">
                    <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
                        <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/4 mx-20 mt-10">
                                <div className="mb-4">
                                    <Image
                                        className="h-32 w-32 md:h-48 md:w-48 rounded-full mx-auto md:mx-0"
                                        src={sessionUser.image || profileDefaultImage}
                                        alt="User"
                                        height={200}
                                        width={200}
                                    />
                                </div>

                                <h2 className="text-2xl mb-4">
                                    <span className="font-bold block">Name: </span>
                                    {sessionUser.name}
                                </h2>
                                <h2 className="text-2xl">
                                    <span className="font-bold block">Email: </span>
                                    {sessionUser.email}
                                </h2>
                            </div>

                            <div className="md:w-3/4 md:pl-4">
                                <h2 className="text-xl font-semibold mb-4">Your Listings</h2>
                                {<ProfileProperties properties={plainProperties} />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
 
export default ProfilePage;