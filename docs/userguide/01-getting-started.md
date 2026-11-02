# 1. Getting started

← [Back to the guide index](README.md)

## Signing in

1. Open your website address followed by `/admin`, for example `https://www.oopsnp.com/admin`.
2. Type your **email** and **password**, then press the sign-in button.
3. You land on the **Dashboard**.

Your sign-in lasts **7 days** on that browser. After that you sign in again. Use **Sign out** (bottom of the left menu) on any shared computer.

> **Where do I get my first password?** An admin creates your account at **Users**. They will send you a temporary password privately (see [Users and roles](07-users.md)).

### Your first sign-in: choose your own password

If you were given a temporary password, a yellow bar appears at the top of every page:

> *You're using a temporary password. Please choose your own.*

Click **choose your own** (or your name at the bottom of the left menu → **My account**) and fill in:

| Field | What to enter |
| --- | --- |
| Current password | the temporary one you were given |
| New password | at least **10 characters**, with **letters and numbers** |
| Repeat new password | the same again |

Press **Change password**. Good to know: changing your password signs you out of every *other* device. You stay signed in here.

### If sign-in does not work

| Message | What it means |
| --- | --- |
| *That email and password don't match* | Check for typos and Caps Lock. The message is deliberately the same whether the email or the password is wrong. |
| *Too many wrong passwords. Try again in N minutes* | After **5 wrong passwords** an account is locked for **15 minutes**. Wait, or ask an admin to reset your password. |
| *Too many attempts. Please wait a few minutes* | Too many tries from the same internet connection. Wait a few minutes. |
| *Sign-in isn't set up yet…* | A technical key is missing. Tell the developer — see [Technical setup](10-technical-setup.md). |

Disabled accounts cannot sign in. Ask an admin if you think yours was disabled by mistake.

## Finding your way around

### The left menu

On a computer the menu is always on the left. On a phone or small tablet, press **☰** at the top-left to open it.

| Menu group | Contains |
| --- | --- |
| **Overview** | **Dashboard** |
| **Pages** | Homepage, About, Attractions, Prices & Offers, Events, Gallery, Contact, FAQ, Rules & Terms |
| **Content** | Attractions, Categories, Offers, Powerplay table, Upcoming events, Event types, Gallery photos, Gallery albums, Reviews, FAQ, Rules & policies |
| **Site** | Site settings, Media library, Enquiries, and **Users** (admins only) |

The page you are on is highlighted. Your name and role show at the bottom of the menu — click them to open **My account**.

### The Dashboard

The Dashboard gives you a quick overview:

- **Content** — every list with the number of items in it. Click one to open it.
- **Setup** — three status lights:
  - 🟢 green = working
  - 🟡 yellow = needs setup

  They cover *Supabase database & buckets* (where content is stored), *Admin sign-in*, and *Enquiry emails (Gmail)*. If a light is yellow, tell the developer; the **Setup guide →** link lists what is missing.
- **Latest enquiries** — the 5 newest Book Now / Contact messages, with a yellow badge showing how many are still **new**.
- **View website ↗** (top right) opens the public site in a new tab.

## Roles: Admin and Editor

| | Editor | Admin |
| --- | :---: | :---: |
| Edit pages, content, site settings | ✅ | ✅ |
| Upload and delete media | ✅ | ✅ |
| Read and manage enquiries, export CSV, backup | ✅ | ✅ |
| See the **Users** page; add, disable, delete users; reset passwords | ❌ | ✅ |

Give most staff the **Editor** role. Keep **Admin** for the owner and one trusted backup person.

> Note: editors can also delete content and enquiries, so only give access to people you trust with that.

## How saving works

Every edit screen works the same way:

1. Change what you need.
2. Press **Save changes** (the button is always at the bottom of the screen).
3. A green confirmation appears — *Saved.* — and the public site is updated immediately.

Things to know:

- A yellow **Unsaved changes** label appears next to the button while you have edits that are not saved. If you try to close the tab, the browser warns you.
- Nothing is saved until you press **Save changes** — except for the quick actions in lists (show/hide, reorder, delete), which save at once.
- If a required field (marked with a pink **\***) is empty, saving stops and tells you which.
- **View on site ↗** (next to the save button on page editors) opens that page.
- There is no "undo". Download a [backup](06-enquiries.md#backing-up-your-content) before big changes.

### Writing in boxes: tips that apply everywhere

- **Colourful words.** In any title that supports it, wrap words in asterisks to give them the colourful gradient. Example: `Nepal's first *family entertainment* centre` shows "family entertainment" in colour. Use one pair of asterisks per highlight.
- **Links.** Anything that asks for a link accepts:
  - a full web address — `https://www.instagram.com/oopsinnepal`
  - a page on this site — `/attractions` or `/prices-offers#other-offers`
  - an email — `mailto:info@example.com`
  - a phone number — `tel:+9779767356014`

  A web address without `https://` (like `oopsnp.com/events`) is fixed for you. Anything else that is not recognised is **silently removed on save**, so check the link works afterwards.
- **Dates** use the date picker. The **×** next to the date clears it.
- **Lists** (like "What's included"): press **Add** to add a line, use the up/down arrows to reorder, and the bin to remove. Empty lines are dropped when you save.
- **Groups of fields** (called *repeaters*, e.g. social links or menu items): each entry can be collapsed by clicking its title, moved up/down, or removed.
- **Photos and videos.** Press **Choose photo** / **Choose video**, pick one from the library or upload a new one. See [Media library](04-media-library.md).
