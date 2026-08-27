---
title: Analytics — GA4 et PostHog
date: 2026-08-27
---

# Pourquoi deux outils

Ils ne repondent pas a la meme question, et aucun des deux ne repond a la plus
importante.

**Le nombre d'inscrits ne vient d'aucun des deux.** Il est exact dans Supabase
(`mg_subscribers`), avec le champ `source` qui distingue les formulaires et
l'`utm_source`. Un analytics ne fera jamais mieux qu'une table qui contient la
verite. Ne jamais citer un chiffre d'inscriptions depuis GA4 ou PostHog.

**GA4** (`G-DR1W1B2VV5`, `Layout.astro`) porte l'historique : cinq mois sur les
articles et l'accueil. C'est sa seule raison de rester.

**PostHog** repond a « ou ils decrochent » : le funnel de `/peptides`, quel
formulaire convertit a nombre de vues egal, et si la pop-up derange. GA4 y est
mauvais a ce volume — il agrege et masque les petits nombres, exactement la ou
on a besoin de les voir.

On ne coupe pas GA4 avant que PostHog ait un trimestre de donnees.

## Ce que ces chiffres ne disent PAS

**Des comportements, pas des effets.** La pop-up s'affiche a TOUT LE MONDE a la
8e seconde : il n'existe aucun groupe temoin, donc rien ne dit si les gens qui
s'inscrivent par elle se seraient inscrits autrement. La tuile mesure le
derangement, pas le gain. Un test A/B est en attente de volume (TODOS.md).

**Des visites, pas des personnes, et le CALCUL doit suivre.** La persistance est
en memoire (voir plus bas). Consequence non evidente, mesuree le 2026-08-27 :
posthog-js ne cree de profil de personne que pour un visiteur IDENTIFIE, donc un
visiteur anonyme n'en a aucun, et le calcul `dau` ne renvoie pas « une personne
par chargement » comme on pourrait le croire. Il renvoie **zero**.

Cinq tuiles avaient ete creees en `dau`. Elles ont affiche zero pendant des
heures pendant que les evenements arrivaient normalement. Discriminant utile :
rejouer la meme requete en `total` ; si elle rend des donnees, le fautif est le
calcul et non le filtre.

**Regle : sur ce projet, aucune tuile n'utilise `dau`, `weekly_active` ni
`monthly_active`.** Ces calculs comptent des personnes, et il n'y en a pas.
`total`, et on nomme le resultat « visites ».

**A nombre de vues egal, sinon rien.** Comparer les inscriptions brutes de
quatre formulaires places a quatre profondeurs differentes confond la position
et la qualite : celui du bas en recolte moins surtout parce que moins de gens
l'atteignent. D'ou `*_form_seen`, le denominateur.

## Rien n'est ecrit chez le visiteur

`persistence: 'memory'` : ni cookie, ni localStorage. Le site n'a **aucune
banniere de consentement**, et l'audience est francaise.

Le funnel survit parce qu'il tient ENTIEREMENT dans un seul chargement de page :
arrivee, saisie, envoi, inscription se produisent tous sur `/peptides`.

Ce qu'on perd : reconnaitre un visiteur d'un jour a l'autre. Assume.

Verifie au navigateur le 2026-08-27 : zero cookie `ph_*`, zero cle localStorage
apres un chargement complet avec PostHog initialise.

## Le projet est PARTAGE avec ouros.health

Le plan gratuit de PostHog n'autorise qu'**un projet par organisation**. Les
deux organisations existantes ont deja le leur : Ouros Health -> `ouros.health`,
Ouros Lab -> `ouroslab.co` (26 000 evenements, actif). Faute d'un projet dedie,
maxguerois.com ecrit dans celui d'Ouros Health (`252123`).

**Toute tuile de ce projet doit porter `site = maxguerois.com` ET
`filterTestAccounts: false`.**

L'echec est heureusement BRUYANT. Une tuile creee sans y penser coche
`filterTestAccounts` par defaut, et le filtre interne du projet exclut
`maxguerois`, donc elle affiche **zero** ligne. Vide et manifestement faux,
plutot que silencieusement melange. C'est le seul garde-fou automatique, et il
protege aussi les tuiles d'Ouros dans l'autre sens.

**Sortir du partage n'est PAS un changement de cle.** Les deux tableaux de bord,
les definitions de proprietes et les reglages du projet vivent dans PostHog, pas
dans ce depot, et devront etre recrees. Les donnees deja ingerees restent
derriere. Voir TODOS.md ; la fenetre ou c'est quasi gratuit est maintenant.

## Les tableaux de bord

- [maxguerois.com — Peptides](https://eu.posthog.com/project/252123/dashboard/918448) :
  visites et inscriptions, ou ils decrochent, quel formulaire travaille a nombre
  de vues egal, d'ou ils viennent, et ce que coute la pop-up.
- [maxguerois.com — Site](https://eu.posthog.com/project/252123/dashboard/918449) :
  visites, quelles pages tirent, d'ou vient le monde, quel article amene des
  inscrits.

## Ce qui est instrumente

Autocapture partout (clics, pages, heatmaps). Puis deux familles d'evenements
nommes, **volontairement prefixees differemment** : les memes noms melangeraient
les deux entonnoirs dans les memes tuiles.

| Evenement | Quand | Proprietes |
|---|---|---|
| `peptides_form_seen` / `newsletter_form_seen` | le formulaire entre a l'ecran, une fois | `source` |
| `peptides_form_started` / `newsletter_form_started` | premier focus, une fois par formulaire | `source` |
| `peptides_form_submitted` / `newsletter_form_submitted` | envoi | `source` |
| `peptides_subscribed` / `newsletter_subscribed` | succes | `source` |
| `peptides_form_failed` / `newsletter_form_failed` | echec cote visiteur | `source`, `reason` |
| `peptides_guide_shown` | pop-up REELLEMENT affichee (`dlg.open` verifie) | — |
| `peptides_guide_dismissed` | pop-up fermee sans inscription, une seule fois | — |

`peptides_*` vient de `/peptides` et distingue ses quatre formulaires
(`fr-peptides`, `-newsletter`, `-guide`, `-modal`). `newsletter_*` vient de
`NewsletterEmbed`, present deux fois par article sur une vingtaine de pages ;
`$pathname` suffit a ventiler par article.

`reason` est borne par une liste blanche (`window.mgReason`, definie dans
`Layout.astro` parce que les deux scripts sont `is:inline` et ne peuvent rien
importer). Sans elle, un echec de `fetch` injectait le message du navigateur,
different d'un moteur a l'autre et traduit selon la langue.

**Ce que `*_form_failed` ne couvre pas :** l'envoi natif sans JavaScript. Celui-la
passe par la redirection 303 de `/api/subscribe` et ne declenche aucun
evenement. L'instrumentation couvre le chemin `fetch`, pas tous les echecs.

## Quatre pieges deja payes

**Le poids.** Un `import` statique de `posthog-js` faisait entrer 257 ko dans le
bundle de `Layout.astro`, donc dans chaque page, telecharges meme cle vide : un
`return` anticipe n'empeche pas un module d'etre charge. L'import est dynamique,
apres la verification. Le chunk reste hors du chemin critique.

**Le rejet non gere.** `eu.i.posthog.com` est dans les listes de blocage par
defaut d'uBlock et de Brave. Sans `.catch()` sur `initAnalytics()`, chaque page
produisait une promesse rejetee non geree pour une part reelle des visiteurs.

**Le double comptage.** `/peptides` et `/fr/peptides` servent le meme contenu
sous deux URL. La correction vit dans `before_send`, le SEUL point de passage de
tous les evenements : la corriger sur la seule vue de page laissait l'autocapture
et les heatmaps sur l'URL reelle, donc le jeu de donnees coupe en deux.
`location.search` y est conserve, sinon `?utm_source=instagram` disparaissait de
`$current_url`.

`before_send` porte aussi la marque `site`. Elle etait posee par `register()`
apres `init()`, ce qui creait une course : la vue de page d'ouverture — la seule
que TOUT visiteur declenche — pouvait partir avant, donc sans marque, donc
invisible a tous les filtres.

**La pop-up.** L'evenement `close` d'un `<dialog>` couvre en theorie les trois
sorties, Echap compris. Il ne se declenche pas dans tous les moteurs : verifie au
navigateur, le moteur de test ne l'emet pas du tout, meme pour un ecouteur pose
dans le monde principal. Les trois sorties sont branchees explicitement, avec un
verrou anti-double-comptage et un drapeau qui empeche de compter comme un refus
quelqu'un qui vient de s'inscrire depuis la pop-up.

Et l'affichage n'etait pas verifie : on comptait juste apres l'appel a
`showModal()`, donc un affichage fantome sur tout moteur qui ne l'implemente pas.
Seul `dlg.open` prouve qu'elle est ouverte.

## Ce qui n'envoie rien

`localhost` et les previews `*.vercel.app` sont filtres a la source
(`ANALYTICS_HOSTS`). Le projet Ouros a pris le chemin inverse — capturer tout,
puis filtrer `$host` dans chaque insight — et il suffit d'un insight qui oublie
le filtre pour que le chiffre soit faux sans que rien ne le signale.
