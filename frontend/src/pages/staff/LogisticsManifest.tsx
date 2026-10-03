import { useState, useEffect } from 'react'
import {
  getLogisticsManifests,
  saveLogisticsManifests,
  clearAllLogisticsManifests,
  ManifestItem,
} from '../../lib/api'
import { Toast } from '../../components/ui/Toast'
import {
  QrcodeOutlined,
  CheckCircleOutlined,
  SendOutlined,
  InboxOutlined,
  CarOutlined,
  SyncOutlined,
  BarcodeOutlined,
  CloseOutlined,
  ThunderboltOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons'

export default function LogisticsManifest() {
  const [activeTab, setActiveTab] = useState<'RECEIVING' | 'DELIVERY'>('RECEIVING')
  const [manifests, setManifests] = useState<ManifestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null)

  // Scanner modal state
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannerMode, setScannerMode] = useState<'RECEIVING' | 'DELIVERY'>('RECEIVING')
  const [scannedCode, setScannedCode] = useState('')

  // Create Manifest Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDriver, setNewDriver] = useState('')
  const [newVehicle, setNewVehicle] = useState('')
  const [newItemsCount, setNewItemsCount] = useState(3)

  useEffect(() => {
    loadManifests()
  }, [])

  const loadManifests = async () => {
    setLoading(true)
    const data = await getLogisticsManifests()
    setManifests(data)
    setLoading(false)
  }

  const handleClearData = async () => {
    await clearAllLogisticsManifests()
    setManifests([])
    setToast({ message: '🗑️ Đã xóa toàn bộ dữ liệu mẫu thành công!', type: 'info' })
  }

  const handleCreateManifest = async () => {
    if (!newTitle.trim()) return

    const nowStr = new Date().toLocaleString('vi-VN')
    const codeStr = activeTab === 'RECEIVING' 
      ? `PH-NHAN-${Math.floor(100 + Math.random() * 900)}` 
      : `PH-GIAO-${Math.floor(100 + Math.random() * 900)}`

    const items = Array.from({ length: newItemsCount }).map((_, idx) => {
      const num = 100 + idx + 1
      return {
        id: `PK-${num}`,
        code: `SP-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `Kiện hàng #${idx + 1} (${newTitle})`,
        recipient: activeTab === 'RECEIVING' ? 'Kho TDTU - Bến Nhận' : 'Sinh viên / Cán bộ',
        address: 'TDTU Tân Phong, Q.7',
        status: activeTab === 'RECEIVING' ? ('CHO_NHAN' as const) : ('CHO_GIAO' as const),
      }
    })

    const newManifest: ManifestItem = {
      id: `MAN-${Date.now()}`,
      code: codeStr,
      type: activeTab,
      title: newTitle.trim(),
      driver: newDriver.trim() || 'Tài xế mặc định',
      vehicle: newVehicle.trim() || '51C-000.00',
      createdDate: nowStr,
      totalItems: items.length,
      completedItems: 0,
      status: 'CHO_XU_LY',
      items,
    }

    const updated = [newManifest, ...manifests]
    setManifests(updated)
    await saveLogisticsManifests(updated)
    setCreateModalOpen(false)
    setNewTitle('')
    setNewDriver('')
    setNewVehicle('')
    setToast({ message: `✨ Đã tạo phơi mới: ${codeStr} thành công!`, type: 'success' })
  }

  // Filter current manifest based on active tab
  const activeManifest = manifests.find(m => m.type === activeTab)

  // --- ACTIONS FOR NHẬN HÀNG (RECEIVING) ---
  const handleReceiveAllInManifest = async () => {
    if (!activeManifest || activeManifest.type !== 'RECEIVING') return

    // CHỈ cập nhật cho phơi NHẬN HÀNG, TUYỆT ĐỐI không đụng đến phơi GIAO HÀNG
    const updated = manifests.map(m => {
      if (m.id === activeManifest.id && m.type === 'RECEIVING') {
        const nowStr = new Date().toLocaleString('vi-VN')
        const updatedItems = m.items.map(item => ({
          ...item,
          status: 'DA_NHAN' as const, // Đã nhập bến (Không thể sửa)
          receivedAt: item.receivedAt || nowStr,
        }))
        return {
          ...m,
          completedItems: m.totalItems,
          status: 'HOAN_THANH' as const,
          items: updatedItems,
        }
      }
      // Giữ nguyên 100% phơi Giao hàng (DELIVERY), không cho tự động cập nhật
      return m
    })

    setManifests(updated)
    await saveLogisticsManifests(updated)
    setToast({
      message: `🔒 [NHẬN HÀNG] Đã nhận tất cả hàng trong phơi ${activeManifest.code} -> Trạng thái "Đã nhập bến (không thể sửa)". Luồng Giao Hàng giữ nguyên độc lập!`,
      type: 'success',
    })
  }

  // --- ACTIONS FOR GIAO HÀNG (DELIVERY) ---
  const handleDeliverAllInManifest = async () => {
    if (!activeManifest || activeManifest.type !== 'DELIVERY') return

    // CHỈ cập nhật cho phơi GIAO HÀNG, TUYỆT ĐỐI không can thiệp phơi NHẬN HÀNG
    const updated = manifests.map(m => {
      if (m.id === activeManifest.id && m.type === 'DELIVERY') {
        const nowStr = new Date().toLocaleString('vi-VN')
        const updatedItems = m.items.map(item => ({
          ...item,
          status: 'DA_GIAO' as const,
          deliveredAt: item.deliveredAt || nowStr,
        }))
        return {
          ...m,
          completedItems: m.totalItems,
          status: 'HOAN_THANH' as const,
          items: updatedItems,
        }
      }
      return m
    })

    setManifests(updated)
    await saveLogisticsManifests(updated)
    setToast({
      message: `🚚 [GIAO HÀNG] Đã xác nhận GIAO TẤT CẢ ${activeManifest.totalItems} hàng trong phơi ${activeManifest.code}!`,
      type: 'success',
    })
  }

  // --- OPEN SCANNERS ---
  const openReceiveScanner = () => {
    setScannerMode('RECEIVING')
    setScannedCode('')
    setScannerOpen(true)
  }

  const openDeliverScanner = () => {
    setScannerMode('DELIVERY')
    setScannedCode('')
    setScannerOpen(true)
  }

  // --- PROCESS SINGLE QR SCAN ---
  const processScanCode = async (codeToScan: string) => {
    const targetCode = codeToScan.trim().toUpperCase()
    if (!targetCode) return

    const targetManifest = manifests.find(m => m.type === scannerMode)
    if (!targetManifest) {
      setToast({ message: 'Không tìm thấy phơi hàng tương ứng!', type: 'warning' })
      return
    }

    const itemIndex = targetManifest.items.findIndex(
      i => i.code.toUpperCase() === targetCode || i.id.toUpperCase() === targetCode
    )

    if (itemIndex === -1) {
      setToast({
        message: `❌ Mã QR "${targetCode}" không có trong danh sách phơi ${scannerMode === 'RECEIVING' ? 'Nhận Hàng' : 'Giao Hàng'}!`,
        type: 'warning',
      })
      return
    }

    const item = targetManifest.items[itemIndex]
    const nowStr = new Date().toLocaleString('vi-VN')

    let updatedStatus: 'DA_NHAN' | 'DA_GIAO' = 'DA_NHAN'
    if (scannerMode === 'RECEIVING') {
      if (item.status === 'DA_NHAN') {
        setToast({ message: `ℹ️ Đơn hàng ${item.code} đã được nhận trước đó rồi!`, type: 'info' })
        return
      }
      updatedStatus = 'DA_NHAN'
    } else {
      if (item.status === 'DA_GIAO') {
        setToast({ message: `ℹ️ Đơn hàng ${item.code} đã được giao trước đó rồi!`, type: 'info' })
        return
      }
      updatedStatus = 'DA_GIAO'
    }

    const updatedManifests = manifests.map(m => {
      if (m.id === targetManifest.id) {
        const newItems = [...m.items]
        newItems[itemIndex] = {
          ...item,
          status: updatedStatus,
          receivedAt: scannerMode === 'RECEIVING' ? nowStr : item.receivedAt,
          deliveredAt: scannerMode === 'DELIVERY' ? nowStr : item.deliveredAt,
        }
        const doneCount = newItems.filter(i => i.status === 'DA_NHAN' || i.status === 'DA_GIAO').length
        return {
          ...m,
          completedItems: doneCount,
          status: doneCount === m.totalItems ? ('HOAN_THANH' as const) : ('DANG_XU_LY' as const),
          items: newItems,
        }
      }
      return m
    })

    setManifests(updatedManifests)
    await saveLogisticsManifests(updatedManifests)

    if (scannerMode === 'RECEIVING') {
      setToast({
        message: `✅ [NHẬN HÀNG SUCCESS] Đã quét QR nhận thành công đơn: ${item.name} (${item.code})`,
        type: 'success',
      })
    } else {
      setToast({
        message: `🚚 [GIAO HÀNG SUCCESS] Đã quét QR giao thành công đơn: ${item.name} (${item.code})`,
        type: 'success',
      })
    }
    setScannedCode('')
    setScannerOpen(false)
  }

  return (
    <div className="page-container max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md uppercase">
              Quy Trình Tách Biệt
            </span>
            <span className="text-xs text-slate-400">| Logistics & Vận chuyển</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Quản Lý Phơi Hàng (Nhận Hàng & Giao Hàng)
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Quét QR và Nhận/Giao tất cả theo phơi riêng biệt, không gộp luồng xử lý.
          </p>
        </div>

        {/* Right side buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <PlusOutlined />
            <span>Tạo Phơi Mới</span>
          </button>
          <button
            onClick={handleClearData}
            title="Xóa toàn bộ dữ liệu mẫu trong hệ thống"
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200/80 transition-colors"
          >
            <DeleteOutlined />
            <span>Xóa Data Mẫu</span>
          </button>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/60 ml-1">
            <button
              onClick={() => setActiveTab('RECEIVING')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'RECEIVING'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <InboxOutlined className="text-base" />
              <span>NHẬN HÀNG (INBOUND)</span>
            </button>
            <button
              onClick={() => setActiveTab('DELIVERY')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'DELIVERY'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SendOutlined className="text-base" />
              <span>GIAO HÀNG (OUTBOUND)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Card based on active tab */}
      {activeTab === 'RECEIVING' ? (
        /* ==================== SECTION 1: NHẬN HÀNG ==================== */
        <div className="space-y-6">
          {/* Action Bar for Nhận Hàng */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
              <InboxOutlined className="text-[200px]" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-semibold mb-2">
                  <ThunderboltOutlined /> Luồng Xử Lý Nhận Hàng Tách Biệt Độc Lập
                </div>
                <h2 className="text-xl font-bold">Chế Độ: QUẢN LÝ NHẬN HÀNG (NHẬP BẾN)</h2>
                <p className="text-emerald-100/70 text-sm mt-1 max-w-xl">
                  Bấm <b>Quét QR Nhận Hàng</b> để quét từng đơn nhập bến, hoặc bấm <b>Nhận Tất Cả Hàng Trong Phơi</b> để chuyển trạng thái sang <b>"Đã nhập bến (không thể sửa)"</b>.
                </p>
                <div className="mt-2 text-xs bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 px-3 py-1.5 rounded-lg inline-block">
                  🔒 <b>Quy tắc độc lập:</b> Thao tác Nhận Hàng KHÔNG tự động cập nhật hay thay đổi trạng thái bên phơi Giao Hàng.
                </div>
              </div>

              {/* Action Buttons for Nhận Hàng */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={openReceiveScanner}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-md transition-transform active:scale-95"
                >
                  <QrcodeOutlined className="text-lg" />
                  <span>Quét QR Nhận Hàng</span>
                </button>
                <button
                  onClick={handleReceiveAllInManifest}
                  disabled={!activeManifest || activeManifest.completedItems === activeManifest.totalItems}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-xl border border-white/20 transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  <CheckCircleOutlined className="text-emerald-400 text-lg" />
                  <span>Nhận Tất Cả Hàng Trong Phơi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Receiving Manifest Card */}
          {activeManifest && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    {activeManifest.code}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mt-0.5">
                    {activeManifest.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                    <span>Tài xế: <b>{activeManifest.driver}</b></span>
                    <span>Biển số: <b>{activeManifest.vehicle}</b></span>
                    <span>Ngày tạo: {activeManifest.createdDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Tiến độ nhận hàng</div>
                    <div className="text-lg font-bold text-emerald-600">
                      {activeManifest.completedItems} / {activeManifest.totalItems} kiện
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-100">
                    {Math.round((activeManifest.completedItems / activeManifest.totalItems) * 100)}%
                  </div>
                </div>
              </div>

              {/* Items Table for Receiving */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200/80">
                      <th className="text-left px-4 py-3">Mã Kiện</th>
                      <th className="text-left px-4 py-3">Mã Đơn / Tên Hàng</th>
                      <th className="text-left px-4 py-3">Đơn Vị Nhận</th>
                      <th className="text-left px-4 py-3">Trạng Thái Nhận Hàng</th>
                      <th className="text-left px-4 py-3">Thời Gian Nhận</th>
                      <th className="text-right px-4 py-3">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeManifest.items.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-600">
                          {item.id}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <div className="text-xs font-mono text-slate-400">{item.code}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-slate-700 font-medium">{item.recipient}</div>
                          <div className="text-xs text-slate-400">{item.address}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          {item.status === 'DA_NHAN' ? (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-full w-fit">
                                <CheckCircleOutlined className="text-emerald-600" /> ĐÃ NHẬP BẾN (KHÔNG THỂ SỬA)
                              </span>
                              <span className="text-[11px] text-slate-400">Trạng thái đã khóa tại bến nhận</span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                              <SyncOutlined spin className="text-amber-600" /> CHỜ NHẬP BẾN
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">
                          {item.receivedAt || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {item.status !== 'DA_NHAN' ? (
                            <button
                              onClick={() => processScanCode(item.code)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                            >
                              Xác nhận Nhập Bến
                            </button>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-400 text-xs font-medium rounded border border-slate-200">
                              🔒 Khóa (Đã nhập bến)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ==================== SECTION 2: GIAO HÀNG ==================== */
        <div className="space-y-6">
          {/* Action Bar for Giao Hàng */}
          <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
              <CarOutlined className="text-[200px]" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-semibold mb-2">
                  <ThunderboltOutlined /> Luồng Xử Lý Giao Hàng Tách Biệt
                </div>
                <h2 className="text-xl font-bold">Chế Độ: QUẢN LÝ GIAO HÀNG</h2>
                <p className="text-indigo-100/70 text-sm mt-1 max-w-xl">
                  Bấm <b>Quét QR Giao Hàng</b> để quét từng đơn xuất hàng, hoặc bấm <b>Giao Tất Cả Hàng Trong Phơi</b> để hoàn tất toàn bộ phơi giao.
                </p>
              </div>

              {/* Action Buttons for Giao Hàng */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={openDeliverScanner}
                  className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-5 py-3 rounded-xl shadow-md transition-transform active:scale-95"
                >
                  <QrcodeOutlined className="text-lg" />
                  <span>Quét QR Giao Hàng</span>
                </button>
                <button
                  onClick={handleDeliverAllInManifest}
                  disabled={!activeManifest || activeManifest.completedItems === activeManifest.totalItems}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-xl border border-white/20 transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  <SendOutlined className="text-indigo-300 text-lg" />
                  <span>Giao Tất Cả Hàng Trong Phơi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Delivery Manifest Card */}
          {activeManifest && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    {activeManifest.code}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mt-0.5">
                    {activeManifest.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                    <span>Tài xế giao: <b>{activeManifest.driver}</b></span>
                    <span>Phương tiện: <b>{activeManifest.vehicle}</b></span>
                    <span>Ngày tạo: {activeManifest.createdDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Tiến độ giao hàng</div>
                    <div className="text-lg font-bold text-indigo-600">
                      {activeManifest.completedItems} / {activeManifest.totalItems} kiện
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
                    {Math.round((activeManifest.completedItems / activeManifest.totalItems) * 100)}%
                  </div>
                </div>
              </div>

              {/* Items Table for Delivery */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200/80">
                      <th className="text-left px-4 py-3">Mã Kiện</th>
                      <th className="text-left px-4 py-3">Mã Đơn / Tên Hàng</th>
                      <th className="text-left px-4 py-3">Người Nhận / Địa Chỉ</th>
                      <th className="text-left px-4 py-3">Trạng Thái Giao Hàng</th>
                      <th className="text-left px-4 py-3">Thời Gian Giao</th>
                      <th className="text-right px-4 py-3">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeManifest.items.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-600">
                          {item.id}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <div className="text-xs font-mono text-slate-400">{item.code}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-slate-700 font-medium">{item.recipient}</div>
                          <div className="text-xs text-slate-400">{item.address}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          {item.status === 'DA_GIAO' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                              <SendOutlined className="text-indigo-600" /> ĐÃ GIAO HÀNG
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-800 text-xs font-bold rounded-full">
                              <SyncOutlined spin className="text-sky-600" /> CHỜ GIAO HÀNG
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">
                          {item.deliveredAt || '—'}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {item.status !== 'DA_GIAO' && (
                            <button
                              onClick={() => processScanCode(item.code)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                            >
                              Xác nhận Giao
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SIMULATED QR CAMERA SCANNER MODAL WITH STRICT MODE SEPARATION */}
      {scannerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Mode Banner */}
            <div
              className={`p-4 text-white flex items-center justify-between ${
                scannerMode === 'RECEIVING'
                  ? 'bg-emerald-700'
                  : 'bg-indigo-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <QrcodeOutlined className="text-xl" />
                <span className="font-bold text-sm tracking-wide">
                  {scannerMode === 'RECEIVING'
                    ? 'CHẾ ĐỘ: QUÉT QR NHẬN HÀNG (INBOUND)'
                    : 'CHẾ ĐỘ: QUÉT QR GIAO HÀNG (OUTBOUND)'}
                </span>
              </div>
              <button
                onClick={() => setScannerOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <CloseOutlined />
              </button>
            </div>

            {/* Camera Viewport Simulation */}
            <div className="p-6 bg-slate-950 text-center relative flex flex-col items-center">
              <div className="w-64 h-64 border-2 border-dashed border-emerald-400/60 rounded-2xl relative flex items-center justify-center overflow-hidden bg-slate-900/80 shadow-inner">
                {/* Laser animation */}
                <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse" style={{ top: '45%' }} />

                <div className="text-center p-4">
                  <BarcodeOutlined className="text-5xl text-emerald-400 mb-2 opacity-80" />
                  <div className="text-xs text-slate-300 font-mono">
                    {scannerMode === 'RECEIVING'
                      ? 'Hướng camera vào Mã QR đơn cần NHẬN'
                      : 'Hướng camera vào Mã QR đơn cần GIAO'}
                  </div>
                </div>
              </div>

              {/* Mode Alert */}
              <div className={`mt-4 px-3 py-1.5 rounded-lg text-xs font-bold ${
                scannerMode === 'RECEIVING'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
              }`}>
                ⚠️ Chỉ xử lý tác vụ {scannerMode === 'RECEIVING' ? 'NHẬN HÀNG' : 'GIAO HÀNG'}. Không gộp luồng.
              </div>
            </div>

            {/* Scan Inputs & Demo Barcode Selector */}
            <div className="p-6 space-y-4 bg-slate-50">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nhập mã đơn / Mã QR thủ công:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scannedCode}
                    onChange={e => setScannedCode(e.target.value)}
                    placeholder="VD: SP-9902 hoặc SP-8801"
                    className="input font-mono flex-1 text-sm uppercase"
                    onKeyDown={e => e.key === 'Enter' && processScanCode(scannedCode)}
                  />
                  <button
                    onClick={() => processScanCode(scannedCode)}
                    className={`px-4 py-2 font-bold text-white text-sm rounded-xl transition-colors ${
                      scannerMode === 'RECEIVING'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    Xác nhận
                  </button>
                </div>
              </div>

              {/* Quick Barcode Pickers from Active Manifest */}
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">
                  Hoặc bấm chọn nhanh đơn trong phơi {scannerMode === 'RECEIVING' ? 'Nhận Hàng' : 'Giao Hàng'}:
                </div>
                <div className="flex flex-wrap gap-2">
                  {manifests
                    .find(m => m.type === scannerMode)
                    ?.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => processScanCode(item.code)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold hover:border-emerald-500 hover:text-emerald-700 transition-all text-left shadow-2xs"
                      >
                        {item.code} ({item.name})
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW MANIFEST MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                Tạo Phơi {activeTab === 'RECEIVING' ? 'Nhận Hàng' : 'Giao Hàng'} Mới
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <CloseOutlined />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên phơi / Mô tả:</label>
                <input
                  type="text"
                  placeholder="VD: Phơi nhập hàng kho TDTU"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tài xế:</label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn A"
                    value={newDriver}
                    onChange={e => setNewDriver(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Biển số xe:</label>
                  <input
                    type="text"
                    placeholder="VD: 51C-123.45"
                    value={newVehicle}
                    onChange={e => setNewVehicle(e.target.value)}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số lượng kiện mẫu trong phơi:</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newItemsCount}
                  onChange={e => setNewItemsCount(Number(e.target.value))}
                  className="input w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateManifest}
                disabled={!newTitle.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl disabled:opacity-50"
              >
                Tạo Phơi Hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
