import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

interface Step {
  key: string;
  label: string;
  icon: SvgIconComponent;
}

interface Props {
  steps: Step[];
  activeIndex: number;
}

export function WorkflowStepper({ steps, activeIndex }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        overflowX: isMobile ? 'auto' : 'visible',
        pb: isMobile ? 1 : 0,
        '&::-webkit-scrollbar': { height: 4 },
      }}
    >
      <Stack direction="row" alignItems="center" sx={{ minWidth: isMobile ? 'max-content' : 'auto' }}>
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          const color = isDone || isActive ? '#2563eb' : '#94a3b8';
          const bg = isDone || isActive ? '#DBEAFE' : '#F1F5F9';

          return (
            <Stack key={step.key} direction="row" alignItems="center" sx={{ flexShrink: 0 }}>
              <Stack alignItems="center" spacing={0.5} sx={{ width: isMobile ? 76 : 88 }}>
                <Box
                  sx={{
                    width: isMobile ? 34 : 40,
                    height: isMobile ? 34 : 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: bg,
                    color,
                    flexShrink: 0,
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Typography
                  variant="caption"
                  textAlign="center"
                  sx={{
                    color: isActive ? '#1e293b' : '#64748b',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: isMobile ? 10.5 : 12,
                    lineHeight: 1.2,
                  }}
                >
                  {step.label}
                </Typography>
              </Stack>
              {i < steps.length - 1 && (
                <Box
                  sx={{
                    width: isMobile ? 20 : 32,
                    height: 2,
                    bgcolor: '#CBD5E1',
                    mx: isMobile ? 0.5 : 1,
                    mb: isMobile ? 2 : 2.5,
                    flexShrink: 0,
                  }}
                />
              )}
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}