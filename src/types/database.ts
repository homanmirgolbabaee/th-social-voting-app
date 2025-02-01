export interface Profile {
    id: string
    username: string
    created_at: string
    updated_at: string
    avatar_url?: string
  }
  
  export interface Page {
    id: string
    message: string
    creator_id: string
    vote_count: number
    title: string
    created_at: string
  }
  
  export interface Vote {
    id: string
    page_id: string
    user_id: string
    created_at: string
  }