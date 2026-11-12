import { useState, type FormEvent } from 'react'
import { CATEGORIES, PRIORITIES, type Category, type Priority } from '../types'

interface Props {
  onAdd: (text: string, priority: Priority, category: Category, dueDate: string | null) => void
}

export function TodoForm({ onAdd }: Props) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [category, setCategory] = useState<Category>('Personal')
  const [dueDate, setDueDate] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed, priority, category, dueDate || null)
    setText('')
    setDueDate('')
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-main">
        <input
          className="form-input"
          placeholder="What needs to be done?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="New task"
        />
        <button className="btn-primary" type="submit" disabled={!text.trim()}>
          <span aria-hidden>＋</span> Add
        </button>
      </div>
      <div className="form-options">
        <div className="segmented" role="group" aria-label="Priority">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              className={`seg seg-${p} ${priority === p ? 'active' : ''}`}
              onClick={() => setPriority(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <select
          className="select"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          aria-label="Category"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className="select"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          aria-label="Due date"
        />
      </div>
    </form>
  )
}
