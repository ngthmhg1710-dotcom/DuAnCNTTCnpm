import { useState } from 'react'
import {
  QrcodeOutlined,
  FilterOutlined,
  PlusOutlined,
  EyeOutlined,
  FileTextOutlined,
  PrinterOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  SearchOutlined,
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  CloseOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { Toast } from '../../components/ui/Toast'

export type OrderItem = {
  id: string
  stt: number
  orderCode: string
  itemName: string
  itemQuantity: string
  vehicleManifest: string
  route: string
  routeTime: string
  staffName: string
  sender: string
  recipient: string
  fee: string
  paymentMethod: string
  status: 'Đã chuyển' | 'Chờ chuyển' | 'Đã nhận' | 'Đã hủy'
}

export default function GoodsList() {
  const [orders, setOrders] = useState<OrderItem[]>([])

  // Filters
  const [selectedDate, setSelectedDate] = useState('')
  const [directionFilter, setDirectionFilter] = useState('Tất cả hướng')
  const [sendStationFilter, setSendStationFilter] = useState('Tất cả trạm gửi')
  const [receiveStationFilter, setReceiveStationFilter] = useState('Tất cả trạm nhận')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals & Toast
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // New Order Form state
  const [newOrderCode, setNewOrderCode] = useState('DH-' + Math.floor(1000 + Math.random() * 9000))
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('1 cái')
  const [newRoute, setNewRoute] = useState('Sài Gòn ➔ Châu Đốc')
  const [newFee, setNewFee] = useState('150.000đ')
  const [newSender, setNewSender] = useState('')
  const [newRecipient, setNewRecipient] = useState('')

  const handleCreateOrder = () => {
    if (!newItemName.trim()) return

    const newOrder: OrderItem = {
      id: Date.now().toString(),
      stt: orders.length + 1,
      orderCode: newOrderCode,
      itemName: newItemName,
      itemQuantity: newItemQuantity,
      vehicleManifest: '',
      route: newRoute,
      routeTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      staffName: '',
      sender: newSender || 'Khách lẻ',
      recipient: newRecipient || 'Người nhận',
      fee: newFee,
      paymentMethod: 'Tiền rồi (Tiền mặt)',
      status: 'Đã chuyển',
    }

    setOrders([newOrder, ...orders])
    setCreateModalOpen(false)
    setNewItemName('')
    setNewSender('')
    setNewRecipient('')
    setNewOrderCode('DH-' + Math.floor(1000 + Math.random() * 9000))
    setToast(`✅ Đã tạo đơn hàng mới ${newOrder.orderCode} thành công!`)
  }

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id))
    setToast('🗑️ Đã xóa đơn hàng khỏi danh sách.')
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* 1. TOP NAVBAR */}
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-2xs sticky top-0 z-30">
        {/* Left: Breadcrumb & Menu Toggle */}
        <div className="flex items-center gap-3">
          <button className="text-slate-600 hover:text-slate-900 p-1 rounded-lg">
            <MenuOutlined className="text-lg" />
          </button>
          <nav className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <span>🏠 Hệ thống điều hành</span>
            <span>›</span>
            <span>Nhận hàng</span>
            <span>›</span>
            <span className="text-slate-900 font-bold">Danh sách hàng hóa</span>
          </nav>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex items-center relative w-96">
          <input
            type="text"
            placeholder="Tìm mã đơn, tên hàng, người gửi..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white transition-all shadow-2xs"
          />
          <SearchOutlined className="absolute left-3 text-slate-400 text-xs" />
        </div>

        {/* Right: User Profile & Logout */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full border border-red-100 font-semibold">
            <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">
              Đ
            </span>
            <span>Nhân viên</span>
          </div>
          <button className="text-slate-500 hover:text-red-600 font-medium px-2 py-1 rounded-lg transition-colors">
            Đăng xuất
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
        {/* PAGE SUB-HEADER & MAIN ACTION BUTTONS */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                NHẬN HÀNG
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                Danh sách hàng hóa
              </h1>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setQrModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <QrcodeOutlined className="text-sm" />
                <span>Quét QR chuyển phơi</span>
              </button>

              <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition-colors">
                <HistoryOutlined />
                <span>Lịch sử xóa</span>
              </button>

              <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors">
                <span>Lọc</span>
              </button>

              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <PlusOutlined className="text-sm" />
                <span>Tạo đơn hàng</span>
              </button>
            </div>
          </div>

          {/* 3. FILTER BAR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Chọn ngày
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Hướng đi
              </label>
              <select
                value={directionFilter}
                onChange={e => setDirectionFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-red-600"
              >
                <option>Tất cả hướng</option>
                <option>Sài Gòn ➔ Châu Đốc</option>
                <option>Châu Đốc ➔ Sài Gòn</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Trạm gửi
              </label>
              <select
                value={sendStationFilter}
                onChange={e => setSendStationFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-red-600"
              >
                <option>Tất cả trạm gửi</option>
                <option>Trạm Sài Gòn</option>
                <option>Trạm Châu Đốc</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Trạm nhận
              </label>
              <select
                value={receiveStationFilter}
                onChange={e => setReceiveStationFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-red-600"
              >
                <option>Tất cả trạm nhận</option>
                <option>Trạm Châu Đốc</option>
                <option>Trạm Sài Gòn</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors">
                <FilterOutlined />
                <span>Lọc</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. GOODS DATA TABLE MATCHING SCREENSHOT EXACTLY */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="px-3 py-3.5 text-center w-10">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </th>
                  <th className="px-3 py-3.5 text-center w-12">STT</th>
                  <th className="px-3 py-3.5 w-28">MÃ ĐƠN</th>
                  <th className="px-4 py-3.5">HÀNG HÓA & PHƠI XE</th>
                  <th className="px-4 py-3.5">TUYẾN ĐƯỜNG & THỜI GIAN</th>
                  <th className="px-4 py-3.5">NGƯỜI GỬI / NGƯỜI NHẬN</th>
                  <th className="px-4 py-3.5">CƯỚC PHÍ & COD</th>
                  <th className="px-4 py-3.5 text-center">TRẠNG THÁI</th>
                  <th className="px-4 py-3.5 text-center">HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400">
                      Không có đơn hàng nào trong danh sách.
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-4 text-center">
                        <input type="checkbox" className="rounded border-slate-300" />
                      </td>
                      <td className="px-3 py-4 text-center font-bold text-slate-700">
                        {index + 1}
                      </td>
                      <td className="px-3 py-4 font-mono font-semibold text-slate-600">
                        {order.orderCode}
                      </td>
                      <td className="px-4 py-4 space-y-1">
                        <div className="font-bold text-slate-900">
                          {order.itemName} <span className="font-normal text-slate-500">({order.itemQuantity})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {order.vehicleManifest}
                        </div>
                      </td>
                      <td className="px-4 py-4 space-y-1">
                        <div className="font-bold text-slate-900">{order.route}</div>
                        <div className="text-[11px] text-slate-500">
                          {order.routeTime} • NV: {order.staffName}
                        </div>
                      </td>
                      <td className="px-4 py-4 space-y-1 text-[11px]">
                        <div>
                          Gửi: <span className="font-bold text-slate-900">{order.sender}</span>
                        </div>
                        <div>
                          Nhận: <span className="font-bold text-slate-900">{order.recipient}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 space-y-1">
                        <div className="font-bold text-slate-900">{order.fee}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {order.paymentMethod}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-full border border-blue-200/80 text-[11px]">
                          • {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                          <button title="Xem" className="hover:text-blue-600 p-1">
                            <EyeOutlined />
                          </button>
                          <button title="Phiếu" className="hover:text-slate-700 p-1">
                            <FileTextOutlined />
                          </button>
                          <button title="In" className="hover:text-slate-700 p-1">
                            <PrinterOutlined />
                          </button>
                          <button title="Sửa" className="hover:text-amber-600 p-1">
                            <EditOutlined />
                          </button>
                          <button
                            title="Xóa"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="hover:text-red-600 p-1"
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL 1: QUÉT QR CHUYỂN PHƠI */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-blue-600 p-4 text-white flex items-center justify-between font-bold">
              <div className="flex items-center gap-2 text-sm">
                <QrcodeOutlined className="text-lg" />
                <span>QUÉT QR CHUYỂN PHƠI (NHẬN HÀNG)</span>
              </div>
              <button onClick={() => setQrModalOpen(false)} className="text-white/80 hover:text-white">
                <CloseOutlined />
              </button>
            </div>

            <div className="p-6 text-center space-y-4 bg-slate-950">
              <div className="w-56 h-56 mx-auto border-2 border-dashed border-blue-400/70 rounded-2xl flex items-center justify-center relative overflow-hidden bg-slate-900">
                <div className="absolute inset-x-0 h-0.5 bg-red-500 animate-pulse shadow-[0_0_15px_#ef4444]" style={{ top: '45%' }} />
                <QrcodeOutlined className="text-6xl text-blue-400 opacity-80" />
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Hướng camera về phía mã QR trên đơn hàng để quét nhập bến.
              </p>
            </div>

            <div className="p-4 bg-slate-50 text-right">
              <button
                onClick={() => {
                  setQrModalOpen(false)
                  setToast('✅ Đã quét và cập nhật trạng thái đơn thành công!')
                }}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TẠO ĐƠN HÀNG MỚI */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Tạo Đơn Hàng Mới</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <CloseOutlined />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã đơn hàng:</label>
                  <input type="text" value={newOrderCode} readOnly className="input bg-slate-100 font-mono" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tuyến đường:</label>
                  <select value={newRoute} onChange={e => setNewRoute(e.target.value)} className="select w-full">
                    <option>Sài Gòn ➔ Châu Đốc</option>
                    <option>Châu Đốc ➔ Sài Gòn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên hàng hóa:</label>
                <input
                  type="text"
                  placeholder="VD: Máy lạnh, Tủ lạnh..."
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số lượng:</label>
                  <input
                    type="text"
                    placeholder="1 cái"
                    value={newItemQuantity}
                    onChange={e => setNewItemQuantity(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cước phí:</label>
                  <input
                    type="text"
                    placeholder="150.000đ"
                    value={newFee}
                    onChange={e => setNewFee(e.target.value)}
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Người gửi:</label>
                  <input
                    type="text"
                    placeholder="Tên người gửi (VD: NTMH)"
                    value={newSender}
                    onChange={e => setNewSender(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Người nhận:</label>
                  <input
                    type="text"
                    placeholder="Tên người nhận (VD: HTN)"
                    value={newRecipient}
                    onChange={e => setNewRecipient(e.target.value)}
                    className="input w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setCreateModalOpen(false)} className="btn-secondary text-xs">
                Hủy
              </button>
              <button onClick={handleCreateOrder} disabled={!newItemName.trim()} className="btn-primary text-xs bg-red-700 hover:bg-red-800">
                Tạo Đơn Hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
