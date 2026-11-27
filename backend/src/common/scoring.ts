// Điểm ước tính của 1 tiêu chí theo quy chế: cộng điểm/lần của hoạt động đã tham gia, tối đa bằng điểm tối đa của tiêu chí.
// Chỉ là điểm tham khảo, không phải điểm rèn luyện chính thức.
export const earnedPoints = (cap: number, activityPoints: number[]) => Math.min(activityPoints.reduce((a, b) => a + b, 0), cap);
