export type ProfileStatus = 'active' | 'draft' | 'archived'

export interface ProProfileRecord {
  id: string
  slug: string
  name: string
  description?: string
  status: ProfileStatus
  isDefault: boolean
  widgetsCount: number
  totalViews: number
  lastUpdated: string
  createdAt: string
  publicUrl: string
  rawSvgUrl: string
}
