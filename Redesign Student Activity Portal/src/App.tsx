import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Paperclip,
  Pencil,
  Search,
  ShieldCheck,
  Target,
  Trophy,
  UploadCloud,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";

type PageKey =
  | "overview"
  | "activities"
  | "registered"
  | "attended"
  | "declaration"
  | "criteria"
  | "history"
  | "notifications"
  | "profile";

type StatusTone = "blue" | "green" | "amber" | "red" | "gray";

const menuItems: { key: PageKey; label: string; icon: typeof Activity }[] = [
  { key: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { key: "activities", label: "Hoạt động", icon: Activity },
  { key: "registered", label: "Đã đăng ký", icon: CheckCircle2 },
  { key: "attended", label: "Đã tham gia", icon: Trophy },
  { key: "declaration", label: "Khai báo", icon: FileText },
  { key: "criteria", label: "Tiêu chí", icon: Target },
  { key: "history", label: "Lịch sử", icon: History },
  { key: "notifications", label: "Thông báo", icon: Bell },
  { key: "profile", label: "Hồ sơ", icon: UserRound },
];

const activities = [
  {
    id: "HD-26017",
    title: "Ngày hội hiến máu nhân đạo 2026",
    category: "Tình nguyện",
    organizer: "Đoàn trường TDTU",
    date: "20/11/2026",
    time: "07:30 – 11:30",
    location: "Sảnh A – TDTU",
    joined: 186,
    max: 300,
    points: 5,
    status: "Đang mở",
    tone: "blue" as StatusTone,
  },
  {
    id: "HD-26018",
    title: "Cuộc thi lập trình ACM ICPC cấp trường",
    category: "Học thuật",
    organizer: "Khoa Công nghệ thông tin",
    date: "24/11/2026",
    time: "08:00 – 17:00",
    location: "Phòng máy B201",
    joined: 42,
    max: 60,
    points: 8,
    status: "Đang mở",
    tone: "green" as StatusTone,
  },
  {
    id: "HD-26022",
    title: "Workshop Thiết kế UI/UX cho sản phẩm số",
    category: "Kỹ năng",
    organizer: "CLB IT Zone",
    date: "01/12/2026",
    time: "13:30 – 16:30",
    location: "Phòng C507",
    joined: 55,
    max: 80,
    points: 3,
    status: "Sắp mở",
    tone: "amber" as StatusTone,
  },
  {
    id: "HD-26025",
    title: "Đêm nhạc chào đón tân sinh viên",
    category: "Văn hóa",
    organizer: "Hội Sinh viên trường",
    date: "05/12/2026",
    time: "18:00 – 21:00",
    location: "Sân vận động TDTU",
    joined: 420,
    max: 800,
    points: 3,
    status: "Sắp mở",
    tone: "amber" as StatusTone,
  },
];

const joinedActivities = [
  [
    "Ngày hội Chào đón Tân sinh viên 2026",
    "Văn hóa",
    "12/09/2026",
    "Hội Sinh viên",
    "5",
    "Đã xác nhận",
  ],
  ["Tập huấn kỹ năng làm việc nhóm", "Kỹ năng", "28/09/2026", "Khoa CNTT", "3", "Đã xác nhận"],
  ["Chủ nhật xanh – Đợt 1", "Tình nguyện", "12/10/2026", "Đoàn trường", "5", "Đã xác nhận"],
  [
    "Seminar: Ứng dụng AI trong học tập",
    "Học thuật",
    "30/10/2026",
    "Khoa CNTT",
    "4",
    "Chờ xác nhận",
  ],
];

function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick} disabled={disabled} type={type}>
      {icon}
      <span>{children}</span>
    </button>
  );
}

function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: StatusTone }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Field({
  label,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>
        {label} {required && <b>*</b>}
      </span>
      <input type={type} placeholder={placeholder} />
    </label>
  );
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="select-wrap">
        <select defaultValue="">
          <option value="" disabled>
            {value}
          </option>
          <option>Tất cả</option>
          <option>Học kỳ 1 – 2026–2027</option>
          <option>Học kỳ 2 – 2025–2026</option>
        </select>
        <ChevronDown size={16} />
      </div>
    </label>
  );
}

function SearchBox({ placeholder = "Tìm kiếm..." }: { placeholder?: string }) {
  return (
    <label className="search-box">
      <Search size={17} />
      <input placeholder={placeholder} />
    </label>
  );
}

function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <div className="breadcrumb">
          Trang chủ <ChevronRight size={13} /> {title}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

function Tabs({
  values,
  active,
  onChange,
}: {
  values: string[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="tabs">
      {values.map((value) => (
        <button
          key={value}
          className={active === value ? "active" : ""}
          onClick={() => onChange(value)}
          type="button"
        >
          {value}
        </button>
      ))}
    </div>
  );
}

function Pagination() {
  return (
    <div className="pagination">
      <span>Hiển thị 1–4 trong 12 kết quả</span>
      <div>
        <button aria-label="Trang trước">
          <ChevronLeft size={16} />
        </button>
        <button className="active">1</button>
        <button>2</button>
        <button>3</button>
        <button aria-label="Trang sau">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function StatStrip({
  items,
}: {
  items: { label: string; value: string; icon: typeof Activity; note?: string }[];
}) {
  return (
    <div className="stat-strip">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div className="stat-item" key={item.label}>
            <span className="stat-icon">
              <Icon size={19} />
            </span>
            <div>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              {item.note && <small>{item.note}</small>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActivityRow({ item, onView }: { item: (typeof activities)[number]; onView: () => void }) {
  return (
    <article className="activity-row">
      <div className={`activity-mark mark-${item.tone}`}>
        {item.category === "Học thuật" ? (
          <BookOpen size={22} />
        ) : item.category === "Tình nguyện" ? (
          <Users size={22} />
        ) : (
          <Activity size={22} />
        )}
      </div>
      <div className="activity-main">
        <div className="activity-heading">
          <div>
            <div className="meta-line">
              <Badge tone={item.tone}>{item.category}</Badge>
              <span>{item.id}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.organizer}</p>
          </div>
          <Badge tone={item.status === "Đang mở" ? "green" : "amber"}>{item.status}</Badge>
        </div>
        <div className="activity-facts">
          <span>
            <CalendarDays size={15} /> {item.date} · {item.time}
          </span>
          <span>
            <MapPin size={15} /> {item.location}
          </span>
          <span>
            <Users size={15} /> {item.joined}/{item.max} đã đăng ký
          </span>
          <span className="points">+{item.points} điểm dự kiến</span>
        </div>
      </div>
      <Button variant="outline" onClick={onView}>
        Xem chi tiết
      </Button>
    </article>
  );
}

function Overview({ goTo }: { goTo: (page: PageKey) => void }) {
  const [filter, setFilter] = useState("Tất cả");
  return (
    <>
      <header className="welcome">
        <div>
          <Badge tone="blue">Học kỳ 1 · 2026–2027</Badge>
          <h1>Chào buổi sáng, Hương.</h1>
          <p>Theo dõi điểm rèn luyện và những hoạt động sắp tới của bạn.</p>
        </div>
        <div className="date-block">
          <CalendarDays size={19} />
          <span>
            Thứ Hai
            <br />
            <b>16 tháng 11, 2026</b>
          </span>
        </div>
      </header>

      <section className="score-panel">
        <div className="score-summary">
          <div className="score-number">
            <strong>85</strong>
            <span>/100</span>
          </div>
          <div>
            <p>Điểm rèn luyện hiện tại</p>
            <h2>Xếp loại Giỏi</h2>
            <Badge tone="green">Đã vượt mục tiêu loại Giỏi</Badge>
          </div>
        </div>
        <div className="score-progress">
          <div className="progress-label">
            <span>Tiến độ hoàn thành</span>
            <b>85%</b>
          </div>
          <div className="progress">
            <span style={{ width: "85%" }} />
          </div>
          <p>
            Cần thêm <b>5 điểm</b> để đạt loại Xuất sắc (90 điểm).
          </p>
        </div>
        <button className="score-link" onClick={() => goTo("history")}>
          Xem chi tiết <ChevronRight size={16} />
        </button>
      </section>

      <section className="category-grid">
        {[
          ["Tình nguyện", "2/2", "Hoàn thành", "green"],
          ["Học thuật", "2/3", "Còn 1 hoạt động", "blue"],
          ["Văn hóa", "1/1", "Hoàn thành", "green"],
          ["Kỹ năng", "0/1", "Chưa bắt đầu", "gray"],
        ].map(([name, score, state, tone]) => (
          <div className="category-item" key={name}>
            <div className={`category-dot dot-${tone}`} />
            <div>
              <p>{name}</p>
              <strong>{score}</strong>
              <small>{state}</small>
            </div>
          </div>
        ))}
      </section>

      <section className="declaration-callout">
        <span className="callout-icon">
          <FileCheck2 size={24} />
        </span>
        <div>
          <h2>Hoạt động của bạn chưa có trên hệ thống?</h2>
          <p>Gửi minh chứng để được xác nhận và ghi nhận điểm rèn luyện.</p>
        </div>
        <Button onClick={() => goTo("declaration")} icon={<FileText size={17} />}>
          Khai báo hoạt động
        </Button>
      </section>

      <section className="content-section">
        <SectionTitle
          title="Hoạt động nổi bật"
          description="Các hoạt động đang mở đăng ký và sắp diễn ra."
          action={
            <Button variant="ghost" onClick={() => goTo("activities")}>
              Xem tất cả <ChevronRight size={16} />
            </Button>
          }
        />
        <div className="toolbar compact">
          <Tabs
            values={["Tất cả", "Đang diễn ra", "Sắp diễn ra"]}
            active={filter}
            onChange={setFilter}
          />
          <SearchBox placeholder="Tìm hoạt động" />
        </div>
        <div className="activity-list">
          {activities.slice(0, 3).map((item) => (
            <ActivityRow item={item} key={item.id} onView={() => goTo("activities")} />
          ))}
        </div>
      </section>

      <div className="two-columns">
        <section className="content-section">
          <SectionTitle title="Lịch sắp tới" action={<Button variant="ghost">Xem lịch</Button>} />
          <div className="schedule-row">
            <div className="schedule-date">
              <b>20</b>
              <span>THG 11</span>
            </div>
            <div>
              <h3>Ngày hội hiến máu nhân đạo 2026</h3>
              <p>07:30 · Sảnh A – TDTU</p>
            </div>
            <Badge tone="blue">4 ngày nữa</Badge>
          </div>
          <div className="schedule-row">
            <div className="schedule-date">
              <b>24</b>
              <span>THG 11</span>
            </div>
            <div>
              <h3>Cuộc thi lập trình ACM ICPC</h3>
              <p>08:00 · Phòng máy B201</p>
            </div>
            <Badge tone="gray">8 ngày nữa</Badge>
          </div>
        </section>
        <section className="content-section">
          <SectionTitle
            title="Thông báo mới"
            action={
              <Button variant="ghost" onClick={() => goTo("notifications")}>
                Xem tất cả
              </Button>
            }
          />
          <div className="notice-row unread">
            <span />
            <div>
              <h3>Kết quả xác nhận hoạt động tháng 10</h3>
              <p>Phòng Công tác HSSV · 2 giờ trước</p>
            </div>
          </div>
          <div className="notice-row">
            <span />
            <div>
              <h3>Mở đăng ký workshop UI/UX</h3>
              <p>Khoa CNTT · Hôm qua</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function ActivitiesPage() {
  const [detail, setDetail] = useState<(typeof activities)[number] | null>(null);
  return (
    <>
      <PageHeader
        title="Hoạt động sinh viên"
        description="Khám phá, đăng ký và theo dõi các hoạt động trong trường."
      />
      <section className="filter-panel">
        <div className="filter-search">
          <SearchBox placeholder="Tìm theo tên hoặc mã hoạt động..." />
        </div>
        <SelectField label="Danh mục" value="Tất cả danh mục" />
        <SelectField label="Trạng thái" value="Đang mở đăng ký" />
        <SelectField label="Học kỳ" value="HK1 · 2026–2027" />
        <Button variant="outline" icon={<Filter size={16} />}>
          Bộ lọc
        </Button>
      </section>
      <div className="results-header">
        <p>
          <b>12 hoạt động</b> phù hợp
        </p>
        <label>
          Sắp xếp{" "}
          <select>
            <option>Ngày diễn ra gần nhất</option>
            <option>Mức độ quan tâm</option>
          </select>
        </label>
      </div>
      <section className="content-section flush">
        <div className="activity-list">
          {activities.map((item) => (
            <ActivityRow item={item} key={item.id} onView={() => setDetail(item)} />
          ))}
        </div>
        <Pagination />
      </section>
      {detail && <ActivityModal item={detail} onClose={() => setDetail(null)} />}
    </>
  );
}

function ActivityModal({
  item,
  onClose,
}: {
  item: (typeof activities)[number];
  onClose: () => void;
}) {
  const [registered, setRegistered] = useState(false);
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="meta-line">
              <Badge tone={item.tone}>{item.category}</Badge>
              <span>{item.id}</span>
            </div>
            <h2>{item.title}</h2>
            <p>{item.organizer}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>
        <div className="modal-grid">
          <div>
            <h3>Nội dung và mục tiêu</h3>
            <p>
              Hoạt động tạo môi trường để sinh viên giao lưu, phát triển kỹ năng và đóng góp tích
              cực cho cộng đồng. Người tham gia cần có mặt đúng giờ và hoàn thành đầy đủ nội dung
              chương trình.
            </p>
            <h3>Điều kiện tham gia</h3>
            <ul>
              <li>Là sinh viên TDTU đang học tập.</li>
              <li>Đăng ký trước thời hạn và tuân thủ nội quy.</li>
              <li>Không trùng lịch học hoặc hoạt động bắt buộc.</li>
            </ul>
            <h3>Quyền lợi</h3>
            <p>
              Được cấp giấy chứng nhận và ghi nhận <b>{item.points} điểm rèn luyện</b> sau khi hoàn
              thành.
            </p>
          </div>
          <aside>
            <h3>Thông tin hoạt động</h3>
            <p>
              <CalendarDays size={16} />
              <span>
                <b>{item.date}</b>
                <br />
                {item.time}
              </span>
            </p>
            <p>
              <MapPin size={16} />
              <span>{item.location}</span>
            </p>
            <p>
              <Users size={16} />
              <span>
                {item.joined}/{item.max} sinh viên đã đăng ký
              </span>
            </p>
            <div className="capacity">
              <span style={{ width: `${(item.joined / item.max) * 100}%` }} />
            </div>
          </aside>
        </div>
        <div className="modal-actions">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button
            variant={registered ? "danger" : "primary"}
            onClick={() => setRegistered(!registered)}
          >
            {registered ? "Hủy đăng ký" : "Đăng ký tham gia"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function RegisteredPage() {
  const [tab, setTab] = useState("Tất cả");
  return (
    <>
      <PageHeader
        title="Hoạt động đã đăng ký"
        description="Theo dõi trạng thái và quản lý các hoạt động bạn đã đăng ký."
      />
      <section className="content-section">
        <div className="toolbar">
          <Tabs
            values={["Tất cả", "Chờ xác nhận", "Đã xác nhận", "Đã hủy"]}
            active={tab}
            onChange={setTab}
          />
          <div className="toolbar-actions">
            <SearchBox placeholder="Tìm hoạt động" />
            <Button variant="outline" icon={<Filter size={16} />}>
              Lọc
            </Button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên hoạt động</th>
                <th>Danh mục</th>
                <th>Ngày đăng ký</th>
                <th>Thời gian diễn ra</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {activities.slice(0, 3).map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <b>{item.title}</b>
                    <small>{item.id}</small>
                  </td>
                  <td>{item.category}</td>
                  <td>{index === 0 ? "12/11/2026" : "14/11/2026"}</td>
                  <td>
                    {item.date}
                    <small>{item.time}</small>
                  </td>
                  <td>
                    <Badge tone={index === 2 ? "amber" : "green"}>
                      {index === 2 ? "Chờ xác nhận" : "Đã xác nhận"}
                    </Badge>
                  </td>
                  <td>
                    <button className="table-link">Chi tiết</button>
                    {index === 2 && <button className="table-link danger">Hủy</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination />
      </section>
    </>
  );
}

function AttendedPage() {
  return (
    <>
      <PageHeader
        title="Hoạt động đã tham gia"
        description="Lịch sử tham gia và điểm rèn luyện đã được ghi nhận."
      />
      <StatStrip
        items={[
          { label: "Tổng hoạt động", value: "12", icon: Activity, note: "Trong 3 học kỳ" },
          { label: "Điểm tích lũy", value: "48", icon: Trophy, note: "Điểm rèn luyện" },
          { label: "Đã xác nhận", value: "11", icon: CheckCircle2, note: "91,7% hoạt động" },
          { label: "Chờ xác nhận", value: "1", icon: Clock3, note: "Cần theo dõi" },
        ]}
      />
      <section className="content-section">
        <div className="toolbar">
          <SearchBox placeholder="Tìm hoạt động" />
          <div className="toolbar-actions">
            <SelectField label="" value="HK1 · 2026–2027" />
            <SelectField label="" value="Tất cả danh mục" />
            <SelectField label="" value="Trạng thái" />
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tên hoạt động</th>
                <th>Danh mục</th>
                <th>Thời gian</th>
                <th>Đơn vị tổ chức</th>
                <th>Điểm</th>
                <th>Xác nhận</th>
                <th>Minh chứng</th>
              </tr>
            </thead>
            <tbody>
              {joinedActivities.map((row) => (
                <tr key={row[0]}>
                  <td>
                    <b>{row[0]}</b>
                  </td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td>{row[3]}</td>
                  <td>
                    <b className="text-blue">+{row[4]}</b>
                  </td>
                  <td>
                    <Badge tone={row[5] === "Đã xác nhận" ? "green" : "amber"}>{row[5]}</Badge>
                  </td>
                  <td>
                    <button className="table-link">
                      <Paperclip size={14} /> Xem tệp
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination />
      </section>
    </>
  );
}

function DeclarationPage() {
  const [tab, setTab] = useState("Khai báo mới");
  const [submitted, setSubmitted] = useState(false);
  return (
    <>
      <PageHeader
        title="Khai báo hoạt động"
        description="Gửi minh chứng cho hoạt động ngoại khóa chưa được ghi nhận trên hệ thống."
      />
      <Tabs values={["Khai báo mới", "Khai báo đã gửi"]} active={tab} onChange={setTab} />
      {tab === "Khai báo mới" ? (
        <div className="form-layout">
          <form
            className="content-section form-card"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            {submitted && (
              <div className="alert success">
                <CheckCircle2 size={18} />
                <div>
                  <b>Đã gửi khai báo thành công</b>
                  <p>Hồ sơ của bạn sẽ được xử lý trong 3–5 ngày làm việc.</p>
                </div>
              </div>
            )}
            <SectionTitle
              title="Thông tin hoạt động"
              description="Các trường có dấu * là thông tin bắt buộc."
            />
            <div className="form-grid">
              <div className="span-2">
                <Field label="Tên hoạt động" placeholder="Nhập tên đầy đủ của hoạt động" required />
              </div>
              <SelectField label="Danh mục hoạt động *" value="Chọn danh mục" />
              <Field label="Đơn vị tổ chức" placeholder="Tên đơn vị tổ chức" required />
              <Field label="Thời gian bắt đầu" placeholder="" type="datetime-local" required />
              <Field label="Thời gian kết thúc" placeholder="" type="datetime-local" required />
              <Field label="Địa điểm" placeholder="Nhập địa điểm tổ chức" required />
              <SelectField label="Vai trò tham gia *" value="Chọn vai trò" />
              <label className="field span-2">
                <span>Mô tả nội dung *</span>
                <textarea
                  rows={5}
                  placeholder="Mô tả ngắn gọn nội dung, mục tiêu và đóng góp của bạn..."
                />
              </label>
            </div>
            <div className="divider" />
            <SectionTitle
              title="Minh chứng"
              description="Tải lên hình ảnh, PDF hoặc tài liệu xác nhận."
            />
            <label className="upload-zone">
              <UploadCloud size={28} />
              <b>Kéo thả tệp vào đây hoặc chọn từ thiết bị</b>
              <span>PNG, JPG, PDF · Tối đa 10 MB mỗi tệp</span>
              <input type="file" multiple />
            </label>
            <label className="field">
              <span>Ghi chú</span>
              <textarea rows={3} placeholder="Thông tin bổ sung dành cho người xét duyệt..." />
            </label>
            <div className="form-actions">
              <Button variant="ghost">Hủy</Button>
              <Button variant="outline">Lưu nháp</Button>
              <Button type="submit">Gửi khai báo</Button>
            </div>
          </form>
          <aside className="guidance">
            <CircleAlert size={21} />
            <h3>Hướng dẫn khai báo</h3>
            <ol>
              <li>Điền thông tin đúng với minh chứng.</li>
              <li>Ảnh phải rõ nội dung, thời gian và đơn vị tổ chức.</li>
              <li>Không gửi trùng hoạt động đã có trên hệ thống.</li>
              <li>Theo dõi yêu cầu bổ sung tại mục đã gửi.</li>
            </ol>
            <p>
              Thời gian xử lý dự kiến
              <br />
              <b>3–5 ngày làm việc</b>
            </p>
          </aside>
        </div>
      ) : (
        <DeclarationTracking />
      )}
    </>
  );
}

function DeclarationTracking() {
  return (
    <section className="content-section">
      <div className="toolbar">
        <Tabs
          values={["Tất cả", "Chờ duyệt", "Đã duyệt", "Từ chối", "Yêu cầu bổ sung"]}
          active="Tất cả"
          onChange={() => {}}
        />
        <SearchBox placeholder="Tìm khai báo" />
      </div>
      <div className="declaration-list">
        <div>
          <span className="doc-icon">
            <FileText size={20} />
          </span>
          <div>
            <h3>Tham gia hỗ trợ Giải chạy cộng đồng Quận 7</h3>
            <p>Gửi ngày 08/11/2026 · Tình nguyện · 2 minh chứng</p>
          </div>
          <Badge tone="amber">Chờ duyệt</Badge>
          <Button variant="ghost">Chi tiết</Button>
        </div>
        <div>
          <span className="doc-icon">
            <FileText size={20} />
          </span>
          <div>
            <h3>Workshop Kỹ năng thuyết trình chuyên nghiệp</h3>
            <p>Gửi ngày 02/11/2026 · Kỹ năng · 1 minh chứng</p>
            <small className="request-note">Cần bổ sung ảnh có xác nhận của đơn vị tổ chức.</small>
          </div>
          <Badge tone="red">Yêu cầu bổ sung</Badge>
          <Button variant="ghost">Cập nhật</Button>
        </div>
        <div>
          <span className="doc-icon">
            <FileText size={20} />
          </span>
          <div>
            <h3>Chiến dịch Mùa hè xanh 2026</h3>
            <p>Gửi ngày 21/08/2026 · Tình nguyện · 3 minh chứng</p>
          </div>
          <Badge tone="green">Đã duyệt · +10 điểm</Badge>
          <Button variant="ghost">Chi tiết</Button>
        </div>
      </div>
    </section>
  );
}

const criteriaGroups = [
  [
    "I",
    "Ý thức tham gia học tập",
    "20",
    ["Đi học đầy đủ, đúng giờ", "Tham gia nghiên cứu khoa học", "Tham gia các cuộc thi học thuật"],
  ],
  [
    "II",
    "Ý thức chấp hành nội quy",
    "25",
    ["Chấp hành quy chế đào tạo", "Thực hiện văn hóa học đường", "Không vi phạm kỷ luật"],
  ],
  [
    "III",
    "Hoạt động chính trị, xã hội",
    "20",
    ["Tham gia hoạt động tình nguyện", "Tham gia văn hóa, văn nghệ và thể thao"],
  ],
  [
    "IV",
    "Phẩm chất công dân và quan hệ cộng đồng",
    "25",
    ["Có tinh thần hỗ trợ cộng đồng", "Tham gia bảo vệ môi trường"],
  ],
  [
    "V",
    "Công tác lớp, đoàn thể",
    "10",
    ["Tham gia xây dựng tập thể", "Hoàn thành nhiệm vụ cán bộ lớp"],
  ],
];

function CriteriaPage() {
  const [open, setOpen] = useState("I");
  return (
    <>
      <PageHeader
        title="Tiêu chí điểm rèn luyện"
        description="Tra cứu quy định và điều kiện tính điểm áp dụng cho năm học 2026–2027."
        action={
          <Button variant="outline" icon={<FileText size={16} />}>
            Tải quy định
          </Button>
        }
      />
      <div className="criteria-summary">
        <div>
          <Target size={22} />
          <span>
            <b>100 điểm</b>Tổng điểm tối đa
          </span>
        </div>
        <div>
          <CheckCircle2 size={22} />
          <span>
            <b>5 nhóm</b>Tiêu chí đánh giá
          </span>
        </div>
        <p>
          Điểm rèn luyện được tổng hợp theo từng học kỳ. Một số tiêu chí yêu cầu minh chứng hợp lệ.
        </p>
      </div>
      <section className="criteria-list">
        {criteriaGroups.map(([code, name, max, items]) => (
          <article className={`criteria-group ${open === code ? "open" : ""}`} key={code}>
            <button className="criteria-head" onClick={() => setOpen(open === code ? "" : code)}>
              <span className="criteria-code">{code}</span>
              <span>
                <b>{name}</b>
                <small>{(items as string[]).length} tiêu chí thành phần</small>
              </span>
              <strong>Tối đa {max} điểm</strong>
              <ChevronDown size={18} />
            </button>
            {open === code && (
              <div className="criteria-body">
                {(items as string[]).map((item, index) => (
                  <div key={item}>
                    <span>
                      {code}.{index + 1}
                    </span>
                    <div>
                      <b>{item}</b>
                      <p>
                        Được tính điểm khi sinh viên đáp ứng đầy đủ điều kiện và cung cấp minh chứng
                        theo quy định.
                      </p>
                      <small>Minh chứng: Danh sách xác nhận hoặc giấy chứng nhận</small>
                    </div>
                    <strong>{index === 0 ? "5" : "3"} điểm</strong>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>
    </>
  );
}

function HistoryPage() {
  const [semester, setSemester] = useState("HK1 2026–2027");
  return (
    <>
      <PageHeader
        title="Lịch sử điểm rèn luyện"
        description="Theo dõi kết quả và các lần cập nhật điểm rèn luyện qua từng học kỳ."
      />
      <div className="history-layout">
        <section className="content-section semester-list">
          <SectionTitle title="Kết quả theo học kỳ" />
          {[
            ["HK1 2026–2027", "85", "Giỏi", "Đang cập nhật"],
            ["HK2 2025–2026", "92", "Xuất sắc", "Đã chốt"],
            ["HK1 2025–2026", "88", "Giỏi", "Đã chốt"],
          ].map((row) => (
            <button
              className={semester === row[0] ? "active" : ""}
              onClick={() => setSemester(row[0])}
              key={row[0]}
            >
              <span>
                <b>{row[0]}</b>
                <small>12 hoạt động được ghi nhận</small>
              </span>
              <strong>{row[1]}</strong>
              <Badge tone={row[3] === "Đã chốt" ? "green" : "amber"}>{row[3]}</Badge>
              <ChevronRight size={16} />
            </button>
          ))}
        </section>
        <section className="content-section history-detail">
          <SectionTitle
            title={`Chi tiết · ${semester}`}
            action={<Badge tone="green">Loại Giỏi</Badge>}
          />
          <div className="large-score">
            <strong>
              {semester.startsWith("HK1 2026") ? "85" : semester.startsWith("HK2") ? "92" : "88"}
            </strong>
            <span>/100 điểm</span>
          </div>
          <div className="criterion-bars">
            {[
              ["Học tập", 18, 20],
              ["Chấp hành nội quy", 23, 25],
              ["Hoạt động xã hội", 17, 20],
              ["Phẩm chất công dân", 19, 25],
              ["Công tác đoàn thể", 8, 10],
            ].map(([name, score, max]) => (
              <div key={name}>
                <p>
                  <span>{name}</span>
                  <b>
                    {score}/{max}
                  </b>
                </p>
                <div className="progress">
                  <span style={{ width: `${(Number(score) / Number(max)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="divider" />
          <h3>Lịch sử cập nhật</h3>
          <div className="timeline">
            <div>
              <span />
              <p>
                <b>Ghi nhận hoạt động “Seminar AI trong học tập”</b>
                <small>+4 điểm · Phòng Công tác HSSV · 12/11/2026</small>
              </p>
            </div>
            <div>
              <span />
              <p>
                <b>Điều chỉnh điểm nhóm Hoạt động xã hội</b>
                <small>+2 điểm · Cán bộ Khoa CNTT · 03/11/2026</small>
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function NotificationsPage() {
  const [filter, setFilter] = useState("Tất cả");
  const [readAll, setReadAll] = useState(false);
  const notices = [
    [
      "Kết quả xác nhận hoạt động tháng 10",
      "Khai báo “Chủ nhật xanh – Đợt 1” của bạn đã được duyệt và cộng 5 điểm.",
      "Điểm rèn luyện",
      "2 giờ trước",
    ],
    [
      "Mở đăng ký Workshop Thiết kế UI/UX",
      "Hoạt động do CLB IT Zone tổ chức đã mở đăng ký. Số lượng có hạn.",
      "Hoạt động",
      "Hôm qua",
    ],
    [
      "Nhắc nhở bổ sung minh chứng",
      "Khai báo Workshop Kỹ năng thuyết trình cần bổ sung ảnh xác nhận.",
      "Hệ thống",
      "12/11/2026",
    ],
    [
      "Cập nhật quy định đánh giá năm học 2026–2027",
      "Quy định mới về tiêu chí đánh giá điểm rèn luyện đã được công bố.",
      "Hệ thống",
      "08/11/2026",
    ],
  ];
  return (
    <>
      <PageHeader
        title="Trung tâm thông báo"
        description="Cập nhật thông tin hoạt động, hệ thống và điểm rèn luyện."
        action={
          <Button variant="outline" onClick={() => setReadAll(true)} icon={<Check size={16} />}>
            Đánh dấu tất cả đã đọc
          </Button>
        }
      />
      <section className="content-section">
        <div className="toolbar">
          <Tabs
            values={["Tất cả", "Chưa đọc", "Đã đọc", "Hoạt động", "Hệ thống", "Điểm rèn luyện"]}
            active={filter}
            onChange={setFilter}
          />
          <SearchBox placeholder="Tìm thông báo" />
        </div>
        <div className="notification-list">
          {notices.map((notice, index) => (
            <article className={!readAll && index < 2 ? "unread" : ""} key={notice[0]}>
              <span className="notification-icon">
                {notice[2] === "Hoạt động" ? (
                  <CalendarDays size={20} />
                ) : notice[2] === "Điểm rèn luyện" ? (
                  <Trophy size={20} />
                ) : (
                  <Bell size={20} />
                )}
              </span>
              <div>
                <div>
                  <h3>{notice[0]}</h3>
                  {!readAll && index < 2 && <span className="unread-dot" />}
                </div>
                <p>{notice[1]}</p>
                <small>
                  <Badge tone="gray">{notice[2]}</Badge>
                  {notice[3]}
                </small>
              </div>
              <Button variant="ghost">
                {!readAll && index < 2 ? "Đánh dấu đã đọc" : "Xem chi tiết"}
              </Button>
            </article>
          ))}
        </div>
        <Pagination />
      </section>
    </>
  );
}

function ProfilePage() {
  const [editing, setEditing] = useState(false);
  return (
    <>
      <PageHeader
        title="Hồ sơ sinh viên"
        description="Quản lý thông tin cá nhân và tài khoản của bạn."
        action={
          <Button
            variant={editing ? "primary" : "outline"}
            onClick={() => setEditing(!editing)}
            icon={editing ? <Check size={16} /> : <Pencil size={16} />}
          >
            {editing ? "Lưu thay đổi" : "Chỉnh sửa"}
          </Button>
        }
      />
      <section className="profile-hero">
        <div className="profile-avatar">NH</div>
        <div>
          <h2>Nguyễn Thị Minh Hương</h2>
          <p>52300201 · Sinh viên Khoa Công nghệ thông tin</p>
          <Badge tone="green">Đang học</Badge>
        </div>
        <div className="profile-score">
          <span>Điểm rèn luyện · HK1 2026–2027</span>
          <strong>85</strong>
          <Badge tone="blue">Loại Giỏi</Badge>
        </div>
      </section>
      <div className="profile-grid">
        <section className="content-section">
          <SectionTitle title="Thông tin cá nhân" description="Thông tin định danh và liên hệ." />
          <div className="info-grid">
            <Info label="Họ và tên" value="Nguyễn Thị Minh Hương" />
            <Info label="Mã số sinh viên" value="52300201" />
            <Info label="Ngày sinh" value="18/06/2005" />
            <Info label="Giới tính" value="Nữ" />
            <Info label="Email" value="52300201@student.tdtu.edu.vn" editable={editing} />
            <Info label="Số điện thoại" value="0912 345 678" editable={editing} />
          </div>
        </section>
        <section className="content-section">
          <SectionTitle
            title="Thông tin học tập"
            description="Dữ liệu đồng bộ từ hệ thống đào tạo."
          />
          <div className="info-grid">
            <Info label="Khoa" value="Công nghệ thông tin" />
            <Info label="Ngành" value="Kỹ thuật phần mềm" />
            <Info label="Lớp" value="23050301" />
            <Info label="Khóa học" value="2023–2027" />
            <Info label="Bậc đào tạo" value="Đại học chính quy" />
            <Info label="Trạng thái" value="Đang học" />
          </div>
        </section>
        <section className="content-section account-panel">
          <SectionTitle title="Tài khoản và bảo mật" />
          <div>
            <ShieldCheck size={21} />
            <span>
              <b>Mật khẩu</b>
              <p>Cập nhật lần cuối 3 tháng trước</p>
            </span>
            <Button variant="outline">Đổi mật khẩu</Button>
          </div>
          <div>
            <LogOut size={21} />
            <span>
              <b>Phiên đăng nhập</b>
              <p>Đăng xuất khỏi tài khoản trên thiết bị này</p>
            </span>
            <Button variant="danger">Đăng xuất</Button>
          </div>
        </section>
      </div>
    </>
  );
}

function Info({ label, value, editable }: { label: string; value: string; editable?: boolean }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      {editable ? <input defaultValue={value} /> : <b>{value}</b>}
    </div>
  );
}

function Sidebar({
  page,
  setPage,
  open,
  setOpen,
}: {
  page: PageKey;
  setPage: (page: PageKey) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <>
      {open && (
        <button className="drawer-overlay" onClick={() => setOpen(false)} aria-label="Đóng menu" />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">
            <GraduationCap size={26} />
          </span>
          <div>
            <b>TDTU · FIT</b>
            <span>Quản lý hoạt động</span>
          </div>
          <button className="mobile-close" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="role-label">
          <span /> Cổng thông tin <b>Sinh viên</b>
        </div>
        <nav>
          <p>ĐIỀU HƯỚNG</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={page === item.key ? "active" : ""}
                onClick={() => {
                  setPage(item.key);
                  setOpen(false);
                }}
                key={item.key}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.key === "notifications" && <em>2</em>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-user">
          <div className="user-row">
            <span className="avatar">NH</span>
            <div>
              <b>Nguyễn Thị Minh Hương</b>
              <small>52300201</small>
            </div>
            <ChevronRight size={16} />
          </div>
          <p>52300201@student.tdtu.edu.vn</p>
          <button>
            <LogOut size={17} /> Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
}

export default function App() {
  const [page, setPage] = useState<PageKey>("overview");
  const [drawer, setDrawer] = useState(false);
  const content = useMemo(() => {
    switch (page) {
      case "overview":
        return <Overview goTo={setPage} />;
      case "activities":
        return <ActivitiesPage />;
      case "registered":
        return <RegisteredPage />;
      case "attended":
        return <AttendedPage />;
      case "declaration":
        return <DeclarationPage />;
      case "criteria":
        return <CriteriaPage />;
      case "history":
        return <HistoryPage />;
      case "notifications":
        return <NotificationsPage />;
      case "profile":
        return <ProfilePage />;
    }
  }, [page]);

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} open={drawer} setOpen={setDrawer} />
      <main className="main-area">
        <div className="mobile-bar">
          <button onClick={() => setDrawer(true)} aria-label="Mở menu">
            <Menu size={21} />
          </button>
          <div>
            <GraduationCap size={21} />
            <b>TDTU · FIT</b>
          </div>
          <button onClick={() => setPage("notifications")} aria-label="Thông báo">
            <Bell size={20} />
            <span />
          </button>
        </div>
        <div className="page-content">{content}</div>
      </main>
    </div>
  );
}
