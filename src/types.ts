export type Priority = 'low' | 'medium' | 'high'

export type Category = 'Personal' | 'Work' | 'Health' | 'Learning' | 'Shopping'

export type Filter = 'all' | 'active' | 'completed'

export interface Todo {
  id: string
  text: string
  completed: boolean
  priority: Priority
  category: Category
  dueDate: string | null
  createdAt: number
}

export const CATEGORIES: Category[] = ['Personal', 'Work', 'Health', 'Learning', 'Shopping']

export const PRIORITIES: Priority[] = ['low', 'medium', 'high']
