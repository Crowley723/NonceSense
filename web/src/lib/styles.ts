/**
 * Shared style constants for consistent theming across the application.
 * Uses Tailwind theme variables instead of hardcoded colors for dark mode support.
 */

// Layout
export const CONTAINER = "max-w-2xl mx-auto p-6";
export const CARD = "bg-card text-card-foreground rounded-lg shadow-md p-6";
export const SECTION_SPACING = "space-y-6";

// Typography
export const HEADING_LARGE = "text-3xl font-bold text-foreground";
export const HEADING_MEDIUM = "text-xl font-semibold text-foreground";
export const TEXT_SMALL = "text-sm text-muted-foreground";
export const TEXT_MONO = "font-mono text-sm";

// Form Elements
export const INPUT_BASE = "w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent";
export const INPUT_MONO = `${INPUT_BASE} font-mono text-sm`;
export const LABEL = "block text-sm font-medium text-foreground mb-2";

// Buttons
export const BUTTON_BASE = "w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
export const BUTTON_PRIMARY = `${BUTTON_BASE} bg-primary text-primary-foreground hover:bg-primary/90`;
export const BUTTON_DESTRUCTIVE = `${BUTTON_BASE} bg-destructive text-primary-foreground hover:bg-destructive/90`;
export const BUTTON_SUCCESS = `${BUTTON_BASE} bg-accent text-accent-foreground hover:bg-accent/90`;

// Alert/Info Boxes
export const ALERT_INFO = "bg-accent/30 border border-accent/50 rounded-lg p-4 text-foreground";
export const ALERT_WARNING = "bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-foreground";
export const ALERT_SUCCESS = "bg-accent/30 border border-accent/50 rounded-lg p-4 text-foreground";

// Status Messages
export const MESSAGE_SUCCESS = "mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20";
export const MESSAGE_ERROR = "mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20";

// Certificate Status
export const CERT_VALID = "p-4 rounded-lg border-2 bg-accent/10 border-accent";
export const CERT_INVALID = "p-4 rounded-lg border-2 bg-destructive/10 border-destructive";
export const CERT_INFO_BOX = "bg-muted p-4 rounded-lg space-y-2 text-sm font-mono";

// File Upload
export const FILE_UPLOAD_AREA = "border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-accent transition-colors cursor-pointer";

// Loading Spinner
export const SPINNER = "w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin";

// Icons
export const ICON_SMALL = "w-5 h-5";
export const ICON_MEDIUM = "w-8 h-8";
export const ICON_LARGE = "w-12 h-12";

// Colors for specific contexts (using theme variables)
export const ICON_PRIMARY = "text-primary";
export const ICON_SUCCESS = "text-accent";
export const ICON_DESTRUCTIVE = "text-destructive";
export const ICON_MUTED = "text-muted-foreground";
