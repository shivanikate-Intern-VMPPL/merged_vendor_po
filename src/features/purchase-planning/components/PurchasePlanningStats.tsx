import { useState } from 'react';
import { Box, Stack, Typography, Collapse, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { ScaleIcon, StorefrontIcon, PendingIcon, ClipboardCheckIcon } from '../../../shared/components/icons';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { Item } from '../../../shared/types/domain';

interface Props {
  items: Item[];
}

interface StatDef {
  icon: typeof ScaleIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
}

export function PurchasePlanningStats({ items }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState(!isMobile);

  const totalItems = items.length;
  const totalWeight = items
    .filter((i) => i.unit.toLowerCase() === 'kg')
    .reduce((sum, i) => sum + (i.required_qty ?? 0), 0);
  const vendorCount = new Set(items.filter((i) => i.vendor_id).map((i) => i.vendor_id)).size;
  const pendingCount = items.filter((i) => !i.vendor_id).length;
  const isReady = pendingCount === 0 && totalItems > 0;

  const stats: StatDef[] = [
    { icon: ClipboardCheckIcon, iconBg: '#DCFCE7', iconColor: '#16A34A', label: 'Items Required', value: totalItems },
    { icon: ScaleIcon, iconBg: '#DCFCE7', iconColor: '#16A34A', label: 'Total Quantity', value: `${totalWeight.toFixed(2)} kg` },
    { icon: StorefrontIcon, iconBg: '#FEF3C7', iconColor: '#F59E0B', label: 'Vendors Assigned', value: vendorCount },
    { icon: PendingIcon, iconBg: '#F1F5F9', iconColor: '#64748B', label: 'Purchase Orders', value: isReady ? 'Ready' : 'Pending' },
  ];

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.25, cursor: isMobile ? 'pointer' : 'default' }}
        onClick={() => isMobile && setExpanded((e) => !e)}
      >
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            {totalItems} item{totalItems === 1 ? '' : 's'} · {vendorCount} vendor{vendorCount === 1 ? '' : 's'}
          </Typography>
          <Box
            sx={{
              px: 1, py: 0.25, borderRadius: 10, fontSize: 11, fontWeight: 700,
              bgcolor: isReady ? '#DCFCE7' : '#F1F5F9',
              color: isReady ? '#16A34A' : '#64748B',
            }}
          >
            {isReady ? 'Ready' : 'Pending'}
          </Box>
        </Stack>
        {isMobile && (
          <IconButton size="small" sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <Collapse in={expanded}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 1,
            px: 2,
            pb: 2,
          }}
        >
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Stack key={s.label} direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: s.iconBg, color: s.iconColor,
                  }}
                >
                  <Icon sx={{ fontSize: 16 }} />
                </Box>
                <Box minWidth={0}>
                  <Typography variant="subtitle2" fontWeight={800} noWrap>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{s.label}</Typography>
                </Box>
              </Stack>
            );
          })}
        </Box>
      </Collapse>
    </Box>
  );
}