export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  created_at: string
}

export interface Question {
  id: string
  title: string
  content: string
  user_id: string
  category_id: string | null
  is_anonymous: boolean
  upvote_count: number
  answer_count: number
  view_count: number
  is_resolved: boolean
  created_at: string
  updated_at: string
  // Joined data
  profiles?: Profile
  categories?: Category
  user_has_upvoted?: boolean
}

export interface Answer {
  id: string
  content: string
  question_id: string
  user_id: string
  is_anonymous: boolean
  is_accepted: boolean
  upvote_count: number
  created_at: string
  updated_at: string
  // Joined data
  profiles?: Profile
  user_has_upvoted?: boolean
}

export interface Upvote {
  id: string
  user_id: string
  question_id: string | null
  answer_id: string | null
  created_at: string
}
