import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_IMAGE,
  SITE_NAME,
  SITE_URL,
  baseFounder,
  baseOrganization,
  baseSoftwareApplication,
  baseWebsite,
  buildBreadcrumbSchema,
  getPageSeo,
} from "./seoConfig";

const setTag = (selector, createTag, attributes) => {
  let tag = document.head.querySelector(selector);

  if (!tag) {
    tag = document.createElement(createTag);
    document.head.appendChild(tag);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value) {
      tag.setAttribute(key, value);
    }
  });
};

const setMetaName = (name, content) => {
  setTag(`meta[name="${name}"]`, "meta", { name, content });
};

const setMetaProperty = (property, content) => {
  setTag(`meta[property="${property}"]`, "meta", { property, content });
};

const setLink = (rel, href) => {
  setTag(`link[rel="${rel}"]`, "link", { rel, href });
};

const setJsonLd = (id, data) => {
  let script = document.head.querySelector(`script[data-seo-json="${id}"]`);

  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoJson = id;
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
};

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = getPageSeo(pathname);
    const canonical = `${SITE_URL}${page.canonicalPath === "/" ? "" : page.canonicalPath}`;
    const schemas = [
      baseOrganization,
      baseFounder,
      baseWebsite,
      baseSoftwareApplication,
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: page.title,
        description: page.description,
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: {
          "@id": `${SITE_URL}/#software`,
        },
        primaryImageOfPage: DEFAULT_IMAGE,
      },
    ];

    if (page.breadcrumbs?.length) {
      schemas.push(buildBreadcrumbSchema(page.breadcrumbs));
    }

    document.title = page.title;
    setMetaName("description", page.description);
    setMetaName("robots", page.robots);
    setMetaName("author", "Abdullah Wahidi");
    setMetaName(
      "keywords",
      "Pakhlai, Abdullah Wahidi, restaurant management system, RMS, cloud restaurant software, menu management, order management, billing software",
    );
    setLink("canonical", canonical);

    setMetaProperty("og:site_name", SITE_NAME);
    setMetaProperty("og:type", page.type);
    setMetaProperty("og:title", page.title);
    setMetaProperty("og:description", page.description);
    setMetaProperty("og:url", canonical);
    setMetaProperty("og:image", DEFAULT_IMAGE);

    setMetaName("twitter:card", "summary_large_image");
    setMetaName("twitter:title", page.title);
    setMetaName("twitter:description", page.description);
    setMetaName("twitter:image", DEFAULT_IMAGE);

    setJsonLd("pakhlai-graph", {
      "@context": "https://schema.org",
      "@graph": schemas,
    });
  }, [pathname]);

  return null;
}
