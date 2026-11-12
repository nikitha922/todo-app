# Taskly

A fast, keyboard-friendly to-do app with due dates, categories and a live insights panel.

**Live demo:** https://nikitha922.github.io/todo-app/

## Features

- **Views:** All tasks, Today, Upcoming and Completed, with tasks grouped by overdue, today, upcoming and no date
- **Categories and priorities:** five categories, three priority levels, and category filtering from the sidebar
- **Due dates:** quick Today / Tomorrow buttons or a date picker, with overdue highlighting
- **Editing:** double-click or use Edit to rename, and undo a delete from the toast
- **Search:** filter tasks as you type
- **Insights panel:** Chart.js charts for open tasks by category, tasks due over the next 7 days, and open tasks by priority, plus open, done and overdue counts
- **Light and dark themes**, with light as the default
- **Keyboard shortcuts:** `N` focuses the new-task box, `/` focuses search
- **Persistence:** everything is saved in `localStorage`, so there is no backend or account

## Tech stack

| Area | Choice |
| --- | --- |
| UI | React 19 |
| Language | TypeScript |
| Build tool | Vite |
| Charts | Chart.js with react-chartjs-2 |
| Linting | oxlint |
| Hosting | GitHub Pages (via `gh-pages`) |

## Getting started

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with oxlint |
| `npm run deploy` | Build and publish `dist/` to the `gh-pages` branch |

If a deploy fails with `a branch named 'gh-pages' already exists`, run `npx gh-pages-clean` first.

## Project structure

```
src/
  App.tsx             state, filtering, grouping and layout
  components/         Sidebar, TodoForm, TodoItem, Charts
  dates.ts            due-date helpers
  useLocalStorage.ts  persisted state hook
  types.ts            shared types
```
