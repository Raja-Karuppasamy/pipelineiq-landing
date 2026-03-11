export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    stripePriceId: null,
    limits: {
      repos: 1,
      members: 1,
      costHistoryDays: 7,
      incidents: 0,
    },
  },
  team: {
    name: "Team",
    price: 49,
    stripePriceId: process.env.STRIPE_PRICE_TEAM!,
    limits: {
      repos: 10,
      members: 10,
      costHistoryDays: 90,
      incidents: 10,
    },
  },
  growth: {
    name: "Growth",
    price: 199,
    stripePriceId: process.env.STRIPE_PRICE_GROWTH!,
    limits: {
      repos: -1, // unlimited
      members: -1,
      costHistoryDays: -1,
      incidents: -1,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;