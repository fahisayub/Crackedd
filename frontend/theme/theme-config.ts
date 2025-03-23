// Define our theme configuration
type CustomThemeConfig = {
    primary?: string;
    secondary?: string;
    radius?: "xs" | "sm" | "md" | "lg" | "xl";
    hint?: "border" | "shadow";
    glow?: "none" | "subtle" | "normal" | "strong";
};

export const themeConfig: CustomThemeConfig = {
    primary: "#7C3AED", // Purple (Violet-600)
    secondary: "#14B8A6", // Teal-500 - complementary to purple
    radius: "md", // Border radius - options: xs, sm, md, lg, xl
    hint: "border", // Focus hint - options: border, shadow
    glow: "subtle", // Glow effect - options: none, subtle, normal, strong
}; 