import Hero from "@/ui/root/page/hero"
import InfoBoxes from "@/ui/root/page/info-boxes";
import FeaturedProperties from "@/ui/root/page/featured-properties";
import CheckAuthStatus from "@/ui/auth/check-auth-status";

const HomePage = () => {
    return (
        <main>
            <CheckAuthStatus />
            <Hero />
            <FeaturedProperties />
            <InfoBoxes />
        </main>
    );
}

export default HomePage;