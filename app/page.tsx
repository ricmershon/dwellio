import Hero from "@/app/ui/root/page/hero"
import InfoBoxes from "@/app/ui/root/page/info-boxes";
import FeaturedProperties from "@/app/ui/root/page/featured-properties";

const HomePage = () => {
    return (
        <main>
            <Hero />
            <FeaturedProperties />
            <InfoBoxes />
        </main>
    );
}

export default HomePage;