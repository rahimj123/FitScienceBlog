import HeroSection from "@/components/home/HeroSection";
import FeaturedArticles from "@/components/home/FeaturedArticles";
import CategoriesSection from "@/components/home/CategoriesSection";
import LatestArticles from "@/components/home/LatestArticles";
import NewsletterSignup from "@/components/home/NewsletterSignup";
import FeaturedInSection from "@/components/home/FeaturedInSection";

const Home = () => {
  return (
    <>
      <HeroSection />
      <FeaturedArticles />
      <CategoriesSection />
      <LatestArticles />
      <NewsletterSignup />
      <FeaturedInSection />
    </>
  );
};

export default Home;
