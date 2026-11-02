# 9. Troubleshooting & FAQ

← [Back to the guide index](README.md)

## My change isn't showing on the website

1. Did you press **Save changes**? Look for the green *Saved.* message. A yellow *Unsaved changes* label means you haven't.
2. Is the item **hidden**? In its list, a dimmed row with a crossed-out eye is hidden. Click the eye to show it.
3. Is it past its **end date**? Offers and upcoming events disappear automatically after their date (Kathmandu time). Edit the date.
4. Refresh the public page (**Ctrl + F5** on a computer; on a phone, close and reopen the tab). Your browser may be showing an old copy.
5. Did you edit the right place? Headings are in **Pages**; lists are in **Content**; contact details are in **Site settings**.

## "Supabase isn't connected yet, so changes can't be saved"

The database connection key is missing or wrong. Everything you see is a read-only copy. Tell the developer — see [Technical setup](10-technical-setup.md).

## "Please sign in again to make changes"

Your session ended, your account was disabled, or your password was changed on another device. Open `/admin`, sign in again, and re-do your last edit (copy long text first if you can).

## I can't sign in

See [Signing in → If sign-in does not work](01-getting-started.md#if-sign-in-does-not-work). Short version: check the email and password, wait 15 minutes if you got locked out, or ask an admin to **reset your password**.

If **every** admin is locked out or has forgotten their password, the developer can create a new admin from the server with `pnpm admin:create` (see [Technical setup](10-technical-setup.md)).

## I can't see "Users" in the menu

You're an **Editor**. Only **Admins** manage users. Ask an admin.

## Saving fails with a message

The message names the problem. The most common:

| Message | Fix |
| --- | --- |
| A required field is missing (marked with pink \*) | Fill it in — for example a **Title**, **Name** or **Cover photo** |
| Something about a database or network error | Check your internet and try again. If it persists, tell the developer |
| "The form data could not be read" | Reload the page and try again |

## A link I typed doesn't work (or vanished)

Links are checked when saved. Valid links start with `https://`, `http://`, `/` (a page on this site), `#`, `mailto:` or `tel:`. Anything else is removed. Re-enter it correctly and check it after saving.

## My photo upload failed

| Message | Fix |
| --- | --- |
| *Videos must be under 50 MB* | Compress the video, or upload it to YouTube and paste the link |
| *This file type isn't supported* / *unsupported file type* | Use JPG, PNG, WebP, GIF, SVG, MP4, WebM or PDF. Camera RAW files (`.CR2`) must be exported to JPG |
| *This video format can't be read by the browser* | Re-save the video as a standard H.264 **MP4** |
| *Could not process the image in this browser* | Try a different browser (Chrome or Edge) or a different copy of the photo |
| *Upload failed…* | Check your internet and try again |

Many files at once: if some fail, the others still upload; the error names the files that failed.

## A photo shows a gap or "None"

The file was deleted from the media library, or the field was never filled. Open the item/page, press **Choose photo** and pick another.

## The photo looks blurry or badly cropped

Use a larger original (at least about 1600 px wide for banners). Photos are cropped to fit their frame, so for hero banners choose landscape photos with the subject near the centre.

## A customer says they sent an enquiry but I can't find it

1. Open **Enquiries**, set the filter to **All**, and press **Refresh**.
2. Ask which name and phone number they used, and scan the list for them (the Enquiries list has no search box, only the status filter).
3. The form refuses messages that fail checks (invalid phone, message over 1,200 characters, or sending too fast). The customer would have seen an error.
4. After 5 messages in 10 minutes from one connection, the form asks people to call instead.
5. If the Dashboard's **Enquiry emails (Gmail)** light is yellow, emails aren't going out — but enquiries are still saved in the list.

## I deleted something by mistake

Deleted items and files can't be restored from the admin. Rebuilding is the only option unless you have a [backup](06-enquiries.md#backing-up-your-content) — the developer can restore from one. This is why it's worth taking a backup before big changes, and using **hide** instead of **delete**.

## Frequently asked questions

**Do I need to "publish"?** No. **Save changes** updates the live site.

**Can two people edit at once?** Yes, but if two people edit the *same* item or page, the last one to save overwrites the other. Agree who edits what.

**Can I preview before publishing?** There's no draft mode — a saved change is live at once. To prepare something in advance, create the item with **Show on website** switched off and switch it on when ready. A hidden item can't be viewed on the public site, so proofread it in the form first. (An offer's **Starts on** date does *not* hide it before that day — it only displays the dates.)

**How do I make a heading colourful?** Wrap words in `*asterisks*`. See [Getting started](01-getting-started.md#writing-in-boxes-tips-that-apply-everywhere).

**Why are my headings in capitals?** The brand design shows all headings in bold uppercase.

**Can I change the fonts, colours or layout?** Not from the admin; these are part of the design. Ask the developer.

**Can I add a brand-new page?** Not from the admin. The nine pages are fixed; ask the developer for new ones.

**Can I edit on my phone?** Yes. The admin works on phones: press ☰ for the menu.

**Is the admin secure?** Passwords are stored scrambled; wrong guesses lock the account for 15 minutes; sessions end after 7 days; and every save is re-checked on the server. Keep your password private, use a different one from your other accounts, and sign out on shared computers.

**What happens to the photos I delete from a list?** Nothing — only the library's **Delete** removes a file.

**Where is everything stored?** In Supabase (database + file storage). The website reads from there, so edits are instant and you never need to touch the site's code.

## Getting help

For anything this guide doesn't solve, contact the developer with:

- what you were doing (which page, which button),
- the exact message you saw (or a screenshot),
- the time it happened.
