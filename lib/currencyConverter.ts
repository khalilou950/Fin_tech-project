// Finovia Offline Currency Normalizer
// In a high-tier production environment, this should be connected to a real-time API (e.g. FreeCurrencyAPI)
// For Finovia, we use fixed base approximations to protect calculations from cross-currency bugs.

const EXCHANGE_RATES_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  DZD: 135.0, // 1 USD = 135 DZD (Official rate approximation)
};

/**
 * Convert an amount from one currency to another
 */
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = EXCHANGE_RATES_TO_USD[fromCurrency] || EXCHANGE_RATES_TO_USD['USD'];
  const toRate = EXCHANGE_RATES_TO_USD[toCurrency] || EXCHANGE_RATES_TO_USD['USD'];
  
  // Convert to USD first, then to target currency
  const amountInUSD = amount / fromRate;
  const convertedAmount = amountInUSD * toRate;
  
  return convertedAmount;
};

/**
 * Display format helper
 */
export const formatCurrencyDisplay = (amount: number, currencyCode: string = 'DZD') => {
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (e) {
    // Fallback if currency code is invalid for Intl
    return `${amount.toLocaleString()} ${currencyCode}`;
  }
};
