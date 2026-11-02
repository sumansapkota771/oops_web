# 7. Users and roles

← [Back to the guide index](README.md)

**Site → Users** is where admins decide who can sign in. *This page is only visible to people with the Admin role.* Editors do not see it, and if they open the address by hand they are sent back to the Dashboard.

## Roles

| Role | Can do |
| --- | --- |
| **Editor** | Edit everything on the website (pages, lists, settings, media), handle enquiries. Cannot manage users. |
| **Admin** | Everything an editor can do, **plus** add users, change roles, reset passwords, disable and delete users. |

Make most people Editors. Keep two Admins if you can (the owner plus one trusted person), so you are never locked out.

## Adding a user

In the **Add a user** box:

| Field | Notes |
| --- | --- |
| **Name** | e.g. `Sita Sharma` |
| **Email** | The address they sign in with. Must be unique — you cannot add the same email twice |
| **Role** | Editor or Admin |
| **Password** | Leave empty to have one generated (recommended). If you type one: 10+ characters with letters and numbers |

Press **Add user**. A yellow box appears with the **temporary password**:

> **The password is shown only once.** Press **Copy**, and send it to the person privately (for example in a direct message — not in a group chat or email with other people). Press **Done** when you've sent it. If you lose it, just reset it (below).

The new user signs in at `/admin`, sees a banner asking them to choose their own password, and does so. The user list shows a **Temporary password** label until they have.

## The user list

Each person shows their name, email and **last sign-in** (Kathmandu time, or *Never*). Labels:

| Label | Meaning |
| --- | --- |
| **You** | This is your own account |
| **Disabled** | Cannot sign in; shown dimmed |
| **Temporary password** | Has not yet chosen their own password |

### Change a role

Use the role drop-down on their row. It saves at once. You can't change **your own** role.

### Reset a password

Use when someone forgot their password or is locked out.

1. Press **Reset password** and confirm.
2. A new temporary password is shown **once** — copy it and send it privately.
3. They are **signed out everywhere**, any lock-out is cleared, and they must choose a new password on their next sign-in.

This also works for your own account.

### Disable and enable

**Disable** blocks sign-in right away and ends their sessions, but keeps their account. Use it when someone goes on long leave. **Enable** restores access.

### Delete

The bin icon deletes the account permanently (after confirming). Use for staff who have left for good. If they might return, use **Disable** instead.

## Safety rules the system enforces

- There must **always be at least one active admin.** You can't remove, disable or demote the last one.
- You can't disable, delete or demote **yourself** — ask another admin.
- After **5 wrong passwords**, an account is locked for **15 minutes** (a password reset clears it).
- Passwords are stored scrambled (hashed); nobody, including admins and developers, can read them. That is why they can only be reset, never recovered.
- Changing or resetting a password signs that person out on all devices.

## When someone leaves the team

1. **Disable** (or delete) their account straight away. They are signed out immediately.
2. If they knew a shared password for anything else (social media, Gmail used for enquiries), change those too.
3. Consider a [backup](06-enquiries.md#backing-up-your-content) so you have a record of the content.
