import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { preconnect } from "react-dom";
import { isSupabaseConfigured, supabaseUrl } from "@/lib/env";
import { getMediaMap, getSettings } from "@/lib/data";
import { imageUrl, toImage } from "@/lib/media";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [settings, media] = await Promise.all([getSettings(), getMediaMap()]);
  const og = imageUrl(toImage(media, settings.seo.ogImage), 1600);
  return {
    metadataBase: new URL(settings.seo.siteUrl),
    title: { default: settings.seo.title, template: settings.seo.titleTemplate },
    description: settings.seo.description,
    keywords: settings.seo.keywords,
    applicationName: settings.brand.name,
    openGraph: {
      type: "website",
      siteName: settings.brand.name,
      locale: "en_US",
      images: og ? [{ url: og, width: 1600, height: 900, alt: settings.brand.name }] : undefined,
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#03050b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Media is served from Supabase Storage once connected: open that connection early.
  if (isSupabaseConfigured) preconnect(new URL(supabaseUrl).origin, { crossOrigin: "anonymous" });
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-dvh bg-space-950 font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
