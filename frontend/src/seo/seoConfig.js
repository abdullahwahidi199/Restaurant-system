export const SITE_URL = "https://pakhlai.com";
export const SITE_NAME = "Pakhlai";
export const FOUNDER_NAME = "Abdullah Wahidi";
export const DEFAULT_IMAGE = `${SITE_URL}/rmsLogo.png`;
export const CURRENT_YEAR = 2026;

export const ORGANIZATION_DESCRIPTION =
  "Pakhlai is a cloud-based restaurant management system that helps restaurants manage menus, orders, tables, billing, kitchen workflow, and daily operations.";

export const baseOrganization = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
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
    "@id": `${SITE_URL}/founder#abdullah-wahidi`,
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
    "@id": `${SITE_URL}/#software`,
  },
};

export const publicPages = [
  {
    path: "/",
    title: "Pakhlai | Restaurant Management System by Abdullah Wahidi",
    description:
      "Pakhlai is a cloud-based restaurant management system founded and developed by Abdullah Wahidi for menus, orders, tables, billing, kitchen workflow, and daily operations.",
    breadcrumbs: [{ name: "Home", path: "/" }],
  },
  {
    path: "/about",
    title: "About Pakhlai | Cloud Restaurant Management System",
    description:
      "Learn the story of Pakhlai, a restaurant management system founded and developed by Abdullah Wahidi to simplify restaurant operations.",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ],
  },
  {
    path: "/founder",
    title: "Abdullah Wahidi | Founder and Developer of Pakhlai",
    description:
      "Meet Abdullah Wahidi, founder of Pakhlai, software engineer, and developer of the Pakhlai Restaurant Management System.",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Founder", path: "/founder" },
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
      title: "Restaurant Menu on Pakhlai | Online Menu and Ordering",
      description:
        "View a restaurant menu powered by Pakhlai, the cloud-based restaurant management system created by Abdullah Wahidi.",
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
        "Secure account access for Pakhlai customers and restaurant users.",
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
        "Private Pakhlai restaurant operations dashboard for authorized staff.",
      canonicalPath: normalizedPath,
      robots: "noindex, nofollow",
      type: "website",
    };
  }

  return {
    title: `${SITE_NAME} | Restaurant Management System`,
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
