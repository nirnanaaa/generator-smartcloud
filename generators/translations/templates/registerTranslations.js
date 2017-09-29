// @flow

const availableLocales = [
    'de',
    'en',
]

// eslint-disable-next-line max-params
export function registerTranslation (locale: string, prefix: string, contents: Object, counterpart: Object) {
    return counterpart.registerTranslations(
        locale,
        {
            // eslint-disable-next-line no-underscore-dangle
            ...counterpart._registry.translations[locale],
            [prefix]: contents,
        }
    )
}

export default function registerTranslations (prefix: string, counterpart: Object = window.counterpart) {
    require.ensure([], () => {
        availableLocales.map(locale => {
            const translation = require(`./locales/${locale}`)

            registerTranslation(locale, prefix, translation, counterpart)
        })
    }, 'translations')
}
