import { Box, Button, Stack, Typography, CircularProgress } from '@mui/material';
import { RocketIcon } from '../../../shared/components/icons';

interface Props {
  totalItems: number;
  assignedCount: number;
  pendingCount: number;
  onSaveDraft: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function PurchasePlanningFooter({
  totalItems, assignedCount, pendingCount, onSaveDraft, onGenerate, isGenerating,
}: Props) {
  return (
    <Box
      position="sticky"
      bottom={0}
      bgcolor="background.paper"
      borderTop="1px solid"
      borderColor="divider"
      px={{ xs: 2, md: 4 }}
      py={2}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack direction="row" spacing={3} justifyContent={{ xs: 'space-between', sm: 'flex-start' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL</Typography>
            <Typography variant="body1" fontWeight={800}>{totalItems}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="success.main" fontWeight={700}>ASSIGNED</Typography>
            <Typography variant="body1" fontWeight={800} color="success.main">{assignedCount}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>PENDING</Typography>
            <Typography variant="body1" fontWeight={800}>{pendingCount}</Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onSaveDraft}
            fullWidth
            sx={{ whiteSpace: 'nowrap' }}
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={isGenerating ? <CircularProgress size={16} color="inherit" /> : <RocketIcon />}
            onClick={onGenerate}
            disabled={isGenerating || pendingCount === totalItems}
            sx={{ whiteSpace: 'nowrap', minWidth: 150 }}
          >
            {isGenerating ? 'Generating...' : 'Generate POs'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}