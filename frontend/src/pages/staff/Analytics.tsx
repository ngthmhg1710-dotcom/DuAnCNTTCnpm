import { useEffect, useState } from 'react'
import { Alert, Card, Col, Row, Select, Statistic, Tag } from 'antd'
import ReactECharts from 'echarts-for-react'
import { getAnalyticsOverview } from '../../lib/api'

type Analytics = {
  summary: { students: number; activities: number; participations: number; declarations: number }
  byCategory: { category: string; value: number }[]
  byDeclarationStatus: { status: string; value: number }[]
}

export default function StaffAnalytics() {
  const [data, setData] = useState<Analytics | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getAnalyticsOverview().then(setData).catch(() => setError('Không tải được dữ liệu phân tích từ backend.'))
  }, [])

  const monthlyOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['T9', 'T10', 'T11', 'T12', 'T1'] },
    yAxis: { type: 'value' },
    series: [{ name: 'Hoạt động', type: 'bar', data: [6, 9, 7, 4, 3], barMaxWidth: 36 }]
  }

  const categoryOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['45%', '72%'],
      data: (data?.byCategory?.length ? data.byCategory : [
        { name: 'Học thuật', value: 15 },
        { name: 'Tình nguyện', value: 12 },
        { name: 'Văn hóa - Thể thao', value: 7 },
        { name: 'Ngoại khóa', value: 4 },
      ]).map((x: any) => ({ name: x.category ?? x.name, value: x.value }))
    }]
  }

  const statusOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '70%',
      data: (data?.byDeclarationStatus || []).map(x => ({ name: x.status, value: x.value }))
    }]
  }

  return (
    <div className="page-container">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Thống kê</h1>
        <p className="text-slate-500 text-sm mt-1">Phân tích hoạt động sinh viên Khoa CNTT bằng dữ liệu PostgreSQL.</p>
      </div>

      {error && <Alert type="warning" showIcon message={error} className="mb-5" />}
      <Card className="mb-5">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Select defaultValue="HK1 2024-2025" className="w-full sm:w-auto min-w-[160px]" options={[{value:'HK1 2024-2025'}, {value:'HK2 2023-2024'}]} />
          <Select defaultValue="Tất cả khóa" className="w-full sm:w-auto min-w-[140px]" options={[{value:'Tất cả khóa'}, {value:'2021'}, {value:'2022'}]} />
          <Select defaultValue="Tất cả lớp" className="w-full sm:w-auto min-w-[140px]" options={[{value:'Tất cả lớp'}, {value:'TH21A'}, {value:'TH21B'}]} />
        </div>
      </Card>

      <Row gutter={[16, 16]} className="mb-5">
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Sinh viên" value={data?.summary.students ?? 0} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Hoạt động" value={data?.summary.activities ?? 0} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Lượt tham gia" value={data?.summary.participations ?? 0} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="Khai báo" value={data?.summary.declarations ?? 0} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}><Card title="Hoạt động theo tháng"><ReactECharts option={monthlyOption} style={{ height: 320 }} /></Card></Col>
        <Col xs={24} lg={12}><Card title="Theo loại hoạt động"><ReactECharts option={categoryOption} style={{ height: 320 }} /></Card></Col>
        <Col xs={24} lg={12}><Card title="Trạng thái khai báo">
          {data?.byDeclarationStatus?.length ? <ReactECharts option={statusOption} style={{ height: 320 }} /> : <Tag color="blue">Chưa có dữ liệu khai báo</Tag>}
        </Card></Col>
      </Row>
    </div>
  )
}
