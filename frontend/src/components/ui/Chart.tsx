import ReactEChartsCoreModule from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// Chỉ nạp các loại biểu đồ đang dùng (cột, tròn) thay vì cả thư viện ECharts (~1 MB).
echarts.use([BarChart, PieChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

// echarts-for-react là CommonJS: tùy bộ build mà export mặc định nằm ở .default. Lấy đúng component ở cả hai trường hợp.
const ReactEChartsCore: typeof ReactEChartsCoreModule = (ReactEChartsCoreModule as any).default ?? ReactEChartsCoreModule

export default function Chart({ option, height }: { option: object; height: number }) {
  return <ReactEChartsCore echarts={echarts} option={option} style={{ height }} notMerge lazyUpdate />
}
