// 4-point spacing scale
export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const shadow = {
  card: {
    shadowColor: '#0E2A23',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
} as const;

// Animation durations in milliseconds
export const motion = { fast: 150, base: 250, slow: 350 } as const;
