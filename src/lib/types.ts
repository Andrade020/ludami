export interface Profile {
  id: string
  username: string
  avatar_color: string
  avatar_url: string | null
  created_at: string
}

export type AreaVisibility = 'public' | 'followers' | 'private'

export interface Area {
  id: string
  name: string
  description: string | null
  color: string
  owner_id: string
  visibility: AreaVisibility
  created_at: string
  owner?: Profile
  member_count?: number
  link_count?: number
  is_member?: boolean
  is_archived?: boolean
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

export type FollowStatus = 'pending' | 'accepted'

export interface Follow {
  follower_id: string
  following_id: string
  status: FollowStatus
  created_at: string
  follower?: Profile
  following?: Profile
}

export interface YouTubeInfo {
  title: string
  thumbnail_url: string
  author_name: string
}
