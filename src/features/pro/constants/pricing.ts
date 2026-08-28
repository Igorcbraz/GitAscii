export interface ProFeatureItem {
  id: string
  titleKey: string
  titleDefault: string
  descKey: string
  descDefault: string
  badge?: string
}

export interface ProPlanComparisonItem {
  id: string
  featureKey: string
  featureDefault: string
  free: string | boolean
  pro: string | boolean
}

export interface ProFaqItem {
  id: string
  questionKey: string
  questionDefault: string
  answerKey: string
  answerDefault: string
}

export interface ProPricingConfig {
  planId: string
  planName: string
  billingModel: 'lifetime'
  priceUsd: number
  priceFormatted: string
  originalPriceUsd: number
  originalPriceFormatted: string
  discountPercentage: number
  currency: string
  currencySymbol: string
  guaranteeDays: number
  badge: string
  features: ProFeatureItem[]
  comparison: ProPlanComparisonItem[]
  faqs: ProFaqItem[]
}

export const PRO_PRICING_CONFIG: ProPricingConfig = {
  planId: 'gitascii-pro-lifetime',
  planName: 'GitAscii Pro Lifetime',
  billingModel: 'lifetime',
  priceUsd: 19,
  priceFormatted: '$19',
  originalPriceUsd: 49,
  originalPriceFormatted: '$49',
  discountPercentage: 60,
  currency: 'USD',
  currencySymbol: '$',
  guaranteeDays: 14,
  badge: 'LIFETIME ACCESS • PAY ONCE',

  features: [
    {
      id: 'analytics',
      titleKey: 'pro.pricing.feat.analytics.title',
      titleDefault: 'Privacy-First Telemetry & Analytics',
      descKey: 'pro.pricing.feat.analytics.desc',
      descDefault:
        'Live unique views, geographic maps, referrer tracking, and peak traffic hours without cookies or invasive trackers.',
      badge: '90-Day History',
    },
    {
      id: 'monitor',
      titleKey: 'pro.pricing.feat.monitor.title',
      titleDefault: '24/7 Widget Health & Error Monitor',
      descKey: 'pro.pricing.feat.monitor.desc',
      descDefault:
        'Automated background health checks that immediately alert you by email when an external badge or API fails in your README.',
      badge: 'Instant Alerts',
    },
    {
      id: 'profiles',
      titleKey: 'pro.pricing.feat.profiles.title',
      titleDefault: 'Multi-Profile Control Plane',
      descKey: 'pro.pricing.feat.profiles.desc',
      descDefault:
        'Create and maintain up to 10 distinct dynamic profiles (Work, Open Source, Minimal, Creative) with isolated analytics.',
      badge: '10 Profiles',
    },
    {
      id: 'cdn',
      titleKey: 'pro.pricing.feat.cdn.title',
      titleDefault: 'Instant SVG Purge & High-Performance Edge',
      descKey: 'pro.pricing.feat.cdn.desc',
      descDefault:
        'Bypass GitHub Camo cache instantly on edits with sub-10ms global edge delivery for blazing fast SVG rendering.',
      badge: 'Edge Accelerated',
    },
    {
      id: 'reports',
      titleKey: 'pro.pricing.feat.reports.title',
      titleDefault: 'Executive Reports & Social Share Cards',
      descKey: 'pro.pricing.feat.reports.desc',
      descDefault:
        'Export verified PDF & CSV telemetry reports and generate 1200x630 Retina performance cards for X/Twitter and LinkedIn.',
      badge: 'PDF / CSV / PNG',
    },
    {
      id: 'updates',
      titleKey: 'pro.pricing.feat.updates.title',
      titleDefault: 'Lifetime Updates & Zero Recurring Fees',
      descKey: 'pro.pricing.feat.updates.desc',
      descDefault:
        'Pay once and own your license forever. Includes all future Pro tools, edge enhancements, and priority support.',
      badge: 'Forever',
    },
  ],

  comparison: [
    {
      id: 'profiles_count',
      featureKey: 'pro.pricing.comp.profiles',
      featureDefault: 'Active Profiles',
      free: '1 Profile',
      pro: 'Up to 10 Profiles',
    },
    {
      id: 'retention',
      featureKey: 'pro.pricing.comp.retention',
      featureDefault: 'Analytics History Retention',
      free: 'No History',
      pro: '90 Days Full Retention',
    },
    {
      id: 'geo_referrers',
      featureKey: 'pro.pricing.comp.geo_referrers',
      featureDefault: 'Country & Referrer Breakdown',
      free: false,
      pro: true,
    },
    {
      id: 'widget_alerts',
      featureKey: 'pro.pricing.comp.widget_alerts',
      featureDefault: '24/7 Widget Error Alerts (Email)',
      free: false,
      pro: true,
    },
    {
      id: 'camo_purge',
      featureKey: 'pro.pricing.comp.camo_purge',
      featureDefault: 'Instant GitHub Camo Cache Purge',
      free: false,
      pro: true,
    },
    {
      id: 'export_reports',
      featureKey: 'pro.pricing.comp.export_reports',
      featureDefault: 'Export PDF, CSV & Share Cards',
      free: false,
      pro: true,
    },
    {
      id: 'recurring_fees',
      featureKey: 'pro.pricing.comp.recurring_fees',
      featureDefault: 'Recurring Subscription Fees',
      free: '$0 / month',
      pro: '$0 / month (Pay Once)',
    },
  ],

  faqs: [
    {
      id: 'faq_lifetime',
      questionKey: 'pro.pricing.faq.lifetime_q',
      questionDefault: 'Is it truly a one-time payment with no subscriptions?',
      answerKey: 'pro.pricing.faq.lifetime_a',
      answerDefault:
        'Yes. You pay once and have lifetime access to GitAscii Pro for your GitHub account. No monthly charges, no annual renewal fees, and no surprise costs.',
    },
    {
      id: 'faq_future',
      questionKey: 'pro.pricing.faq.future_q',
      questionDefault: 'Do I get access to future Pro features?',
      answerKey: 'pro.pricing.faq.future_a',
      answerDefault:
        'Absolutely. Your lifetime license includes all future upgrades and enhancements added to the Pro workspace.',
    },
    {
      id: 'faq_guarantee',
      questionKey: 'pro.pricing.faq.guarantee_q',
      questionDefault: 'How does the refund guarantee work?',
      answerKey: 'pro.pricing.faq.guarantee_a',
      answerDefault:
        'We offer a 14-day 100% money-back guarantee. If GitAscii Pro is not the right fit for your workflow, reach out to our team for a hassle-free refund.',
    },
  ],
}
