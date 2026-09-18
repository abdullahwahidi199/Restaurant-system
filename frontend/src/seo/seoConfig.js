import i18n from "../i18n";export const SITE_URL = "https://pakhlai.com";
export const SITE_NAME = "Pakhlai";
export const COMPANY_NAME = "Asanlink";
export const FOUNDER_NAME = "Abdullah Wahidi";
export const DEFAULT_IMAGE = `${SITE_URL}/images/pakhlai-hero-feast.webp`;
export const CURRENT_YEAR = 2026;

export const ORGANIZATION_DESCRIPTION =
  "Pakhlai helps customers discover restaurants, browse real menus, and order food online, powered by a professional restaurant operations platform.";

export const baseOrganization = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: COMPANY_NAME,
  alternateName: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/rmsLogo.png`,
  description: ORGANIZATION_DESCRIPTION,
  founder: {
    "@type": "Person",
    "@id": `${SITE_URL}/founder#abdullah-wahidi`,
    name: FOUNDER_NAME,
    jobTitle: "Founder and Software Engineer",
    url: `${SITE_URL}/founder`,
  },
};

export const baseFounder = {
  "@type": "Person",
  "@id": `${SITE_URL}/founder#abdullah-wahidi`,
  name: FOUNDER_NAME,
  jobTitle: "Founder and Software Engineer",
  url: `${SITE_URL}/founder`,
  worksFor: {
    "@id": `${SITE_URL}/#organization`,
  },
  founder: {
    "@id": `${SITE_URL}/#organization`,
  },
  knowsAbout: [
    "Restaurant Management System",
    "Cloud software",
    "React",
    "Django",
    "Restaurant operations",
  ],
};

export const baseSoftwareApplication = {
  "@type": "SoftwareApplication",
  "@id": `${SITE_URL}/#software`,
  name: SITE_NAME,
  alternateName: "Pakhlai Restaurant Management System",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Restaurant Management System",
  operatingSystem: "Web",
  url: SITE_URL,
  description: ORGANIZATION_DESCRIPTION,
  creator: {
    "@id": `${SITE_URL}/#organization`,
  },
  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },
};

export const baseWebsite = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },
  about: {
    "@id": `${SITE_URL}/#organization`,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const publicPages = [
  {
    path: "/",
    title: i18n.t("legacy.pakhlai_find_restaurants_order_food_online_d66fe9b9"),
    description:
      i18n.t("legacy.find_restaurants_browse_real_menus_and_order_your_favo_0b8d4c3c"),
    breadcrumbs: [{ name: "Home", path: "/" }],
  },
  {
    path: "/about",
    title: i18n.t("legacy.about_pakhlai_cloud_restaurant_management_system_02a5a865"),
    description:
      i18n.t("legacy.learn_the_story_of_pakhlai_a_restaurant_management_sys_871337dc"),
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ],
  },
  {
    path: "/founder",
    title: i18n.t("legacy.abdullah_wahidi_founder_and_developer_of_pakhlai_68b44003"),
    description:
      i18n.t("legacy.meet_abdullah_wahidi_founder_of_pakhlai_software_engin_b993313e"),
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Founder", path: "/founder" },
    ],
  },
  {
    path: "/privacy",
    title: i18n.t("legacy.privacy_policy_pakhlai_7dd5efde"),
    description:
      i18n.t("legacy.learn_how_pakhlai_handles_customer_delivery_account_an_46b72b8d"),
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Privacy", path: "/privacy" },
    ],
  },
  {
    path: "/terms",
    title: i18n.t("legacy.terms_of_service_pakhlai_5d252d47"),
    description:
      i18n.t("legacy.read_the_terms_for_using_pakhlai_restaurant_discovery__1912f27f"),
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Terms", path: "/terms" },
    ],
  },
];

export const getPageSeo = (pathname) => {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const publicPage = publicPages.find((page) => page.path === normalizedPath);

  if (publicPage) {
    return {
      ...publicPage,
      canonicalPath: publicPage.path,
      robots: "index, follow",
      type: "website",
    };
  }

  if (normalizedPath.startsWith("/menu/")) {
    return {
      title: i18n.t("legacy.restaurant_menu_on_pakhlai_online_menu_and_ordering_37576449"),
      description:
        i18n.t("legacy.view_a_restaurant_menu_powered_by_pakhlai_the_cloud_ba_27aec714"),
      canonicalPath: normalizedPath,
      robots: "index, follow",
      type: "website",
    };
  }

  if (
    ["/login", "/signup", "/staff-login", "/profile", "/orders"].includes(
      normalizedPath,
    )
  ) {
    return {
      title: `${SITE_NAME} Account Access`,
      description:
        i18n.t("legacy.secure_account_access_for_pakhlai_customers_and_restau_85b02312"),
      canonicalPath: normalizedPath,
      robots: "noindex, follow",
      type: "website",
    };
  }

  if (
    normalizedPath.startsWith("/admin") ||
    normalizedPath.startsWith("/manager") ||
    normalizedPath.startsWith("/kitchen") ||
    normalizedPath.startsWith("/cashier") ||
    normalizedPath.startsWith("/call-operator") ||
    normalizedPath.startsWith("/super-admin")
  ) {
    return {
      title: `${SITE_NAME} Restaurant Operations Dashboard`,
      description:
        i18n.t("legacy.private_pakhlai_restaurant_operations_dashboard_for_au_6dd4e14d"),
      canonicalPath: normalizedPath,
      robots: "noindex, nofollow",
      type: "website",
    };
  }

  return {
    title: `${SITE_NAME} | Restaurant Menus and Online Ordering`,
    description: ORGANIZATION_DESCRIPTION,
    canonicalPath: normalizedPath,
    robots: "index, follow",
    type: "website",
  };
};

export const buildBreadcrumbSchema = (breadcrumbs = []) => ({
  "@type": "BreadcrumbList",
  itemListElement: breadcrumbs.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
  })),
});
