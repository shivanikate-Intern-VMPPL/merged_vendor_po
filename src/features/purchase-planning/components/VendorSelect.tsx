import { memo } from 'react';
import { Autocomplete, TextField, Box, Typography, createFilterOptions } from '@mui/material';
import { CheckCircleIcon } from '../../../shared/components/icons';
import type { Vendor } from '../../../shared/types/domain';

interface Props {
  vendors: Vendor[];
  value: string | null;
  onChange: (vendorId: string | null) => void;
  loading?: boolean;
}

function vendorLabel(vendor: Vendor): string {
  const contact = vendor.mobile || vendor.phone;
  return contact ? `${vendor.name} — ${contact}` : vendor.name;
}

const filterVendorOptions = createFilterOptions<Vendor>({
  stringify: (option) => `${option.name} ${option.mobile ?? ''} ${option.phone ?? ''}`,
});

function VendorSelectComponent({ vendors, value, onChange, loading }: Props) {
  const selected = vendors.find((v) => v.id === value) ?? null;

  return (
    <Autocomplete<Vendor>
      size="small"
      options={vendors}
      loading={loading}
      value={selected}
      getOptionLabel={(option) => vendorLabel(option)}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      filterOptions={filterVendorOptions}
      onChange={(_, newValue: Vendor | null) => {
        onChange(newValue ? newValue.id : null);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Select Vendor"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderColor: selected ? 'primary.main' : undefined,
              fontWeight: selected ? 700 : 400,
            },
          }}
        />
      )}
      renderOption={(props, option) => {
        const contact = option.mobile || option.phone;
        return (
          <Box component="li" {...props} key={option.id}>
            <Box>
              <Typography variant="body2" fontWeight={600}>{option.name}</Typography>
              {contact && (
                <Typography variant="caption" color="text.secondary">
                  {contact}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
      popupIcon={selected ? <CheckCircleIcon color="success" fontSize="small" /> : undefined}
      sx={{ width: '100%' }}
    />
  );
}

export const VendorSelect = memo(VendorSelectComponent);