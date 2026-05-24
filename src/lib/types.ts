export interface Profile {
  id: string
  username: string
  avatar_color: string
  created_at: string
}

export interface Area {
  id: string
  name: string
  description: string | null
  color: string
  owner_id: string
  is_public: boolean
  created_at: string
  owner?: Profile
  member_count?: number
  link_count?: number
  is_member?: boolean
}

export interface AreaMember {
  area_id: string
  user_id: string
  joined_at: string
  profile?: Profile
}

export interface Link {
  id: string
  area_id: string
  url: string
  title: string | null
  thumbnail_url: string | null
  notes: string | null
  added_by: string
  created_at: string
  profile?: Profile
}

export interface YouTubeInfo {
  title: string
  thumbnail_url: string
  author_name: string
}
