import {
  BadgePercent,
  Building2,
  Image,
  Link as LinkIcon,
  MapPin,
  Settings,
  Share2,
  Truck,
} from "lucide-react";
import GeneralSettings from "./components/GeneralSettings";
import BrandingSettings from "./components/BrandingSettings";
import LocationSettings from "./components/LocationSettings";
import DeliverySettings from "./components/DeliverySettings";
import DiscountSettings from "./components/DiscountSettings";
import BranchSettings from "./components/BranchSettings";
import PublicLinksSettings from "./components/PublicLinksSettings";
import SocialMediaSettings from "./components/SocialMediaSettings";

export const SETTINGS_SECTIONS = [
  {
    id: "general",
    labelKey: "settings_center.nav.general",
    descriptionKey: "settings_center.general.short",
    icon: Settings,
    component: GeneralSettings,
    restaurantOnly: true,
  },
  {
    id: "branding",
    labelKey: "settings_center.nav.branding",
    descriptionKey: "settings_center.branding.short",
    icon: Image,
    component: BrandingSettings,
    restaurantOnly: true,
  },
  {
    id: "location",
    labelKey: "settings_center.nav.location",
    descriptionKey: "settings_center.location.short",
    icon: MapPin,
    component: LocationSettings,
    restaurantOnly: true,
  },
  {
    id: "delivery",
    labelKey: "settings_center.nav.delivery",
    descriptionKey: "settings_center.delivery.short",
    icon: Truck,
    component: DeliverySettings,
    restaurantOnly: true,
  },
  {
    id: "discounts",
    labelKey: "settings_center.nav.discounts",
    descriptionKey: "settings_center.discounts.short",
    icon: BadgePercent,
    component: DiscountSettings,
    restaurantOnly: true,
  },
  {
    id: "branch",
    labelKey: "settings_center.nav.branch",
    descriptionKey: "settings_center.branch.short",
    icon: Building2,
    component: BranchSettings,
  },
  {
    id: "public-links",
    labelKey: "settings_center.nav.public_links",
    descriptionKey: "settings_center.public_links.short",
    icon: LinkIcon,
    component: PublicLinksSettings,
    restaurantOnly: true,
  },
  {
    id: "social",
    labelKey: "settings_center.nav.social",
    descriptionKey: "settings_center.social.short",
    icon: Share2,
    component: SocialMediaSettings,
    restaurantOnly: true,
  },
];

export const getSettingsSections = (branchOnly) =>
  SETTINGS_SECTIONS.filter((section) => !(branchOnly && section.restaurantOnly));
