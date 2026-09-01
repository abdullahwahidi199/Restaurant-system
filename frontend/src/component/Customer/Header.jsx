import { Info, Utensils } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getBranchPath, getMediaUrl } from "../../api/publicOrdering";
import CustomerAccountMenu from "./CustomerAccountMenu";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header({
  restaurantInfo,
  branchInfo,
  restaurantSlug,
  branchSlug,
}) {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const slug = restaurantSlug || params.restaurantSlug || params.slug;
  const activeBranchSlug = branchSlug || params.branchSlug;
  const homePath = activeBranchSlug
    ? getBranchPath({ restaurantSlug: slug, branchSlug: activeBranchSlug })
    : `/${slug}`;
  const logoUrl = getMediaUrl(restaurantInfo?.logo);

  return (
    <header
      className="sticky top-0 z-[70] w-full bg-[#fbfaf7]/90 px-2 py-2 backdrop-blur-md sm:px-4 sm:py-3"
      dir={i18n.dir()}
    >
      <nav
        className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 rounded-2xl border border-stone-200/90 bg-white/95 px-2.5 py-2 shadow-lg shadow-stone-950/5 sm:px-4"
        aria-label={t("landing.marketplace.nav.primary", "Primary navigation")}
      >
        <Link
          to={homePath}
          className="group flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 sm:gap-3"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg border border-stone-200 object-cover sm:h-11 sm:w-11"
              width="44"
              height="44"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/rmsFavicon.png";
              }}
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700 sm:h-11 sm:w-11">
              <Utensils className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-[0.62rem] font-black uppercase text-orange-700">
              Pakhlai
            </span>
            <span className="block max-w-28 truncate text-sm font-black text-stone-950 transition-colors group-hover:text-orange-700 sm:max-w-52 sm:text-base">
              {restaurantInfo?.name || t("restaurant", "Restaurant")}
            </span>
            {branchInfo?.name ? (
              <span className="hidden max-w-52 truncate text-xs font-semibold text-stone-500 sm:block">
                {branchInfo.name}
              </span>
            ) : null}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <Link
            to={`/${slug}/info`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition hover:border-orange-300 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            aria-label={t("nav.info")}
            title={t("nav.info")}
          >
            <Info className="h-5 w-5" aria-hidden="true" />
          </Link>
          <CustomerAccountMenu compact showGuestActions={false} />
        </div>
      </nav>
    </header>
  );
}
