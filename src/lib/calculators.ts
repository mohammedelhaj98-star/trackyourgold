export type CalculatorDefinition = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  inputs: Array<{ key: string; label: string; placeholder: string }>;
};

export const calculators: CalculatorDefinition[] = [
  {
    slug: "qar-gold-calculator",
    title: "QAR Gold Calculator",
    description: "Convert grams and karat pricing into total QAR cost.",
    intro: "Useful for quick jewellery cost estimation and store comparisons.",
    inputs: [
      { key: "grams", label: "Grams", placeholder: "10" },
      { key: "pricePerGram", label: "Price per gram (QAR)", placeholder: "288" }
    ]
  },
  {
    slug: "gold-premium-calculator",
    title: "Gold Premium Over Spot Calculator",
    description: "Compare local store pricing against a spot-derived benchmark in QAR.",
    intro: "Helps buyers understand whether local pricing is stretched or reasonable.",
    inputs: [
      { key: "localPrice", label: "Local price per gram", placeholder: "288" },
      { key: "spotEstimate", label: "Spot-derived price per gram", placeholder: "276" }
    ]
  },
  {
    slug: "should-i-buy-gold-now",
    title: "Should I Buy Gold Now? Calculator",
    description: "Score today’s price against your target entry and recent trend context.",
    intro: "Use your own threshold along with market context from TrackYourGold.",
    inputs: [
      { key: "currentPrice", label: "Current local price", placeholder: "288" },
      { key: "targetPrice", label: "Your target price", placeholder: "282" }
    ]
  },
  {
    slug: "gold-profit-loss-calculator",
    title: "Gold Profit and Loss Calculator",
    description: "Estimate unrealized gain or loss on a gold purchase.",
    intro: "Useful for private portfolio tracking and public SEO utility pages.",
    inputs: [
      { key: "buyPrice", label: "Buy price per gram", placeholder: "279" },
      { key: "currentPrice", label: "Current price per gram", placeholder: "288" },
      { key: "grams", label: "Grams held", placeholder: "18.5" }
    ]
  },
  {
    slug: "making-charge-calculator",
    title: "Jewellery Making Charge Calculator",
    description: "Separate raw gold cost from making charges to compare offers.",
    intro: "Designed for shoppers evaluating jewellery quotes and store comparisons.",
    inputs: [
      { key: "goldCost", label: "Gold cost", placeholder: "5000" },
      { key: "makingCharge", label: "Making charge", placeholder: "250" }
    ]
  },
  {
    slug: "gold-savings-goal-calculator",
    title: "Gold Savings Goal Calculator",
    description: "Plan how much to save each month for a future gold purchase.",
    intro: "A conversion-focused tool that ties back to alerts and account creation.",
    inputs: [
      { key: "goalAmount", label: "Goal amount", placeholder: "10000" },
      { key: "months", label: "Months", placeholder: "8" }
    ]
  }
];

export function getCalculatorBySlug(slug: string) {
  return calculators.find((calculator) => calculator.slug === slug);
}

export function computeCalculatorResult(slug: string, payload: Record<string, number>) {
  switch (slug) {
    case "qar-gold-calculator":
      return { label: "Estimated total", value: payload.grams * payload.pricePerGram };
    case "gold-premium-calculator":
      return {
        label: "Premium over spot",
        value: ((payload.localPrice - payload.spotEstimate) / payload.spotEstimate) * 100,
        suffix: "%"
      };
    case "should-i-buy-gold-now": {
      const delta = payload.currentPrice - payload.targetPrice;
      return {
        label: delta <= 0 ? "Signal" : "Gap to target",
        value: delta <= 0 ? Math.abs(delta) : delta,
        message: delta <= 0 ? "Current price is at or below your target." : "Current price is above your target."
      };
    }
    case "gold-profit-loss-calculator":
      return {
        label: "Unrealized P/L",
        value: (payload.currentPrice - payload.buyPrice) * payload.grams
      };
    case "making-charge-calculator":
      return {
        label: "Making charge share",
        value: (payload.makingCharge / payload.goldCost) * 100,
        suffix: "%"
      };
    case "gold-savings-goal-calculator":
      return {
        label: "Monthly savings needed",
        value: payload.goalAmount / payload.months
      };
    default:
      return null;
  }
}
