import { addDifyChatI18n } from '@dify-chat/widget'
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

/**
 * 最小 init：无需 resources，init 后调用 addDifyChatI18n(i18n) 注入 Widget 文案。
 * 接入方可参考此写法；若打包后出现多份 i18next，必须显式调用 addDifyChatI18n(i18n)。
 */
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({ debug: false, fallbackLng: 'en', interpolation: { escapeValue: false } })
  .then(() => {
    addDifyChatI18n(i18n)
  })

export default i18n
