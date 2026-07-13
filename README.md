# Whimsy

**by Don't Lose Your Whimsy** · *Your body, on the record.*

A health documentation and advocacy app for people with chronic illnesses and invisible (non-apparent) disabilities, centered on Black women. Other apps ask what triggers your symptoms. Whimsy asks how you get believed.

---

## Deploy it (about 20 minutes, no coding)

### 1. Put it on GitHub
1. Make a free account at github.com
2. Click **New repository**, name it `whimsy`, keep it Public, click **Create**
3. On the new repo page, click **uploading an existing file**
4. Drag in every file and folder from this project (including `src` and `public`), then click **Commit changes**

### 2. Deploy on Vercel
1. Make a free account at vercel.com and choose **Continue with GitHub**
2. Click **Add New → Project**
3. Find `whimsy` in the list, click **Import**
4. Vercel detects Vite automatically. Click **Deploy**
5. About a minute later you get a live link: `whimsy-something.vercel.app`

That link is Whimsy, live on the internet. Share it with anyone.

### 3. Optional: your own domain
Buy a domain (Porkbun or Namecheap, roughly $12/year), then in Vercel go to **Settings → Domains**, add it, and follow the instructions. Free to connect.

### 4. Optional: app icons
Export your Whimsy logo as PNGs at 192x192 and 512x512, name them `icon-192.png` and `icon-512.png`, and upload both into the `public` folder. Then anyone can "Add to Home Screen" on their phone and Whimsy opens like a real app, with your logo on it.

---

## Running it on your own computer (optional)

```bash
npm install
npm run dev
```

Then open the localhost link it prints.

---

## How data works

Everything a member logs is stored in **their own browser** (localStorage). It never leaves their device, there are no accounts, no servers, and no tracking. Members can download a full backup at any time ("Take your story with you") and restore it later.

When Whimsy grows into a service with accounts and shared community data, that will require a real backend and a privacy review. This version is deliberately, provably private.

---

## What's inside

- **Today**: energy days, pain slider with a mood face, twelve tappable spoons, symptoms, meds, triggers, a daily reflection prompt, gentle flare pattern notices, and a one-tap appointment summary
- **Patterns**: your garden (every check-in grows a plant), trigger echoes before red days, time-range filters, and a pain chart
- **Receipts**: every visit documented as dismissed or believed, exported as a care record for appeals and second opinions
- **Toolkit**: conditions, allergies and med reactions, an 11-type insurance playbook, a 93-entry code lookup, appointment prep with a visit-plan builder, a searchable food and relief database, battle guides, and opt-in anonymous community research

---

© Don't Lose Your Whimsy. Built with love, for people who deserve to be believed.
