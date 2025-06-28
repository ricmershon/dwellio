import Hero from "@/app/ui/root/page/Hero"
import InfoBoxes from "@/app/ui/root/page/info-boxes";
import HomePageProperties from "@/app/ui/root/page/home-page-properties-list";

const HomePage = () => {
    return (
        <main>
            <Hero />
            <InfoBoxes />
            <HomePageProperties />
        </main>
    );
}

export default HomePage;