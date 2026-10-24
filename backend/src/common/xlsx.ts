import { Workbook } from 'exceljs';

// Gửi bảng dữ liệu dạng .xlsx; header = mảng tên cột, rows = mảng mảng giá trị.
export async function sendXlsx(res: any, filename: string, header: string[], rows: unknown[][]) {
  const wb = new Workbook();
  const ws = wb.addWorksheet('Dữ liệu');
  ws.addRow(header).font = { bold: true };
  rows.forEach((r) => ws.addRow(r));
  ws.columns.forEach((c) => (c.width = 20));
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await wb.xlsx.write(res);
  res.end();
}
