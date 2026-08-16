export interface GalleryFilterDef {
  id: string
  labelKey: string
  defaultLabel: string
}

export const EXPLORE_GALLERY_FILTERS: readonly GalleryFilterDef[] = [
  { id: 'all', labelKey: 'explore.gallery.all', defaultLabel: 'All Community Profiles' },
  { id: 'terminal', labelKey: 'explore.gallery.terminal', defaultLabel: 'Terminal CLI' },
  { id: 'dracula', labelKey: 'explore.gallery.dracula', defaultLabel: 'Dracula' },
  { id: 'tokyo-night', labelKey: 'explore.gallery.tokyo_night', defaultLabel: 'Tokyo Night' },
  { id: 'minimal', labelKey: 'explore.gallery.minimal', defaultLabel: 'Minimal' },
]
