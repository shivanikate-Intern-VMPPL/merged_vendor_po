import type { ExportRow } from '../api/exportApi'

export function generateCsv(rows: ExportRow[]): string {
  const headers = [
    'PO Number',
    'Date',
    'Farmer Name',
    'Village',
    'Item Name',
    'Quantity',
    'Rate',
    'Amount',
    'Grand Total',
  ]

  const dataRows = rows.map((row) => [
    row.po_number,
    row.date,
    row.farmer_name,
    row.village,
    row.item_name,
    row.quantity,
    row.rate,
    row.amount,
    row.grand_total,
  ])

  const escape = (val: string | number) =>
    `"${String(val).replace(/"/g, '""')}"`

  const csvLines = [
    headers.map(escape).join(','),
    ...dataRows.map((row) => row.map(escape).join(',')),
  ]

  return csvLines.join('\n')
}

export function downloadCsv(csvString: string, filename: string) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}