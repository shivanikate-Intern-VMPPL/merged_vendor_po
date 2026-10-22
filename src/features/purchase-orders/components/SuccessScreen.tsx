// // import { useState, useRef } from 'react'
// // import {
// //   Box, Button, Typography, Paper, Divider, IconButton, Chip, Alert, CircularProgress,
// // } from '@mui/material'
// // import CheckCircleIcon from '@mui/icons-material/CheckCircle'
// // import PrintIcon from '@mui/icons-material/Print'
// // import CloudUploadIcon from '@mui/icons-material/CloudUpload'
// // import CloudDoneIcon from '@mui/icons-material/CloudDone'
// // import AddIcon from '@mui/icons-material/Add'
// // import HomeIcon from '@mui/icons-material/Home'
// // import ArrowBackIcon from '@mui/icons-material/ArrowBack'
// // import UploadFileIcon from '@mui/icons-material/UploadFile'
// // import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
// // import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
// // import { useNavigate, useLocation } from 'react-router-dom'
// // import { useAuthContext } from '../../auth/AuthContext'
// // import type { OrderItem } from '../utils/calculateTotals'
// // import type { Farmer } from '../../../shared/types'
// // import logo from '../../../assets/Mulyam_logo.svg'
// // import stamp from '../../../assets/Mulyam_stamp.png'
// // import { uploadPurchaseOrderToZoho, attachFilesToZoho } from '../api/zohoApi'
// // import { supabase } from '../../../shared/lib/supabaseClient'
// // import { Layout } from '../../../shared/components/Layout'
// // import { escapeHtml } from '../../../shared/utils/escapeHtml'
// // interface SuccessState {
// //   po_id: string
// //   po_number: string
// //   farmer: Farmer
// //   items: OrderItem[]
// //   subtotal: number
// //   total_tax: number
// //   grand_total: number
// //   notes: string
// // }

// // export function SuccessScreen() {
// //   const navigate = useNavigate()
// //   const location = useLocation()
// //   const { profile } = useAuthContext()
// //   const state = location.state as SuccessState

// //   const [uploading, setUploading] = useState(false)
// //   const [printing, setPrinting] = useState(false)
// //   const [uploadedZohoId, setUploadedZohoId] = useState<string | null>(null)
// //   const [uploadError, setUploadError] = useState('')

// //   const [attachedFiles, setAttachedFiles] = useState<{ name: string; path: string }[]>([])
// //   const [uploadingFile, setUploadingFile] = useState(false)
// //   const [fileError, setFileError] = useState('')
// //   const fileInputRef = useRef<HTMLInputElement>(null)
// //   const cameraInputRef = useRef<HTMLInputElement>(null)

// //   if (!state) {
// //     navigate('/dashboard')
// //     return null
// //   }

// //   const {   po_id,
// //   po_number,
// //   farmer,
// //   items,
// //   subtotal,
// //   total_tax,
// //   grand_total,
// //   notes } = state
// //   const collectorName = profile?.full_name || 'Collector'

// //   function formatAmount(amount: number) {
// //     return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
// //   }

// //   function getReceiptDateTime() {
// //     return new Date().toLocaleString('en-IN', {
// //       day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
// //     })
// //   }

// //   async function handleUploadToZoho() {
// //     if (!po_id) {
// //       setUploadError('Missing purchase order reference. Cannot upload.')
// //       return
// //     }
// //     setUploading(true)
// //     setUploadError('')
// //     const result = await uploadPurchaseOrderToZoho(po_id)
// //     if (!result.success || !result.zoho_po_id) {
// //       setUploading(false)
// //       setUploadError(result.error || 'Failed to upload to Zoho. Please try again.')
// //       return
// //     }
// //     setUploadedZohoId(result.zoho_po_id)

// //     if (attachedFiles.length > 0) {
// //       const attachResult = await attachFilesToZoho(po_id)
// //       if (!attachResult.success) {
// //         setUploadError('PO uploaded, but some attachments failed to sync to Zoho.')
// //       }
// //     }
// //     setUploading(false)
// //   }

// //   async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
// //     const file = e.target.files?.[0]
// //     if (!file) return
// //     setUploadingFile(true)
// //     setFileError('')

// //     const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
// //     const path = `${po_id}/${Date.now()}_${safeName}`

// //     const { error } = await supabase.storage
// //       .from('po-attachments')
// //       .upload(path, file, { upsert: false })

// //     setUploadingFile(false)

// //     if (error) {
// //       console.error('Upload failed:', error)
// //       setFileError('Failed to upload file. Please try again.')
// //       return
// //     }

// //     setAttachedFiles((prev) => [...prev, { name: file.name, path }])
// //     if (fileInputRef.current) fileInputRef.current.value = ''
// //     if (cameraInputRef.current) cameraInputRef.current.value = ''
// //   }

// //   async function imageToDataUrl(src: string): Promise<string> {
// //     try {
// //       const res = await fetch(src)
// //       const blob = await res.blob()
// //       return await new Promise((resolve, reject) => {
// //         const reader = new FileReader()
// //         reader.onloadend = () => resolve(reader.result as string)
// //         reader.onerror = reject
// //         reader.readAsDataURL(blob)
// //       })
// //     } catch (err) {
// //       console.error('Failed to embed image for print:', src, err)
// //       return ''
// //     }
// //   }

// //   async function handleThermalPrint() {
// //     if (printing) return

// //     // Open the print window immediately from the button click.
// //     // This avoids popup blocking while images are being prepared.
// //     const printWindow = window.open('', '_blank', 'width=420,height=700')

// //     if (!printWindow) {
// //       alert('Please allow pop-ups for this site to print the receipt.')
// //       return
// //     }

// //     setPrinting(true)

// //     try {
// //       const [logoData, stampData] = await Promise.all([
// //         imageToDataUrl(logo),
// //         imageToDataUrl(stamp),
// //       ])

// //       const line = '-'.repeat(32)
// //       const itemsText = items
// //   .map((item) => {
// //     const qty = `${item.quantity} ${escapeHtml(item.unit ?? 'Kg')}`
// //     const rate = `Rs.${Number(item.rate || 0).toFixed(2)}`
// //     const total = `Rs.${Number(item.amount || 0).toFixed(2)}`
// //     const comment = item.row_comment
// //       ? `\n  (${escapeHtml(item.row_comment)})`
// //       : ''

// //     return `${escapeHtml(item.item_name)}\n  ${qty} x ${rate} = ${total}${comment}`
// //   })
// //   .join('\n')
// //       // const itemsText = items
// //       //   .map((item) => {
// //       //     const qty = `${item.quantity} ${escapeHtml(item.unit ?? 'Kg')}`
// //       //     const rate = `Rs.${Number(item.rate || 0).toFixed(2)}`
// //       //     const total = `Rs.${Number(item.amount || 0).toFixed(2)}`
// //       //     const comment = item.row_comment
// //       //       ? `\n  (${item.row_comment})`
// //       //       : ''

// //       //     return `${item.item_name}\n  ${qty} x ${rate} = ${total}${comment}`
// //       //   })
// //       //   .join('\n')

// //       const calculatedSubtotal =
// //         subtotal ??
// //         items.reduce((sum, item) => sum + Number(item.amount || 0), 0)

// //       const calculatedTax =
// //         total_tax ??
// //         items.reduce((sum, item) => sum + Number(item.gst_amount || 0), 0)

// //       const calculatedGrandTotal =
// //         grand_total ??
// //         calculatedSubtotal + calculatedTax

// //       printWindow.document.open()
// //       printWindow.document.write(`
// // <!DOCTYPE html>
// // <html>
// // <head>
// //   <meta charset="utf-8" />
// //   <title>Mulyam Receipt ${po_number}</title>
// //   <style>
// //     @page {
// //       size: 72mm auto;
// //       margin: 0;
// //     }

// //     * {
// //       box-sizing: border-box;
// //       -webkit-print-color-adjust: exact !important;
// //       print-color-adjust: exact !important;
// //     }

// //     html,
// //     body {
// //       width: 72mm;
// //       margin: 0;
// //       padding: 0;
// //       background: #fff;
// //       color: #000;
// //     }

// //     body {
// //       font-family: "Courier New", Courier, monospace;
// //       overflow-x: hidden;
// //     }

// //     .receipt {
// //       width: 68mm;
// //       margin: 0 auto;
// //       padding: 2mm 0 3mm;
// //       font-size: 11px;
// //       line-height: 1.35;
// //       overflow-wrap: anywhere;
// //     }

// //     .center { text-align: center; }
// //     .bold { font-weight: 700; }

// //     .line {
// //       white-space: pre;
// //       margin: 4px 0;
// //       overflow: hidden;
// //     }

// //     .section { margin: 4px 0; }

// //     .row {
// //       display: flex;
// //       justify-content: space-between;
// //       gap: 8px;
// //       margin: 3px 0;
// //     }

// //     .row span:first-child { flex: 1; }

// //     .row span:last-child {
// //       white-space: nowrap;
// //       text-align: right;
// //     }

// //     .items {
// //       white-space: pre-wrap;
// //       word-break: break-word;
// //     }

// //     .logo {
// //       display: block;
// //       width: auto;
// //       max-width: 48mm;
// //       max-height: 17mm;
// //       margin: 0 auto 3mm;
// //       object-fit: contain;
// //     }

// //     .stamp {
// //       display: block;
// //       width: auto;
// //       max-width: 22mm;
// //       max-height: 22mm;
// //       margin: 5mm auto 2mm;
// //       object-fit: contain;
// //     }

// //     @media print {
// //       html,
// //       body {
// //         width: 72mm !important;
// //         margin: 0 !important;
// //         padding: 0 !important;
// //       }

// //       .receipt {
// //         width: 68mm !important;
// //         margin: 0 auto !important;
// //         padding-top: 2mm !important;
// //         padding-bottom: 3mm !important;
// //       }

// //       .receipt,
// //       .section,
// //       .items {
// //         break-inside: avoid;
// //         page-break-inside: avoid;
// //       }
// //     }
// //   </style>
// // </head>
// // <body>
// //   <div class="receipt">
// //     ${logoData ? `<img src="${logoData}" class="logo" alt="Mulyam" />` : ''}

// //     <div class="center bold">MULYAM AGRONOMICS PVT LTD</div>
// //     <div class="center">Purchase Receipt</div>

// //     <div class="line">${line}</div>

// //     <div class="section">
// //       // <div>PO No: ${po_number}</div>
// //       // <div>Date: ${getReceiptDateTime()}</div>
// //       // <div>Vendor: ${farmer.name}</div>
// //       // ${farmer.village ? `<div>Village: ${farmer.village}</div>` : ''}
// //       // <div>Collected By: ${collectorName}</div>
// //       <div>PO No: ${escapeHtml(po_number)}</div>
// // <div>Date: ${getReceiptDateTime()}</div>
// // <div>Vendor: ${escapeHtml(farmer.name)}</div>
// // ${farmer.village ? `<div>Village: ${escapeHtml(farmer.village)}</div>` : ''}
// // <div>Collected By: ${escapeHtml(collectorName)}</div>
// //     </div>

// //     <div class="line">${line}</div>

// //     <div class="bold">ITEMS</div>
// //     // <div class="section items">${itemsText}</div>
// //     <div class="section">Collected By: ${escapeHtml(collectorName)}</div>
// //     <div class="line">${line}</div>

// //     <div class="row">
// //       <span>Subtotal</span>
// //       <span>Rs.${Number(calculatedSubtotal).toFixed(2)}</span>
// //     </div>

// //     <div class="row">
// //       <span>Tax</span>
// //       <span>Rs.${Number(calculatedTax).toFixed(2)}</span>
// //     </div>

// //     <div class="row bold">
// //       <span>GRAND TOTAL</span>
// //       <span>Rs.${Number(calculatedGrandTotal).toFixed(2)}</span>
// //     </div>

// //     ${notes && notes.trim()
// //   ? `<div class="line">${line}</div><div class="section">Note: ${escapeHtml(notes)}</div>`
// //   : ''}

// //     <div class="line">${line}</div>

// //     <div class="section">Collected By: ${collectorName}</div>

// //     ${stampData
// //       ? `<div class="center"><img src="${stampData}" class="stamp" alt="stamp" /></div>`
// //       : ''}

// //     <div class="center">________________________</div>
// //     <div class="center">For Mulyam Agronomics Pvt Ltd</div>
// //     <div class="center">Authorized Signature</div>

// //     <div class="line">${line}</div>
// //     <div class="center bold">Thank you!</div>
// //   </div>
// // </body>
// // </html>
// //       `)
// //       printWindow.document.close()

// //       // Give Chromium time to finish laying out the receipt.
// //       await new Promise<void>((resolve) => {
// //         const start = Date.now()
// //         const check = () => {
// //           if (
// //             printWindow.document.readyState === 'complete' ||
// //             Date.now() - start > 1500
// //           ) {
// //             resolve()
// //           } else {
// //             setTimeout(check, 50)
// //           }
// //         }
// //         check()
// //       })

// //       try {
// //         if (printWindow.document.fonts?.ready) {
// //           await printWindow.document.fonts.ready
// //         }
// //       } catch {
// //         // Font readiness is optional.
// //       }

// //       // This is the ONLY print() call in this function.
// //       printWindow.focus()
// //       printWindow.print()

// //       let closed = false
// //       const closeWindow = () => {
// //         if (closed) return
// //         closed = true

// //         try {
// //           printWindow.close()
// //         } catch {
// //           // Ignore browser restrictions.
// //         }

// //         setPrinting(false)
// //       }

// //       printWindow.onafterprint = closeWindow

// //       // Fallback for drivers/browsers that do not fire afterprint.
// //       setTimeout(closeWindow, 30000)
// //     } catch (error) {
// //       console.error('Failed to prepare thermal receipt:', error)

// //       try {
// //         printWindow.close()
// //       } catch {
// //         // Ignore browser restrictions.
// //       }

// //       setPrinting(false)
// //       alert('Unable to prepare the receipt for printing.')
// //     }
// //   }

// //   return (
// //     <Layout maxWidth={false}>
// //     <Box sx={{ minHeight: '100vh', bgcolor: '#EEF2FF' }}>
// //       <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB', px: 2, py: 1.2, display: 'flex', alignItems: 'center', gap: 1 }}>
// //         <IconButton onClick={() => navigate('/dashboard')} size="small" sx={{ color: '#004B8B' }}>
// //           <ArrowBackIcon />
// //         </IconButton>
// //         <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 16 }}>Purchase order</Typography>
// //       </Box>

// //       <Box sx={{ maxWidth: 600, mx: 'auto', px: 2, py: 3 }}>
// //         <Box sx={{ textAlign: 'center', mb: 3 }}>
// //           <CheckCircleIcon sx={{ fontSize: 64, color: '#00BD67', mb: 1.5 }} />
// //           <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 0.5 }}>
// //             Purchase Order Saved!
// //           </Typography>
// //           <Chip label={po_number} sx={{ bgcolor: '#EEF2FF', color: '#004B8B', fontWeight: 700, fontSize: 13, borderRadius: 10 }} />
// //         </Box>

// //         {uploadError && (
// //           <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setUploadError('')}>
// //             {uploadError}
// //           </Alert>
// //         )}
// //         {uploadedZohoId && (
// //           <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
// //             Successfully uploaded to Zoho Books.
// //           </Alert>
// //         )}

// //         {/* Digital Receipt */}
// //         <Paper elevation={0} sx={{ border: '2px solid #0D1B3E', borderRadius: 1, overflow: 'hidden', mb: 3 }}>
// //           <Box sx={{
// //             bgcolor: 'white', borderBottom: '2px solid #0D1B3E', px: 2.5, py: 2,
// //             display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 1.5,
// //           }}>
// //             <img src={logo} alt="Mulyam" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
// //             <Box sx={{ textAlign: 'center' }}>
// //               <Typography sx={{ color: '#0D1B3E', fontWeight: 700, fontSize: 18, letterSpacing: 0.5 }}>
// //                 Mulyam Agronomics Pvt Ltd
// //               </Typography>
// //               <Typography sx={{ color: '#6B7280', fontSize: 13 }}>Purchase Receipt</Typography>
// //             </Box>
// //             <Box sx={{ width: 44 }} />
// //           </Box>

// //           <Box sx={{ p: 2.5 }}>
// //             <Box sx={{ bgcolor: '#F8FAFF', border: '1px solid #E5E7EB', borderRadius: 1.5, p: 2, mb: 2 }}>
// //               {[
// //                 { label: 'PO Number', value: po_number, blue: true },
// //                 { label: 'Date & Time', value: getReceiptDateTime(), blue: false },
// //                 { label: 'Vendor / Farmer', value: farmer.name, blue: false },
// //                 ...(farmer.village ? [{ label: 'Village', value: farmer.village, blue: false }] : []),
// //                 { label: 'Collected By', value: collectorName, blue: false },
// //               ].map((row) => (
// //                 <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
// //                   <Typography variant="body2" sx={{ color: '#6B7280' }}>{row.label}</Typography>
// //                   <Typography variant="body2" sx={{ fontWeight: 600, color: row.blue ? '#004B8B' : '#0D1B3E' }}>
// //                     {row.value}
// //                   </Typography>
// //                 </Box>
// //               ))}
// //             </Box>

// //             <Divider sx={{ mb: 1.5 }} />

// //             <Box sx={{ display: 'grid', gridTemplateColumns: '2.2fr 0.8fr 0.8fr 0.8fr 1fr', bgcolor: '#F8FAFF', border: '1px solid #E5E7EB', px: 1.5, py: 1, borderRadius: 1, mb: 1 }}>
// //               {['Item', 'Qty', 'Rate', 'Tax', 'Total'].map((h, i) => (
// //                 <Typography key={h} sx={{ fontSize: 11, fontWeight: 700, color: '#004B8B', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: i > 0 ? 'right' : 'left' }}>
// //                   {h}
// //                 </Typography>
// //               ))}
// //             </Box>

// //             {items.map((item, index) => (
// //               <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '2.2fr 0.8fr 0.8fr 0.8fr 1fr', px: 1.5, py: 0.8, borderRadius: 1, bgcolor: index % 2 === 0 ? 'white' : '#F8FAFF' }}>
// //                 <Box>
// //                   <Typography sx={{ fontSize: 13 }}>{item.item_name}</Typography>
// //                   {item.row_comment && (
// //                     <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>{item.row_comment}</Typography>
// //                   )}
// //                 </Box>
// //                 <Typography sx={{ fontSize: 13, textAlign: 'right' }}>
// //                   {item.quantity} {item.unit ?? 'Kg'}
// //                 </Typography>
// //                 <Typography sx={{ fontSize: 13, textAlign: 'right' }}>₹{item.rate}</Typography>
// //                 <Typography sx={{ fontSize: 13, textAlign: 'right', color: item.gst_percent ? '#0D1B3E' : '#9CA3AF' }}>
// //                   {item.gst_percent ? `${item.gst_percent}%` : '—'}
// //                 </Typography>
// //                 <Typography sx={{ fontSize: 13, textAlign: 'right', fontWeight: 600 }}>₹{item.amount.toFixed(0)}</Typography>
// //               </Box>
// //             ))}

// //             <Box sx={{ px: 0.5, mt: 1 }}>
// //               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
// //                 <Typography sx={{ color: '#6B7280', fontSize: 13 }}>Subtotal</Typography>
// //                 <Typography sx={{ color: '#6B7280', fontSize: 13 }}>
// //                   {formatAmount(subtotal ?? items.reduce((s, i) => s + (i.amount || 0), 0))}
// //                 </Typography>
// //               </Box>
// //               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
// //                 <Typography sx={{ color: '#6B7280', fontSize: 13 }}>Tax</Typography>
// //                 <Typography sx={{ color: '#6B7280', fontSize: 13 }}>
// //                   {formatAmount(total_tax ?? items.reduce((s, i) => s + (i.gst_amount || 0), 0))}
// //                 </Typography>
// //               </Box>
// //             </Box>

// //             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #0D1B3E', borderBottom: '2px solid #0D1B3E', px: 0.5, py: 1.5, my: 2 }}>
// //               <Typography sx={{ color: '#0D1B3E', fontWeight: 700, fontSize: 16 }}>GRAND TOTAL</Typography>
// //               <Typography sx={{ color: '#0D1B3E', fontWeight: 700, fontSize: 18 }}>{formatAmount(grand_total)}</Typography>
// //             </Box>

// //             {notes && notes.trim() && (
// //               <Box sx={{
// //                 bgcolor: '#FFFBEB', border: '1px solid #FFC400', borderRadius: 2, px: 2, py: 1.2, mb: 1.5,
// //               }}>
// //                 <Typography variant="body2" sx={{ color: '#6B7280' }}>📝 {notes}</Typography>
// //               </Box>
// //             )}

// //             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2, mt: 6 }}>
// //               <Box>
// //                 <Typography sx={{ fontSize: 12, color: '#6B7280' }}>Collected By</Typography>
// //                 <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0D1B3E' }}>{collectorName}</Typography>
// //               </Box>
// //               <Box sx={{ textAlign: 'center', minWidth: 200 }}>
// //                 <Box
// //                   component="img"
// //                   src={stamp}
// //                   alt="stamp"
// //                   sx={{ width: 75, height: 75, objectFit: 'contain', opacity: 0.85, mb: 1 }}
// //                 />
// //                 <Box sx={{ borderTop: '1.5px solid #0D1B3E', mb: 1 }} />
// //                 <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
// //                   For Mulyam Agronomics Pvt Ltd
// //                 </Typography>
// //                 <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
// //                   Authorized Signature
// //                 </Typography>
// //               </Box>
// //             </Box>

// //             <Box sx={{ textAlign: 'center', borderTop: '1px dashed #E5E7EB', pt: 1.5 }}>
// //               <Typography sx={{ color: '#004B8B', fontWeight: 700, fontSize: 14 }}>🙏 Thank you!</Typography>
// //               <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Mulyam Agronomics Pvt Ltd</Typography>
// //             </Box>
// //           </Box>
// //         </Paper>

// //         <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 2, p: 2.5 }}>
// //           <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 15, mb: 1.5 }}>
// //             Attach File(s) to Purchase Order
// //           </Typography>

// //           {fileError && (
// //             <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }} onClose={() => setFileError('')}>
// //               {fileError}
// //             </Alert>
// //           )}

// //           <Box sx={{ display: 'flex', gap: 1.5, mb: attachedFiles.length ? 1.5 : 0 }}>
// //             <Button
// //               variant="outlined" fullWidth
// //               startIcon={uploadingFile ? <CircularProgress size={16} /> : <UploadFileIcon />}
// //               onClick={() => fileInputRef.current?.click()}
// //               disabled={uploadingFile}
// //               sx={{ borderColor: '#E5E7EB', color: '#004B8B', borderRadius: 2.5, fontWeight: 600, bgcolor: 'white', '&:hover': { borderColor: '#004B8B', bgcolor: '#F8FAFF' } }}
// //             >
// //               Upload File
// //             </Button>
// //             <Button
// //               variant="outlined" fullWidth
// //               startIcon={<PhotoCameraIcon />}
// //               onClick={() => cameraInputRef.current?.click()}
// //               disabled={uploadingFile}
// //               sx={{ borderColor: '#E5E7EB', color: '#004B8B', borderRadius: 2.5, fontWeight: 600, bgcolor: 'white', '&:hover': { borderColor: '#004B8B', bgcolor: '#F8FAFF' } }}
// //             >
// //               Take Photo
// //             </Button>
// //           </Box>

// //           <input ref={fileInputRef} type="file" hidden onChange={handleFileSelected} />
// //           <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFileSelected} />

// //           {attachedFiles.length > 0 && (
// //             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
// //               {attachedFiles.map((f, i) => (
// //                 <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F8FAFF', border: '1px solid #E5E7EB', borderRadius: 2, px: 1.5, py: 1 }}>
// //                   <InsertDriveFileIcon sx={{ fontSize: 18, color: '#6B7280' }} />
// //                   <Typography sx={{ fontSize: 13, color: '#0D1B3E', flex: 1, wordBreak: 'break-all' }}>{f.name}</Typography>
// //                   <CheckCircleIcon sx={{ fontSize: 16, color: '#00BD67' }} />
// //                 </Box>
// //               ))}
// //             </Box>
// //           )}
// //         </Paper>

// //         <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
// //           <Button
// //             variant="outlined" fullWidth size="large" startIcon={printing ? <CircularProgress size={18} /> : <PrintIcon />} onClick={handleThermalPrint} disabled={printing}
// //             sx={{ borderColor: '#004B8B', color: '#004B8B', borderRadius: 3, py: 1.8, fontWeight: 600, fontSize: 15, bgcolor: 'white', '&:hover': { bgcolor: '#F8FAFF' } }}>
// //             Print Receipt
// //           </Button>
// //           <Button
// //             variant="contained" fullWidth size="large"
// //             startIcon={
// //               uploading ? <CircularProgress size={18} color="inherit" />
// //               : uploadedZohoId ? <CloudDoneIcon />
// //               : <CloudUploadIcon />
// //             }
// //             onClick={handleUploadToZoho}
// //             disabled={uploading || !!uploadedZohoId}
// //             sx={{
// //               bgcolor: uploadedZohoId ? '#00BD67' : '#FF6B00', borderRadius: 3, py: 1.8, fontWeight: 600, fontSize: 15,
// //               '&:hover': { bgcolor: uploadedZohoId ? '#00A85A' : '#E05F00' },
// //               '&.Mui-disabled': { bgcolor: uploadedZohoId ? '#00BD67' : '#FFB088', color: 'white' },
// //             }}>
// //             {uploading ? 'Uploading...' : uploadedZohoId ? 'Uploaded' : 'Upload to Zoho'}
// //           </Button>
// //         </Box>

// //         <Box sx={{ display: 'flex', gap: 1.5 }}>
// //           <Button variant="outlined" fullWidth size="large" startIcon={<AddIcon />} onClick={() => navigate('/purchase-orders/new')}
// //             sx={{ borderColor: '#004B8B', color: '#004B8B', borderRadius: 3, py: 1.5, fontWeight: 600, bgcolor: 'white', '&:hover': { bgcolor: '#F8FAFF' } }}>
// //             New Order
// //           </Button>
// //           <Button variant="outlined" fullWidth size="large" startIcon={<HomeIcon />} onClick={() => navigate('/dashboard')}
// //             sx={{ borderColor: '#E5E7EB', color: '#6B7280', borderRadius: 3, py: 1.5, fontWeight: 600, bgcolor: 'white', '&:hover': { bgcolor: '#F9FAFB' } }}>
// //             Dashboard
// //           </Button>
// //         </Box>
// //       </Box>
// //     </Box>
// //     </Layout>
// //   )
// // }
// import { useState, useRef } from 'react'
// import {
//   Box, Button, Typography, Paper, Divider, IconButton, Chip, Alert, CircularProgress,
// } from '@mui/material'
// import CheckCircleIcon from '@mui/icons-material/CheckCircle'
// import PrintIcon from '@mui/icons-material/Print'
// import CloudUploadIcon from '@mui/icons-material/CloudUpload'
// import CloudDoneIcon from '@mui/icons-material/CloudDone'
// import AddIcon from '@mui/icons-material/Add'
// import HomeIcon from '@mui/icons-material/Home'
// import ArrowBackIcon from '@mui/icons-material/ArrowBack'
// import UploadFileIcon from '@mui/icons-material/UploadFile'
// import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
// import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
// import { useNavigate, useLocation } from 'react-router-dom'
// import { useAuthContext } from '../../auth/AuthContext'
// import type { OrderItem } from '../utils/calculateTotals'
// import type { Farmer } from '../../../shared/types'
// import logo from '../../../assets/Mulyam_logo.svg'
// import stamp from '../../../assets/Mulyam_stamp.png'
// import { uploadPurchaseOrderToZoho, attachFilesToZoho } from '../api/zohoApi'
// import { supabase } from '../../../shared/lib/supabaseClient'
// import { Layout } from '../../../shared/components/Layout'
// import { escapeHtml } from '../../../shared/utils/escapeHtml'
// interface SuccessState {
//   po_id: string
//   po_number: string
//   farmer: Farmer
//   items: OrderItem[]
//   subtotal: number
//   total_tax: number
//   grand_total: number
//   notes: string
// }

// export function SuccessScreen() {
//   const navigate = useNavigate()
//   const location = useLocation()
//   const { profile } = useAuthContext()
//   const state = location.state as SuccessState

//   const [uploading, setUploading] = useState(false)
//   const [printing, setPrinting] = useState(false)
//   const [uploadedZohoId, setUploadedZohoId] = useState<string | null>(null)
//   const [uploadError, setUploadError] = useState('')

//   const [attachedFiles, setAttachedFiles] = useState<{ name: string; path: string }[]>([])
//   const [uploadingFile, setUploadingFile] = useState(false)
//   const [fileError, setFileError] = useState('')
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const cameraInputRef = useRef<HTMLInputElement>(null)

//   if (!state) {
//     navigate('/dashboard')
//     return null
//   }

//   const {   po_id,
//   po_number,
//   farmer,
//   items,
//   subtotal,
//   total_tax,
//   grand_total,
//   notes } = state
//   const collectorName = profile?.full_name || 'Collector'

//   function formatAmount(amount: number) {
//     return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
//   }

//   function getReceiptDateTime() {
//     return new Date().toLocaleString('en-IN', {
//       day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
//     })
//   }

//   async function handleUploadToZoho() {
//     if (!po_id) {
//       setUploadError('Missing purchase order reference. Cannot upload.')
//       return
//     }
//     setUploading(true)
//     setUploadError('')
//     const result = await uploadPurchaseOrderToZoho(po_id)
//     if (!result.success || !result.zoho_po_id) {
//       setUploading(false)
//       setUploadError(result.error || 'Failed to upload to Zoho. Please try again.')
//       return
//     }
//     setUploadedZohoId(result.zoho_po_id)

//     if (attachedFiles.length > 0) {
//       const attachResult = await attachFilesToZoho(po_id)
//       if (!attachResult.success) {
//         setUploadError('PO uploaded, but some attachments failed to sync to Zoho.')
//       }
//     }
//     setUploading(false)
//   }

//   async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0]
//     if (!file) return
//     setUploadingFile(true)
//     setFileError('')

//     const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
//     const path = `${po_id}/${Date.now()}_${safeName}`

//     const { error } = await supabase.storage
//       .from('po-attachments')
//       .upload(path, file, { upsert: false })

//     setUploadingFile(false)

//     if (error) {
//       console.error('Upload failed:', error)
//       setFileError('Failed to upload file. Please try again.')
//       return
//     }

//     setAttachedFiles((prev) => [...prev, { name: file.name, path }])
//     if (fileInputRef.current) fileInputRef.current.value = ''
//     if (cameraInputRef.current) cameraInputRef.current.value = ''
//   }

//   async function imageToDataUrl(src: string): Promise<string> {
//     try {
//       const res = await fetch(src)
//       const blob = await res.blob()
//       return await new Promise((resolve, reject) => {
//         const reader = new FileReader()
//         reader.onloadend = () => resolve(reader.result as string)
//         reader.onerror = reject
//         reader.readAsDataURL(blob)
//       })
//     } catch (err) {
//       console.error('Failed to embed image for print:', src, err)
//       return ''
//     }
//   }

//   async function handleThermalPrint() {
//     if (printing) return

//     // Open the print window immediately from the button click.
//     // This avoids popup blocking while images are being prepared.
//     const printWindow = window.open('', '_blank', 'width=420,height=700')

//     if (!printWindow) {
//       alert('Please allow pop-ups for this site to print the receipt.')
//       return
//     }

//     setPrinting(true)

//     try {
//       const [logoData, stampData] = await Promise.all([
//         imageToDataUrl(logo),
//         imageToDataUrl(stamp),
//       ])

//       const line = '-'.repeat(32)

//       // All untrusted values (po_number, farmer.name, farmer.village,
//       // collectorName, item.item_name, item.unit, item.row_comment) are escaped
//       // with escapeHtml before being interpolated into this HTML string.
//       // These values come from shared tables (farmers, items) that other
//       // staff can write to, so this print window is a stored-XSS surface,
//       // not just a self-XSS one.
//       const itemsText = items
//         .map((item) => {
//           const qty = `${item.quantity} ${escapeHtml(item.unit ?? 'Kg')}`
//           const rate = `Rs.${Number(item.rate || 0).toFixed(2)}`
//           const total = `Rs.${Number(item.amount || 0).toFixed(2)}`
//           const comment = item.row_comment
//             ? `\n  (${escapeHtml(item.row_comment)})`
//             : ''

//           return `${escapeHtml(item.item_name)}\n  ${qty} x ${rate} = ${total}${comment}`
//         })
//         .join('\n')

//       const calculatedSubtotal =
//         subtotal ??
//         items.reduce((sum, item) => sum + Number(item.amount || 0), 0)

//       const calculatedTax =
//         total_tax ??
//         items.reduce((sum, item) => sum + Number(item.gst_amount || 0), 0)

//       const calculatedGrandTotal =
//         grand_total ??
//         calculatedSubtotal + calculatedTax

//       printWindow.document.open()
//       printWindow.document.write(`
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8" />
//   <title>Mulyam Receipt ${escapeHtml(po_number)}</title>
//   <style>
//     @page {
//       size: 72mm auto;
//       margin: 0;
//     }

//     * {
//       box-sizing: border-box;
//       -webkit-print-color-adjust: exact !important;
//       print-color-adjust: exact !important;
//     }

//     html,
//     body {
//       width: 72mm;
//       margin: 0;
//       padding: 0;
//       background: #fff;
//       color: #000;
//     }

//     body {
//       font-family: "Courier New", Courier, monospace;
//       overflow-x: hidden;
//     }

//     .receipt {
//       width: 68mm;
//       margin: 0 auto;
//       padding: 2mm 0 3mm;
//       font-size: 11px;
//       line-height: 1.35;
//       overflow-wrap: anywhere;
//     }

//     .center { text-align: center; }
//     .bold { font-weight: 700; }

//     .line {
//       white-space: pre;
//       margin: 4px 0;
//       overflow: hidden;
//     }

//     .section { margin: 4px 0; }

//     .row {
//       display: flex;
//       justify-content: space-between;
//       gap: 8px;
//       margin: 3px 0;
//     }

//     .row span:first-child { flex: 1; }

//     .row span:last-child {
//       white-space: nowrap;
//       text-align: right;
//     }

//     .items {
//       white-space: pre-wrap;
//       word-break: break-word;
//     }

//     .logo {
//       display: block;
//       width: auto;
//       max-width: 48mm;
//       max-height: 17mm;
//       margin: 0 auto 3mm;
//       object-fit: contain;
//     }

//     .stamp {
//       display: block;
//       width: auto;
//       max-width: 22mm;
//       max-height: 22mm;
//       margin: 5mm auto 2mm;
//       object-fit: contain;
//     }

//     @media print {
//       html,
//       body {
//         width: 72mm !important;
//         margin: 0 !important;
//         padding: 0 !important;
//       }

//       .receipt {
//         width: 68mm !important;
//         margin: 0 auto !important;
//         padding-top: 2mm !important;
//         padding-bottom: 3mm !important;
//       }

//       .receipt,
//       .section,
//       .items {
//         break-inside: avoid;
//         page-break-inside: avoid;
//       }
//     }
//   </style>
// </head>
// <body>
//   <div class="receipt">
//     ${logoData ? `<img src="${logoData}" class="logo" alt="Mulyam" />` : ''}

//     <div class="center bold">MULYAM AGRONOMICS PVT LTD</div>
//     <div class="center">Purchase Receipt</div>

//     <div class="line">${line}</div>

//     <div class="section">
//       <div>PO No: ${escapeHtml(po_number)}</div>
//       <div>Date: ${getReceiptDateTime()}</div>
//       <div>Vendor: ${escapeHtml(farmer.name)}</div>
//       ${farmer.village ? `<div>Village: ${escapeHtml(farmer.village)}</div>` : ''}
//       <div>Collected By: ${escapeHtml(collectorName)}</div>
//     </div>

//     <div class="line">${line}</div>

//     <div class="bold">ITEMS</div>
//     <div class="section items">${itemsText}</div>
//     <div class="line">${line}</div>

//     <div class="row">
//       <span>Subtotal</span>
//       <span>Rs.${Number(calculatedSubtotal).toFixed(2)}</span>
//     </div>

//     <div class="row">
//       <span>Tax</span>
//       <span>Rs.${Number(calculatedTax).toFixed(2)}</span>
//     </div>

//     <div class="row bold">
//       <span>GRAND TOTAL</span>
//       <span>Rs.${Number(calculatedGrandTotal).toFixed(2)}</span>
//     </div>

//     ${notes && notes.trim()
//       ? `<div class="line">${line}</div><div class="section">Note: ${escapeHtml(notes)}</div>`
//       : ''}

//     <div class="line">${line}</div>

//     ${stampData
//       ? `<div class="center"><img src="${stampData}" class="stamp" alt="stamp" /></div>`
//       : ''}

//     <div class="center">________________________</div>
//     <div class="center">For Mulyam Agronomics Pvt Ltd</div>
//     <div class="center">Authorized Signature</div>

//     <div class="line">${line}</div>
//     <div class="center bold">Thank you!</div>
//   </div>
// </body>
// </html>
//       `)
//       printWindow.document.close()

//       // Give Chromium time to finish laying out the receipt.
//       await new Promise<void>((resolve) => {
//         const start = Date.now()
//         const check = () => {
//           if (
//             printWindow.document.readyState === 'complete' ||
//             Date.now() - start > 1500
//           ) {
//             resolve()
//           } else {
//             setTimeout(check, 50)
//           }
//         }
//         check()
//       })

//       try {
//         if (printWindow.document.fonts?.ready) {
//           await printWindow.document.fonts.ready
//         }
//       } catch {
//         // Font readiness is optional.
//       }

//       // This is the ONLY print() call in this function.
//       printWindow.focus()
//       printWindow.print()

//       let closed = false
//       const closeWindow = () => {
//         if (closed) return
//         closed = true

//         try {
//           printWindow.close()
//         } catch {
//           // Ignore browser restrictions.
//         }

//         setPrinting(false)
//       }

//       printWindow.onafterprint = closeWindow

//       // Fallback for drivers/browsers that do not fire afterprint.
//       setTimeout(closeWindow, 30000)
//     } catch (error) {
//       console.error('Failed to prepare thermal receipt:', error)

//       try {
//         printWindow.close()
//       } catch {
//         // Ignore browser restrictions.
//       }

//       setPrinting(false)
//       alert('Unable to prepare the receipt for printing.')
//     }
//   }

//   return (
//     <Layout maxWidth={false}>
//     <Box sx={{ minHeight: '100vh', bgcolor: '#EEF2FF' }}>
//       <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB', px: 2, py: 1.2, display: 'flex', alignItems: 'center', gap: 1 }}>
//         <IconButton onClick={() => navigate('/dashboard')} size="small" sx={{ color: '#004B8B' }}>
//           <ArrowBackIcon />
//         </IconButton>
//         <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 16 }}>Purchase order</Typography>
//       </Box>

//       <Box sx={{ maxWidth: 600, mx: 'auto', px: 2, py: 3 }}>
//         <Box sx={{ textAlign: 'center', mb: 3 }}>
//           <CheckCircleIcon sx={{ fontSize: 64, color: '#00BD67', mb: 1.5 }} />
//           <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 0.5 }}>
//             Purchase Order Saved!
//           </Typography>
//           <Chip label={po_number} sx={{ bgcolor: '#EEF2FF', color: '#004B8B', fontWeight: 700, fontSize: 13, borderRadius: 10 }} />
//         </Box>

//         {uploadError && (
//           <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setUploadError('')}>
//             {uploadError}
//           </Alert>
//         )}
//         {uploadedZohoId && (
//           <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
//             Successfully uploaded to Zoho Books.
//           </Alert>
//         )}

//         {/* Digital Receipt */}
//         <Paper elevation={0} sx={{ border: '2px solid #0D1B3E', borderRadius: 1, overflow: 'hidden', mb: 3 }}>
//           <Box sx={{
//             bgcolor: 'white', borderBottom: '2px solid #0D1B3E', px: 2.5, py: 2,
//             display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 1.5,
//           }}>
//             <img src={logo} alt="Mulyam" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
//             <Box sx={{ textAlign: 'center' }}>
//               <Typography sx={{ color: '#0D1B3E', fontWeight: 700, fontSize: 18, letterSpacing: 0.5 }}>
//                 Mulyam Agronomics Pvt Ltd
//               </Typography>
//               <Typography sx={{ color: '#6B7280', fontSize: 13 }}>Purchase Receipt</Typography>
//             </Box>
//             <Box sx={{ width: 44 }} />
//           </Box>

//           <Box sx={{ p: 2.5 }}>
//             <Box sx={{ bgcolor: '#F8FAFF', border: '1px solid #E5E7EB', borderRadius: 1.5, p: 2, mb: 2 }}>
//               {[
//                 { label: 'PO Number', value: po_number, blue: true },
//                 { label: 'Date & Time', value: getReceiptDateTime(), blue: false },
//                 { label: 'Vendor / Farmer', value: farmer.name, blue: false },
//                 ...(farmer.village ? [{ label: 'Village', value: farmer.village, blue: false }] : []),
//                 { label: 'Collected By', value: collectorName, blue: false },
//               ].map((row) => (
//                 <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
//                   <Typography variant="body2" sx={{ color: '#6B7280' }}>{row.label}</Typography>
//                   <Typography variant="body2" sx={{ fontWeight: 600, color: row.blue ? '#004B8B' : '#0D1B3E' }}>
//                     {row.value}
//                   </Typography>
//                 </Box>
//               ))}
//             </Box>

//             <Divider sx={{ mb: 1.5 }} />

//             <Box sx={{ display: 'grid', gridTemplateColumns: '2.2fr 0.8fr 0.8fr 0.8fr 1fr', bgcolor: '#F8FAFF', border: '1px solid #E5E7EB', px: 1.5, py: 1, borderRadius: 1, mb: 1 }}>
//               {['Item', 'Qty', 'Rate', 'Tax', 'Total'].map((h, i) => (
//                 <Typography key={h} sx={{ fontSize: 11, fontWeight: 700, color: '#004B8B', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: i > 0 ? 'right' : 'left' }}>
//                   {h}
//                 </Typography>
//               ))}
//             </Box>

//             {items.map((item, index) => (
//               <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '2.2fr 0.8fr 0.8fr 0.8fr 1fr', px: 1.5, py: 0.8, borderRadius: 1, bgcolor: index % 2 === 0 ? 'white' : '#F8FAFF' }}>
//                 <Box>
//                   <Typography sx={{ fontSize: 13 }}>{item.item_name}</Typography>
//                   {item.row_comment && (
//                     <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>{item.row_comment}</Typography>
//                   )}
//                 </Box>
//                 <Typography sx={{ fontSize: 13, textAlign: 'right' }}>
//                   {item.quantity} {item.unit ?? 'Kg'}
//                 </Typography>
//                 <Typography sx={{ fontSize: 13, textAlign: 'right' }}>₹{item.rate}</Typography>
//                 <Typography sx={{ fontSize: 13, textAlign: 'right', color: item.gst_percent ? '#0D1B3E' : '#9CA3AF' }}>
//                   {item.gst_percent ? `${item.gst_percent}%` : '—'}
//                 </Typography>
//                 <Typography sx={{ fontSize: 13, textAlign: 'right', fontWeight: 600 }}>₹{item.amount.toFixed(0)}</Typography>
//               </Box>
//             ))}

//             <Box sx={{ px: 0.5, mt: 1 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
//                 <Typography sx={{ color: '#6B7280', fontSize: 13 }}>Subtotal</Typography>
//                 <Typography sx={{ color: '#6B7280', fontSize: 13 }}>
//                   {formatAmount(subtotal ?? items.reduce((s, i) => s + (i.amount || 0), 0))}
//                 </Typography>
//               </Box>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
//                 <Typography sx={{ color: '#6B7280', fontSize: 13 }}>Tax</Typography>
//                 <Typography sx={{ color: '#6B7280', fontSize: 13 }}>
//                   {formatAmount(total_tax ?? items.reduce((s, i) => s + (i.gst_amount || 0), 0))}
//                 </Typography>
//               </Box>
//             </Box>

//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #0D1B3E', borderBottom: '2px solid #0D1B3E', px: 0.5, py: 1.5, my: 2 }}>
//               <Typography sx={{ color: '#0D1B3E', fontWeight: 700, fontSize: 16 }}>GRAND TOTAL</Typography>
//               <Typography sx={{ color: '#0D1B3E', fontWeight: 700, fontSize: 18 }}>{formatAmount(grand_total)}</Typography>
//             </Box>

//             {notes && notes.trim() && (
//               <Box sx={{
//                 bgcolor: '#FFFBEB', border: '1px solid #FFC400', borderRadius: 2, px: 2, py: 1.2, mb: 1.5,
//               }}>
//                 <Typography variant="body2" sx={{ color: '#6B7280' }}>📝 {notes}</Typography>
//               </Box>
//             )}

//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2, mt: 6 }}>
//               <Box>
//                 <Typography sx={{ fontSize: 12, color: '#6B7280' }}>Collected By</Typography>
//                 <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0D1B3E' }}>{collectorName}</Typography>
//               </Box>
//               <Box sx={{ textAlign: 'center', minWidth: 200 }}>
//                 <Box
//                   component="img"
//                   src={stamp}
//                   alt="stamp"
//                   sx={{ width: 75, height: 75, objectFit: 'contain', opacity: 0.85, mb: 1 }}
//                 />
//                 <Box sx={{ borderTop: '1.5px solid #0D1B3E', mb: 1 }} />
//                 <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
//                   For Mulyam Agronomics Pvt Ltd
//                 </Typography>
//                 <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
//                   Authorized Signature
//                 </Typography>
//               </Box>
//             </Box>

//             <Box sx={{ textAlign: 'center', borderTop: '1px dashed #E5E7EB', pt: 1.5 }}>
//               <Typography sx={{ color: '#004B8B', fontWeight: 700, fontSize: 14 }}>🙏 Thank you!</Typography>
//               <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Mulyam Agronomics Pvt Ltd</Typography>
//             </Box>
//           </Box>
//         </Paper>

//         <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 2, p: 2.5 }}>
//           <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 15, mb: 1.5 }}>
//             Attach File(s) to Purchase Order
//           </Typography>

//           {fileError && (
//             <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }} onClose={() => setFileError('')}>
//               {fileError}
//             </Alert>
//           )}

//           <Box sx={{ display: 'flex', gap: 1.5, mb: attachedFiles.length ? 1.5 : 0 }}>
//             <Button
//               variant="outlined" fullWidth
//               startIcon={uploadingFile ? <CircularProgress size={16} /> : <UploadFileIcon />}
//               onClick={() => fileInputRef.current?.click()}
//               disabled={uploadingFile}
//               sx={{ borderColor: '#E5E7EB', color: '#004B8B', borderRadius: 2.5, fontWeight: 600, bgcolor: 'white', '&:hover': { borderColor: '#004B8B', bgcolor: '#F8FAFF' } }}
//             >
//               Upload File
//             </Button>
//             <Button
//               variant="outlined" fullWidth
//               startIcon={<PhotoCameraIcon />}
//               onClick={() => cameraInputRef.current?.click()}
//               disabled={uploadingFile}
//               sx={{ borderColor: '#E5E7EB', color: '#004B8B', borderRadius: 2.5, fontWeight: 600, bgcolor: 'white', '&:hover': { borderColor: '#004B8B', bgcolor: '#F8FAFF' } }}
//             >
//               Take Photo
//             </Button>
//           </Box>

//           <input ref={fileInputRef} type="file" hidden onChange={handleFileSelected} />
//           <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFileSelected} />

//           {attachedFiles.length > 0 && (
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//               {attachedFiles.map((f, i) => (
//                 <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F8FAFF', border: '1px solid #E5E7EB', borderRadius: 2, px: 1.5, py: 1 }}>
//                   <InsertDriveFileIcon sx={{ fontSize: 18, color: '#6B7280' }} />
//                   <Typography sx={{ fontSize: 13, color: '#0D1B3E', flex: 1, wordBreak: 'break-all' }}>{f.name}</Typography>
//                   <CheckCircleIcon sx={{ fontSize: 16, color: '#00BD67' }} />
//                 </Box>
//               ))}
//             </Box>
//           )}
//         </Paper>

//         <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
//           <Button
//             variant="outlined" fullWidth size="large" startIcon={printing ? <CircularProgress size={18} /> : <PrintIcon />} onClick={handleThermalPrint} disabled={printing}
//             sx={{ borderColor: '#004B8B', color: '#004B8B', borderRadius: 3, py: 1.8, fontWeight: 600, fontSize: 15, bgcolor: 'white', '&:hover': { bgcolor: '#F8FAFF' } }}>
//             Print Receipt
//           </Button>
//           <Button
//             variant="contained" fullWidth size="large"
//             startIcon={
//               uploading ? <CircularProgress size={18} color="inherit" />
//               : uploadedZohoId ? <CloudDoneIcon />
//               : <CloudUploadIcon />
//             }
//             onClick={handleUploadToZoho}
//             disabled={uploading || !!uploadedZohoId}
//             sx={{
//               bgcolor: uploadedZohoId ? '#00BD67' : '#FF6B00', borderRadius: 3, py: 1.8, fontWeight: 600, fontSize: 15,
//               '&:hover': { bgcolor: uploadedZohoId ? '#00A85A' : '#E05F00' },
//               '&.Mui-disabled': { bgcolor: uploadedZohoId ? '#00BD67' : '#FFB088', color: 'white' },
//             }}>
//             {uploading ? 'Uploading...' : uploadedZohoId ? 'Uploaded' : 'Upload to Zoho'}
//           </Button>
//         </Box>

//         <Box sx={{ display: 'flex', gap: 1.5 }}>
//           <Button variant="outlined" fullWidth size="large" startIcon={<AddIcon />} onClick={() => navigate('/purchase-orders/new')}
//             sx={{ borderColor: '#004B8B', color: '#004B8B', borderRadius: 3, py: 1.5, fontWeight: 600, bgcolor: 'white', '&:hover': { bgcolor: '#F8FAFF' } }}>
//             New Order
//           </Button>
//           <Button variant="outlined" fullWidth size="large" startIcon={<HomeIcon />} onClick={() => navigate('/dashboard')}
//             sx={{ borderColor: '#E5E7EB', color: '#6B7280', borderRadius: 3, py: 1.5, fontWeight: 600, bgcolor: 'white', '&:hover': { bgcolor: '#F9FAFB' } }}>
//             Dashboard
//           </Button>
//         </Box>
//       </Box>
//     </Box>
//     </Layout>
//   )
// }
import { useState, useRef } from 'react'
import {
  Box, Button, Typography, Paper, Divider, IconButton, Chip, Alert, CircularProgress,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PrintIcon from '@mui/icons-material/Print'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CloudDoneIcon from '@mui/icons-material/CloudDone'
import AddIcon from '@mui/icons-material/Add'
import HomeIcon from '@mui/icons-material/Home'
import EditIcon from '@mui/icons-material/Edit'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../auth/AuthContext'
import type { OrderItem } from '../utils/calculateTotals'
import type { Farmer } from '../../../shared/types'
import logo from '../../../assets/Mulyam_logo.svg'
import stamp from '../../../assets/Mulyam_stamp.png'
import { uploadPurchaseOrderToZoho, attachFilesToZoho } from '../api/zohoApi'
import { supabase } from '../../../shared/lib/supabaseClient'
import { Layout } from '../../../shared/components/Layout'
import { escapeHtml } from '../../../shared/utils/escapeHtml'
interface SuccessState {
  po_id: string
  po_number: string
  farmer: Farmer
  items: OrderItem[]
  subtotal: number
  total_tax: number
  grand_total: number
  notes: string
}

export function SuccessScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuthContext()
  const state = location.state as SuccessState

  const [uploading, setUploading] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [uploadedZohoId, setUploadedZohoId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState('')

  const [attachedFiles, setAttachedFiles] = useState<{ name: string; path: string }[]>([])
  const [uploadingFile, setUploadingFile] = useState(false)
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  if (!state) {
    navigate('/dashboard')
    return null
  }

  const {   po_id,
  po_number,
  farmer,
  items,
  subtotal,
  total_tax,
  grand_total,
  notes } = state
  const collectorName = profile?.full_name || 'Collector'

  function formatAmount(amount: number) {
    return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  function getReceiptDateTime() {
    return new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  // Opens the order form with this purchase order already filled in.
  function handleEdit() {
    navigate('/purchase-orders/new', { state: { editPoId: po_id } })
  }

  async function handleUploadToZoho() {
    if (!po_id) {
      setUploadError('Missing purchase order reference. Cannot upload.')
      return
    }
    setUploading(true)
    setUploadError('')
    const result = await uploadPurchaseOrderToZoho(po_id)
    if (!result.success || !result.zoho_po_id) {
      setUploading(false)
      setUploadError(result.error || 'Failed to upload to Zoho. Please try again.')
      return
    }
    setUploadedZohoId(result.zoho_po_id)

    if (attachedFiles.length > 0) {
      const attachResult = await attachFilesToZoho(po_id)
      if (!attachResult.success) {
        setUploadError('PO uploaded, but some attachments failed to sync to Zoho.')
      }
    }
    setUploading(false)
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFile(true)
    setFileError('')

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${po_id}/${Date.now()}_${safeName}`

    const { error } = await supabase.storage
      .from('po-attachments')
      .upload(path, file, { upsert: false })

    setUploadingFile(false)

    if (error) {
      console.error('Upload failed:', error)
      setFileError('Failed to upload file. Please try again.')
      return
    }

    setAttachedFiles((prev) => [...prev, { name: file.name, path }])
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  async function imageToDataUrl(src: string): Promise<string> {
    try {
      const res = await fetch(src)
      const blob = await res.blob()
      return await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (err) {
      console.error('Failed to embed image for print:', src, err)
      return ''
    }
  }

  async function handleThermalPrint() {
    if (printing) return

    // Open the print window immediately from the button click.
    // This avoids popup blocking while images are being prepared.
    const printWindow = window.open('', '_blank', 'width=420,height=700')

    if (!printWindow) {
      alert('Please allow pop-ups for this site to print the receipt.')
      return
    }

    setPrinting(true)

    try {
      const [logoData, stampData] = await Promise.all([
        imageToDataUrl(logo),
        imageToDataUrl(stamp),
      ])

      const line = '-'.repeat(32)

      // All untrusted values (po_number, farmer.name, farmer.village,
      // collectorName, item.item_name, item.unit, item.row_comment) are escaped
      // with escapeHtml before being interpolated into this HTML string.
      // These values come from shared tables (farmers, items) that other
      // staff can write to, so this print window is a stored-XSS surface,
      // not just a self-XSS one.
      const itemsText = items
        .map((item) => {
          const qty = `${item.quantity} ${escapeHtml(item.unit ?? 'Kg')}`
          const rate = `Rs.${Number(item.rate || 0).toFixed(2)}`
          const total = `Rs.${Number(item.amount || 0).toFixed(2)}`
          const comment = item.row_comment
            ? `\n  (${escapeHtml(item.row_comment)})`
            : ''

          return `${escapeHtml(item.item_name)}\n  ${qty} x ${rate} = ${total}${comment}`
        })
        .join('\n')

      const calculatedSubtotal =
        subtotal ??
        items.reduce((sum, item) => sum + Number(item.amount || 0), 0)

      const calculatedTax =
        total_tax ??
        items.reduce((sum, item) => sum + Number(item.gst_amount || 0), 0)

      const calculatedGrandTotal =
        grand_total ??
        calculatedSubtotal + calculatedTax

      printWindow.document.open()
      printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Mulyam Receipt ${escapeHtml(po_number)}</title>
  <style>
    @page {
      size: 72mm auto;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    html,
    body {
      width: 72mm;
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
    }

    body {
      font-family: "Courier New", Courier, monospace;
      overflow-x: hidden;
    }

    .receipt {
      width: 68mm;
      margin: 0 auto;
      padding: 2mm 0 3mm;
      font-size: 11px;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .center { text-align: center; }
    .bold { font-weight: 700; }

    .line {
      white-space: pre;
      margin: 4px 0;
      overflow: hidden;
    }

    .section { margin: 4px 0; }

    .row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin: 3px 0;
    }

    .row span:first-child { flex: 1; }

    .row span:last-child {
      white-space: nowrap;
      text-align: right;
    }

    .items {
      white-space: pre-wrap;
      word-break: break-word;
    }

    .logo {
      display: block;
      width: auto;
      max-width: 48mm;
      max-height: 17mm;
      margin: 0 auto 3mm;
      object-fit: contain;
    }

    .stamp {
      display: block;
      width: auto;
      max-width: 22mm;
      max-height: 22mm;
      margin: 5mm auto 2mm;
      object-fit: contain;
    }

    @media print {
      html,
      body {
        width: 72mm !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .receipt {
        width: 68mm !important;
        margin: 0 auto !important;
        padding-top: 2mm !important;
        padding-bottom: 3mm !important;
      }

      .receipt,
      .section,
      .items {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    ${logoData ? `<img src="${logoData}" class="logo" alt="Mulyam" />` : ''}

    <div class="center bold">MULYAM AGRONOMICS PVT LTD</div>
    <div class="center">Purchase Receipt</div>

    <div class="line">${line}</div>

    <div class="section">
      <div>PO No: ${escapeHtml(po_number)}</div>
      <div>Date: ${getReceiptDateTime()}</div>
      <div>Vendor: ${escapeHtml(farmer.name)}</div>
      ${farmer.village ? `<div>Village: ${escapeHtml(farmer.village)}</div>` : ''}
      <div>Collected By: ${escapeHtml(collectorName)}</div>
    </div>

    <div class="line">${line}</div>

    <div class="bold">ITEMS</div>
    <div class="section items">${itemsText}</div>
    <div class="line">${line}</div>

    <div class="row">
      <span>Subtotal</span>
      <span>Rs.${Number(calculatedSubtotal).toFixed(2)}</span>
    </div>

    <div class="row">
      <span>Tax</span>
      <span>Rs.${Number(calculatedTax).toFixed(2)}</span>
    </div>

    <div class="row bold">
      <span>GRAND TOTAL</span>
      <span>Rs.${Number(calculatedGrandTotal).toFixed(2)}</span>
    </div>

    ${notes && notes.trim()
      ? `<div class="line">${line}</div><div class="section">Note: ${escapeHtml(notes)}</div>`
      : ''}

    <div class="line">${line}</div>

    ${stampData
      ? `<div class="center"><img src="${stampData}" class="stamp" alt="stamp" /></div>`
      : ''}

    <div class="center">________________________</div>
    <div class="center">For Mulyam Agronomics Pvt Ltd</div>
    <div class="center">Authorized Signature</div>

    <div class="line">${line}</div>
    <div class="center bold">Thank you!</div>
  </div>
</body>
</html>
      `)
      printWindow.document.close()

      // Give Chromium time to finish laying out the receipt.
      await new Promise<void>((resolve) => {
        const start = Date.now()
        const check = () => {
          if (
            printWindow.document.readyState === 'complete' ||
            Date.now() - start > 1500
          ) {
            resolve()
          } else {
            setTimeout(check, 50)
          }
        }
        check()
      })

      try {
        if (printWindow.document.fonts?.ready) {
          await printWindow.document.fonts.ready
        }
      } catch {
        // Font readiness is optional.
      }

      // This is the ONLY print() call in this function.
      printWindow.focus()
      printWindow.print()

      let closed = false
      const closeWindow = () => {
        if (closed) return
        closed = true

        try {
          printWindow.close()
        } catch {
          // Ignore browser restrictions.
        }

        setPrinting(false)
      }

      printWindow.onafterprint = closeWindow

      // Fallback for drivers/browsers that do not fire afterprint.
      setTimeout(closeWindow, 30000)
    } catch (error) {
      console.error('Failed to prepare thermal receipt:', error)

      try {
        printWindow.close()
      } catch {
        // Ignore browser restrictions.
      }

      setPrinting(false)
      alert('Unable to prepare the receipt for printing.')
    }
  }

  return (
    <Layout maxWidth={false}>
    <Box sx={{ minHeight: '100vh', bgcolor: '#EEF2FF' }}>
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB', px: 2, py: 1.2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => navigate('/dashboard')} size="small" sx={{ color: '#004B8B' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 16 }}>Purchase order</Typography>
      </Box>

      <Box sx={{ maxWidth: 600, mx: 'auto', px: 2, py: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: '#00BD67', mb: 1.5 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1B3E', mb: 0.5 }}>
            Purchase Order Saved!
          </Typography>
          <Chip label={po_number} sx={{ bgcolor: '#EEF2FF', color: '#004B8B', fontWeight: 700, fontSize: 13, borderRadius: 10 }} />
        </Box>

        {uploadError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setUploadError('')}>
            {uploadError}
          </Alert>
        )}
        {uploadedZohoId && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            Successfully uploaded to Zoho Books.
          </Alert>
        )}

        {/* Digital Receipt */}
        <Paper elevation={0} sx={{ border: '2px solid #0D1B3E', borderRadius: 1, overflow: 'hidden', mb: 3 }}>
          <Box sx={{
            bgcolor: 'white', borderBottom: '2px solid #0D1B3E', px: 2.5, py: 2,
            display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 1.5,
          }}>
            <img src={logo} alt="Mulyam" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ color: '#0D1B3E', fontWeight: 700, fontSize: 18, letterSpacing: 0.5 }}>
                Mulyam Agronomics Pvt Ltd
              </Typography>
              <Typography sx={{ color: '#6B7280', fontSize: 13 }}>Purchase Receipt</Typography>
            </Box>
            <Box sx={{ width: 44 }} />
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Box sx={{ bgcolor: '#F8FAFF', border: '1px solid #E5E7EB', borderRadius: 1.5, p: 2, mb: 2 }}>
              {[
                { label: 'PO Number', value: po_number, blue: true },
                { label: 'Date & Time', value: getReceiptDateTime(), blue: false },
                { label: 'Vendor / Farmer', value: farmer.name, blue: false },
                ...(farmer.village ? [{ label: 'Village', value: farmer.village, blue: false }] : []),
                { label: 'Collected By', value: collectorName, blue: false },
              ].map((row) => (
                <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>{row.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: row.blue ? '#004B8B' : '#0D1B3E' }}>
                    {row.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: '2.2fr 0.8fr 0.8fr 0.8fr 1fr', bgcolor: '#F8FAFF', border: '1px solid #E5E7EB', px: 1.5, py: 1, borderRadius: 1, mb: 1 }}>
              {['Item', 'Qty', 'Rate', 'Tax', 'Total'].map((h, i) => (
                <Typography key={h} sx={{ fontSize: 11, fontWeight: 700, color: '#004B8B', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: i > 0 ? 'right' : 'left' }}>
                  {h}
                </Typography>
              ))}
            </Box>

            {items.map((item, index) => (
              <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '2.2fr 0.8fr 0.8fr 0.8fr 1fr', px: 1.5, py: 0.8, borderRadius: 1, bgcolor: index % 2 === 0 ? 'white' : '#F8FAFF' }}>
                <Box>
                  <Typography sx={{ fontSize: 13 }}>{item.item_name}</Typography>
                  {item.row_comment && (
                    <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>{item.row_comment}</Typography>
                  )}
                </Box>
                <Typography sx={{ fontSize: 13, textAlign: 'right' }}>
                  {item.quantity} {item.unit ?? 'Kg'}
                </Typography>
                <Typography sx={{ fontSize: 13, textAlign: 'right' }}>₹{item.rate}</Typography>
                <Typography sx={{ fontSize: 13, textAlign: 'right', color: item.gst_percent ? '#0D1B3E' : '#9CA3AF' }}>
                  {item.gst_percent ? `${item.gst_percent}%` : '—'}
                </Typography>
                <Typography sx={{ fontSize: 13, textAlign: 'right', fontWeight: 600 }}>₹{item.amount.toFixed(0)}</Typography>
              </Box>
            ))}

            <Box sx={{ px: 0.5, mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                <Typography sx={{ color: '#6B7280', fontSize: 13 }}>Subtotal</Typography>
                <Typography sx={{ color: '#6B7280', fontSize: 13 }}>
                  {formatAmount(subtotal ?? items.reduce((s, i) => s + (i.amount || 0), 0))}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                <Typography sx={{ color: '#6B7280', fontSize: 13 }}>Tax</Typography>
                <Typography sx={{ color: '#6B7280', fontSize: 13 }}>
                  {formatAmount(total_tax ?? items.reduce((s, i) => s + (i.gst_amount || 0), 0))}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #0D1B3E', borderBottom: '2px solid #0D1B3E', px: 0.5, py: 1.5, my: 2 }}>
              <Typography sx={{ color: '#0D1B3E', fontWeight: 700, fontSize: 16 }}>GRAND TOTAL</Typography>
              <Typography sx={{ color: '#0D1B3E', fontWeight: 700, fontSize: 18 }}>{formatAmount(grand_total)}</Typography>
            </Box>

            {notes && notes.trim() && (
              <Box sx={{
                bgcolor: '#FFFBEB', border: '1px solid #FFC400', borderRadius: 2, px: 2, py: 1.2, mb: 1.5,
              }}>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>📝 {notes}</Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2, mt: 6 }}>
              <Box>
                <Typography sx={{ fontSize: 12, color: '#6B7280' }}>Collected By</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0D1B3E' }}>{collectorName}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 200 }}>
                <Box
                  component="img"
                  src={stamp}
                  alt="stamp"
                  sx={{ width: 75, height: 75, objectFit: 'contain', opacity: 0.85, mb: 1 }}
                />
                <Box sx={{ borderTop: '1.5px solid #0D1B3E', mb: 1 }} />
                <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                  For Mulyam Agronomics Pvt Ltd
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                  Authorized Signature
                </Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center', borderTop: '1px dashed #E5E7EB', pt: 1.5 }}>
              <Typography sx={{ color: '#004B8B', fontWeight: 700, fontSize: 14 }}>🙏 Thank you!</Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Mulyam Agronomics Pvt Ltd</Typography>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 2, p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, color: '#004B8B', fontSize: 15, mb: 1.5 }}>
            Attach File(s) to Purchase Order
          </Typography>

          {fileError && (
            <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }} onClose={() => setFileError('')}>
              {fileError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 1.5, mb: attachedFiles.length ? 1.5 : 0 }}>
            <Button
              variant="outlined" fullWidth
              startIcon={uploadingFile ? <CircularProgress size={16} /> : <UploadFileIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              sx={{ borderColor: '#E5E7EB', color: '#004B8B', borderRadius: 2.5, fontWeight: 600, bgcolor: 'white', '&:hover': { borderColor: '#004B8B', bgcolor: '#F8FAFF' } }}
            >
              Upload File
            </Button>
            <Button
              variant="outlined" fullWidth
              startIcon={<PhotoCameraIcon />}
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploadingFile}
              sx={{ borderColor: '#E5E7EB', color: '#004B8B', borderRadius: 2.5, fontWeight: 600, bgcolor: 'white', '&:hover': { borderColor: '#004B8B', bgcolor: '#F8FAFF' } }}
            >
              Take Photo
            </Button>
          </Box>

          <input ref={fileInputRef} type="file" hidden onChange={handleFileSelected} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFileSelected} />

          {attachedFiles.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {attachedFiles.map((f, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F8FAFF', border: '1px solid #E5E7EB', borderRadius: 2, px: 1.5, py: 1 }}>
                  <InsertDriveFileIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                  <Typography sx={{ fontSize: 13, color: '#0D1B3E', flex: 1, wordBreak: 'break-all' }}>{f.name}</Typography>
                  <CheckCircleIcon sx={{ fontSize: 16, color: '#00BD67' }} />
                </Box>
              ))}
            </Box>
          )}
        </Paper>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
          <Button
            variant="outlined" fullWidth size="large" startIcon={printing ? <CircularProgress size={18} /> : <PrintIcon />} onClick={handleThermalPrint} disabled={printing}
            sx={{ borderColor: '#004B8B', color: '#004B8B', borderRadius: 3, py: 1.8, fontWeight: 600, fontSize: 15, bgcolor: 'white', '&:hover': { bgcolor: '#F8FAFF' } }}>
            Print Receipt
          </Button>
          <Button
            variant="contained" fullWidth size="large"
            startIcon={
              uploading ? <CircularProgress size={18} color="inherit" />
              : uploadedZohoId ? <CloudDoneIcon />
              : <CloudUploadIcon />
            }
            onClick={handleUploadToZoho}
            disabled={uploading || !!uploadedZohoId}
            sx={{
              bgcolor: uploadedZohoId ? '#00BD67' : '#FF6B00', borderRadius: 3, py: 1.8, fontWeight: 600, fontSize: 15,
              '&:hover': { bgcolor: uploadedZohoId ? '#00A85A' : '#E05F00' },
              '&.Mui-disabled': { bgcolor: uploadedZohoId ? '#00BD67' : '#FFB088', color: 'white' },
            }}>
            {uploading ? 'Uploading...' : uploadedZohoId ? 'Uploaded' : 'Upload to Zoho'}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {!uploadedZohoId && (
            <Button variant="outlined" fullWidth size="large" startIcon={<EditIcon />} onClick={handleEdit}
              disabled={uploading}
              sx={{ borderColor: '#004B8B', color: '#004B8B', borderRadius: 3, py: 1.5, fontWeight: 600, bgcolor: 'white', '&:hover': { bgcolor: '#F8FAFF' } }}>
              Edit
            </Button>
          )}
          <Button variant="outlined" fullWidth size="large" startIcon={<AddIcon />} onClick={() => navigate('/purchase-orders/new')}
            sx={{ borderColor: '#004B8B', color: '#004B8B', borderRadius: 3, py: 1.5, fontWeight: 600, bgcolor: 'white', '&:hover': { bgcolor: '#F8FAFF' } }}>
            New Order
          </Button>
          <Button variant="outlined" fullWidth size="large" startIcon={<HomeIcon />} onClick={() => navigate('/dashboard')}
            sx={{ borderColor: '#E5E7EB', color: '#6B7280', borderRadius: 3, py: 1.5, fontWeight: 600, bgcolor: 'white', '&:hover': { bgcolor: '#F9FAFB' } }}>
            Dashboard
          </Button>
        </Box>
      </Box>
    </Box>
    </Layout>
  )
}