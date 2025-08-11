import Hero from "@/ui/root/page/hero"
import InfoBoxes from "@/ui/root/page/info-boxes";
import FeaturedProperties from "@/ui/root/page/featured-properties";

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