import { useSystemSetting } from './useSystemSettings';

export const useCurrency = () => {
  const currency = useSystemSetting('general', 'default_currency') || 'INR'; // Default to INR if not set
  
  const getCurrencySymbol = (currencyCode?: string) => {
    const code = currencyCode || currency;
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'SEK': 'kr',
      'NZD': 'NZ$'
    };
    return symbols[code] || '$';
  };

  const formatCurrency = (amount: number, currencyCode?: string) => {
    const code = currencyCode || currency;
    const symbol = getCurrencySymbol(code);
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'symbol'
    }).format(amount).replace(/^[^\d-]*/, symbol);
  };

  return {
    currency: currency,
    symbol: getCurrencySymbol(),
    formatCurrency,
    getCurrencySymbol
  };
};