import { useEffect, useState } from 'react'
import { Alert, Card, Col, Empty, Row, Statistic } from 'antd'
import Chart from '../../components/ui/Chart'
import { getStaffDashboard, type StaffDashboardData, type StatFilters } from '../../lib/api'
import StatFilterBar from '../../components/ui/StatFilterBar'

const H = { height: 300 }
const pie = (data: { name: string; value: number }[]) => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  series: [{ type: 'pie', radius: ['45%', '70%'], data }],
})
const bar = (names: string[], series: { name: string; data: number[] }[]) => ({
  tooltip: { trigger: 'axis' },
  legend: series.length > 1 ? { bottom: 0 } : undefined,
  grid: { left: 40, right: 16, top: 24, bottom: series.length > 1 ? 48 : 32 },
  xAxis: { type: 'category', data: names, axisLabel: { interval: 0, rotate: names.length > 6 ? 30 : 0 } },
  yAxis: { type: 'value', minInterval: 1 },
  series: series.map(s => ({ ...s, type: 'bar', barMaxWidth: 36 })),
})

export default function StaffAnalytics() {
  const [filters, setFilters] = useState<StatFilters>({})
  const [data, setData] = useState<StaffDashboardData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    getStaffDashboard(filters).then(setData).catch(() => setError('Không tải được dữ liệu thống kê.'))
  }, [filters])

  const chart = (title: string, rows: unknown[] | undefined, option: object) => (
    <Col xs={24} lg={12}>
      <Card title={title}>{rows?.length ? <Chart option={option} height={H.height} /> : <Empty description="Chưa có dữ liệu" style={{ height: H.height, paddingTop: 80 }} />}</Card>
    </Col>
  )

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Thống kê</h1>
        <p className="text-slate-500 text-sm mt-1">Số liệu theo bộ lọc · {data?.semester ?? '...'}</p>
      </div>

      <StatFilterBar value={filters} onChange={setFilters} />
      {error && <Alert type="warning" showIcon message={error} className="mb-5" />}

      <Row gutter={[16, 16]} className="mb-5">
        <Col xs={12} lg={6}><Card><Statistic title="Sinh viên" value={data?.students ?? 0} /></Card></Col>
        <Col xs={12} lg={6}><Card><Statistic title="Hoạt động" value={data?.activities ?? 0} /></Card></Col>
        <Col xs={12} lg={6}><Card><Statistic title="Lượt tham gia" value={data?.attended ?? 0} suffix={`/ ${data?.participations ?? 0} đăng ký`} /></Card></Col>
        <Col xs={12} lg={6}><Card><Statistic title="Tỷ lệ tham gia" value={data?.participationRate ?? 0} suffix="%" /></Card></Col>
      </Row>

      <Row gutter={[16, 16]}>
        {chart('Hoạt động theo tháng', data?.byMonth, bar(data?.byMonth.map(x => x.name) ?? [], [{ name: 'Hoạt động', data: data?.byMonth.map(x => x.value) ?? [] }]))}
        {chart('Theo loại hoạt động', data?.byCategory, pie((data?.byCategory ?? []).map(x => ({ name: x.category, value: x.value }))))}
        {chart('Theo trạng thái hoạt động', data?.byStatus, pie(data?.byStatus ?? []))}
        {chart('Theo học kỳ', data?.bySemester, bar(data?.bySemester.map(x => x.name) ?? [], [
          { name: 'Hoạt động', data: data?.bySemester.map(x => x.activities) ?? [] },
          { name: 'Lượt tham gia', data: data?.bySemester.map(x => x.attended) ?? [] },
        ]))}
        {chart('Theo lớp', data?.byClass, bar(data?.byClass.map(x => x.name) ?? [], [
          { name: 'Sinh viên', data: data?.byClass.map(x => x.students) ?? [] },
          { name: 'Lượt tham gia', data: data?.byClass.map(x => x.attended) ?? [] },
        ]))}
        {chart('Theo khóa', data?.byCohort, bar(data?.byCohort.map(x => x.name) ?? [], [
          { name: 'Sinh viên', data: data?.byCohort.map(x => x.students) ?? [] },
          { name: 'Lượt tham gia', data: data?.byCohort.map(x => x.attended) ?? [] },
        ]))}
        {chart('Trạng thái khai báo', data?.byDeclarationStatus, pie((data?.byDeclarationStatus ?? []).map(x => ({ name: x.status, value: x.value }))))}
      </Row>
      <p className="text-xs text-slate-400 mt-4">Lượt tham gia chỉ tính hoạt động đã công bố, chưa hủy. Tỷ lệ tham gia = số lượt đã điểm danh ÷ số lượt đăng ký của hoạt động đã đến giờ bắt đầu. Học kỳ tính theo ngày bắt đầu hoạt động.</p>
    </div>
  )
}
