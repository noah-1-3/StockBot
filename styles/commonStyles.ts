
export const colors = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0051D5',
  
  // Background colors
  background: '#000000',
  cardBackground: '#1C1C1E',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  
  // Status colors
  success: '#34C759',
  successBackground: '#1C3A28',
  error: '#FF3B30',
  errorBackground: '#3A1C1C',
  warning: '#FF9500',
  
  // Border colors
  border: '#38383A',
  
  // Chart colors
  chartLine: '#007AFF',
  chartGrid: '#38383A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    color: colors.text,
  },
  caption: {
    fontSize: 14,
    color: colors.textSecondary,
  },
};
