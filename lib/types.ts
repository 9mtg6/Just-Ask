export interface Profile {
  id: string
  full_name: string | null
  display_name?: string | null
  avatar_url: string | null
  bio?: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug?: string
  description: string | null
  icon?: string | null
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
  upvotes_count: number
  answers_count: number
  views_count: number
  is_resolved: boolean
  is_deleted?: boolean
  created_at: string
  updated_at: string
  // Joined data
  profiles?: Profile
  categories?: Category
  user_has_upvoted?: boolean
  export interface Question {
  id: string
  title: string
  content: string
  user_id: string
  category_id: string | null
  is_anonymous: boolean
  upvotes_count: number
  answers_count: number
  views_count: number
  is_resolved: boolean
  is_deleted?: boolean
  image_url?: string | null // <-- هذا هو السطر الناقص
  created_at: string
  updated_at: string
  // Joined data
  profiles?: Profile
  categories?: Category
  user_has_upvoted?: boolean
}
}

export interface Answer {
  id: string
  content: string
  question_id: string
  user_id: string
  is_anonymous: boolean
  is_accepted: boolean
  upvotes_count: number
  is_deleted?: boolean
  created_at: string
  updated_at: string
  // Joined data
  profiles?: Profile
  user_has_upvoted?: boolean
}

export interface QuestionUpvote {
  id: string
  user_id: string
  question_id: string
  created_at: string
}

export interface AnswerUpvote {
  id: string
  user_id: string
  answer_id: string
  created_at: string
}
