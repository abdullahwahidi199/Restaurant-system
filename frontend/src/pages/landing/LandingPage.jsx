import { useTranslation } from "react-i18next";
import AnalyticsSection from "../../component/landing/AnalyticsSection";
import FAQSection from "../../component/landing/FAQSection";
import FeaturesSection from "../../component/landing/FeaturesSection";
import FinalCTASection from "../../component/landing/FinalCTASection";
import HeroSection from "../../component/landing/HeroSection";
import HowItWorksSection from "../../component/landing/HowItWorksSection";
import LandingFooter from "../../component/landing/LandingFooter";
import LandingNavbar from "../../component/landing/LandingNavbar";
import PricingSection from "../../component/landing/PricingSection";
import ProblemSolutionSection from "../../component/landing/ProblemSolutionSection";
import ProductShowcaseSection from "../../component/landing/ProductShowcaseSection";
import QRMenuSection from "../../component/landing/QRMenuSection";
import SolutionsSection from "../../component/landing/SolutionsSection";
import TrustSection from "../../component/landing/TrustSection";
import WhyPakhlaiSection from "../../component/landing/WhyPakhlaiSection";
import "../../styles/landing.css";

function LandingPage() {
  const { i18n } = useTranslation();
  const direction = i18n.dir(i18n.language);

  return (
    <div
      className="landing-page min-h-screen w-full bg-white text-slate-900"
      dir={direction}
    >
      <LandingNavbar />
      <main>
        <HeroSection />
        <TrustSection />
        <FeaturesSection />
        <QRMenuSection />
        <AnalyticsSection />
        <SolutionsSection />
        <PricingSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
