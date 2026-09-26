// ponytail: fixed thresholds instead of a configurable rules engine — revisit if criteria weighting is needed
export function getParticipationTier(count: number): 'Cao' | 'Trung bình' | 'Thấp' {
  if (count >= 6) return 'Cao';
  if (count >= 3) return 'Trung bình';
  return 'Thấp';
}
