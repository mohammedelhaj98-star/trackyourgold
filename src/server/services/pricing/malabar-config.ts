export const MALABAR_SELECTOR_CONFIG = {
  rowSelectors: [
    "table tr",
    "[class*='gold'] tr",
    "[class*='rate'] tr",
    "[class*='price'] tr",
    "li",
    "[class*='item']",
    "[class*='card']",
    "div"
  ],
  timestampSelectors: [
    "time[datetime]",
    "[data-last-updated]",
    "[class*='updated']",
    "[class*='timestamp']",
    "[class*='date']"
  ],
  karatRegex: /(\d{1,2})(?:\s|-)?(?:k|kt|karat)/i,
  priceRegex: /(?:qar|qr|q\.r\.?|ريال)\s*([0-9]+(?:\.[0-9]+)?)/i,
  fallbackNumberRegex: /([0-9]{2,4}(?:\.[0-9]+)?)/g
} as const;

export const MALABAR_PARSER_NOTES = [
  "Selectors are centralized here so parser maintenance does not require touching ingestion logic.",
  "The parser is intentionally dynamic: it extracts any published karat labels instead of hardcoding 22K and 24K.",
  "If Malabar changes layout, update selectors here first and keep the parser version in sync."
];
