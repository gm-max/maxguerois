---
subject: My bloodwork, labs, and wearables in one place, read by AI. Here's how.
subject_alts:
  - I put all my health data in one folder and pointed an AI at it
  - The follow-up a lot of you asked for: how I built my Health OS
  - Build your own Health OS (no code)
preview_text: Your health data as plain files, read by an AI that tells you what to do. The full how-to.
status: draft
tool: Beehiiv (paste this markdown into the post editor)
companion_post: https://maxguerois.com/health-os
notes: >
  Same body as the blog post. One image to upload in the editor at the marked
  spot: the Health OS schema (data in -> LLM -> decisions). Source asset is an
  SVG at public/health-journey/dna/wiki-llm-schema.svg; a PNG export already
  exists at public/health-journey/dna/wiki-llm-schema.png, use that for email
  (Beehiiv may not render SVG). Use the same schema PNG as the email header /
  social image. No em dashes anywhere. Section-3 weekly-read example still needs
  Max to confirm it's real and to swap in real protein/marker numbers.
---

Hey,

Last issue I told you I sequenced my [whole genome](https://maxguerois.com/my-genome) and dropped it into something I keep calling my Health OS. A lot of you replied with the same question: what is that, exactly, and how do I build my own?

So this one is the full how-to. By the end you'll be able to set up yours.

## What a Health OS is

Your health data is scattered and none of it talks to each other. Your bloodwork is a PDF in an email, your sleep is in one app, your training is in another, your DEXA scan is a file you opened once. A Health OS fixes that in the simplest way I've found.

It's your health data as plain text files, all in one folder, with an AI that reads across every file at once and tells you what to do. One file for bloodwork, one for your wearables, one for your genome, one for family history. The AI holds the whole picture instead of one slice, and turns it into decisions. That's the whole thing. No app, no dashboard, no code.

## Why I built it

For years my data lived in ten places. Five years of blood tests across two countries, Whoop, Strava, Withings, a genome report, my family's panels. Each one on its own told me almost nothing. Nothing read them together.

Health apps don't fix this, they make it worse. Every app is a silo. It shows you its own data, draws a pretty chart, and stops there. Your sleep app doesn't know your ferritin is low. Your lab portal doesn't know you trained hard all week. None of them know your genome when they look at any of it. They give you numbers, not decisions.

The thing that changed was realizing an LLM doesn't need any of that to be clean. It can read across plain, messy, personal files and connect them. You don't have to build a database or wait for ten apps to integrate. You hand it your text, and it reasons over the whole thing at once. *The data you already have is enough, it just needs one reader that sees all of it.*

## What it's done for me, three months in

Three things, mostly:

- Everything lives in one place, so every new lab makes the whole picture sharper instead of adding one more orphan PDF.
- I can ask any health question and get an answer grounded in my own numbers, not generic advice.
- I de-risk anything new before I try it. The genome post covered exactly this for retatrutide: check the risks against my own data first.

Here's a real one from a few weeks ago. I'd just traveled, trained hard, and I'm running a GLP-1, so my appetite is way down. I asked for my weekly read. It pulled across my wearables, my last bloodwork, and my training log and flagged something I'd missed: my protein had quietly dropped well under what I need to hold onto muscle while losing fat on a GLP-1. It cross-checked that against my actual goal, losing fat without losing muscle, and told me what to change: bring protein back up to a daily floor, swap one of that week's hard sessions for an easy one, and recheck a blood marker at my next draw. None of my apps could have caught it, because none of them were looking at my training, my bloodwork, and what I'm taking at the same time.

The clearest signal it's real: I sent the genome issue to a friend, he rebuilt his own version in a day, and his first message back was *"there's a startup to build on this."* Maybe. For now it's just a folder and a prompt, and that's the point.

## How to set it up, no code

If you can edit a text file and paste a prompt, you can run this. Five steps.

**1. Pick a tool that can read a folder.** Any AI you can point at a folder of files works: Claude (the Cowork desktop app or Claude Code), OpenAI Codex, or similar. Free tiers are fine to start. The trick is that it reads the whole folder, not one pasted message.

**2. Set up the folder.** One plain file per topic. Mine looks like this:

- **profile.md**: who you are, your goals, your targets.
- **data/**: your raw results by source, one file each: bloodwork, wearables, body composition, genetics.
- **protocol/**: what you're actually doing: supplements, training.
- **instructions.md**: the file that turns the AI into your coach.
- **dashboard.md**: a plain-language snapshot the AI keeps updated for you.

**3. Get your data in.** Export what you have and paste the numbers into the matching file. Lab portal PDFs, your Whoop or Oura or Garmin, Apple Health, a DEXA report. You don't need everything on day one. Start with bloodwork and one wearable, add the rest as you go.

**4. Give it the coach instructions.** This is the file that does the work. It tells the AI to read every file before answering, never invent a number, cite which file each claim comes from, flag anything that needs a doctor, and return five things when you ask for your read: where you stand, what's flagged, what to do this week, what to stop, and what's missing. Drop the folder into Claude or Codex and it reads it automatically.

**5. Run the weekly loop.** Once a week, or whenever new data lands, drop the new lab or month of wearable data into the right file and say "give me my read." The picture compounds. Data you collect is a curiosity; data something acts on every week is a coach.

[IMAGE: the Health OS schema. Upload public/health-journey/dna/wiki-llm-schema.png (PNG, renders in email). Caption: "The whole system: your files go in, the AI reads across them, decisions come out." Use as email header / social image too.]

I packaged the exact scaffold I run, the coach prompt, and example (fake) data so you can see the shape, into a starter template: [github.com/gm-max/health-os-starter](https://github.com/gm-max/health-os-starter). Copy it, replace the example data with yours, point your AI at it. The idea behind all of this comes from Andrej Karpathy's "LLM wiki" [1]: plain markdown a model can read, reason over, and write back to.

## What to watch for

Three honest warnings before you run this.

**Privacy, and genetics most of all.** Your health data is sensitive, and your genome is the one part you can never change or revoke. It also implicates your blood relatives. So be deliberate: keep your genetics file local and out of any cloud AI, or store only categories ("I carry a variant relevant to family planning") instead of raw variants, or leave it out entirely until you've decided. Never paste raw variant tables into a cloud model. For everything else, the rule is simple: don't upload anything you wouldn't want stored somewhere.

**This is not medical advice.** It's a tool for organizing your own data and thinking. Anything clinical goes to a doctor. The Health OS is good at spotting patterns and bad at replacing a physician, and it should hand off the moment something looks like it needs one.

**The AI can be wrong.** That's why the coach instructions force it to cite the file behind every claim and never estimate a lab value. Make it show its sources, and sanity-check the numbers yourself. A confident wrong answer about your health is worse than no answer.

## Build your own

That's the entire system: a folder of plain files and an AI that reads across all of them. The genome was the base layer. This is the thing that finally acts on it, and on everything else you measure.

Want to build your own? Reply to this email and I'll send you the GitHub repo. Tell me what you're tracking and I'll help you set it up, plus send updates as the template evolves.

More soon,
Max

*Personal experimentation and documentation, not medical advice. Talk to a doctor before making health decisions.*

---

### References

1. [Andrej Karpathy on the "LLM wiki" (plain-markdown second brain for LLMs)](https://x.com/karpathy/status/2039805659525644595)
