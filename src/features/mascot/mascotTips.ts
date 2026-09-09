'use client'

import type { MascotScrollWaypoint, MascotTip } from './types'

export const LANDING_WAYPOINTS: MascotScrollWaypoint[] = [
  {
    at: 0.08,
    once: true,
    mood: 'focused',
    tip: {
      id: 'landing-hero-cta',
      message: 'Enter your username or login with GitHub to get started.',
      duration: 4500,
      mood: 'focused',
    },
  },
  {
    at: 0.22,
    once: true,
    mood: 'curious',
    tip: {
      id: 'landing-editor-demo',
      message: 'Switch to Live Demo to test the engine and drag widgets.',
      duration: 5000,
      mood: 'curious',
    },
  },
  {
    at: 0.42,
    once: true,
    mood: 'focused',
    tip: {
      id: 'landing-community',
      message: 'Over 1,000 custom profiles created by developers.',
      duration: 4500,
      mood: 'focused',
    },
  },
  {
    at: 0.58,
    once: true,
    mood: 'thinking',
    tip: {
      id: 'landing-templates',
      message: 'Select any layout to inspect widgets and color palette.',
      duration: 5000,
      mood: 'thinking',
    },
  },
  {
    at: 0.74,
    once: true,
    mood: 'focused',
    tip: {
      id: 'landing-comparison',
      message: 'Pure SVG vector rendering, with zero external database dependency.',
      duration: 4500,
      mood: 'focused',
    },
  },
  {
    at: 0.9,
    once: true,
    mood: 'happy',
    tip: {
      id: 'landing-cta',
      message: '100% free and open source under MIT license.',
      duration: 5000,
      mood: 'happy',
    },
  },
]

export const EDITOR_TIPS: MascotTip[] = [
  {
    id: 'editor-copy',
    message: 'Ctrl+C copies the selected widget.',
    shortcut: 'Ctrl+C',
    duration: 4000,
    mood: 'focused',
  },
  {
    id: 'editor-paste',
    message: 'Ctrl+V pastes the widget on the canvas.',
    shortcut: 'Ctrl+V',
    duration: 4000,
    mood: 'focused',
  },
  {
    id: 'editor-undo',
    message: 'Ctrl+Z undoes the previous action.',
    shortcut: 'Ctrl+Z',
    duration: 4000,
    mood: 'thinking',
  },
  {
    id: 'editor-search',
    message: 'Ctrl+K opens the editor command palette.',
    shortcut: 'Ctrl+K',
    duration: 4500,
    mood: 'focused',
  },
  {
    id: 'editor-drag',
    message: 'Drag widgets from the sidebar to the canvas to add them.',
    duration: 4500,
    mood: 'curious',
  },
  {
    id: 'editor-github-mode',
    message: 'Switch to GitHub Mode to view the actual profile proportions.',
    duration: 4500,
    mood: 'focused',
  },
  {
    id: 'editor-delete',
    message: 'Select a widget and press Delete to remove it.',
    shortcut: 'Delete',
    duration: 4000,
    mood: 'focused',
  },
  {
    id: 'editor-zoom',
    message: 'Use Ctrl+Scroll to adjust the canvas zoom level.',
    shortcut: 'Ctrl+Scroll',
    duration: 4000,
    mood: 'curious',
  },
]

export const ONBOARDING_TIPS: MascotTip[] = [
  {
    id: 'onboarding-welcome',
    message: 'Select a template as a starting point or build a layout from scratch.',
    duration: 4500,
    mood: 'focused',
  },
  {
    id: 'onboarding-template',
    message: 'You can customize colors and fonts at any time in the top bar.',
    duration: 4500,
    mood: 'curious',
  },
]

export const PRO_TIPS: MascotTip[] = [
  {
    id: 'pro-analytics',
    message: 'The Pro plan includes real-time view metrics for your profile.',
    duration: 4500,
    mood: 'focused',
  },
  {
    id: 'pro-multi-profile',
    message: 'Manage multiple profiles and variants from a single account.',
    duration: 4500,
    mood: 'focused',
  },
]

export const IDLE_TIPS: MascotTip[] = [
  {
    id: 'idle-github-tip',
    message: 'READMEs with SVG badges have higher visual retention on the profile.',
    duration: 4500,
    mood: 'focused',
  },
  {
    id: 'idle-star',
    message: 'The GitAscii repository accepts contributions and feedback on GitHub.',
    duration: 4500,
    mood: 'happy',
  },
]

export const PET_RESPONSES: string[] = [
  'Strobi operational.',
  'Ready to help.',
  'Mascot mode active.',
  'GitAscii ready.',
  'Everything in order.',
]
