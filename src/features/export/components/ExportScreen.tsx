import { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  IconButton,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import SearchIcon from '@mui/icons-material/Search'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../../shared/components/Layout'
import { fetchExportData } from '../api/exportApi'
import { generateCsv, downloadCsv } from '../utils/generateCsv'
import type { ExportRow } from '../api/exportApi'

export function ExportScreen() {
  const navigate = useNavigate()
  const todayStr = new Date().toISOString().split('T')[0]

  const [fromDate, setFromDate] = useState(todayStr)
  const [toDate, setToDate] = useState(todayStr)
  const [rows, setRows] = useState<ExportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  function formatAmount(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount)
  }

  async function handleSearch() {
    if (!fromDate || !toDate) {
      setError('Please select both dates')
      return
    }
    if (new Date(fromDate) > new Date(toDate)) {
      setError('From date cannot be after To date')
      return
    }

    setLoading(true)
    setError('')
    setSearched(false)

    const data = await fetchExportData(fromDate, toDate)
    setRows(data)
    setSearched(true)
    setLoading(false)
  }

  function handleExport() {
    if (rows.length === 0) return
    const csv = generateCsv(rows)
    const filename =
      fromDate === toDate
        ? `Mulyam_PO_${fromDate}.csv`
        : `Mulyam_PO_${fromDate}_to_${toDate}.csv`
    downloadCsv(csv, filename)
  }

  const uniquePOs = new Set(rows.map((r) => r.po_number)).size
  const totalAmount = rows
    .filter(
      (row, index, self) =>
        self.findIndex((r) => r.po_number === row.po_number) === index
    )
    .reduce((sum, row) => sum + row.grand_total, 0)

  return (
    <Layout>

      {/* Back button + Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <IconButton onClick={() => navigate('/dashboard')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Export Purchase Orders
        </Typography>
      </Box>

      {/* Date Range */}
      <Paper elevation={1} sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 'bold', mb: 2, color: 'text.secondary' }}
        >
          SELECT DATE RANGE
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 140 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
            >
              From Date
            </Typography>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #ccc',
                fontSize: 14,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 140 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
            >
              To Date
            </Typography>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #ccc',
                fontSize: 14,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </Box>
        </Box>

        <Button
          variant="contained"
          fullWidth
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SearchIcon />
            )
          }
          onClick={handleSearch}
          disabled={loading}
          sx={{ borderRadius: 2, py: 1.2 }}
        >
          {loading ? 'Loading...' : 'Search Orders'}
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {searched && (
        <>
          {rows.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                border: '1px dashed #ccc',
                bgcolor: 'white',
              }}
            >
              <Typography sx={{ color: 'text.secondary' }}>
                No orders found for this date range
              </Typography>
            </Paper>
          ) : (
            <>
              {/* Summary */}
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 1,
                    textAlign: 'center',
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 'bold', color: 'primary.main' }}
                    >
                      {uniquePOs}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Orders
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 'bold', color: 'primary.main' }}
                    >
                      {rows.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Items
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 'bold', color: 'primary.main' }}
                    >
                      {formatAmount(totalAmount)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Total
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Preview Table */}
              <Paper
                elevation={1}
                sx={{ borderRadius: 2, mb: 2, overflow: 'hidden' }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 'bold',
                    color: 'text.secondary',
                    p: 1.5,
                    bgcolor: '#f5f5f5',
                  }}
                >
                  PREVIEW — {rows.length} rows
                </Typography>
                <Divider />
                <TableContainer sx={{ maxHeight: 340 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: 11 }}>
                          PO No.
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: 11 }}>
                          Farmer
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: 11 }}>
                          Item
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: 11 }} align="right">
                          Qty
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: 11 }} align="right">
                          Rate
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: 11 }} align="right">
                          Amount
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            bgcolor: index % 2 === 0 ? 'white' : '#fafafa',
                          }}
                        >
                          <TableCell sx={{ fontSize: 11 }}>
                            <Chip
                              label={row.po_number}
                              size="small"
                              color="primary"
                              sx={{ fontSize: 10, height: 20 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: 11 }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 'bold' }}>
                              {row.farmer_name}
                            </Typography>
                            {row.village && (
                              <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                                {row.village}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ fontSize: 11 }}>
                            {row.item_name}
                          </TableCell>
                          <TableCell sx={{ fontSize: 11 }} align="right">
                            {row.quantity} kg
                          </TableCell>
                          <TableCell sx={{ fontSize: 11 }} align="right">
                            ₹{row.rate}
                          </TableCell>
                          <TableCell sx={{ fontSize: 11 }} align="right">
                            ₹{row.amount.toFixed(0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Download Button */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                sx={{
                  borderRadius: 3,
                  py: 2,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  mb: 2,
                }}
              >
                Download CSV
              </Button>

              {/* Zoho hint */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#e8f5e9',
                  border: '1px solid #c8e6c9',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}
                >
                  How to import into Zoho
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  1. Open Zoho Books → Purchase Orders
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  2. Click Import → Choose the downloaded CSV
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  3. Map: Farmer Name → Vendor, Item Name → Item,
                  Quantity → Quantity, Rate → Rate, Amount → Amount
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  4. Click Import — Done ✅
                </Typography>
              </Paper>
            </>
          )}
        </>
      )}
    </Layout>
  )
}