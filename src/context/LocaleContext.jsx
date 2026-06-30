import { createContext, useContext, useState } from 'react'

const COUNTRY_DATA = {
  'United States': { code: 'US', flag: '🇺🇸', language: 'English', currency: 'USD' },
  'UK': { code: 'GB', flag: '🇬🇧', language: 'English', currency: 'GBP' },
  'Pakistan': { code: 'PK', flag: '🇵🇰', language: 'Urdu', currency: 'PKR' },
  'Australia': { code: 'AU', flag: '🇦🇺', language: 'English', currency: 'AUD' },
  'Canada': { code: 'CA', flag: '🇨🇦', language: 'English', currency: 'CAD' },
  'UAE': { code: 'AE', flag: '🇦🇪', language: 'Arabic', currency: 'AED' },
}

const LocaleContext = createContext(null)

export function LocaleProvider({ children }) {
  const [country, setCountryState] = useState('United States')

  function setCountry(name) {
    if (COUNTRY_DATA[name]) {
      setCountryState(name)
    }
  }

  const value = {
    country,
    setCountry,
    countryData: COUNTRY_DATA[country],
    countries: Object.keys(COUNTRY_DATA).map((name) => ({
      name,
      ...COUNTRY_DATA[name],
    })),
  }

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}