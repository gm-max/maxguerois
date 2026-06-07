---
subject: I sequenced my whole genome. Here's what I found.
subject_alts:
  - The cheapest measurement in modern health
  - I checked my DNA before trying a single peptide.
preview_text: The base layer under everything I do with my health, and the three steps to do it yourself.
status: draft
tool: Beehiiv (paste this markdown into the post editor)
companion_post: https://maxguerois.com/my-genome
notes: >
  Same body as the blog post. Two images to upload in the editor at the marked
  spots: (1) the cost chart at public/health-journey/dna/cost-of-sequencing.jpeg
  (also use it as the email header / social image), and (2) the wiki->LLM schema.
  Beehiiv may not render SVG in email; export wiki-llm-schema.svg to PNG before
  uploading. No em dashes anywhere. Note: the cost chart still shows a
  "Sequensencing" typo in the blue label (shipping as-is per Max).
---

Hey,

Most of you found me through the post on [leaving Lucis](https://maxguerois.com/lucis-chapter). Here's what you actually signed up for: I'm building my next venture in the open, and you get the unfiltered version.

The research, the experiments I run on myself, what works and what blows up.

So I'll start with the foundation: the highest-leverage thing I've done for my health.

I sequenced my genome.

I did it during YC. Being in the US gave me access to the most promising DNA test on the market, and I'd known for a while that sequencing was becoming the thing in health.

So I used Nucleus, and it ended up running how I manage my health today.

In this issue:

- what a DNA test actually is
- why everyone's suddenly talking about it
- what mine changed for me
- the three steps to do it yourself

## What a "DNA test" actually is

Most people hear "DNA test" and think 23andMe. Wrong tool. There are two:

- **Genotyping** (23andMe, Ancestry): reads ~0.1% of your DNA at preselected spots. Cheap, good for ancestry. It does not read your genome.
- **Whole genome sequencing (WGS):** reads all 3.2 billion base pairs at 30x. Clinical-grade. Surfaces actionable variants, carrier status, real risk.

Genotyping samples. Sequencing reads everything. For any real decision, you want sequencing.

## Why everyone is suddenly talking about it

[IMAGE: cost chart. public/health-journey/dna/cost-of-sequencing.jpeg. "Cost of sequencing a whole human genome (2000 to 2026) vs Moore's Law". Use as email header / social image too.]

The cost of sequencing a human genome dropped from $100M to less than $100 in about 25 years. That's a million-fold decrease, which outpaces even Moore's Law.

Then the cheap-data era imploded. 23andMe went bankrupt in March 2025 and sold 15 million people's DNA as an asset. Nebula shut down.

So here's the rule that came out of it: your genome is the one data point you can never change or revoke. When the company holding it fails, your DNA gets sold. Own it, or don't hand it over.

## Where this is going

We're about to enter the era of personalized medicine, and it's moving faster than most people realize.

Reading a genome is now cheap and routine. Two things happening right now show where it goes next:

- **We're starting to edit genomes.** Scientists in the US just corrected disease-causing genes directly in human embryos [1], more precisely than ever before. Early and ethically loaded, but the line has been crossed.
- **And you can now do the whole thing yourself, privately.** Someone sequenced his entire genome at home, on his kitchen table, without his DNA ever touching the internet [6], using a device smaller than a phone and open-source AI to trace his family's autoimmune conditions.

Reading your genome was step one. Rewriting it, and owning it end to end, is step two. It just started.

## What I did, and how it helped

Nucleus is simple, and the UX is genuinely great. A kit arrives, you give a sample, you ship it back, and your results land in a clean app a few weeks later.

Then it took me weeks to open it. Sequencing your genome means reading things you can't unread.

When I did, three things mattered:

- **A pathogenic variant** I didn't know I carried. It changed what I screen for, and how often, with my doctor.
- **Polygenic risk scores.** These sum thousands of tiny genetic effects into a single estimate of your odds for a common condition. Think of it as a weather forecast for your body: "roughly 1.6x the average lifetime odds of type 2 diabetes," or "below average for one heart condition." Useful for deciding what to watch closely.
- **Carrier status** that matters for family planning.

What I learned: a genome is not a crystal ball. Most of it reads average. But the handful of findings that are actionable are genuinely actionable, and you only get them if you look.

Two moves turned the report into something I actually use day to day:

**1. I pulled it together with the rest of my data.** Everything went into one place: 5 years of blood tests, Whoop, Strava, Withings, and my family's panels, including my father's.

The genome is the fixed baseline; the rest shows what's happening week to week. Stacked together, they cross-check each other, and inherited patterns stop looking like noise.

**2. I built the Max Health OS.** A markdown wiki of everything above, with an LLM layer that reads across all of it and turns it into decisions. That's the real unlock.

[IMAGE: the Max Health OS schema. Upload wiki-llm-schema (export the SVG to PNG first for email).]

The wiki itself is just a folder of plain-text files on my computer, one per topic, each tagged with consistent labels. A second brain that holds everything known about my health, structured so a machine can read across all of it.

The idea comes from Andrej Karpathy's "LLM wiki" [4]: plain markdown a model can read, reason over, and write back to.

## How I de-risk an advanced therapy before I try it

Take what I'm running now: retatrutide, a GLP-1/GIP/glucagon triple-agonist peptide and the most effective metabolic compound tested so far, up to 24% body-weight loss in its phase 2 trial [2].

I want to see firsthand how it moves my metabolism, body composition, and appetite, on my own data, before I have an opinion worth sharing.

Before the first dose, I ran a three-step check:

1. **Map the risk factors.** What the literature says about contraindications, side effects, and the genetics that matter for this specific compound.
2. **Hand them to the Max Health OS.** Cross-reference those risks against my own genome and bloodwork.
3. **Ask the one question that counts:** given my specific data, is this safe enough to be worth it for me?

This is where the genome earns its place in daily life. It can't yet tell you the ideal dose; the science there is still young [3]. What it does reliably is flag the contraindications, the variants that say "this is riskier for you than for most people." That one safety filter, applied to every supplement, drug, or therapy you're considering, is worth the price of sequencing on its own.

## The 3 steps to start

**1. Sequence your genome.**

Get whole-genome sequencing (WGS), the kind that reads everything.

The labs below all use the same proven method, Illumina short-read sequencing [5]: it reads your DNA in hundreds of millions of short fragments, then a computer stitches them back into your full genome. Accurate, and the industry standard.

**US**

- [Nucleus](https://mynucleus.com/health). Whole genome at 30x. Clinical-grade, genetic-counselor access, strong reports. ~$399. What I used.

**Europe**

- [Myoform](https://myoform.io/pages/pricing). Whole genome at 30x, raw data you own and can delete. They pair your DNA test with a supplement formula built from your results, or you can take the test on its own. DNA test only, ~£359.
- [YSEQ](https://www.yseq.net/product_info.php?cPath=29&products_id=129554). Whole genome at 30x, full raw data (FASTQ, BAM, VCF). Germany. A bare-bones research lab, no interpretation reports, just clean data. ~€399.
- [Dante Labs](https://dantelabs.com/products/whole-genome-sequencing). Whole genome at 30x, full raw data included. Italy. ~€430, often far less on sale. The catch: turnaround can run long and reviews are mixed, so go in eyes open.

Three rules:

- it must be whole-genome
- you must be able to download your raw data
- you must be able to delete it

23andMe is why.

**2. Put everything in one place.**

A genome on its own gives tendencies. Its value shows up when it sits next to your bloodwork, your wearables, and your family history, in one organized place.

For me that's the Max Health OS above. Yours can be anything organized, as long as it all lives in one place.

**3. Let an LLM interpret it.**

This is the step almost everyone skips, and where the entire payoff lives. Raw data and reports do nothing on their own. I point Claude (or any LLM) at that wiki, and because the files are structured the same way, it reads across all of them at once and gives me specific, daily recommendations that update every time new data lands. The genome stops being a one-time PDF and becomes a live input into decisions, which is what lets me test new things safely.

You can build your own or use a tool that does it for you. The principle is what matters: data you collect is a curiosity; data something acts on compounds.

## The bottom line

A $100 genome is the highest-leverage measurement in health today. Most people will never run it, and most who do let it rot in an app. Read yours, then build the thing that acts on it. That's the game I'll keep playing in front of you here.

Reply if you've sequenced yours and done something real with it. I'm always looking for cases where it actually changed a decision.

More soon,
Max

*Personal experimentation and documentation, not medical advice. Talk to a doctor before making health decisions.*

---

### References

1. [*Nature*, first precise base-editing of human embryos (June 2026)](https://www.nature.com/articles/d41586-026-01827-8)
2. [Jastreboff et al., *NEJM* 2023, retatrutide phase 2 trial, up to ~24% body-weight loss](https://www.nejm.org/doi/full/10.1056/NEJMoa2301972)
3. [*Lancet Diabetes & Endocrinology* 2022, pharmacogenomics of GLP-1 receptor agonists](https://www.thelancet.com/journals/landia/article/PIIS2213-8587(22)00340-0/fulltext)
4. [Andrej Karpathy on the "LLM wiki" (plain-markdown second brain for LLMs)](https://x.com/karpathy/status/2039805659525644595)
5. [Goodwin et al., *Nature Reviews Genetics* 2016, what short-read sequencing is, a review of next-generation sequencing technologies](https://www.nature.com/articles/nrg.2016.49)
6. [Seth Howes, sequencing his whole genome at home on his kitchen table, no internet, local open-source AI (X, 2026)](https://x.com/SethSHowes/status/2045289299269070978)
