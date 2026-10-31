import { useApp } from '../context/AppContext'

export default function useChartTheme() {
  const { theme } = useApp()
  const dark = theme === 'dark'
  return {
    dark,
    axis: dark ? '#8A95A5' : '#5C6674',
    grid: dark ? 'rgba(255,255,255,0.06)' : 'rgba(12,16,22,0.07)',
    lime: dark ? '#C6FF3D' : '#6CBF00',
    cyan: dark ? '#22E4FF' : '#0596B8',
    violet: dark ? '#B987FF' : '#8B5CF6',
    tooltipBg: dark ? 'rgba(18,22,30,0.92)' : 'rgba(255,255,255,0.95)',
    tooltipBorder: dark ? 'rgba(255,255,255,0.1)' : 'rgba(12,16,22,0.1)',
    ink: dark ? '#EEF3F8' : '#0C1016',
  }
}
