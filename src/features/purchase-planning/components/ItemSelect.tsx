
// // import { Autocomplete, TextField, Box } from '@mui/material';
// // import type { ItemCatalogEntry } from '../hooks/useItemCatalog';

// // interface Props {
// //   catalog: ItemCatalogEntry[];
// //   value: string;
// //   onChange: (item: ItemCatalogEntry | null) => void;
// //   loading?: boolean;
// // }

// // export function ItemSelect({ catalog, value, onChange, loading }: Props) {
// //   const selected = catalog.find((c) => c.item_name === value) ?? null;

// //   return (
// //     <Autocomplete<ItemCatalogEntry>
// //       size="small"
// //       options={catalog}
// //       loading={loading}
// //       value={selected}
// //       getOptionLabel={(option) => option.item_name}
// //       isOptionEqualToValue={(option, val) => option.zoho_item_id === val.zoho_item_id}
// //       onChange={(_, newValue: ItemCatalogEntry | null) => {
// //         onChange(newValue);
// //       }}
// //       renderInput={(params) => <TextField {...params} placeholder="Select item" />}
// //       renderOption={(props, option) => (
// //         <Box component="li" {...props} key={option.zoho_item_id}>
// //           {option.item_name}
// //         </Box>
// //       )}
// //       sx={{ minWidth: 200 }}
// //     />
// //   );
// // }
// import { Autocomplete, TextField, Box } from '@mui/material';
// import type { ItemCatalogEntry } from '../hooks/useItemCatalog';

// interface Props {
//   catalog: ItemCatalogEntry[];
//   value: string;
//   onChange: (item: ItemCatalogEntry | null) => void;
//   loading?: boolean;
// }

// export function ItemSelect({ catalog, value, onChange, loading }: Props) {
//   const selected = catalog.find((c) => c.item_name === value) ?? null;

//   return (
//     <Autocomplete<ItemCatalogEntry>
//       size="small"
//       options={catalog}
//       loading={loading}
//       value={selected}
//       getOptionLabel={(option) => option.item_name}
//       isOptionEqualToValue={(option, val) => option.zoho_item_id === val.zoho_item_id}
//       onChange={(_, newValue: ItemCatalogEntry | null) => {
//         onChange(newValue);
//       }}
//       renderInput={(params) => <TextField {...params} placeholder="Select item" />}
//       renderOption={(props, option) => (
//         <Box component="li" {...props} key={option.zoho_item_id}>
//           {option.item_name}
//         </Box>
//       )}
//       sx={{ width: '100%' }}
//     />
//   );
// }
import { Autocomplete, TextField, Box } from '@mui/material';
import type { ItemCatalogEntry } from '../hooks/useItemCatalog';

interface Props {
  catalog: ItemCatalogEntry[];
  value: string;
  onChange: (item: ItemCatalogEntry | null) => void;
  loading?: boolean;
}

export function ItemSelect({ catalog, value, onChange, loading }: Props) {
  const selected = catalog.find((c) => c.item_name === value) ?? null;

  return (
    <Autocomplete<ItemCatalogEntry>
      size="small"
      options={catalog}
      loading={loading}
      value={selected}
      getOptionLabel={(option) => option.item_name}
      isOptionEqualToValue={(option, val) => option.zoho_item_id === val.zoho_item_id}
      onChange={(_, newValue: ItemCatalogEntry | null) => {
        onChange(newValue);
      }}
      renderInput={(params) => <TextField {...params} placeholder="Select item" />}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.zoho_item_id}>
          {option.item_name}
        </Box>
      )}
      sx={{ width: '100%' }}
    />
  );
}