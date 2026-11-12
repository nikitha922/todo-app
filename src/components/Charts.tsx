import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import { useMemo } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { dateInDays } from '../dates'
import { CATEGORIES, PRIORITIES, type Todo } from '../types'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

interface Props {
  todos: Todo[]
  dark: boolean
}

const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

export function Charts({ todos, dark }: Props) {
  // Re-read theme colours whenever the theme flips.
  const c = useMemo(
    () => {
      void dark
      return {
        ink: cssVar('--ink'),
        muted: cssVar('--muted'),
        line: cssVar('--line'),
        surface: cssVar('--surface'),
        accent: cssVar('--accent'),
        high: cssVar('--high'),
        medium: cssVar('--medium'),
        low: cssVar('--low'),
        cats: CATEGORIES.map((k) => cssVar(`--c-${k.toLowerCase()}`)),
      }
    },
    [dark],
  )

  const open = todos.filter((t) => !t.completed)
  const done = todos.length - open.length
  const percent = todos.length === 0 ? 0 : Math.round((done / todos.length) * 100)
  const overdue = open.filter((t) => t.dueDate && t.dueDate < dateInDays(0)).length

  const days = Array.from({ length: 7 }, (_, i) => dateInDays(i))
  const dueCounts = [overdue, ...days.map((d) => open.filter((t) => t.dueDate === d).length)]
  const dueLabels = [
    'Overdue',
    ...days.map((d, i) =>
      i === 0 ? 'Today' : new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' }),
    ),
  ]
  const dueColors = dueLabels.map((_, i) => (i === 0 ? c.high : i === 1 ? c.accent : c.ink))

  const font = { family: getComputedStyle(document.body).fontFamily, size: 12 }
  const tooltip = {
    backgroundColor: c.ink,
    titleColor: c.surface,
    bodyColor: c.surface,
    padding: 10,
    cornerRadius: 6,
    displayColors: false,
    titleFont: { ...font, weight: 600 as const },
    bodyFont: font,
  }

  const catCounts = CATEGORIES.map((k) => open.filter((t) => t.category === k).length)

  const centerText = {
    id: 'centerText',
    afterDraw(chart: ChartJS) {
      const { ctx, chartArea } = chart
      const x = (chartArea.left + chartArea.right) / 2
      const y = (chartArea.top + chartArea.bottom) / 2
      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = c.ink
      ctx.font = `700 30px ${font.family}`
      ctx.fillText(String(open.length), x, y - 8)
      ctx.fillStyle = c.muted
      ctx.font = `12px ${font.family}`
      ctx.fillText('open tasks', x, y + 14)
      ctx.restore()
    },
  }

  const vertical: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip },
    scales: {
      x: { grid: { display: false }, border: { color: c.line }, ticks: { color: c.muted, font } },
      y: {
        beginAtZero: true,
        grid: { color: c.line },
        border: { display: false },
        ticks: { color: c.muted, font, precision: 0, stepSize: 1 },
      },
    },
  }

  const horizontal: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: c.line },
        border: { display: false },
        ticks: { color: c.muted, font, precision: 0, stepSize: 1 },
      },
      y: { grid: { display: false }, border: { display: false }, ticks: { color: c.ink, font } },
    },
  }

  return (
    <aside className="charts" aria-label="Task insights">
      <h2 className="charts-title">Insights</h2>

      <div className="kpis">
        <div className="kpi">
          <span className="kpi-value">{open.length}</span>
          <span className="kpi-label">Open</span>
        </div>
        <div className="kpi">
          <span className="kpi-value">{percent}%</span>
          <span className="kpi-label">Done</span>
        </div>
        <div className="kpi">
          <span className={`kpi-value ${overdue ? 'is-overdue' : ''}`}>{overdue}</span>
          <span className="kpi-label">Overdue</span>
        </div>
      </div>

      <section className="chart-card">
        <h3>Open tasks by category</h3>
        <div className="chart-box chart-doughnut">
          {open.length === 0 ? (
            <p className="chart-empty">No open tasks</p>
          ) : (
            <Doughnut
              data={{
                labels: CATEGORIES.map((k, i) => `${k} (${catCounts[i]})`),
                datasets: [
                  {
                    data: catCounts,
                    backgroundColor: c.cats,
                    borderColor: c.surface,
                    borderWidth: 3,
                    hoverOffset: 4,
                  },
                ],
              }}
              plugins={[centerText]}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                layout: { padding: 4 },
                plugins: {
                  tooltip: { ...tooltip, displayColors: true },
                  legend: {
                    position: 'bottom',
                    labels: { color: c.ink, font, usePointStyle: true, boxWidth: 8, padding: 14 },
                  },
                },
              }}
            />
          )}
        </div>
      </section>

      <section className="chart-card">
        <h3>Due: overdue and the next 7 days</h3>
        <div className="chart-box">
          <Bar
            data={{
              labels: dueLabels,
              datasets: [{ data: dueCounts, backgroundColor: dueColors, borderRadius: 4, maxBarThickness: 32 }],
            }}
            options={vertical}
          />
        </div>
      </section>

      <section className="chart-card">
        <h3>Open tasks by priority</h3>
        <div className="chart-box chart-short">
          <Bar
            data={{
              labels: [...PRIORITIES].reverse().map((p) => p[0].toUpperCase() + p.slice(1)),
              datasets: [
                {
                  data: [...PRIORITIES].reverse().map((p) => open.filter((t) => t.priority === p).length),
                  backgroundColor: [c.high, c.medium, c.low],
                  borderRadius: 4,
                  maxBarThickness: 22,
                },
              ],
            }}
            options={horizontal}
          />
        </div>
      </section>
    </aside>
  )
}
