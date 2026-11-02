# 6. Enquiries

← [Back to the guide index](README.md)

Messages sent through the website's **Book Now** form (Events page) and **Contact** form arrive in **Site → Enquiries**. Check it every day.

## What customers send

The form asks for **Name**, **Phone number**, **Email** (optional) and **Message**. Every message is:

1. **Saved** in the Enquiries list — always.
2. **Emailed** to the inboxes the developer set up (if email sending is configured — see the Dashboard's "Enquiry emails (Gmail)" light). Changing who receives these emails is a developer task.
3. If the customer typed an email address, they also get an automatic "We received your enquiry" email. When you reply from your inbox, the reply goes to their address.

If a customer says they sent a message and you cannot find it, see [Troubleshooting](09-troubleshooting.md#a-customer-says-they-sent-an-enquiry-but-i-cant-find-it).

## Reading enquiries

Newest first. Each card shows:

- the **name**,
- the **phone number** (tap to call on a phone),
- the **email** (tap to write to them), if given,
- **date and time** in Kathmandu time, and **which page** they used (e.g. `events`, `contact`),
- the **message**.

The list refreshes by itself every 15 seconds and whenever you come back to the tab, so you can leave it open at reception. The **Refresh** button forces an update.

## Tracking status

Each enquiry has a status drop-down (top right of the card):

| Status | Use it when |
| --- | --- |
| **New** (yellow) | Nobody has answered yet |
| **Contacted** (blue) | You have called or replied |
| **Closed** (grey) | It's done: booked, answered, or not relevant |

The filter at the top left shows only one status — for example **New** to see what needs a reply. The number of **new** enquiries also appears on the Dashboard.

Changing the status saves immediately. It's your team's shared to-do list: agree who updates it.

## Deleting

The bin icon deletes one enquiry **permanently** (after a confirmation). Normally mark it **Closed** instead — you may need the record later.

## Exporting to a spreadsheet

Press **Export CSV**. The system:

1. creates a file of **all** enquiries with the columns *Date, Name, Phone, Email, Message, Page, Status*,
2. stores a copy in the private `data` storage (folder `exports/`, named with the date and time), and
3. opens a download link in a new tab. The link works for **1 hour**; press Export CSV again for a fresh one.

Open the file in Excel or Google Sheets. If your browser blocks the new tab, allow pop-ups for the admin site.

## Backing up your content

Press **Backup all content** to save a snapshot of the site's text and settings.

- It is saved as `backups/content-<date-time>.json` in the private `data` storage, and a download link opens (valid for 1 hour).
- **Included:** site settings, all pages, and every list (attractions, categories, offers, Powerplay, events, event types, gallery albums and photos, reviews, FAQs, policies) plus the media library records.
- **Not included:** the photo/video files themselves, enquiries (use *Export CSV*), and user accounts.

Take a backup **before big changes** (re-doing the offers, deleting many items) and about **once a month**. Keep the downloaded file somewhere safe, e.g. Google Drive. Restoring a backup is a developer task.

## Privacy

Enquiries contain customers' phone numbers and emails. Only share them with colleagues who need them, don't paste them into public chats, and delete old enquiries you no longer need.
