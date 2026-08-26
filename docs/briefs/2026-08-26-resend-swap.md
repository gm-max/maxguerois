---
title: Basculer la couche d'envoi de beehiiv vers Resend
date: 2026-08-26
branch: feat/supabase-capture
status: à implémenter
---

# Brief — bascule beehiiv → Resend

Décision D16, prise le 26/08 après une review d'ingénierie et une voix extérieure.
La capture (D10) ne change pas. Seule la couche d'envoi est remplacée.

## Pourquoi, en une phrase

`unsubscribed_at` n'était écrit par personne, donc « Supabase est la source de vérité »
était faux, et c'est cette phrase qui justifiait l'architecture. Garder deux systèmes
imposait en plus une réconciliation quotidienne, l'ambiguïté entre « beehiiv a accepté »
et « la personne est abonnée », et un rejeu qui pouvait renvoyer des emails de bienvenue
en double. Un seul système supprime les quatre.

## État actuel, déjà fait, ne pas refaire

| Élément | Où |
|---|---|
| Route de capture | `src/pages/api/subscribe.ts`, seule route non prérendue |
| Tests | `test/api/subscribe.test.ts`, 39 tests, `npm test` |
| Schéma | `supabase/migrations/20260826000000_create_mg_subscribers.sql` |
| Adapter | `@astrojs/vercel` **v10** (la v11 exige Astro 7), `output: 'static'` conservé |

Branche `feat/supabase-capture`, 4 commits, poussée, **non mergée**.

## Identifiants (non secrets)

```
Supabase   projet ouros-health   jkfqzypiomdxwmjkexpd
           tables                public.mg_subscribers, public.mg_rate_limit_hits

Resend     domaine maxguerois.com    86dc9891-f1d2-4774-abc0-4ab5d5ba2c9f  (eu-west-1)
           topic  « L'actu peptides » f0a1936e-38dd-4d41-8f46-17ab3c2eff5c  (opt_out par défaut)
           segment                    400e7512-8a4c-4a89-91a8-f262a341f8c6

beehiiv    publication               pub_5eedca30-dd73-499b-8d75-6ea4c3994152
           88 abonnés actifs, 92 inscrits, 4 désabonnés
```

**Bloquant, hors de votre contrôle :** le domaine `maxguerois.com` n'est pas encore
vérifié chez Resend (DNS en attente côté Max). Le code s'écrit et se teste sans, mais
aucun envoi réel ne partira avant. Ne considérez pas une tâche « vérifiée » sur la
base d'un envoi qui n'a pas pu partir.

## Les tâches

### T1 — `pushToBeehiiv` → `pushToResend`

Dans `src/pages/api/subscribe.ts`. L'inscription doit :
1. créer/mettre à jour le contact Resend,
2. l'ajouter au **segment**,
3. poser un **opt_in** explicite sur le **topic** (le défaut du topic est `opt_out`,
   donc sans opt-in explicite la personne ne recevra rien),
4. envoyer l'email de bienvenue qui porte le guide peptides.

`reactivate_existing: true` n'existe pas chez Resend : l'équivalent est de remettre
`unsubscribed: false` sur le contact et `opt_in` sur le topic. Le comportement attendu
est le même, une réinscription volontaire est un consentement neuf.

Les variables `BEEHIIV_*` disparaissent. Nouvelles : `RESEND_API_KEY`,
`RESEND_TOPIC_ID`, `RESEND_SEGMENT_ID`.

### T2 — L'endpoint de désabonnement, `src/pages/api/unsubscribe.ts`

C'est lui qui rend `unsubscribed_at` réel, et donc qui rend vraie la phrase sur
laquelle toute l'architecture repose. **C'est la tâche la plus importante du lot.**

- Lien signé (HMAC de l'email avec un secret), jamais un simple `?email=`. Sans
  signature, n'importe qui désabonne n'importe qui et l'énumération est triviale.
- Écrit `unsubscribed_at` dans Supabase, **puis** pose `opt_out` sur le topic Resend.
- L'écriture Supabase est bloquante, l'appel Resend ne doit jamais faire échouer
  un désabonnement : un désabonnement refusé est un problème légal.
- `opt_out` sur le **topic**, jamais le drapeau `unsubscribed` global du contact :
  celui-ci est au niveau du compte et couperait aussi Ouros Lab et Ouros Health à
  la même personne.
- Doit répondre en GET (les clients mail suivent des liens), et supporter le
  pré-chargement des liens par les antivirus sans désabonner par accident : exiger
  une confirmation, ou accepter POST depuis une page de confirmation.

### T3 — Les tests

Même discipline que l'existant. Après avoir écrit un test qui prétend garder une
correction, **réintroduisez le bug et vérifiez que la suite échoue.** Un garde-fou
non vérifié ainsi est un garde-fou supposé. Ce dépôt a un historique de gardes qui se
lisaient bien et ne s'exécutaient jamais.

Couvrir au minimum : opt-in posé sur le topic, contact ajouté au segment, réinscription
après désabonnement, échec Resend qui n'annule pas l'inscription, signature invalide
refusée, désabonnement qui écrit bien Supabase même si Resend échoue.

### T4 — Migration des 88 abonnés

**Ne l'exécutez pas sans validation explicite de Max.** Produisez d'abord un dry-run
qui affiche ce qui serait écrit.

Les 4 désabonnés sont la donnée critique : ils doivent arriver en `opt_out` sur le
topic et avec `unsubscribed_at` renseigné dans Supabase. Les réimporter comme actifs
serait précisément ce que la loi interdit.

## Invariants, à ne pas redécouvrir à vos dépens

1. **Tout appel tiers est `await`, jamais lancé sans attendre.** Astro n'a pas
   d'équivalent à `after()`. Dans `ouros-reddit-scam`, des appels non attendus ont été
   tués par la destruction du serverless : 5 ajouts d'audience sur 20 et 13 emails de
   bienvenue sur 20 perdus, au hasard et indépendamment.
2. **Supabase est la source de vérité.** Une panne d'envoi enregistre `sync_error` et
   renvoie quand même 200. Une inscription n'est jamais perdue à cause de l'envoi.
3. **Les tests vivent dans `test/`, JAMAIS sous `src/pages/`.** Tout fichier sous
   `src/pages` est une route Astro : un test colocalisé est devenu l'endpoint
   `/api/subscribe.test` et a cassé le build. S'il n'avait pas planté, le fichier de
   test partait en production comme endpoint public.
4. **Aucun secret en `PUBLIC_`**, il finirait dans le bundle client.
5. **Ne touchez pas** aux pages, au CSS, à `DESIGN.md` ni à la landing `/fr/peptides` :
   un autre agent travaille dessus en parallèle. Restez dans `src/pages/api/`, `test/`,
   `supabase/`.
6. `vercel.json` continue de s'appliquer malgré le Build Output API (mesuré sur preview :
   CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, cleanUrls tous présents).
   Ce n'est pas un bug à corriger.
7. Pattern de référence, déjà éprouvé en production :
   `~/claude_code/ouros-reddit-scam/lib/resend.ts` et `app/api/subscribe/route.ts`.

## Décisions ouvertes, à NE PAS trancher seul

Elles sont connues et assumées. Signalez-les, ne les résolvez pas en silence.

- **Consentement CNIL** sur la landing : case dédiée non pré-cochée, politique de
  confidentialité, sous-traitant nommé, preuve conservée. Appartient à l'autre agent.
- **Course sur la limite de débit** : `count` puis `insert` ne sont pas atomiques,
  N requêtes simultanées d'une même IP passent toutes.
- **Attribution écrasée** : l'upsert remplace `source` et `utm_*` à chaque
  réinscription, le premier contact est perdu.
- **Plafond de 100 emails/jour** du plan gratuit Resend, franchi vers le 101e abonné.

## Définition de terminé

`npm test` vert, `npm run build` vert, chaque garde-fou testé négativement, et un
rapport honnête distinguant ce qui a été **mesuré** de ce qui est **supposé**. Si les
DNS ne sont pas propagés, dites que l'envoi réel reste non vérifié.
