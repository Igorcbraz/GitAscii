export interface ProFeatureItem {
  id: string
  titleKey: string
  titleDefault: string
  descKey: string
  descDefault: string
  badge?: string
  tag?: string
  specs?: string[]
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
  badge: '[ GITASCII PRO · LIFETIME UPGRADE ]',

  features: [
    {
      id: 'analytics',
      titleKey: 'pro.pricing.feat.analytics.title',
      titleDefault: 'Privacy-First Telemetry & Analytics',
      descKey: 'pro.pricing.feat.analytics.desc',
      descDefault:
        'Cookieless real-time traffic tracking, interactive SVG heatmaps, geographic country distribution, referrer sources, and peak viewing hours without cookie banners or GDPR friction.',
      badge: '90-Day Retention',
      tag: '// 01 · TELEMETRY',
      specs: [
        'Daily rotating salt hash',
        'Country & City ISO 3166',
        'Referrer Sanitizer',
        '7x24 Peak Heatmap',
      ],
    },
    {
      id: 'monitor',
      titleKey: 'pro.pricing.feat.monitor.title',
      titleDefault: '24/7 Sentinel Widget Health & Error Alerts',
      descKey: 'pro.pricing.feat.monitor.desc',
      descDefault:
        'Continuous automated health checks on every external badge and API in your profile README. Get instant email alerts before broken images or rate-limits impact your public portfolio.',
      badge: 'Automated Sentinel',
      tag: '// 02 · MONITORING',
      specs: [
        '10-minute cron pings',
        'Timeout & 4xx/5xx alerts',
        '30-day incident log',
        'One-click error resolution',
      ],
    },
    {
      id: 'profiles',
      titleKey: 'pro.pricing.feat.profiles.title',
      titleDefault: 'Multi-Profile Architecture (Up to 10)',
      descKey: 'pro.pricing.feat.profiles.desc',
      descDefault:
        'Create and maintain up to 10 independent dynamic profiles (e.g. /work, /oss, /sponsor, /minimal) with distinct widget configurations, themes, and dedicated analytics streams.',
      badge: '10 Profiles',
      tag: '// 03 · MULTI-PROFILE',
      specs: [
        'Dedicated /username/slug URLs',
        'Isolated telemetry streams',
        'Custom draft & live states',
        'Per-profile gitascii.json',
      ],
    },
    {
      id: 'cdn',
      titleKey: 'pro.pricing.feat.cdn.title',
      titleDefault: 'Instant Camo Cache Purge & Sub-10ms Edge',
      descKey: 'pro.pricing.feat.cdn.desc',
      descDefault:
        'Bypass GitHub Camo proxy caching immediately upon saving edits. Dynamic SVGs are rendered and served worldwide via low-latency global edge locations in under 10 milliseconds.',
      badge: 'Sub-10ms Global',
      tag: '// 04 · EDGE CDN',
      specs: [
        'Instant GitHub Camo invalidation',
        'Global Edge CDN cache headers',
        'ETag 304 Not Modified support',
        'Zero layout shifts',
      ],
    },
    {
      id: 'reports',
      titleKey: 'pro.pricing.feat.reports.title',
      titleDefault: 'Executive Telemetry Reports & Retina Share Cards',
      descKey: 'pro.pricing.feat.reports.desc',
      descDefault:
        'Export verified PDF audit summaries and raw CSV datasets for clients or sponsors. Generate dynamic 1200x630 Retina OpenGraph preview banners tailored for X/Twitter and LinkedIn.',
      badge: 'PDF / CSV / PNG',
      tag: '// 05 · EXPORTS',
      specs: [
        '1-Click PDF Audit Export',
        'Full CSV Raw Data Access',
        '1200x630 Retina Social Cards',
        'Custom Date Range Filters',
      ],
    },
    {
      id: 'updates',
      titleKey: 'pro.pricing.feat.updates.title',
      titleDefault: 'Lifetime Updates & Zero Recurring Fees',
      descKey: 'pro.pricing.feat.updates.desc',
      descDefault:
        'Pay once and own your license forever. Includes all future Pro widgets, experimental ASCII shaders, edge enhancements, and direct priority GitHub support with $0 monthly subscriptions.',
      badge: 'Lifetime License',
      tag: '// 06 · LIFETIME',
      specs: [
        'Zero recurring fees ($0/mo)',
        'All future Pro widgets included',
        'Priority developer support',
        '14-day 100% money-back',
      ],
    },
  ],

  comparison: [
    {
      id: 'editor_templates',
      featureKey: 'pro.pricing.comp.editor_templates',
      featureDefault: 'Visual Editor & 13+ Templates',
      free: true,
      pro: true,
    },
    {
      id: 'dynamic_widgets',
      featureKey: 'pro.pricing.comp.dynamic_widgets',
      featureDefault: 'Dynamic SVG Widgets (30+)',
      free: true,
      pro: true,
    },
    {
      id: 'ascii_engine',
      featureKey: 'pro.pricing.comp.ascii_engine',
      featureDefault: 'ASCII Art Generation Engine',
      free: true,
      pro: true,
    },
    {
      id: 'profiles_count',
      featureKey: 'pro.pricing.comp.profiles',
      featureDefault: 'Active Profiles Supported',
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
      featureDefault: 'Country ISO & Referrer Breakdown',
      free: false,
      pro: true,
    },
    {
      id: 'widget_alerts',
      featureKey: 'pro.pricing.comp.widget_alerts',
      featureDefault: '24/7 Widget Error Sentinel (Email Alerts)',
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
      id: 'edge_cdn',
      featureKey: 'pro.pricing.comp.edge_cdn',
      featureDefault: 'Priority Sub-10ms Global Edge CDN',
      free: false,
      pro: true,
    },
    {
      id: 'export_reports',
      featureKey: 'pro.pricing.comp.export_reports',
      featureDefault: 'Export PDF, CSV & 1200x630 Social Cards',
      free: false,
      pro: true,
    },
    {
      id: 'future_updates',
      featureKey: 'pro.pricing.comp.future_updates',
      featureDefault: 'Future Pro Widgets & Releases Included',
      free: false,
      pro: true,
    },
    {
      id: 'recurring_fees',
      featureKey: 'pro.pricing.comp.recurring_fees',
      featureDefault: 'Monthly Recurring Fees',
      free: '$0',
      pro: '$0 (Pay Once, Own Forever)',
    },
  ],

  faqs: [
    {
      id: 'faq_lifetime',
      questionKey: 'pro.pricing.faq.lifetime_q',
      questionDefault: 'Is it truly a one-time payment with no subscriptions?',
      answerKey: 'pro.pricing.faq.lifetime_a',
      answerDefault:
        'Yes. You make a single one-time payment of $19 USD and receive permanent lifetime access to GitAscii Pro for your GitHub account. No monthly billing, no annual renewals, and no surprise lock-ins.',
    },
    {
      id: 'faq_camo',
      questionKey: 'pro.pricing.faq.camo_q',
      questionDefault: 'How does the instant GitHub Camo cache purge work?',
      answerKey: 'pro.pricing.faq.camo_a',
      answerDefault:
        'GitHub uses a proxy server (Camo) that caches external images for hours. With Pro, when you save edits or switch active profiles, our edge invalidation triggers a forced upstream refresh so your visitors see your updated README immediately.',
    },
    {
      id: 'faq_profiles',
      questionKey: 'pro.pricing.faq.profiles_q',
      questionDefault: 'How do multiple profiles work?',
      answerKey: 'pro.pricing.faq.profiles_a',
      answerDefault:
        'You can create up to 10 separate profile slugs (e.g. /username for main profile, /username/work for recruiter views, /username/oss for open source sponsors). Each profile maintains its own widget configuration, theme, and analytics metrics.',
    },
    {
      id: 'faq_telemetry',
      questionKey: 'pro.pricing.faq.telemetry_q',
      questionDefault: 'Is the telemetry privacy-first and compliant with GDPR/LGPD?',
      answerKey: 'pro.pricing.faq.telemetry_a',
      answerDefault:
        '100%. We do not use persistent cookies, localStorage trackers, or invasive fingerprinting. Visitor metrics are pseudonymized using a daily rotating salt hash, preserving visitor privacy while providing rich geographic and referrer insights.',
    },
    {
      id: 'faq_future',
      questionKey: 'pro.pricing.faq.future_q',
      questionDefault: 'Do I get access to future Pro widgets and features?',
      answerKey: 'pro.pricing.faq.future_a',
      answerDefault:
        'Yes! Your lifetime license includes all future Pro widgets, advanced ASCII generator shaders, new telemetry integrations, and priority edge delivery improvements at no additional cost.',
    },
    {
      id: 'faq_guarantee',
      questionKey: 'pro.pricing.faq.guarantee_q',
      questionDefault: 'How does the 14-day refund guarantee work?',
      answerKey: 'pro.pricing.faq.guarantee_a',
      answerDefault:
        'We stand behind GitAscii Pro with a 14-day 100% money-back guarantee. If Pro does not elevate your developer portfolio or meet your needs, contact us and we will promptly issue a full refund.',
    },
  ],
}
