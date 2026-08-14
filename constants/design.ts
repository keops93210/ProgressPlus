import Colors from "@/constants/colors";

/**
 * Progress+ visual system.
 *
 * Keep shared visual decisions here so screens stop inventing their own
 * spacing, radii, typography and elevation values.
 */
const Design = {
  colors: Colors,

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    section: 28,
    page: 20,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 999,
  },

  typography: {
    display: { fontSize: 32, lineHeight: 38, fontWeight: "900" as const },
    h1: { fontSize: 26, lineHeight: 32, fontWeight: "900" as const },
    h2: { fontSize: 20, lineHeight: 25, fontWeight: "900" as const },
    h3: { fontSize: 16, lineHeight: 21, fontWeight: "800" as const },
    body: { fontSize: 14, lineHeight: 20, fontWeight: "500" as const },
    bodyStrong: { fontSize: 14, lineHeight: 20, fontWeight: "800" as const },
    caption: { fontSize: 11, lineHeight: 15, fontWeight: "600" as const },
    eyebrow: { fontSize: 9, lineHeight: 12, fontWeight: "900" as const, letterSpacing: 1.2 },
    metric: { fontSize: 28, lineHeight: 32, fontWeight: "900" as const },
    metricHero: { fontSize: 42, lineHeight: 46, fontWeight: "900" as const },
  },

  control: {
    buttonHeight: 50,
    compactHeight: 40,
    iconButton: 44,
    inputHeight: 48,
  },

  elevation: {
    card: {
      shadowColor: Colors.primary,
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    floating: {
      shadowColor: Colors.primary,
      shadowOpacity: 0.22,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
  },
} as const;

export default Design;
