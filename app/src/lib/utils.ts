import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTranslatedUnit(unit: string, t: any): string {
  if (!unit) return "";
  const lowerUnit = unit.toLowerCase();
  
  const reverseMap: Record<string, string> = {
    "шт": "шт", "pc": "шт", "дана": "шт",
    "кг": "кг", "kg": "кг",
    "тонна": "тонна", "ton": "тонна",
    "метр": "метр", "m": "метр", "м": "метр",
    "см": "см", "cm": "см",
    "мм": "мм", "mm": "мм",
    "литр": "литр", "l": "литр", "л": "литр",
    "услуга": "услуга", "service": "услуга", "қызмет": "услуга"
  };

  const key = reverseMap[lowerUnit];
  if (key) {
    return t(`units.${key}`) || unit;
  }
  return unit;
}

export const CURRENCIES = {
  KZT: { symbol: '₸', label: 'Тенге (KZT)', pdfLabel: 'тг.' },
  RUB: { symbol: '₽', label: 'Рубль (RUB)', pdfLabel: 'руб.' },
  USD: { symbol: '$', label: 'US Dollar (USD)', pdfLabel: '$' },
};

export function formatCurrency(amount: number, currencyCode: string = "KZT", forPdf: boolean = false, locale: string = "ru", noSymbol: boolean = false) {
  const currency = CURRENCIES[currencyCode as keyof typeof CURRENCIES] || CURRENCIES.KZT;
  const isKzt = currencyCode === "KZT";

  // Use Intl.NumberFormat to get standard grouping
  const formatter = new Intl.NumberFormat(locale === "en" ? "en-US" : "ru-RU", {
    style: "decimal",
    minimumFractionDigits: 0, // Changed from 2 to 0 to remove .00
    maximumFractionDigits: 2,
  });

  const formattedAmount = formatter.format(amount);
  
  if (noSymbol) {
      return formattedAmount;
  }

  // Fallback for non-HTML
  let symbol = currency.symbol;
  if ((locale === 'en' || locale?.startsWith('en')) && currencyCode === 'KZT') {
      symbol = 'KZT';
  } else if (forPdf) {
      symbol = currency.pdfLabel || currency.symbol;
  } else if (isKzt) {
      symbol = 'тг.'; // Use text "тг." globally for both PDF and Preview to ensure consistency
  }

  return `${formattedAmount} ${symbol}`;
}

export function getNextInvoiceNumber(lastNumber: string): string {
  // Find the last sequence of digits
  const match = lastNumber.match(/(\d+)$/);
  
  if (!match) {
    // If no digits found at the end, just append -001
    return `${lastNumber}-001`;
  }

  const numberPart = match[1];
  const prefix = lastNumber.substring(0, lastNumber.length - numberPart.length);
  
  // Increment the number preserving leading zeros
  const nextNumber = (parseInt(numberPart) + 1).toString();
  const paddedNextNumber = nextNumber.padStart(numberPart.length, '0');
  
  return `${prefix}${paddedNextNumber}`;
}

export function generateBarcodeValue(type: string): string {
  if (type === 'ean8') {
    let codeValue = "";
    for (let i = 0; i < 7; i++) {
      codeValue += Math.floor(Math.random() * 10);
    }
    const sum1 = parseInt(codeValue[6]) + parseInt(codeValue[4]) + parseInt(codeValue[2]) + parseInt(codeValue[0]);
    const sum2 = parseInt(codeValue[5]) + parseInt(codeValue[3]) + parseInt(codeValue[1]);
    const total = (sum1 * 3) + sum2;
    const checksum = (10 - (total % 10)) % 10;
    return codeValue + checksum;
  } else if (type === 'code128') {
    // Generate 10-char alphanumeric string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  } else {
    // Default to ean13
    let codeValue = "";
    for (let i = 0; i < 12; i++) {
      codeValue += Math.floor(Math.random() * 10);
    }
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(codeValue[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checksum = (10 - (sum % 10)) % 10;
    return codeValue + checksum;
  }
}
