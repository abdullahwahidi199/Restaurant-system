import React, { useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useRestaurantSettings from "./hooks/useRestaurantSettings";
import RestaurantSettingsLayout from "./RestaurantSettingsLayout";
import { SettingsProvider } from "./SettingsContext";
import { getSettingsSections } from "./settingsConfig";

export default function RestaurantSettings() {
  const { t } = useTranslation();
  const settings = useRestaurantSettings(t);
  const { sectionId } = useParams();
  const sections = useMemo(
    () => getSettingsSections(settings.branchOnly),
    [settings.branchOnly],
  );
  const activeSection = sections.find((section) => section.id === sectionId);
  const fallbackSection = sections[0];

  if (!sectionId && fallbackSection) {
    return (
      <Navigate
        to={`/admin/dashboard/settings/${fallbackSection.id}`}
        replace
      />
    );
  }

  if (sectionId && !activeSection && fallbackSection) {
    return (
      <Navigate
        to={`/admin/dashboard/settings/${fallbackSection.id}`}
        replace
      />
    );
  }

  const ActiveComponent = activeSection?.component || fallbackSection?.component;

  return (
    <SettingsProvider value={settings}>
      <RestaurantSettingsLayout
        settings={settings}
        sections={sections}
        activeSection={activeSection || fallbackSection}
      >
        {ActiveComponent && <ActiveComponent />}
      </RestaurantSettingsLayout>
    </SettingsProvider>
  );
}
