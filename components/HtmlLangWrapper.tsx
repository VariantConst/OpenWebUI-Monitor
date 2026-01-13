'use client'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function HtmlLangWrapper() {
    const { i18n } = useTranslation()

    useEffect(() => {
        // Update the HTML lang attribute when language changes
        const langMap: Record<string, string> = {
            en: 'en',
            zh: 'zh-CN',
            es: 'es',
        }

        const lang = langMap[i18n.language] || 'zh-CN'
        document.documentElement.lang = lang
    }, [i18n.language])

    return null
}
