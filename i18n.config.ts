import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from '@/locales/en/common.json'
import zhCommon from '@/locales/zh/common.json'
import esCommon from '@/locales/es/common.json'

i18n.use(LanguageDetector)
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
        fallbackLng: 'zh',
        interpolation: {
            escapeValue: false,
        },
    })

export default i18n
