import Hero from "@/app/ui/root/page/hero"
import InfoBoxes from "@/app/ui/root/page/info-boxes";
import HomePageProperties from "@/app/ui/root/page/home-page-properties-list";
import FeaturedProperties from "@/app/ui/root/page/featured-properties";

const HomePage = () => {
    return (
        <main>
            <Hero />
            <InfoBoxes />
            <FeaturedProperties />
            <HomePageProperties />
        </main>
    );
}

export default HomePage;