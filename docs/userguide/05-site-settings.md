# 5. Site settings

← [Back to the guide index](README.md)

**Site → Site settings** holds the details that appear on *many* pages at once — in the header, the footer, the Contact page and Google. Change a phone number here once and it updates everywhere.

Press **Save changes** at the bottom when done.

## Brand

| Field | Notes |
| --- | --- |
| **Business name** \* | e.g. `OOPS! Nepal` |
| **Short name** | Used where space is tight |
| **Tagline** | |
| **Logo (for dark backgrounds)** \* | The logo shown in the dark header and footer (the white/colourful version) |
| **Logo (for light backgrounds)** | Optional dark version, for light areas |

## Announcement bar

A thin strip at the top of every page — ideal for a festival offer or a temporary closure.

| Field | Notes |
| --- | --- |
| **Show the announcement bar** | The on/off switch |
| **Hide automatically after** | Optional date. The bar disappears after this day (Kathmandu time) — you do not have to remember to turn it off |
| **Text** | Keep it short — one line |
| **Link** | Where it goes when clicked, e.g. `/prices-offers#other-offers`. If empty, it goes to the Prices & Offers page |

The bar only shows when it is switched on **and** has text.

## Contact

| Field | Notes |
| --- | --- |
| **Reception phone** | Shown in the header call button, footer, Contact page |
| **Management phone** | Also shown on the site, and quoted to customers ("please call us on…") if the enquiry form fails |
| **Email (general)** | Shown in the footer, Contact page and homepage |
| **Email (management)** | Shown on the Contact page and homepage |
| **WhatsApp number (optional)** | Saved, but not currently displayed on the website. To show WhatsApp, add it under **Social media** instead |

Type phone numbers the way you want them to look, e.g. `+977 9767356014`. They become tap-to-call links.

> **Which inbox receives enquiry emails?** Not these fields. Enquiry emails go to the addresses the developer set in the server's `ENQUIRY_TO_EMAIL` setting (see [Technical setup](10-technical-setup.md)). The management email above is only used as a backup if that setting is empty. To change who gets enquiry emails, ask the developer.

## Opening hours

| Field | Notes |
| --- | --- |
| **Hours** | What visitors read, e.g. `11 AM – 8 PM` |
| **Note** | e.g. `Open daily, including public holidays` |
| **Opens / Closes (24h, for Google)** | Machine-readable times such as `11:00` and `20:00`. Search engines use these — keep them in step with the line above |

When hours change (for example during festivals), update **both** the readable line and the 24-hour times.

## Address & map

| Field | Notes |
| --- | --- |
| **Street, City, Province, Postal code, Country** | Shown in the footer/Contact page and given to Google |
| **Google Maps link** | The "Open in Google Maps" link |
| **Google Maps embed URL** | For the map on the page: open Google Maps → **Share** → **Embed a map** → copy only the web address inside `src="…"` |

## Social media

A list. Press **Add social link**, then choose the **Platform** (Instagram, Facebook, TikTok, YouTube, Tripadvisor, X, WhatsApp), type the **Handle** (e.g. `@oopsinnepal`) and paste the full **Link**. Reorder with the arrows; remove with the bin. The icons appear in the header/footer automatically.

## Big numbers (stats)

The large counting-up numbers on the homepage (e.g. **25,000+** monthly footfall, **100,000+** customers).

Each entry has: **Number**, **After the number** (e.g. `+`) and **Label**. Type the number without commas.
Only put in figures you can stand behind — these are marketing claims customers will read.

## Main menu

The links in the top navigation bar. Each has a **Label** and **Link** (e.g. `Prices & Offers` → `/prices-offers`). Reorder with the arrows.

> If you remove a page from the menu, it still exists — it's just harder to find. If you add a link to a page that doesn't exist, visitors get a "not found" page, so double-check each link.

## Header button

| Field | Notes |
| --- | --- |
| **Book button** | The coloured **BOOK NOW** button: its text and where it goes (e.g. `/events`) |
| **Call button label** | Text on the call button |

## Footer

| Field | Notes |
| --- | --- |
| **Short description** | Short blurb under the logo |
| **Copyright line** | `{year}` is replaced by the current year automatically, so you never have to update it |
| **Footer links** | Label + Link pairs, e.g. Rules & Terms, FAQ |

## Search engines (SEO)

These are the **defaults** used on pages that don't have their own title/description (set per page in *Pages*).

| Field | Notes |
| --- | --- |
| **Website address** | e.g. `https://www.oopsnp.com` — used to build the sitemap and share links. Must be right, with `https://` |
| **Default page title** | |
| **Title template** | `%s` is replaced by the page title, e.g. `%s | OOPS! Nepal` |
| **Default description** | One or two sentences about OOPS! |
| **Share image** | Picture shown when any page is shared on Facebook/WhatsApp. Use a landscape image about 1200 × 630 |
| **Keywords** | A list of phrases people might search, e.g. `family entertainment centre Kathmandu` |

Good SEO habits: be specific ("Family Entertainment Centre in Dhumbarahi, Kathmandu"), avoid stuffing keywords, and keep your opening hours and phone number correct — Google shows them.
