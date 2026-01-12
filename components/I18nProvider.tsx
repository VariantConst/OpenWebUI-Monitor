"use client";

import { PropsWithChildren, useEffect } from "react";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import dayjs from "dayjs";

import enCommon from "@/locales/en/common.json";
import zhCommon from "@/locales/zh/common.json";
import esCommon from "@/locales/es/common.json";

const i18n = i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
      },
      zh: {
        common: zhCommon,
      },
      es: {
        common: esCommon,
      },
    },
    fallbackLng: "zh",
    interpolation: {
      escapeValue: false,
    },
  });

export default function I18nProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    // Sync dayjs locale with i18n language
    const updateDayjsLocale = () => {
      const dayjsLocaleMap: Record<string, string> = {
        en: "en",
        zh: "zh-cn",
        es: "es",
      };
      const locale = dayjsLocaleMap[i18next.language] || "zh-cn";
      dayjs.locale(locale);
    };

    // Set initial locale
    updateDayjsLocale();

    // Listen for language changes
    i18next.on("languageChanged", updateDayjsLocale);

    return () => {
      i18next.off("languageChanged", updateDayjsLocale);
    };
  }, []);

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
