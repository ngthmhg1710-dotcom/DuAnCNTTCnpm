// Ngưỡng cảnh báo cấu hình được (bảng Setting, key "alerts"); mặc định như dưới.
export type AlertConfig = {
  lowBelow: number; // số hoạt động đã tham gia < ngưỡng này: "Thấp"
  mediumBelow: number; // < ngưỡng này: "Trung bình", từ ngưỡng này trở lên: "Cao"
  targetPoints: number; // điểm ước tính mục tiêu (0-100)
  manyPending: number; // từ bấy nhiêu khai báo chờ xử lý trở lên thì gắn cờ
  riskAfterPct: number; // chỉ xét "nguy cơ" khi học kỳ đã trôi qua ≥ bấy nhiêu %
};
export const DEFAULT_ALERT_CONFIG: AlertConfig = { lowBelow: 3, mediumBelow: 6, targetPoints: 50, manyPending: 3, riskAfterPct: 50 };

export function getParticipationTier(count: number, cfg: AlertConfig = DEFAULT_ALERT_CONFIG): 'Cao' | 'Trung bình' | 'Thấp' {
  if (count >= cfg.mediumBelow) return 'Cao';
  if (count >= cfg.lowBelow) return 'Trung bình';
  return 'Thấp';
}
