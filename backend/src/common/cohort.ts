// MSSV TDTU: số 5, rồi 2 số cuối của năm nhập học. Ví dụ 523xxxxx nhập học 2023.
// Khóa K = năm nhập học - 1996 (2023 -> K27, dự kiến tốt nghiệp 2027). Không đúng dạng thì trả null.
export function cohortFromMssv(mssv: string | null | undefined): string | null {
  const m = /^5(\d{2})/.exec(String(mssv ?? '').trim());
  return m ? `K${2000 + Number(m[1]) - 1996}` : null;
}
