---
title: Analytics — GA4 et PostHog
date: 2026-08-27
---

# Pourquoi deux outils

Ils ne repondent pas a la meme question, et aucun des deux ne repond a la plus
importante.

**Le nombre d'inscrits ne vient d'aucun des deux.** Il est exact dans Supabase
(`mg_subscribers`), avec le champ `source` qui distingue les quatre formulaires
et l'`utm_source`. Un analytics ne fera jamais mieux qu'une table qui contient
la verite. Ne jamais citer un chiffre d'inscriptions depuis GA4 ou PostHog.

**GA4** (`G-DR1W1B2VV5`, `Layout.astro`) porte l'historique : cinq mois sur les
articles et l'accueil. C'est sa seule raison de rester.

**PostHog** repond a « ou ils decrochent » : le funnel de `/peptides`, lequel des
quatre formulaires convertit, et si la pop-up aide ou derange. GA4 y est mauvais
a ce volume — il agrege et masque les petits nombres, exactement la ou on a
besoin de les voir.

On ne coupe pas GA4 avant que PostHog ait un trimestre de donnees.

## Activer PostHog

Une seule ligne : `POSTHOG_KEY` dans `src/lib/analytics.ts`. Vide = desactive
partout, silencieusement. C'est l'etat par defaut.

La cle `phc_...` est **publique** : PostHog la publie dans le HTML de chaque
page, comme l'identifiant GA4 juste a cote. Elle n'autorise que l'ecriture
d'evenements. Ce n'est pas un secret, elle a sa place dans le depot.

Instance **UE** (`eu.i.posthog.com`) : les donnees ne quittent pas l'Europe.

## Ce qui est instrumente

Autocapture partout (clics, pages, heatmaps) sans rien toucher aux composants.
Sur `/peptides`, six evenements nommes :

| Evenement | Quand | Propriete |
|---|---|---|
| `peptides_form_started` | premier focus, une fois par formulaire | `source` |
| `peptides_form_submitted` | envoi | `source` |
| `peptides_subscribed` | succes | `source` |
| `peptides_form_failed` | echec cote visiteur | `source`, `reason` |
| `peptides_guide_shown` | pop-up reellement affichee | — |
| `peptides_guide_dismissed` | pop-up fermee sans inscription | — |

`source` vaut `fr-peptides`, `fr-peptides-newsletter`, `fr-peptides-guide` ou
`fr-peptides-modal`. Les quatre formulaires sont identiques a l'oeil ; c'est la
seule chose qui dise lequel travaille.

`peptides_form_failed` n'a pas d'equivalent dans Supabase : un envoi qui echoue
n'y laisse aucune trace. C'est le seul endroit d'ou l'on saura qu'un visiteur a
essaye et n'a pas reussi.

## Trois pieges deja payes

**Le poids.** Un `import` statique de `posthog-js` faisait entrer 257 ko dans le
bundle de `Layout.astro`, donc dans chaque page du site, telecharges meme cle
vide : un `return` anticipe n'empeche pas un module d'etre charge. L'import est
dynamique, apres la verification de la cle.

**Le double comptage.** `/peptides` et `/fr/peptides` servent le meme contenu
sous deux URL. Sans correction, PostHog les compte comme deux pages et coupe le
taux de conversion en deux. `Layout.astro` pose `data-analytics-path` sur les
pages hors miroir ; `analytics.ts` l'utilise pour le `$pageview`. Meme piege,
meme correction que sur GA4.

**La fermeture de la pop-up.** L'evenement `close` d'un `<dialog>` couvre en
theorie les trois sorties, Echap compris. Il ne se declenche pas dans tous les
moteurs — verifie : le navigateur de test ne l'emet pas du tout, meme pour un
ecouteur pose dans le monde principal. Les trois sorties sont donc branchees
explicitement, avec un verrou qui empeche le double comptage la ou les trois
marchent.

**Non verifie :** la sortie par la touche Echap, faute d'un moteur emettant
`close` dans l'environnement de test. A confirmer sur un vrai navigateur une
fois la cle posee.

## Ce qui n'envoie rien

`localhost` et les previews `*.vercel.app` sont filtres a la source
(`ANALYTICS_HOSTS`). Le projet Ouros a pris le chemin inverse — capturer tout,
puis filtrer `$host` dans chaque insight — et il suffit d'un insight qui oublie
le filtre pour que le chiffre soit faux sans que rien ne le signale.
