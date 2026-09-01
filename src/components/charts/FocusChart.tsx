import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import { useEffect, useRef } from 'react'

echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, SVGRenderer])

export function FocusChart({ labels, values, type = 'line', height = 210 }: { labels: string[]; values: number[]; type?: 'line' | 'bar'; height?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return; const chart = echarts.init(ref.current, undefined, { renderer: 'svg' })
    const color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#5268d9'; const text = getComputedStyle(document.documentElement).getPropertyValue('--muted-fg').trim() || '#667085'; const border = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#e5e7eb'
    chart.setOption({ animation: false, grid: { top: 12, left: 36, right: 8, bottom: 24 }, tooltip: { trigger: 'axis', valueFormatter: (v: unknown) => `${String(v ?? 0)} min` }, xAxis: { type: 'category', data: labels, boundaryGap: type === 'bar', axisLine: { lineStyle: { color: border } }, axisTick: { show: false }, axisLabel: { color } }, yAxis: { type: 'value', min: 0, minInterval: 1, splitLine: { lineStyle: { color: border, opacity: 0.5 } }, axisLabel: { color: text, formatter: '{value}m' } }, series: [{ type, data: values, smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { width: 2, color }, itemStyle: { color }, areaStyle: type === 'line' ? { color, opacity: 0.08 } : undefined, barWidth: 20, borderRadius: type === 'bar' ? [4, 4, 0, 0] : undefined }] })
    const observer = new ResizeObserver(() => chart.resize()); observer.observe(ref.current); return () => { observer.disconnect(); chart.dispose() }
  }, [labels, values, type])
  return <div ref={ref} style={{ width: '100%', height }} aria-label="Focus duration chart" />
}
