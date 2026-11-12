
// // import { useMemo, useState } from 'react';
// // import {
// //   Box, Checkbox, IconButton, InputAdornment, Paper, Stack, Table,
// //   TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
// //   Typography, Button, MenuItem, useMediaQuery, useTheme,
// // } from '@mui/material';
// // import { SearchIcon, FilterIcon, RefreshIcon, CloseIcon } from '../../../shared/components/icons';
// // import { VendorSelect } from './VendorSelect';
// // import { ItemSelect } from './ItemSelect';
// // import { useItemCatalog, type ItemCatalogEntry } from '../hooks/useItemCatalog';
// // import type { Item, Vendor } from '../../../shared/types/domain';

// // const BASE_UNIT_OPTIONS = ['Kg', 'Units', 'Nos', 'g', 'L', 'Boxes', 'PKT', 'Dozen', 'Bunch'];

// // function unitOptionsFor(currentUnit: string) {
// //   return currentUnit && !BASE_UNIT_OPTIONS.includes(currentUnit)
// //     ? [currentUnit, ...BASE_UNIT_OPTIONS]
// //     : BASE_UNIT_OPTIONS;
// // }

// // function isBulkItem(entry: ItemCatalogEntry) {
// //   const name = entry.item_name?.toLowerCase() ?? '';
// //   const looksInactive = name.startsWith('inactive-') || entry.active === false;
// //   return !looksInactive && name.includes('bulk');
// // }

// // interface Props {
// //   items: Item[];
// //   vendors: Vendor[];
// //   selectedIds: Set<string>;
// //   onToggleSelect: (itemId: string) => void;
// //   onToggleSelectAll: (checked: boolean) => void;
// //   onAssignVendor: (itemId: string, vendorId: string | null) => void;
// //   onRenameItem: (itemId: string, picked: ItemCatalogEntry | null) => void;
// //   onUpdateQty: (itemId: string, qty: number | null) => void;
// //   onUpdateUnit: (itemId: string, unit: string) => void;
// //   onUpdateRate: (itemId: string, rate: number | null) => void;
// //   onAddItem: () => void;
// //   onDeleteItem: (itemId: string) => void;
// //   onRefresh: () => void;
// // }

// // export function ItemsTable({
// //   items, vendors, selectedIds, onToggleSelect, onToggleSelectAll,
// //   onAssignVendor, onRenameItem, onUpdateQty, onUpdateUnit, onUpdateRate,
// //   onAddItem, onDeleteItem, onRefresh,
// // }: Props) {
// //   const [search, setSearch] = useState('');
// //   const theme = useTheme();
// //   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
// //   const { data: rawCatalog = [], isLoading: catalogLoading } = useItemCatalog();

// //   const catalog = useMemo(() => rawCatalog.filter(isBulkItem), [rawCatalog]);

// //   const filteredItems = useMemo(() => {
// //     if (!search.trim()) return items;
// //     const q = search.toLowerCase();
// //     return items.filter((item: Item) => item.item_name.toLowerCase().includes(q));
// //   }, [items, search]);

// //   const allChecked = filteredItems.length > 0 && filteredItems.every((i: Item) => selectedIds.has(i.id));

// //   const rowTotal = (item: Item) =>
// //     item.required_qty && item.rate ? (item.required_qty * item.rate).toFixed(2) : '—';

// //   return (
// //     <Paper>
// //       <Stack
// //         direction={{ xs: 'column', sm: 'row' }}
// //         justifyContent="space-between"
// //         alignItems={{ xs: 'stretch', sm: 'center' }}
// //         spacing={1.5}
// //         px={{ xs: 2, sm: 3 }}
// //         py={2.5}
// //         borderBottom="1px solid"
// //         borderColor="divider"
// //       >
// //         <Typography variant="subtitle1" fontWeight={700}>Items to Purchase</Typography>

// //         <Stack direction="row" spacing={1.5}>
// //           <TextField
// //             size="small"
// //             fullWidth
// //             placeholder="Search items..."
// //             value={search}
// //             onChange={(e) => setSearch(e.target.value)}
// //             InputProps={{
// //               startAdornment: (
// //                 <InputAdornment position="start">
// //                   <SearchIcon fontSize="small" />
// //                 </InputAdornment>
// //               ),
// //             }}
// //             sx={{ minWidth: { xs: 0, sm: 220 } }}
// //           />
// //           {!isMobile && (
// //             <Button variant="outlined" startIcon={<FilterIcon />} color="inherit">
// //               Filter
// //             </Button>
// //           )}
// //           <IconButton onClick={onRefresh} sx={{ border: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
// //             <RefreshIcon fontSize="small" />
// //           </IconButton>
// //         </Stack>
// //       </Stack>

// //       {isMobile ? (
// //         <Stack divider={<Box borderBottom="1px solid" borderColor="divider" />}>
// //           {filteredItems.map((item: Item) => {
// //             const isSelected = selectedIds.has(item.id);
// //             return (
// //               <Box key={item.id} p={2} bgcolor={isSelected ? 'primary.light' : undefined}>
// //                 <Stack direction="row" alignItems="flex-start" spacing={1}>
// //                   <Checkbox
// //                     checked={isSelected}
// //                     onChange={() => onToggleSelect(item.id)}
// //                     color="success"
// //                     sx={{ mt: -1 }}
// //                   />
// //                   <Box flexGrow={1} minWidth={0}>
// //                     <Box mb={1}>
// //                       <ItemSelect
// //                         catalog={catalog}
// //                         value={item.item_name}
// //                         loading={catalogLoading}
// //                         onChange={(picked) => onRenameItem(item.id, picked)}
// //                       />
// //                     </Box>
// //                     {/*
// //                       FIX: Qty/Unit/Rate were each fixed at width:90, which
// //                       left empty space on the right once the row was wider
// //                       than 3×90 + gaps. Each field is now flex:1 so they
// //                       grow to fill the full row width evenly, no leftover
// //                       white space, and nowrap keeps them from stacking.
// //                     */}
// //                     <Stack direction="row" spacing={1} mb={1} flexWrap="nowrap">
// //                       <TextField
// //                         size="small"
// //                         type="number"
// //                         label="Qty"
// //                         placeholder="Enter qty"
// //                         value={item.required_qty ?? ''}
// //                         onChange={(e) => {
// //                           const raw = e.target.value;
// //                           onUpdateQty(item.id, raw === '' ? null : Number(raw));
// //                         }}
// //                         sx={{ flex: 1, minWidth: 0 }}
// //                       />
// //                       <TextField
// //                         size="small"
// //                         select
// //                         label="Unit"
// //                         value={item.unit}
// //                         onChange={(e) => onUpdateUnit(item.id, e.target.value)}
// //                         sx={{ flex: 1, minWidth: 0 }}
// //                       >
// //                         {unitOptionsFor(item.unit).map((u) => (
// //                           <MenuItem key={u} value={u}>{u}</MenuItem>
// //                         ))}
// //                       </TextField>
// //                       <TextField
// //                         size="small"
// //                         type="number"
// //                         label="Rate"
// //                         placeholder="Rate"
// //                         value={item.rate ?? ''}
// //                         onChange={(e) => {
// //                           const raw = e.target.value;
// //                           onUpdateRate(item.id, raw === '' ? null : Number(raw));
// //                         }}
// //                         sx={{ flex: 1, minWidth: 0 }}
// //                       />
// //                     </Stack>
// //                     <Typography variant="caption" color="text.secondary" display="block" mb={1}>
// //                       Total: {rowTotal(item)}
// //                     </Typography>
// //                     <VendorSelect
// //                       vendors={vendors}
// //                       value={item.vendor_id}
// //                       onChange={(vendorId) => onAssignVendor(item.id, vendorId)}
// //                     />
// //                   </Box>
// //                   <IconButton size="small" onClick={() => onDeleteItem(item.id)} sx={{ mt: -1 }}>
// //                     <CloseIcon fontSize="small" />
// //                   </IconButton>
// //                 </Stack>
// //               </Box>
// //             );
// //           })}

// //           {filteredItems.length === 0 && (
// //             <Box py={6} textAlign="center">
// //               <Typography color="text.secondary">No items match your search.</Typography>
// //             </Box>
// //           )}

// //           <Box p={2}>
// //             <Button fullWidth variant="outlined" onClick={onAddItem}>+ Add Item</Button>
// //           </Box>
// //         </Stack>
// //       ) : (
// //         <TableContainer>
// //           <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
// //             <TableHead>
// //               <TableRow>
// //                 <TableCell padding="checkbox" sx={{ width: '4%' }}>
// //                   <Checkbox checked={allChecked} onChange={(e) => onToggleSelectAll(e.target.checked)} />
// //                 </TableCell>
// //                 <TableCell sx={{ width: '26%' }}>Item Name</TableCell>
// //                 <TableCell sx={{ width: '10%' }}>Required</TableCell>
// //                 <TableCell sx={{ width: '10%' }}>Unit</TableCell>
// //                 <TableCell sx={{ width: '10%' }}>Rate</TableCell>
// //                 <TableCell sx={{ width: '10%' }} align="right">Total</TableCell>
// //                 <TableCell sx={{ width: '26%' }}>Vendor</TableCell>
// //                 <TableCell padding="checkbox" sx={{ width: '4%' }} />
// //               </TableRow>
// //             </TableHead>
// //             <TableBody>
// //               {filteredItems.map((item: Item) => {
// //                 const isSelected = selectedIds.has(item.id);
// //                 return (
// //                   <TableRow key={item.id} sx={{ bgcolor: isSelected ? 'primary.light' : undefined, '&:last-child td': { border: 0 } }}>
// //                     <TableCell padding="checkbox">
// //                       <Checkbox checked={isSelected} onChange={() => onToggleSelect(item.id)} color="success" />
// //                     </TableCell>
// //                     <TableCell sx={{ overflow: 'hidden' }}>
// //                       <ItemSelect
// //                         catalog={catalog}
// //                         value={item.item_name}
// //                         loading={catalogLoading}
// //                         onChange={(picked) => onRenameItem(item.id, picked)}
// //                       />
// //                     </TableCell>
// //                     <TableCell sx={{ overflow: 'hidden' }}>
// //                       <TextField
// //                         size="small"
// //                         fullWidth
// //                         type="number"
// //                         placeholder="Enter qty"
// //                         value={item.required_qty ?? ''}
// //                         onChange={(e) => {
// //                           const raw = e.target.value;
// //                           onUpdateQty(item.id, raw === '' ? null : Number(raw));
// //                         }}
// //                         inputProps={{ step: 0.01, min: 0 }}
// //                       />
// //                     </TableCell>
// //                     <TableCell sx={{ overflow: 'hidden' }}>
// //                       <TextField
// //                         size="small"
// //                         select
// //                         fullWidth
// //                         value={item.unit}
// //                         onChange={(e) => onUpdateUnit(item.id, e.target.value)}
// //                       >
// //                         {unitOptionsFor(item.unit).map((u) => (
// //                           <MenuItem key={u} value={u}>{u}</MenuItem>
// //                         ))}
// //                       </TextField>
// //                     </TableCell>
// //                     <TableCell sx={{ overflow: 'hidden' }}>
// //                       <TextField
// //                         size="small"
// //                         fullWidth
// //                         type="number"
// //                         placeholder="Rate"
// //                         value={item.rate ?? ''}
// //                         onChange={(e) => {
// //                           const raw = e.target.value;
// //                           onUpdateRate(item.id, raw === '' ? null : Number(raw));
// //                         }}
// //                         inputProps={{ step: 0.01, min: 0 }}
// //                       />
// //                     </TableCell>
// //                     <TableCell align="right" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
// //                       {rowTotal(item)}
// //                     </TableCell>
// //                     <TableCell sx={{ overflow: 'hidden' }}>
// //                       <VendorSelect
// //                         vendors={vendors}
// //                         value={item.vendor_id}
// //                         onChange={(vendorId) => onAssignVendor(item.id, vendorId)}
// //                       />
// //                     </TableCell>
// //                     <TableCell padding="checkbox">
// //                       <IconButton size="small" onClick={() => onDeleteItem(item.id)}>
// //                         <CloseIcon fontSize="small" />
// //                       </IconButton>
// //                     </TableCell>
// //                   </TableRow>
// //                 );
// //               })}

// //               {filteredItems.length === 0 && (
// //                 <TableRow>
// //                   <TableCell colSpan={8}>
// //                     <Box py={6} textAlign="center">
// //                       <Typography color="text.secondary">No items match your search.</Typography>
// //                     </Box>
// //                   </TableCell>
// //                 </TableRow>
// //               )}
// //             </TableBody>
// //           </Table>

// //           <Box p={2} borderTop="1px solid" borderColor="divider">
// //             <Button variant="outlined" onClick={onAddItem}>+ Add Item</Button>
// //           </Box>
// //         </TableContainer>
// //       )}
// //     </Paper>
// //   );
// // }
// import { useMemo, useState } from 'react';
// import {
//   Box, Checkbox, IconButton, InputAdornment, Paper, Stack, Table,
//   TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
//   Typography, Button, MenuItem, useMediaQuery, useTheme,
// } from '@mui/material';
// import { SearchIcon, FilterIcon, RefreshIcon, CloseIcon } from '../../../shared/components/icons';
// import { VendorSelect } from './VendorSelect';
// import { ItemSelect } from './ItemSelect';
// import { useItemCatalog, type ItemCatalogEntry } from '../hooks/useItemCatalog';
// import type { Item, Vendor } from '../../../shared/types/domain';

// const BASE_UNIT_OPTIONS = ['Kg', 'Units', 'Nos', 'g', 'L', 'Boxes', 'PKT', 'Dozen', 'Bunch'];

// function unitOptionsFor(currentUnit: string) {
//   return currentUnit && !BASE_UNIT_OPTIONS.includes(currentUnit)
//     ? [currentUnit, ...BASE_UNIT_OPTIONS]
//     : BASE_UNIT_OPTIONS;
// }

// function isBulkItem(entry: ItemCatalogEntry) {
//   const name = entry.item_name?.toLowerCase() ?? '';
//   const looksInactive = name.startsWith('inactive-') || entry.active === false;
//   return !looksInactive && name.includes('bulk');
// }

// interface Props {
//   items: Item[];
//   vendors: Vendor[];
//   selectedIds: Set<string>;
//   onToggleSelect: (itemId: string) => void;
//   onToggleSelectAll: (checked: boolean) => void;
//   onAssignVendor: (itemId: string, vendorId: string | null) => void;
//   onRenameItem: (itemId: string, picked: ItemCatalogEntry | null) => void;
//   onUpdateQty: (itemId: string, qty: number | null) => void;
//   onUpdateUnit: (itemId: string, unit: string) => void;
//   onUpdateRate: (itemId: string, rate: number | null) => void;
//   onAddItem: () => void;
//   onDeleteItem: (itemId: string) => void;
//   onRefresh: () => void;
// }

// export function ItemsTable({
//   items, vendors, selectedIds, onToggleSelect, onToggleSelectAll,
//   onAssignVendor, onRenameItem, onUpdateQty, onUpdateUnit, onUpdateRate,
//   onAddItem, onDeleteItem, onRefresh,
// }: Props) {
//   const [search, setSearch] = useState('');
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { data: rawCatalog = [], isLoading: catalogLoading } = useItemCatalog();

//   const catalog = useMemo(() => rawCatalog.filter(isBulkItem), [rawCatalog]);

//   const filteredItems = useMemo(() => {
//     if (!search.trim()) return items;
//     const q = search.toLowerCase();
//     return items.filter((item: Item) => item.item_name.toLowerCase().includes(q));
//   }, [items, search]);

//   const allChecked = filteredItems.length > 0 && filteredItems.every((i: Item) => selectedIds.has(i.id));

//   const rowTotal = (item: Item) =>
//     item.required_qty && item.rate ? (item.required_qty * item.rate).toFixed(2) : '—';

//   return (
//     <Paper>
//       <Stack
//         direction={{ xs: 'column', sm: 'row' }}
//         justifyContent="space-between"
//         alignItems={{ xs: 'stretch', sm: 'center' }}
//         spacing={1.5}
//         px={{ xs: 2, sm: 3 }}
//         py={2.5}
//         borderBottom="1px solid"
//         borderColor="divider"
//       >
//         <Typography variant="subtitle1" fontWeight={700}>Items to Purchase</Typography>

//         <Stack direction="row" spacing={1.5}>
//           <TextField
//             size="small"
//             fullWidth
//             placeholder="Search items..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon fontSize="small" />
//                 </InputAdornment>
//               ),
//             }}
//             sx={{ minWidth: { xs: 0, sm: 220 } }}
//           />
//           {!isMobile && (
//             <Button variant="outlined" startIcon={<FilterIcon />} color="inherit">
//               Filter
//             </Button>
//           )}
//           <IconButton onClick={onRefresh} sx={{ border: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
//             <RefreshIcon fontSize="small" />
//           </IconButton>
//         </Stack>
//       </Stack>

//       {isMobile ? (
//         <Stack divider={<Box borderBottom="1px solid" borderColor="divider" />}>
//           {filteredItems.map((item: Item) => {
//             const isSelected = selectedIds.has(item.id);
//             return (
//               <Box key={item.id} p={2} bgcolor={isSelected ? 'primary.light' : undefined}>
//                 <Stack direction="row" alignItems="flex-start" spacing={1}>
//                   <Checkbox
//                     checked={isSelected}
//                     onChange={() => onToggleSelect(item.id)}
//                     color="success"
//                     sx={{ mt: -1 }}
//                   />
//                   <Box flexGrow={1} minWidth={0}>
//                     <Box mb={1}>
//                       <ItemSelect
//                         catalog={catalog}
//                         value={item.item_name}
//                         loading={catalogLoading}
//                         onChange={(picked) => onRenameItem(item.id, picked)}
//                       />
//                     </Box>
//                     {/*
//                       FIX: flex:1 + minWidth:0 let fields shrink smaller
//                       than their "Qty"/"Unit"/"Rate" labels actually need,
//                       clipping the label text. Each field now keeps a
//                       sensible minWidth (90px) and the row is allowed to
//                       wrap onto a second line on very narrow screens
//                       instead of squashing labels illegibly — still no
//                       leftover blank space, since useFlexGap keeps the
//                       spacing tight either way.
//                     */}
//                     <Stack direction="row" spacing={1} mb={1} flexWrap="wrap" useFlexGap>
//                       <TextField
//                         size="small"
//                         type="number"
//                         label="Qty"
//                         placeholder="Enter qty"
//                         value={item.required_qty ?? ''}
//                         onChange={(e) => {
//                           const raw = e.target.value;
//                           onUpdateQty(item.id, raw === '' ? null : Number(raw));
//                         }}
//                         sx={{ flex: '1 1 90px', minWidth: 90 }}
//                       />
//                       <TextField
//                         size="small"
//                         select
//                         label="Unit"
//                         value={item.unit}
//                         onChange={(e) => onUpdateUnit(item.id, e.target.value)}
//                         sx={{ flex: '1 1 90px', minWidth: 90 }}
//                       >
//                         {unitOptionsFor(item.unit).map((u) => (
//                           <MenuItem key={u} value={u}>{u}</MenuItem>
//                         ))}
//                       </TextField>
//                       <TextField
//                         size="small"
//                         type="number"
//                         label="Rate"
//                         placeholder="Rate"
//                         value={item.rate ?? ''}
//                         onChange={(e) => {
//                           const raw = e.target.value;
//                           onUpdateRate(item.id, raw === '' ? null : Number(raw));
//                         }}
//                         sx={{ flex: '1 1 90px', minWidth: 90 }}
//                       />
//                     </Stack>
//                     <Typography variant="caption" color="text.secondary" display="block" mb={1}>
//                       Total: {rowTotal(item)}
//                     </Typography>
//                     <VendorSelect
//                       vendors={vendors}
//                       value={item.vendor_id}
//                       onChange={(vendorId) => onAssignVendor(item.id, vendorId)}
//                     />
//                   </Box>
//                   <IconButton size="small" onClick={() => onDeleteItem(item.id)} sx={{ mt: -1 }}>
//                     <CloseIcon fontSize="small" />
//                   </IconButton>
//                 </Stack>
//               </Box>
//             );
//           })}

//           {filteredItems.length === 0 && (
//             <Box py={6} textAlign="center">
//               <Typography color="text.secondary">No items match your search.</Typography>
//             </Box>
//           )}

//           <Box p={2}>
//             <Button fullWidth variant="outlined" onClick={onAddItem}>+ Add Item</Button>
//           </Box>
//         </Stack>
//       ) : (
//         <TableContainer>
//           <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
//             <TableHead>
//               <TableRow>
//                 <TableCell padding="checkbox" sx={{ width: '4%' }}>
//                   <Checkbox checked={allChecked} onChange={(e) => onToggleSelectAll(e.target.checked)} />
//                 </TableCell>
//                 <TableCell sx={{ width: '26%' }}>Item Name</TableCell>
//                 <TableCell sx={{ width: '10%' }}>Required</TableCell>
//                 <TableCell sx={{ width: '10%' }}>Unit</TableCell>
//                 <TableCell sx={{ width: '10%' }}>Rate</TableCell>
//                 <TableCell sx={{ width: '10%' }} align="right">Total</TableCell>
//                 <TableCell sx={{ width: '26%' }}>Vendor</TableCell>
//                 <TableCell padding="checkbox" sx={{ width: '4%' }} />
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredItems.map((item: Item) => {
//                 const isSelected = selectedIds.has(item.id);
//                 return (
//                   <TableRow key={item.id} sx={{ bgcolor: isSelected ? 'primary.light' : undefined, '&:last-child td': { border: 0 } }}>
//                     <TableCell padding="checkbox">
//                       <Checkbox checked={isSelected} onChange={() => onToggleSelect(item.id)} color="success" />
//                     </TableCell>
//                     <TableCell sx={{ overflow: 'hidden' }}>
//                       <ItemSelect
//                         catalog={catalog}
//                         value={item.item_name}
//                         loading={catalogLoading}
//                         onChange={(picked) => onRenameItem(item.id, picked)}
//                       />
//                     </TableCell>
//                     <TableCell sx={{ overflow: 'hidden' }}>
//                       <TextField
//                         size="small"
//                         fullWidth
//                         type="number"
//                         placeholder="Enter qty"
//                         value={item.required_qty ?? ''}
//                         onChange={(e) => {
//                           const raw = e.target.value;
//                           onUpdateQty(item.id, raw === '' ? null : Number(raw));
//                         }}
//                         inputProps={{ step: 0.01, min: 0 }}
//                       />
//                     </TableCell>
//                     <TableCell sx={{ overflow: 'hidden' }}>
//                       <TextField
//                         size="small"
//                         select
//                         fullWidth
//                         value={item.unit}
//                         onChange={(e) => onUpdateUnit(item.id, e.target.value)}
//                       >
//                         {unitOptionsFor(item.unit).map((u) => (
//                           <MenuItem key={u} value={u}>{u}</MenuItem>
//                         ))}
//                       </TextField>
//                     </TableCell>
//                     <TableCell sx={{ overflow: 'hidden' }}>
//                       <TextField
//                         size="small"
//                         fullWidth
//                         type="number"
//                         placeholder="Rate"
//                         value={item.rate ?? ''}
//                         onChange={(e) => {
//                           const raw = e.target.value;
//                           onUpdateRate(item.id, raw === '' ? null : Number(raw));
//                         }}
//                         inputProps={{ step: 0.01, min: 0 }}
//                       />
//                     </TableCell>
//                     <TableCell align="right" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                       {rowTotal(item)}
//                     </TableCell>
//                     <TableCell sx={{ overflow: 'hidden' }}>
//                       <VendorSelect
//                         vendors={vendors}
//                         value={item.vendor_id}
//                         onChange={(vendorId) => onAssignVendor(item.id, vendorId)}
//                       />
//                     </TableCell>
//                     <TableCell padding="checkbox">
//                       <IconButton size="small" onClick={() => onDeleteItem(item.id)}>
//                         <CloseIcon fontSize="small" />
//                       </IconButton>
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}

//               {filteredItems.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={8}>
//                     <Box py={6} textAlign="center">
//                       <Typography color="text.secondary">No items match your search.</Typography>
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>

//           <Box p={2} borderTop="1px solid" borderColor="divider">
//             <Button variant="outlined" onClick={onAddItem}>+ Add Item</Button>
//           </Box>
//         </TableContainer>
//       )}
//     </Paper>
//   );
// }
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Checkbox, IconButton, InputAdornment, Paper, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
  Typography, Button, MenuItem, useMediaQuery, useTheme,
} from '@mui/material';
import { SearchIcon, FilterIcon, RefreshIcon, CloseIcon } from '../../../shared/components/icons';
import { VendorSelect } from './VendorSelect';
import { ItemSelect } from './ItemSelect';
import { isEligibleCatalogItem, useItemCatalog, type ItemCatalogEntry } from '../hooks/useItemCatalog';
import type { Item, Vendor } from '../../../shared/types/domain';

const BASE_UNIT_OPTIONS = ['Kg', 'Units', 'Nos', 'g', 'L', 'Boxes', 'PKT', 'Dozen', 'Bunch'];

function unitOptionsFor(currentUnit: string) {
  return currentUnit && !BASE_UNIT_OPTIONS.includes(currentUnit)
    ? [currentUnit, ...BASE_UNIT_OPTIONS]
    : BASE_UNIT_OPTIONS;
}

// Typing into Qty/Rate used to call the save mutation on every keystroke,
// and every save invalidates the items query (a full refetch). Typing
// "100" fired 3 saves + 3 refetches. This wrapper keeps what you type in
// local state and only calls onCommit 600ms after you stop typing, or
// immediately when the field loses focus — so there is exactly one save
// per edit, not one per character.
function useDebouncedNumberField(
  externalValue: number | null,
  onCommit: (value: number | null) => void,
  delay = 600
) {
  const [localValue, setLocalValue] = useState<string>(
    externalValue === null || externalValue === undefined ? '' : String(externalValue)
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCommittedRef = useRef<number | null>(externalValue);

  // Keep local state in sync when the value changes from outside
  // (e.g. after a real refetch), but not while the user is mid-edit.
  useEffect(() => {
    if (timerRef.current) return; // a commit is pending, don't override typing
    setLocalValue(externalValue === null || externalValue === undefined ? '' : String(externalValue));
    lastCommittedRef.current = externalValue;
  }, [externalValue]);

  function commitNow(raw: string) {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const next = raw === '' ? null : Number(raw);
    if (next === lastCommittedRef.current) return;
    lastCommittedRef.current = next;
    onCommit(next);
  }

  function handleChange(raw: string) {
    setLocalValue(raw);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      commitNow(raw);
    }, delay);
  }

  function handleBlur() {
    commitNow(localValue);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { localValue, handleChange, handleBlur };
}

interface DebouncedNumberFieldProps {
  size?: 'small' | 'medium';
  label?: string;
  placeholder?: string;
  fullWidth?: boolean;
  value: number | null;
  onCommit: (value: number | null) => void;
  sx?: any;
  inputProps?: any;
}

function DebouncedNumberField({
  size = 'small', label, placeholder, fullWidth, value, onCommit, sx, inputProps,
}: DebouncedNumberFieldProps) {
  const { localValue, handleChange, handleBlur } = useDebouncedNumberField(value, onCommit);

  return (
    <TextField
      size={size}
      type="number"
      label={label}
      placeholder={placeholder}
      fullWidth={fullWidth}
      value={localValue}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      sx={sx}
      inputProps={inputProps}
    />
  );
}

interface Props {
  items: Item[];
  vendors: Vendor[];
  selectedIds: Set<string>;
  onToggleSelect: (itemId: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onAssignVendor: (itemId: string, vendorId: string | null) => void;
  onRenameItem: (itemId: string, picked: ItemCatalogEntry | null) => void;
  onUpdateQty: (itemId: string, qty: number | null) => void;
  onUpdateUnit: (itemId: string, unit: string) => void;
  onUpdateRate: (itemId: string, rate: number | null) => void;
  onAddItem: () => void;
  onDeleteItem: (itemId: string) => void;
  onRefresh: () => void;
}

export function ItemsTable({
  items, vendors, selectedIds, onToggleSelect, onToggleSelectAll,
  onAssignVendor, onRenameItem, onUpdateQty, onUpdateUnit, onUpdateRate,
  onAddItem, onDeleteItem, onRefresh,
}: Props) {
  const [search, setSearch] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: rawCatalog = [], isLoading: catalogLoading } = useItemCatalog();

  const catalog = useMemo(
    () => rawCatalog.filter((item) =>
      !item.item_name.toLowerCase().startsWith('inactive-') &&
      isEligibleCatalogItem(item)
    ),
    [rawCatalog]
  );

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item: Item) => item.item_name.toLowerCase().includes(q));
  }, [items, search]);

  const allChecked = filteredItems.length > 0 && filteredItems.every((i: Item) => selectedIds.has(i.id));

  const rowTotal = (item: Item) =>
    item.required_qty && item.rate ? (item.required_qty * item.rate).toFixed(2) : '—';

  return (
    <Paper>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.5}
        px={{ xs: 2, sm: 3 }}
        py={2.5}
        borderBottom="1px solid"
        borderColor="divider"
      >
        <Typography variant="subtitle1" fontWeight={700}>Items to Purchase</Typography>

        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: 0, sm: 220 } }}
          />
          {!isMobile && (
            <Button variant="outlined" startIcon={<FilterIcon />} color="inherit">
              Filter
            </Button>
          )}
          <IconButton onClick={onRefresh} sx={{ border: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {isMobile ? (
        <Stack divider={<Box borderBottom="1px solid" borderColor="divider" />}>
          {filteredItems.map((item: Item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <Box key={item.id} p={2} bgcolor={isSelected ? 'primary.light' : undefined}>
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onToggleSelect(item.id)}
                    color="success"
                    sx={{ mt: -1 }}
                  />
                  <Box flexGrow={1} minWidth={0}>
                    <Box mb={1}>
                      <ItemSelect
                        catalog={catalog}
                        value={item.item_name}
                        loading={catalogLoading}
                        onChange={(picked) => onRenameItem(item.id, picked)}
                      />
                    </Box>
                    <Stack direction="row" spacing={1} mb={1} flexWrap="wrap" useFlexGap>
                      <DebouncedNumberField
                        size="small"
                        label="Qty"
                        placeholder="Enter qty"
                        value={item.required_qty ?? null}
                        onCommit={(v) => onUpdateQty(item.id, v)}
                        sx={{ flex: '1 1 90px', minWidth: 90 }}
                      />
                      <TextField
                        size="small"
                        select
                        label="Unit"
                        value={item.unit}
                        onChange={(e) => onUpdateUnit(item.id, e.target.value)}
                        sx={{ flex: '1 1 90px', minWidth: 90 }}
                      >
                        {unitOptionsFor(item.unit).map((u) => (
                          <MenuItem key={u} value={u}>{u}</MenuItem>
                        ))}
                      </TextField>
                      <DebouncedNumberField
                        size="small"
                        label="Rate"
                        placeholder="Rate"
                        value={item.rate ?? null}
                        onCommit={(v) => onUpdateRate(item.id, v)}
                        sx={{ flex: '1 1 90px', minWidth: 90 }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                      Total: {rowTotal(item)}
                    </Typography>
                    <VendorSelect
                      vendors={vendors}
                      value={item.vendor_id}
                      onChange={(vendorId) => onAssignVendor(item.id, vendorId)}
                    />
                  </Box>
                  <IconButton size="small" onClick={() => onDeleteItem(item.id)} sx={{ mt: -1 }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            );
          })}

          {filteredItems.length === 0 && (
            <Box py={6} textAlign="center">
              <Typography color="text.secondary">No items match your search.</Typography>
            </Box>
          )}

          <Box p={2}>
            <Button fullWidth variant="outlined" onClick={onAddItem}>+ Add Item</Button>
          </Box>
        </Stack>
      ) : (
        <TableContainer>
          <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ width: '4%' }}>
                  <Checkbox checked={allChecked} onChange={(e) => onToggleSelectAll(e.target.checked)} />
                </TableCell>
                <TableCell sx={{ width: '26%' }}>Item Name</TableCell>
                <TableCell sx={{ width: '10%' }}>Required</TableCell>
                <TableCell sx={{ width: '10%' }}>Unit</TableCell>
                <TableCell sx={{ width: '10%' }}>Rate</TableCell>
                <TableCell sx={{ width: '10%' }} align="right">Total</TableCell>
                <TableCell sx={{ width: '26%' }}>Vendor</TableCell>
                <TableCell padding="checkbox" sx={{ width: '4%' }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item: Item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <TableRow key={item.id} sx={{ bgcolor: isSelected ? 'primary.light' : undefined, '&:last-child td': { border: 0 } }}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={isSelected} onChange={() => onToggleSelect(item.id)} color="success" />
                    </TableCell>
                    <TableCell sx={{ overflow: 'hidden' }}>
                      <ItemSelect
                        catalog={catalog}
                        value={item.item_name}
                        loading={catalogLoading}
                        onChange={(picked) => onRenameItem(item.id, picked)}
                      />
                    </TableCell>
                    <TableCell sx={{ overflow: 'hidden' }}>
                      <DebouncedNumberField
                        size="small"
                        fullWidth
                        placeholder="Enter qty"
                        value={item.required_qty ?? null}
                        onCommit={(v) => onUpdateQty(item.id, v)}
                        inputProps={{ step: 0.01, min: 0 }}
                      />
                    </TableCell>
                    <TableCell sx={{ overflow: 'hidden' }}>
                      <TextField
                        size="small"
                        select
                        fullWidth
                        value={item.unit}
                        onChange={(e) => onUpdateUnit(item.id, e.target.value)}
                      >
                        {unitOptionsFor(item.unit).map((u) => (
                          <MenuItem key={u} value={u}>{u}</MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ overflow: 'hidden' }}>
                      <DebouncedNumberField
                        size="small"
                        fullWidth
                        placeholder="Rate"
                        value={item.rate ?? null}
                        onCommit={(v) => onUpdateRate(item.id, v)}
                        inputProps={{ step: 0.01, min: 0 }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rowTotal(item)}
                    </TableCell>
                    <TableCell sx={{ overflow: 'hidden' }}>
                      <VendorSelect
                        vendors={vendors}
                        value={item.vendor_id}
                        onChange={(vendorId) => onAssignVendor(item.id, vendorId)}
                      />
                    </TableCell>
                    <TableCell padding="checkbox">
                      <IconButton size="small" onClick={() => onDeleteItem(item.id)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box py={6} textAlign="center">
                      <Typography color="text.secondary">No items match your search.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Box p={2} borderTop="1px solid" borderColor="divider">
            <Button variant="outlined" onClick={onAddItem}>+ Add Item</Button>
          </Box>
        </TableContainer>
      )}
    </Paper>
  );
}