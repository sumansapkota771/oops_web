# 3. Managing content

← [Back to the guide index](README.md)

**Content** in the left menu holds the *lists* on the website. All eleven lists work the same way, so learn it once.

## How every list works

Open any list (for example **Content → Attractions**). You see one row per item, with a photo thumbnail where the list has photos.

| Control | What it does |
| --- | --- |
| **Search box** | Finds items by title (and subtitle). |
| **Filter drop-down** | Only on *Gallery photos* (filter by album) and *Rules & policies* (filter by group). |
| **+ New …** (top right) | Opens a blank form to add an item. |
| **Click a row** | Opens the item to edit. |
| **⤒ Move to top** | Sends the item to the top of the list. |
| **▲ / ▼** | Moves the item up or down one place. |
| **👁 eye** | Shows or hides the item on the website. A hidden item is dimmed in the list. |
| **🗑 bin** | Deletes the item **permanently** (you are asked to confirm). |

The order of this list is the order on the website. Order, show/hide and delete save **immediately** — there is no Save button for them.
Lists show 60 items at a time; press **Show more** for the rest.

> **Hide, don't delete.** If an offer or attraction might come back (seasonal, paused, being updated), hide it with the eye icon. Delete only what you will never need again.

### Adding or editing an item

1. Press **+ New …** (or click an existing row).
2. Fill in the form. Fields marked with a pink **\*** are required.
3. Press **Save changes**.

New items are put at the **end** of the list automatically; reorder them afterwards if you want. Every item also has two standard fields at the bottom:

| Field | Meaning |
| --- | --- |
| **Order** | A number. Lower numbers appear first. You normally use the arrows instead of typing here. |
| **Show on website** | Switch off to hide the item. |

Fields called **Page address**, **Anchor** or **Key** (the "slug") are made from the title automatically if you leave them empty. If two items would get the same address, the second gets `-2` added. You rarely need to touch these, and changing the address of an existing attraction changes its web link.

---

## Attractions

*Games, rides and facilities. Each one gets its own page at `/attractions/<page-address>`.*

| Field | Notes |
| --- | --- |
| **Name** \* | e.g. `Zipline` |
| **Page address** | Auto-generated from the name |
| **Category** | One of your [categories](#categories); used by the filter chips on the Attractions page |
| **Tagline** | One short line shown on cards |
| **Description** | The main text on the attraction's page |
| **Cover photo** \* | The main picture. A landscape photo works best |
| **Photo gallery** | Extra photos. Use the arrows on a photo to reorder, the bin to remove |
| **Good-to-know notes** | A list, e.g. *Grip socks are compulsory*, *Minimum height 120 cm* |
| **Grip socks required** | Switch on to show the grip-socks notice |
| **Feature on the homepage** | Switch on to show it in the homepage attractions area (up to 8 are shown, in list order). If none are featured, the first 8 attractions are shown. The first featured attraction's cover photo is also the background of the Attractions page header |

## Categories

*Groups used to filter attractions (Arcade, Thrill Rides, Kids…).*

| Field | Notes |
| --- | --- |
| **Name** \* | Shown on the filter chip |
| **Key** | Auto-generated |
| **Description** | Optional, short |
| **Colour** | Sea blue, orange, yellow, green, pink or purple — the accent used for that category |

A category must exist before you can pick it in an attraction. If you hide a category, the attractions in it are not deleted.

## Offers

*All-day deals and limited-time offers. Offers **disappear automatically after their end date**.*

| Field | Notes |
| --- | --- |
| **Title** \* | e.g. `Unlimited Friday` |
| **Anchor** | Auto-generated; lets links jump to this offer |
| **Type** | **All-day deal (every week)** — recurring deals like Unlimited Friday. **Other offer (limited time)** — goes in the *Other offers* section |
| **Tagline** | Short line |
| **Schedule** | e.g. `Every Friday · 11 AM – 8 PM` |
| **Price** / **Price note** | e.g. `Rs. 1,999` and `per person` |
| **Price options / prizes** | Use when there is more than one price (e.g. Rs. 999 and Rs. 1,499 passes). Each option has a name, price and description |
| **What's included** | A list |
| **Notes / fine print** | Terms and conditions |
| **Poster (portrait)** \* | The offer poster. Customers can click it to enlarge |
| **Wide banner (optional)** | A landscape version, if you have one |
| **Starts on** / **Ends on** | See below |
| **Also available on Khalti** | Shows the Khalti badge (the badge can be switched on/off in *Pages → Prices & Offers*) |
| **Button text / Button link** | Optional button on the offer |

**Dates.** An offer with an **Ends on** date is shown *up to and including* that day, then disappears. The date is checked in **Kathmandu time**. After midnight it usually disappears within the hour. Leave **Ends on** empty for an offer that never ends. **Starts on** does not hide an offer before that day — an offer with a future start date is shown straight away, with its dates. To keep an offer off the site until you're ready, switch **Show on website** off.

**To end an offer early:** hide it (eye icon) or set *Ends on* to yesterday's date.
**To run it again:** change the dates or switch it back to visible — you do not need to retype it.

## Powerplay table

*The rows of the "Load for Powerplay" recharge table.*

| Field | Notes |
| --- | --- |
| **You pay (Rs.)** \* | The recharge amount |
| **Credits** \* | Credits for that amount |
| **Bonus** | Bonus credits |
| **You get** \* | Total credits received |
| **Highlight this row** | Makes the row stand out (use for the best-value row) |

Numbers are typed without commas — type `120000`, the site displays `1,20,000`. The column headings and the Terms & Conditions are in *Pages → Prices & Offers*.

## Upcoming events

*Shown in "Upcoming events" on the Events page and the homepage.*

| Field | Notes |
| --- | --- |
| **Title** \* | |
| **Date** | **Past events hide automatically** (checked in Kathmandu time). An event with no date always shows |
| **Time** | Text, e.g. `2 PM – 6 PM` |
| **Description** | |
| **Poster** | |
| **Button text / link** | e.g. "Book now" |

There is no limit on how many you can add. When none are upcoming, the page shows the "no events" text you set in *Pages → Events*.

## Event types

*The "Social & private" and "Corporate" event descriptions.*

Fields: **Title**, **Anchor**, **Description**, **Highlights** (list), **Cover photo**, **Photos**, **Videos** (e.g. birthday videos). Videos must be uploaded to the media library first and be under 50 MB.

## Gallery albums and Gallery photos

The Gallery page has **tabs**. Each tab is an *album*; the pictures are *gallery photos*.

### Gallery albums

| Field | Notes |
| --- | --- |
| **Title** \* | The tab name, e.g. `General`, `Hall of Fame`, `Partner brands` |
| **Key** | Auto-generated |
| **Description** | Optional |
| **Layout** | **Photos (masonry)** — a normal photo wall. **People (captioned portraits)** — Hall of Fame style, with names. **Logos (white tiles)** — partner logos on white tiles |

### Gallery photos

| Field | Notes |
| --- | --- |
| **Album** \* | Which tab it belongs to |
| **Caption / name** | For *People* albums this is the person's name; for logos, the brand name |
| **Image** \* | The picture |

**The homepage uses your albums too.** The *Hall of Fame* strip shows photos from the **first album with the "People" layout** — only photos that have a **caption** (up to 10). The *Partner brands* marquee shows logos from the **first album with the "Logos" layout**. So give Hall of Fame photos a name, and don't change those albums' layouts.

To add many photos, repeat **+ New gallery photo**; set the **Album** first. Use the filter at the top of the list to look at one album at a time. Photos can be reordered within the list.

## Reviews

*Google reviews shown on the homepage.* Copy them from Google — the site does not pull them in automatically.

| Field | Notes |
| --- | --- |
| **Name** \* | Reviewer's name |
| **Stars (1–5)** | |
| **Review** \* | The text |
| **When** | e.g. `3 months ago` |
| **Source** | Default `Google` |
| **Badge** | e.g. `Local Guide` |

Only copy real reviews, word for word.

## FAQ

*Questions and answers on the FAQ page.* Fields: **Question** \* and **Answer** \*. Put the most-asked questions first. Search engines also read these.

## Rules & policies

*Rules & regulations, the refund policy and the waiver, shown on the Rules & Terms page.*

| Field | Notes |
| --- | --- |
| **Group** \* | **Rules & regulations**, **Refund policy** or **Waiver** |
| **Title** \* | A heading, e.g. `Safety rules` |
| **Points** | One line per rule |

Use the **Group** filter at the top of the list to see one group at a time.

---

## Things to know about all lists

- **Saving refreshes the website instantly.** There's no separate "publish" step.
- **Photos must be in the media library.** When a field asks for a photo, you choose from the library or upload on the spot. See [Media library](04-media-library.md).
- **Deleting a list item does not delete its photos** — they stay in the media library.
- **Hidden items can still be edited.** They just don't show to customers.
