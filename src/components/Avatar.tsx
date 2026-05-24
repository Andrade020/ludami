import type { Profile } from '../lib/types'

interface Props {
  profile: Pick<Profile, 'username' | 'avatar_color' | 'avatar_url'>
  size?: number
  rounded?: string
}

export default function Avatar({ profile, size = 48, rounded = 'rounded-2xl' }: Props) {
  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.username}
        className={`object-cover flex-shrink-0 ${rounded}`}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className={`flex items-center justify-center text-white font-extrabold flex-shrink-0 ${rounded}`}
      style={{ backgroundColor: profile.avatar_color, width: size, height: size, fontSize: size * 0.36 }}
    >
      {profile.username[0].toUpperCase()}
    </div>
  )
}
