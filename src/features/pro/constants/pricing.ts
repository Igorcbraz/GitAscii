export interface ProFeatureItem {
  id: string
  titleKey: string
  titleDefault: string
  descKey: string
  descDefault: string
  badge?: string
  badgeKey?: string
  tag?: string
  tagKey?: string
  specs?: string[]
  specKeys?: string[]
}

export interface ProPlanComparisonItem {
  id: string
  featureKey: string
  featureDefault: string
  free: string | boolean
  pro: string | boolean
  freeKey?: string
  proKey?: string
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
      titleDefault: 'Know If Anyone Actually Reads Your Work',
      descKey: 'pro.pricing.feat.analytics.desc',
      descDefault:
        'You spent hours tuning your README. Pro shows you real traffic, what countries your visitors come from, which projects brought them, and your peak visiting hours. No guessing, no complex setup.',
      badge: '90-Day History',
      badgeKey: 'pro.pricing.feat.analytics.badge',
      tag: '// 01 · AUDIENCE',
      tagKey: 'pro.pricing.feat.analytics.tag',
      specs: [
        'See your actual profile traffic volume',
        'Discover which links & repos send visitors',
        'Find out what countries view your portfolio',
        'Analyze peak hours to plan your launches',
      ],
      specKeys: [
        'pro.pricing.feat.analytics.spec_1',
        'pro.pricing.feat.analytics.spec_2',
        'pro.pricing.feat.analytics.spec_3',
        'pro.pricing.feat.analytics.spec_4',
      ],
    },
    {
      id: 'monitor',
      titleKey: 'pro.pricing.feat.monitor.title',
      titleDefault: 'Never Let a Broken Badge Embarrass You',
      descKey: 'pro.pricing.feat.monitor.desc',
      descDefault:
        'Third-party badges and stats APIs break all the time. We check all your widgets 24/7 and email you immediately if one fails — so you fix it before a recruiter, client, or sponsor sees an ugly red cross.',
      badge: '24/7 Guard',
      badgeKey: 'pro.pricing.feat.monitor.badge',
      tag: '// 02 · REPUTATION',
      tagKey: 'pro.pricing.feat.monitor.tag',
      specs: [
        'Background health checks every 10 min',
        'Instant email alert on any broken widget',
        'Keeps your portfolio clean and credible',
        '1-click fix right from your dashboard',
      ],
      specKeys: [
        'pro.pricing.feat.monitor.spec_1',
        'pro.pricing.feat.monitor.spec_2',
        'pro.pricing.feat.monitor.spec_3',
        'pro.pricing.feat.monitor.spec_4',
      ],
    },
    {
      id: 'profiles',
      titleKey: 'pro.pricing.feat.profiles.title',
      titleDefault: 'Tailor Your README for Events, Talks & Launches',
      descKey: 'pro.pricing.feat.profiles.desc',
      descDefault:
        'Going to AWS Summit? Launching an open source library? Pitching GitHub Sponsors? Create separate profiles for each moment with dedicated widgets, and track which one gets the most traction.',
      badge: 'Up to 10 Profiles',
      badgeKey: 'pro.pricing.feat.profiles.badge',
      tag: '// 03 · CONTEXTS',
      tagKey: 'pro.pricing.feat.profiles.tag',
      specs: [
        'Dedicated profiles for work, talks, or OSS',
        'Separate visitor analytics per profile version',
        'Switch active layout in one click',
        'Test different hooks and see what converts',
      ],
      specKeys: [
        'pro.pricing.feat.profiles.spec_1',
        'pro.pricing.feat.profiles.spec_2',
        'pro.pricing.feat.profiles.spec_3',
        'pro.pricing.feat.profiles.spec_4',
      ],
    },
    {
      id: 'cdn',
      titleKey: 'pro.pricing.feat.cdn.title',
      titleDefault: 'Updates Go Live Instantly on GitHub',
      descKey: 'pro.pricing.feat.cdn.desc',
      descDefault:
        'GitHub normally caches your README images for hours, showing outdated stats or old designs to visitors. With Pro, the moment you hit save, your live profile updates immediately for everyone.',
      badge: 'Instant Sync',
      badgeKey: 'pro.pricing.feat.cdn.badge',
      tag: '// 04 · REAL-TIME',
      tagKey: 'pro.pricing.feat.cdn.tag',
      specs: [
        'Bypasses GitHub image caching on save',
        'Visitors always see your latest achievements',
        'Zero waiting time after editing your design',
        'Instant updates during live talks or demos',
      ],
      specKeys: [
        'pro.pricing.feat.cdn.spec_1',
        'pro.pricing.feat.cdn.spec_2',
        'pro.pricing.feat.cdn.spec_3',
        'pro.pricing.feat.cdn.spec_4',
      ],
    },
    {
      id: 'reports',
      titleKey: 'pro.pricing.feat.reports.title',
      titleDefault: 'Proven Audience Reach for Sponsors & Clients',
      descKey: 'pro.pricing.feat.reports.desc',
      descDefault:
        'Need to prove your open source project gets attention? Generate verified PDF reports and high-res cards showing your profile reach to pitch GitHub Sponsors, OpenCollective, or freelance clients.',
      badge: 'Sponsor Proof',
      badgeKey: 'pro.pricing.feat.reports.badge',
      tag: '// 05 · PROOF',
      tagKey: 'pro.pricing.feat.reports.tag',
      specs: [
        'Export clean PDF reach summaries',
        'Download 1200×630 cards ready for X/LinkedIn',
        'Concrete numbers to close sponsors & gigs',
        'Verified metrics signed by GitAscii',
      ],
      specKeys: [
        'pro.pricing.feat.reports.spec_1',
        'pro.pricing.feat.reports.spec_2',
        'pro.pricing.feat.reports.spec_3',
        'pro.pricing.feat.reports.spec_4',
      ],
    },
    {
      id: 'updates',
      titleKey: 'pro.pricing.feat.updates.title',
      titleDefault: 'Pay $19 Once. Keep Every Feature Forever.',
      descKey: 'pro.pricing.feat.updates.desc',
      descDefault:
        'No monthly subscriptions draining your wallet. Pay once and get full lifetime access, plus every future widget, template, and feature we ever build, delivered automatically at no extra charge.',
      badge: 'Lifetime Access',
      badgeKey: 'pro.pricing.feat.updates.badge',
      tag: '// 06 · OWNERSHIP',
      tagKey: 'pro.pricing.feat.updates.tag',
      specs: [
        'Zero monthly or annual subscriptions ($0/mo)',
        'All future widgets & pro features included',
        'Direct priority support from the creator',
        '14-day 100% money-back guarantee',
      ],
      specKeys: [
        'pro.pricing.feat.updates.spec_1',
        'pro.pricing.feat.updates.spec_2',
        'pro.pricing.feat.updates.spec_3',
        'pro.pricing.feat.updates.spec_4',
      ],
    },
  ],

  comparison: [
    {
      id: 'editor_templates',
      featureKey: 'pro.pricing.comp.editor_templates',
      featureDefault: 'Visual Editor & 13+ Designer Presets',
      free: true,
      pro: true,
    },
    {
      id: 'dynamic_widgets',
      featureKey: 'pro.pricing.comp.dynamic_widgets',
      featureDefault: 'Dynamic Live Widgets (30+)',
      free: true,
      pro: true,
    },
    {
      id: 'ascii_engine',
      featureKey: 'pro.pricing.comp.ascii_engine',
      featureDefault: 'Terminal ASCII Art Engine',
      free: true,
      pro: true,
    },
    {
      id: 'profiles_count',
      featureKey: 'pro.pricing.comp.profiles',
      featureDefault: 'Custom Profiles (Work, Talks, OSS Launch)',
      free: '1 Profile',
      pro: 'Up to 10 Profiles',
      freeKey: 'landing.pricing.cell.1_profile',
      proKey: 'landing.pricing.cell.up_to_10_profiles',
    },
    {
      id: 'retention',
      featureKey: 'pro.pricing.comp.retention',
      featureDefault: 'Visitor History & Audience Analytics',
      free: 'No Tracking',
      pro: '90 Days Full History',
      freeKey: 'pro.pricing.comp.free_no_tracking',
      proKey: 'pro.pricing.comp.pro_90_days_history',
    },
    {
      id: 'geo_referrers',
      featureKey: 'pro.pricing.comp.geo_referrers',
      featureDefault: 'See Where Your Visitors Come From (Sites & Countries)',
      free: false,
      pro: true,
    },
    {
      id: 'widget_alerts',
      featureKey: 'pro.pricing.comp.widget_alerts',
      featureDefault: 'Email Alerts When Badges or Widgets Break',
      free: false,
      pro: true,
    },
    {
      id: 'camo_purge',
      featureKey: 'pro.pricing.comp.camo_purge',
      featureDefault: 'Instant GitHub Refresh on Save (No Stale Caching)',
      free: false,
      pro: true,
    },
    {
      id: 'edge_cdn',
      featureKey: 'pro.pricing.comp.edge_cdn',
      featureDefault: 'Ultra-Fast Loading for Global Visitors',
      free: false,
      pro: true,
    },
    {
      id: 'export_reports',
      featureKey: 'pro.pricing.comp.export_reports',
      featureDefault: 'Export Audience Proof (PDF & Social Cards for Sponsors)',
      free: false,
      pro: true,
    },
    {
      id: 'future_updates',
      featureKey: 'pro.pricing.comp.future_updates',
      featureDefault: 'Every Future Pro Widget & Update Included',
      free: false,
      pro: true,
    },
    {
      id: 'recurring_fees',
      featureKey: 'pro.pricing.comp.recurring_fees',
      featureDefault: 'Monthly Subscriptions',
      free: '$0',
      pro: '$0 (Pay $19 Once, Own Forever)',
      freeKey: 'landing.pricing.cell.free_0',
      proKey: 'pro.pricing.comp.pro_recurring_val',
    },
  ],

  faqs: [
    {
      id: 'faq_lifetime',
      questionKey: 'pro.pricing.faq.lifetime_q',
      questionDefault: 'Is it truly a one-time payment with no subscriptions?',
      answerKey: 'pro.pricing.faq.lifetime_a',
      answerDefault:
        "Yes — $19 once, yours forever. No monthly billing, no annual renewals, no price increases. We're building a tool we'd want to use ourselves, and that means no subscription traps.",
    },
    {
      id: 'faq_camo',
      questionKey: 'pro.pricing.faq.camo_q',
      questionDefault: 'Why does my profile sometimes show an old version even after I update it?',
      answerKey: 'pro.pricing.faq.camo_a',
      answerDefault:
        'GitHub caches profile images through a proxy that can hold stale versions for hours. Pro automatically forces a refresh the moment you save any change, so visitors always see your latest profile — not the version from this morning.',
    },
    {
      id: 'faq_profiles',
      questionKey: 'pro.pricing.faq.profiles_q',
      questionDefault: 'How do multiple profiles work in practice?',
      answerKey: 'pro.pricing.faq.profiles_a',
      answerDefault:
        'You create separate profile versions for different contexts — your main README, a recruiter-focused version, an OSS sponsor page, or even a dedicated profile for an event like AWS Summit or a product launch. Each has its own URL, its own design, and its own analytics. You can see which version drives the most interest and switch your active profile with one click.',
    },
    {
      id: 'faq_telemetry',
      questionKey: 'pro.pricing.faq.telemetry_q',
      questionDefault: 'Is my visitors\u2019 privacy protected?',
      answerKey: 'pro.pricing.faq.telemetry_a',
      answerDefault:
        'Completely. We never use cookies, browser fingerprinting, or any persistent tracking. Visitor data is anonymized daily so you get rich insights — country, referrer, peak hours — without any privacy compliance burden for you or your visitors.',
    },
    {
      id: 'faq_future',
      questionKey: 'pro.pricing.faq.future_q',
      questionDefault: 'Do I get new features as they ship?',
      answerKey: 'pro.pricing.faq.future_a',
      answerDefault:
        'Yes — everything we build for Pro is included in your lifetime license at no extra cost. New widgets, new analytics views, new export formats — all yours, automatically, the day they ship.',
    },
    {
      id: 'faq_guarantee',
      questionKey: 'pro.pricing.faq.guarantee_q',
      questionDefault: 'What if I try Pro and it\u2019s not for me?',
      answerKey: 'pro.pricing.faq.guarantee_a',
      answerDefault:
        "If you open Pro, explore your analytics, and don't discover anything new about who's visiting your profile within 14 days — just email us and we'll refund every cent. No hoops, no questions.",
    },
  ],
}
