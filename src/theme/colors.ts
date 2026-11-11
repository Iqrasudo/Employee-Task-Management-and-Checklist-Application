// Amal colour palette — one place for every colour in the app.
export const colors = {
  pine900: '#0E2A23', // ink, dark headers
  pine700: '#2D4C43', // borders on dark backgrounds
  pine600: '#1E6B52', // primary
  pine100: '#E3EFEA', // primary tint
  saffron: '#F0B04A', // accent
  paper: '#F7F6F2', // page background
  surface: '#FFFFFF', // cards
  line: '#E4E2DA',
  lineStrong: '#D9D6CC',
  text: '#1A1F1D',
  muted: '#5E6662',
  onDark: '#FFFFFF',
  onDarkMuted: '#B9CCC4',
  danger: '#B42318',
  dangerBg: '#FDECEA',
  warning: '#8A5100',
  warningBg: '#FDF1DC',
  info: '#1D5FA8',
  infoBg: '#E6EFFA',
  review: '#5B3DA8',
  reviewBg: '#EFEAFB',
  neutral: '#3F4743',
  neutralBg: '#EEF0EF',
} as const;

export type StatusKey =
  | 'assigned'
  | 'inProgress'
  | 'pendingReview'
  | 'corrections'
  | 'approved'
  | 'rejected'
  | 'overdue';

export const statusColors: Record<StatusKey, { fg: string; bg: string; label: string }> = {
  assigned: { fg: colors.neutral, bg: colors.neutralBg, label: 'Assigned' },
  inProgress: { fg: colors.info, bg: colors.infoBg, label: 'In progress' },
  pendingReview: { fg: colors.review, bg: colors.reviewBg, label: 'Pending review' },
  corrections: { fg: colors.warning, bg: colors.warningBg, label: 'Corrections' },
  approved: { fg: colors.pine600, bg: colors.pine100, label: 'Approved' },
  rejected: { fg: colors.danger, bg: colors.dangerBg, label: 'Rejected' },
  overdue: { fg: colors.danger, bg: colors.surface, label: 'Overdue' },
};

export type PriorityKey = 'low' | 'medium' | 'high' | 'critical';

export const priorityColors: Record<PriorityKey, { color: string; bars: number; label: string }> = {
  low: { color: colors.muted, bars: 1, label: 'Low' },
  medium: { color: colors.info, bars: 2, label: 'Medium' },
  high: { color: '#B86E00', bars: 3, label: 'High' },
  critical: { color: colors.danger, bars: 4, label: 'Critical' },
};
