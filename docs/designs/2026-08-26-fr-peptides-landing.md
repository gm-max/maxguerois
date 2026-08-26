---
title: Landing dédiée /fr/peptides pour le funnel Instagram
date: 2026-08-26
status: approved, not implemented
branch: feat/supabase-capture
---

# Landing /fr/peptides

Page dédiée pour le trafic Instagram peptides. Un seul job : faire entrer un email.
**Conçue à 390 px d'abord.** Le desktop est un élargissement, pas l'inverse.

**`/newsletter` et `/fr/newsletter` ne sont pas touchés.** Ils restent le blog et son
archive. La landing est une page neuve, à une URL neuve.

## Les deux virages du 26/08

**Virage 1, le périmètre.** La version initiale refondait `/fr/newsletter` en landing.
Deux objections l'ont fait tomber : la page se lisait comme un média et non comme un
blog perso (le H1 nommait le sujet, la bio arrivait en cinquième position), et une même
page ne peut pas être à la fois le blog et son tunnel. Deux pages distinctes suppriment
l'arbitrage : l'archive reste sur le blog, la conversion vit sur la landing.

**Virage 2, la sobriété.** La v1 de la landing empilait trois preuves, une section
meetups avec photo pleine largeur, et une accroche construite sur Bryan Johnson. Trois
corrections : Bryan Johnson est trop stigmatisé en France pour servir de porte
d'entrée, Zero Club sort, et les meetups ne méritent pas une section. La page perd un
écran entier et gagne en crédibilité française.

## Décisions

| # | Décision | Motif |
|---|---|---|
| 1 | La page d'abord, le numéro de lundi ensuite | choix de Max, contre ma recommandation inverse |
| 2 | Contenu en **français**, funnel FR de bout en bout | le seul canal d'acquisition actif est FR |
| 3 | ~~Structure B~~ **remplacée par D12** | lisait comme un média |
| 4 | Guide **gated** : décrit sur la page, envoyé dans le premier email | l'inscription est la seule porte |
| 5 | **Formulaire natif**, plus d'iframe | l'élément central de la page doit être contrôlable |
| 6 | Cadence **hebdo, lundi** | promesse déjà live dans ManyChat depuis le 25/08 |
| 7 | Registre : **vouvoiement** | verrouillé le 17/08. **Déjà appliqué** à tout le FR par `e070d8c` |
| 8 | ~~Nom : « L'actu peptides »~~ **abandonné** | nom de média |
| 9 | ~~Lien ManyChat → `/fr/newsletter`~~ **à repointer sur `/fr/peptides`** | sinon le trafic IG atterrit sur l'archive |
| 10 | ~~Capture Supabase, envoi **beehiiv**~~ **remplacé par D19** | tranché le 26/08 |
| 11 | **Page dédiée `/fr/peptides`**, `/newsletter` et `/fr/newsletter` intacts | supprime l'arbitrage archive contre conversion |
| 12 | **Structure : la personne d'abord** | remplace D3 |
| 13 | **Aucune mention d'Ouros Lab**, nulle part | marques étanches |
| 14 | Landing **indexée**, meta différenciées de `/fr/newsletter` | le trafic organique perdu serait réel |
| 15 | Succès : **le formulaire se remplace sur place**, pas de page `/merci` | pas de rechargement au moment le plus fragile |
| **16** | **Mobile-first, largeur de référence 390 px** | le trafic vient d'Instagram, donc du téléphone. Le desktop est le cas secondaire |
| **17** | **Les channels restent secrets.** Aucune mention sur la page | WhatsApp arrive plus tard. Une seule ligne est pré-réservée pour ce jour-là |
| **18** | **La newsletter est la promesse.** Les channels seront un bonus, pas l'accroche | ce que Max maîtrise entièrement est ce qu'il peut promettre |
| **19** | **Resend remplace beehiiv partout.** Envoi ET diffusion | plus qu'un fournisseur d'email sur le compte |
| **20** | **Bryan Johnson, le Daily Mail, Zero Club et « cobaye » sortent.** Deux preuves seulement | Bryan Johnson est trop critiqué en France pour ouvrir une page de confiance |
| **21** | ~~Pas de section meetups~~ **absorbé par D24** | les rencontres reviennent, à l'intérieur de la mission |
| **22** | **Photo réelle en bandeau** `max-peptides-hero.jpg`, plus de portrait vignette | une scène vaut mieux qu'un portrait d'identité, et elle porte la chaleur du site |
| **23** | **Nouvelle structure** : Pourquoi moi → Ma mission → La newsletter → le guide en clôture | l'ancienne enchaînait quatre blocs sans jamais dire ce qu'on construit |
| **24** | **Bloc MA MISSION**, neuf | c'est lui qui transforme une newsletter en projet. Il porte la cartographie des peptides, la communauté et les rencontres |
| **25** | **Le guide passe en clôture ET en pop-up**, il n'est plus une section au milieu | il redevient une incitation, pas un item de sommaire |
| **26** | **« La newsletter peptides »**, plus « la lettre du lundi » | le nom doit dire ce que c'est, en français simple |
| **27** | ~~Nombres comptés en lettres~~ **annulé le 26/08 : tout en chiffres** | « 2 ans », « 2021 », « 12 peptides », « 6 signaux », « 1 000 » |
| **28** | **Échelle typo verrouillée, deux familles** | la v2 en étalait douze, ce qui cassait le système |
| **29** | **Héros collectif** : « On explore les peptides ensemble » | l'ancien héros vendait l'auto-expérimentation et une newsletter, ni l'un ni l'autre n'est la mission |
| **30** | **Le vrai footer du site**, pas `HeroFooter` | `HeroFooter` est un dock `position: fixed` qui s'efface au scroll, et son usage supprime le footer réel |
| **31** | **Bloc mission aéré** : 4 phrases, 48 px d'écart, 3 surlignages | c'était un pavé de deux paragraphes |
| **32** | **Pop-up sans couverture de guide** | l'image alourdissait une modale qui doit s'ouvrir instantanément |
| **33** | **État succès en une phrase** | le message précédent en faisait trois |
| **34** | **Eyebrow « Max Guérois · Newsletter peptides »** dans le héros | correction Codex, hard rejection n°2 : belle image, marque faible. Le produit n'était nommé nulle part dans le premier écran |
| **35** | **La newsletter passe AVANT la mission** | Codex : l'offre doit atterrir avant la vision, sur du trafic froid |
| **36** | **Photo en 3/2, plus 4/3** | Codex : réduire la dominance de l'image, rendre de la place au texte |
| **37** | **Preuve sans négation** : « j'ai aidé des milliers de personnes, en collaboration avec des médecins » | « pas avec des influenceurs » sonnait IA, « construit des produits de santé » sonnait vente |
| **38** | **« Je teste sur ma santé, first »** | franglais assumé, plus direct que « je teste avant d'écrire » |
| **39** | **Les 3 articles disent ce que le lecteur y gagne**, plus une catégorie | un titre seul n'explique pas en quoi l'article aide |
| **40** | **La relation newsletter / guide énoncée une seule fois**, dans le bloc guide | Codex : deux offres dont le lien n'est pas dit créent de l'hésitation au formulaire |
| **41** | **Bouton accent en `#1a1a1a` sur TOUT le site**, entré dans `DESIGN.md` | tranché le 26/08. `#fff` échouait AA dans les deux thèmes, sur tous les CTA du site |
| **42** | **Le surlignage entre dans la charte** comme composant Text Highlight | tranché le 26/08. Réutilise `--accent-light`, aucun token nouveau, plafonné à 3 par section |
| **43** | **La preuve Lucis reste telle quelle**, volume compris | tranché le 26/08, en connaissance de la contrainte `legal.md` |
| **44** | **Lignes d'articles aérées** : titre, utilité, date, chacun sur sa ligne | la date collée à l'utilité rendait la ligne illisible |
| **45** | **La sortie de beehiiv est traitée par un autre agent** | hors périmètre de ce plan, mais crée un risque de collision, voir la section dédiée |
| **46** | **Un 3ᵉ formulaire, sous la section newsletter** | tranché le 26/08. Pic d'intention : le lecteur vient de lire les 3 choses qu'il recevra. Aucune autre réorganisation |
| **47** | **Padding mobile corrigé et appliqué** : `22px` → `--sp-6`, `100px` → `--sp-20`. Le haut reste 80px | tranché ET livré le 26/08. Les 80px du haut sont du dégagement de navbar, pas du vide |

## Structure retenue

Authored à 390 px. Sept blocs, un job chacun.

```
  ── 390 px ────────────────────────────────────
  1 · HÉROS                     premier écran, entier
      PHOTO 3/2 pleine largeur, max-peptides-hero.jpg
      eyebrow       MAX GUÉROIS · NEWSLETTER PEPTIDES
      H1            Je teste les peptides sur moi,
                    et je documente tout.
      sub           1 phrase
      label + INPUT 48px + BOUTON 48px, empilés
      micro         gratuit · désinscription

  2 · POURQUOI MOI              2 lignes en filets 1px
      Entrepreneur depuis 2021 · Je teste avant d'écrire
      ENCADRÉ       je ne vends aucun peptide

  3 · LA NEWSLETTER PEPTIDES    liste 1-2-3 + FORM (D46)
      l'offre atterrit avant la vision (D35, Codex)

  4 · MA MISSION                cartographier · la communauté
      · les rencontres. Dernier argument avant le formulaire

  5 · LE GUIDE, EN CLÔTURE      titre + 1 phrase + FORM
      « Recevez le guide des peptides, gratuitement »

  6 · DÉJÀ PUBLIÉ ICI           3 articles, liste texte

  7 · FOOTER DU SITE           Layout.astro, rendu par défaut

  + POP-UP GUIDE                coquille SubscribeModal
```

**Ce qui change au-dessus de 600 px, et rien d'autre :** colonne 620 px centrée,
H1 38 → 52 px, photo en 16/9 au lieu de 3/2, input et bouton sur une ligne (max
480 px), interstices 64 → 80 px.

**Pourquoi le héros a changé (D29).** L'ancien titre disait deux choses, « je
m'auto-expérimente » et « il y a une newsletter ». Ni l'une ni l'autre n'est la
mission. Un inconnu déduisait « un type qui se pique et raconte », plus petit que ce
que vous faites. Le titre collectif place le projet ; la photo et le nom, juste
au-dessus, portent déjà la personne.

**Ce que le sous-titre ne dit PAS, volontairement.** L'option retenue proposait
« vous partagez ce que vous testez ». Écarté : tant que les channels restent secrets
(D17), il n'existe aucun endroit où partager, donc la phrase promet une réciprocité
qui n'a pas lieu. Le sous-titre livre la substance à la place, et « ensemble » suffit
à porter le collectif.

**Pourquoi la mission est le bloc décisif.** L'ancienne structure enchaînait pourquoi
moi, la lettre, le guide, on commence lundi, déjà publié. Quatre blocs qui décrivent
un produit et zéro qui dit ce qu'on construit. Le bloc mission répond à la seule
question qui donne envie de rester : qu'est-ce que je rejoins, au juste. Il porte à la
fois la cartographie des peptides, la communauté qui explore avec vous, et les
rencontres, sans donner à ces dernières une section à elles.

**Comment le bloc mission respire (D31).** Il ne compte plus qu'une idée par ligne,
avec 48 px (`--sp-12`) entre chacune, et trois surlignages en `--accent-light` sur
« Molécule par molécule », « Et je ne veux pas le faire seul » et « en vrai ». Les
deux paragraphes précédents disaient la même chose en deux pavés que personne ne lit
sur un téléphone. Le surlignage réutilise un token existant, il n'introduit pas de
couleur.

**Pourquoi le guide sort du milieu.** Une section guide au milieu de la page le
transformait en item de sommaire, à côté de la newsletter. En clôture, il redevient ce
qu'il est : la raison de donner son email maintenant. Et en pop-up, il attrape ceux
qui ont scrollé sans se décider.

**Pourquoi le bloc 6 est après le formulaire.** Ce sont des liens sortants. Ils
prouvent que le blog existe, mais chaque clic est un visiteur qui part sans son email.
Liste texte sans vignette.

**Ce qui n'entre pas.** Aucun numéro de newsletter affiché : les trois vrais sont en
anglais, hors sujet, le dernier du 16 juillet. Le bloc 6 montre des **articles**, qui
existent, en français, datés honnêtement.

### Le pied de page (D30)

`HeroFooter.astro` **n'est pas un pied de page.** C'est `position: fixed` sans media
query, une barre collée au bas du viewport qui s'efface dès `scrollY > 8`. Elle est
faite pour une page dont le premier écran EST la page, comme `/fr/newsletter`. Et les
pages qui l'utilisent passent `hideFooter` au `Layout`, ce qui **supprime le footer
réel**.

Sur une landing qui scrolle sur six blocs, l'utiliser donnerait une barre flottante
qui disparaît au premier geste, et rien du tout en bas de page.

Le bon choix est le footer déjà présent dans `Layout.astro:188` : réseaux, lien
Newsletter, bascule de langue, bascule de thème, copyright. Il se rend par défaut.
**Il suffit de ne rien passer.** Zéro ligne de code.

Les maquettes v2 et v3 dessinaient HeroFooter en bloc statique en fin de page. Ce
composant ne fait pas ça, c'était une erreur de ma part.

### La photo (D22)

`public/health-journey/max-peptides-hero.jpg`, recadrée en 3/2 depuis l'original carré,
1100 px de large, 139 ko. Elle passe en bandeau pleine largeur au-dessus du titre, pas
en vignette latérale.

Deux raisons. C'est une **scène**, pas un portrait d'identité : vous en conversation,
détendu, dans une pièce chaude. Un recadrage serré sur le visage jetait exactement ce
qui la rend crédible. Et ses tons — le fauteuil terre cuite, le rideau écru — tombent
sur la palette de DESIGN.md sans retouche, ce qui est rare et qu'il serait dommage de
gâcher.

**Elle vit dans `public/`, pas sur un CDN externe.** `npm run build` lance
`scripts/check-csp-img-src.mjs`, qui casse le build si un `<img>` pointe un hôte absent
de la CSP. Un asset local évite d'élargir la CSP pour une seule image.

### La ligne réservée aux channels (D17 + D18)

D18 dit « la lettre d'abord, les channels en bonus ». D17 dit « les channels restent
secrets ». Les deux se réconcilient ainsi : **la page ne mentionne pas les channels du
tout.** La dernière phrase du bloc mission est aujourd'hui « On se retrouvera aussi en
vrai. » Le jour du lancement WhatsApp, elle devient le lien vers les channels. Un seul
endroit à toucher, aucune restructuration.

### Maquette

`~/.gstack/projects/gm-max-maxguerois/designs/fr-newsletter-personne-dabord-20260826/sketch-v7-mobile.html`

HTML réel à 390 px, tokens et polices de DESIGN.md, photo réelle. Porte aussi la
pop-up guide, l'état succès, et l'échelle typo en entier.

Les v1 à v6 sont conservées comme trace des virages, elles ne sont plus la référence.

## Copy retenue

| Bloc | Texte |
|---|---|
| label | MAX GUÉROIS |
| eyebrow | Max Guérois · **Newsletter peptides** (« Newsletter peptides » en ambre) |
| H1 | On explore les peptides *ensemble*. (italique ambre) |
| sub | Ce qui est prouvé, ce qui ne l'est pas, et ce que le marché raconte à côté. |
| label champ | Votre email (visible, pas un placeholder) |
| bouton | **S'inscrire à la newsletter du lundi** |
| micro | Gratuit. Désinscription en un clic. |
| H2 §2 | Entrepreneur, et je teste sur ma santé first. |
| preuve 1 | **Entrepreneur depuis 2021.** La dernière, dans la santé : Lucis, que j'ai cofondée. J'ai aidé des milliers de personnes, en collaboration avec des médecins. |
| preuve 2 | **Je teste sur ma santé, first.** 2 ans que je publie mes analyses, mes protocoles et mes résultats en public. Y compris ceux qui n'ont rien donné. |
| encadré | *À savoir* — Je ne vends aucun peptide. Aucun partenariat vendeur, aucun code promo, aucune commission. |
| H2 §3 | Cartographier les peptides. |
| §3 texte | *Molécule par molécule.* (surligné) / Je publie au fur et à mesure, sans attendre d'avoir la réponse complète. / *Et je ne veux pas le faire seul.* (surligné) / On est 1 000 à explorer en même temps. On se retrouvera aussi *en vrai* (surligné). |
| H2 §4 | La newsletter peptides, chaque lundi. |
| §4 items | 1. **Une étude de la semaine.** Ce qu'elle prouve, et ce qu'elle ne prouve pas. 2. **Un peptide décrypté.** Ce qu'il fait, pour qui, ce qu'il coûte. 3. **Une alerte marché.** Un vendeur ou une pratique à connaître avant de commander. |
| H2 §5 | Recevez le guide des peptides, gratuitement. |
| §5 texte | 12 peptides passés en revue. 6 signaux qui trahissent un vendeur douteux. Il arrive dans le premier email. |
| pop-up | *Le guide des peptides, offert.* 12 peptides passés en revue. 6 signaux qui trahissent un vendeur douteux. Bouton : **S'inscrire à la newsletter du lundi**, identique aux deux autres. **Aucune image** |
| succès | C'est fait. Le guide arrive, pensez aux spams. |
| article 1 | **J'ai testé le retatrutide** / Les effets réels d'un peptide de perte de poids, mesurés sur moi. / Peptides · 16 juillet 2026 |
| article 2 | **Je prends 11 compléments par jour** / À quoi sert chacun, un par un. / Protocole · 9 avril 2026 |
| article 3 | **Mes biomarqueurs, bilan complet** / Quels tests santé je fais, chez qui, et ce qu'ils m'ont appris. / Bilan de santé · 8 mai 2026 |

Les trois lignes de chaque article sont sur **trois lignes distinctes** : titre en
Cormorant 16, utilité en 13 secondaire, catégorie et date en 13 tertiaire. Espacement
vertical de la ligne porté de 16 à 24 px. Une utilité collée à sa date sur la même
ligne se lit comme une seule phrase bancale.

**Le compte de startups a sauté.** « Trois startups depuis 2021 » comptait Zero Club et
Lucis séparément alors qu'ils se recoupent, donc le chiffre était faux ou au mieux
discutable. Un chiffre discutable sur une page de confiance coûte plus qu'il ne
rapporte. « Entrepreneur depuis 2021 » dit la même chose et ne se
conteste pas.

**L'encadré (D5 de cette passe).** « Je ne vends aucun peptide » était un paragraphe
noyé en fin de bloc. C'est maintenant le composant Callout Box de DESIGN.md : bordure,
`radius-lg`, pas de remplissage, label ambre « À savoir ». Sur un marché où tout le
monde touche une commission vendeur, c'est le seul argument que la concurrence ne peut
pas copier sans mentir : il mérite un cadre, pas une ligne.

**Tous les nombres restent en chiffres (D27, annulée puis inversée).** 2 ans, 2021,
12 peptides, 6 signaux, 11 compléments, 1 000 lecteurs. Sur une page qui promet de la
rigueur, un chiffre se lit et se compare ; écrit en toutes lettres il se survole.

**Ce qui a été retiré, et pourquoi.** Bryan Johnson et le Daily Mail : trop stigmatisé
en France, ouvrir une page de confiance là-dessus coûte plus qu'il ne rapporte. Zero
Club : hors sujet peptides, et il faisait double emploi avec Lucis dans le décompte.
« Passer par la case cobaye » : la formule se retourne contre l'auteur. « La lettre du
lundi » : un nom qui n'explique pas ce que c'est. La section meetups et sa photo : les
rencontres tiennent maintenant en une phrase, à l'intérieur de la mission.

## États d'interaction

Ce que le visiteur **voit**, pas ce que le serveur fait.

| État | Ce qui s'affiche | Détail |
|---|---|---|
| repos | `<label>` « Votre email » visible au-dessus, input vide, bouton ambre actif | jamais de placeholder-as-label |
| saisie invalide | bordure input → `--accent`, message 13px sous le champ : « Cet email n'a pas l'air valide. » | validation au `blur`, jamais à chaque frappe |
| envoi | bouton désactivé, texte → « Une seconde… », `aria-busy="true"` | pas de spinner, pas de skeleton |
| succès | **le bloc formulaire entier est remplacé** par UNE phrase : « C'est fait. Le guide arrive, pensez aux spams. » Focus déplacé dessus, `role="status"`. Idem dans la pop-up | l'instruction spam arrive là où elle sert, elle protège la délivrabilité du seul email qui porte le guide |
| déjà inscrit | message de succès, mot à mot | ne jamais révéler qu'un email est en base |
| erreur serveur | « Ça n'a pas marché de notre côté. Réessayez, ou écrivez-moi à hi@maxguerois.com. » Formulaire et valeur saisie conservés | ne jamais vider le champ sur erreur |
| rate-limit | même message qu'erreur serveur | ne pas expliquer la limite, ça donne la carte au robot |
| JS désactivé | le `<form>` poste en natif vers `/api/subscribe`, qui redirige vers `/fr/peptides?ok=1` | la route gère déjà ce cas, il faut juste ajouter l'entrée dans `RETURN_PATHS` |

**Champ email mobile :** `type="email"` + `inputmode="email"` + `autocomplete="email"`
+ `autocapitalize="off"` + `spellcheck="false"`. Sans ça, iOS met une majuscule au
premier caractère et souligne l'adresse en rouge.

**`font-size: 16px` sur l'input, non négociable.** En dessous, Safari iOS zoome
automatiquement au focus et le visiteur se retrouve avec une page décalée à recadrer
à la main, au moment exact où il tape son email.

## Parcours et arc émotionnel

| # | Le visiteur fait | Ce qu'il ressent | Ce qui le soutient |
|---|---|---|---|
| 1 | clique le lien du DM ManyChat, sur son téléphone | méfiance par défaut | un visage et un prénom en premier |
| 2 | lit le H1 | « ok, ce type le fait sur lui » | première personne, verbe d'action |
| 3 | voit le formulaire, sans avoir scrollé | hésitation : mon email pour quoi | la micro-ligne dit gratuit, réversible, et ce qui arrive tout de suite |
| 4 | scrolle vers les preuves | cherche la faille | deux preuves, dont une cliquable |
| 5 | lit la ligne de posture | soulagement, ce n'est pas un vendeur déguisé | la seule promesse incopiable |
| 6 | s'inscrit | engagement | confirmation immédiate, instruction spam, date précise |
| 7 | reçoit le guide dans la minute | vérification que la promesse tient | envoi transactionnel Resend, pas le lundi |

**Les trois horizons.** À 5 secondes, un visage et une phrase à la première personne.
À 5 minutes, les deux preuves et la posture décident. À 5 ans, la communauté fait
rester — et c'est précisément pour ça que la ligne du bloc 3 est réservée, même si
elle ne dit encore rien.

**Le guide part immédiatement, pas lundi.** Quelqu'un qui s'inscrit un jeudi doit
recevoir quelque chose le jeudi. C'est un envoi transactionnel Resend au moment de
l'inscription ; la lettre hebdo est une diffusion séparée.

## Mobile-first

La colonne de référence est 390 px. Tout est écrit pour elle, les media queries
n'ajoutent que l'élargissement.

| | < 600 px (référence) | ≥ 600 px |
|---|---|---|
| colonne | pleine largeur, gouttières 22px | 620px centrée |
| héros | **portrait au-dessus du titre** | portrait à gauche |
| H1 | 38px | 52px |
| formulaire | **empilé**, input et bouton pleine largeur, 48px de haut | une ligne, max 480px |
| guide | couverture au-dessus du texte | couverture à gauche |
| bloc 6 | date sous le titre | titre à gauche, date à droite |
| interstices | 64px (`--sp-16`) | 80px (`--sp-20`) |

**Hauteurs à 48 px, pas 44.** 44 px est le minimum d'accessibilité ; sur un
formulaire qui EST la page, 48 px est la bonne valeur. Le pouce ne rate pas.

**Le premier écran doit tenir le formulaire entier sur un iPhone SE (375×667).**
Budget vertical : portrait 112 + label 16 + H1 ~82 + sub ~44 + label champ 28 +
input 48 + bouton 48 + micro ~36 ≈ 414 px hors marges. Ça passe. C'est la contrainte
qui a dicté la taille du portrait, pas l'esthétique.

**`100dvh`, pas `100vh`.** La page d'accueil utilise déjà `dvh` ; le reproduire ici,
sinon la barre d'URL mobile rogne le bas du héros.

## Accessibilité

- **Labels visibles.** `<label for>` au-dessus de chaque input.
- **Cibles tactiles 48×48.** Input, bouton, et les trois liens d'article avec un
  padding vertical de 16 px.
- **Contraste, mesuré :**

  | Combinaison | Ratio | AA (4,5:1) |
  |---|---|---|
  | `#fff` sur `#c4934a` (clair) | **2,76:1** | échoue |
  | `#1a1a1a` sur `#c4934a` (clair) | **6,31:1** | passe |
  | `#fff` sur `#d4a55e` (sombre) | **2,25:1** | échoue |
  | `#1a1a1a` sur `#d4a55e` (sombre) | **7,74:1** | passe |

  La maquette v2 utilise `#1a1a1a` sur le bouton. **Ce défaut n'est pas propre à cette
  page :** DESIGN.md spécifie le bouton Accent comme `background: var(--accent);
  color: #fff`, utilisé par tous les CTA newsletter du site. Le périmètre de la
  correction est la seule décision non tranchée de ce plan.
- **Focus.** `:focus-visible`, contour `--accent`, offset 2px.
- **Annonce du succès.** `role="status"` + focus déplacé, sinon un lecteur d'écran ne
  saura jamais que l'inscription a fonctionné.
- **Erreurs.** `aria-describedby` vers le message, `aria-invalid="true"` sur le champ.
- **Mouvement réduit.** `prefers-reduced-motion: reduce` désactive `fadeUp`.
- **Portrait.** `alt="Max Guérois"`, `width`/`height` explicites pour réserver la
  place et éviter le décalage au chargement, ce qui compte double sur mobile.

## Conformité DESIGN.md

| Règle | Statut |
|---|---|
| Cormorant Garamond display, DM Sans body | respecté |
| Colonne unique 620px | respecté au-dessus de 600px |
| Ambre parcimonieux | respecté : italique du H1, bouton, chiffres de liste |
| Pas de grille de cartes | respecté, filets 1px |
| Pas de rangée 3 colonnes | respecté |
| Pas de dégradé | respecté |
| Tokens `--sp-*`, `--duration-*`, `--ease-out` | aucune valeur en dur à l'implémentation |
| Cible tactile 44×44 | dépassé, 48×48 |
| Contraste AA | **une exception**, le bouton accent, voir ci-dessus |
| Footer du site réutilisé | respecté, `Layout.astro:188` rendu par défaut, `HeroFooter` volontairement PAS utilisé |

### Échelle typo verrouillée (D28)

La v2 étalait douze tailles différentes. C'est le défaut que vous avez repéré : deux
familles bien choisies ne suffisent pas si on invente une taille par bloc. La page est
ramenée à **cinq pas, deux familles**, et chaque pas existe déjà dans DESIGN.md.

| Pas | Taille | Famille | Usage |
|---|---|---|---|
| H1 | 38px mobile / 52px desktop | Cormorant 300 | titre de page, une seule occurrence |
| H2 | 24px | Cormorant 400 | titre de section, et les chiffres de la liste 1-2-3 |
| Item | 16px | Cormorant 500 | titres de ligne : preuves ET articles |
| Body | 16px | DM Sans 400 | texte courant |
| Callout | 14px | DM Sans 400 | corps de l'encadré, **spec DESIGN.md** |
| Micro | 13px | DM Sans 400 | mentions, dates, descriptions de ligne |
| Label | 12px | DM Sans 500 caps | labels de section, labels de champ |

**`--t-body` ne peut pas descendre sous 16 px.** L'input du formulaire utilise ce pas,
et Safari iOS zoome automatiquement sur tout champ dont le texte fait moins de 16 px.
Un jour où quelqu'un trouvera le corps « un peu gros », c'est la page entière qui
sautera au focus sur iPhone. Contrainte, pas préférence.

**Le gain n'est pas cosmétique.** Les titres de preuve et les titres d'article
partagent maintenant **un seul composant**, celui déjà spécifié dans DESIGN.md sous
« Writing Item » (Cormorant 16px + méta 11-13px tertiaire). Il n'y a donc plus aucun
nouveau composant à documenter : le besoin est couvert par le vocabulaire existant,
simplement sans l'encapsulation en carte.

**La déviation de la v3 est annulée.** L'encadré utilisait un corps 16px pour tenir
en cinq pas ; c'était trop gros et hors charte. Il revient à la spec DESIGN.md :
label 12 tertiaire, corps 14 secondaire, bordure neutre et non ambre. Six pas au lieu
de cinq, mais tous conformes. La charte gagne contre l'élégance du compte rond.

**Violation existante hors périmètre :** `/fr/newsletter` et `/newsletter` affichent
leur archive en grille de cartes à vignettes 16/9, ce que DESIGN.md interdit. Ces
pages ne sont pas modifiées (D11). Signalé, pas corrigé.

## Architecture de capture et d'envoi (D19)

Resend est le seul fournisseur d'email. beehiiv sort entièrement.

```
  <form> natif  →  POST /api/subscribe  (route Astro, SSR)
                     1. valide + honeypot + rate-limit par IP
                     2. upsert Supabase         ← source de vérité, bloquant
                     3. Resend: email de bienvenue + guide  ← awaité, timeout
                     4. 200

  Lundi          →  Resend Broadcast
                     audience construite depuis Supabase avant chaque envoi
```

**Supabase reste la source de vérité.** Une panne Resend ne doit jamais faire échouer
une inscription : l'email est déjà chez nous, la synchro se rattrape via
`sync_error` + `synced_at` NULL, comme aujourd'hui.

**Un seul appel Resend sur le chemin chaud.** L'email de bienvenue, qui porte le
guide. La création du contact dans l'audience Resend n'est PAS faite à l'inscription :
elle se fait en lot depuis Supabase avant chaque diffusion du lundi. Deux raisons : un
appel de moins sur le chemin critique, donc un mode de panne de moins ; et l'audience
Resend se reconstruit toujours depuis la source de vérité, donc elle ne peut pas
diverger en silence.

**La cicatrice à ne pas rouvrir.** Dans `ouros-reddit-scam/app/api/subscribe/route.ts`,
les appels tiers ont d'abord été lancés sans `await` : le serverless détruit la
fonction dès la réponse renvoyée, ce qui a tué la requête en vol et perdu **5 ajouts
d'audience sur 20 et 13 emails de bienvenue sur 20**, au hasard et indépendamment.
Astro n'a pas d'équivalent de `after()`, donc la garantie ici vient de l'`await` avec
timeout, comme le fait déjà `pushToBeehiiv`. Ce contrat ne change pas, seul le
destinataire change.

### Ce que le passage à Resend coûte, honnêtement

**Le motif de D10 disparaît.** beehiiv avait été retenu pour une raison précise :
« l'éditeur beehiiv reste ce qui rend le lundi tenable ». Resend a un éditeur de
broadcast, mais il est nettement plus brut. **Écrire le numéro du lundi devient plus
coûteux qu'avec beehiiv.** C'est un vrai coût récurrent, assumé au profit d'un seul
fournisseur sur tout le compte. À revoir si le lundi commence à glisser.

**Ce qui se perd aussi :** les analytics d'ouverture et de clic par numéro que beehiiv
donne clés en main, la page d'archive hébergée, et la gestion du désabonnement livrée
avec l'embed. Le désabonnement devient à construire, et **c'est une obligation légale,
pas une option.**

### Le blocage n° 1 : aucun domaine `maxguerois.com` dans Resend

Vérifié le 26/08 sur le compte Resend : **un seul domaine vérifié, `ouroslab.co`.**

Envoyer la lettre peptides depuis `ouroslab.co` est exclu deux fois : ça violerait
D13 (aucune trace Ouros), et un domaine d'envoi qui ne correspond pas à la marque
détruit la confiance et la délivrabilité.

`maxguerois.com` doit donc être ajouté et vérifié dans Resend : enregistrements DKIM,
SPF, et un DMARC. **Ça demande une intervention DNS et de la propagation**, donc ça ne
se fait pas la veille du premier lundi. C'est le prérequis le plus long du plan et il
n'est pas commencé.

### beehiiv vit ailleurs sur le site

Sortir beehiiv de la landing ne suffit pas. Il est aussi dans :

- `src/components/NewsletterEmbed.astro` — l'iframe, sur la page d'accueil, les deux
  index newsletter et **le pied de chaque article**
- `src/components/SubscribeModal.astro` — la modale, sur toutes les pages sauf `/404`
- `src/layouts/Layout.astro:166-167` — `preconnect` et `dns-prefetch`
- `src/pages/api/subscribe.ts` — `pushToBeehiiv`, `BEEHIIV_TIMEOUT_MS`, et un
  commentaire qui dit « beehiiv is the real validator downstream »

**Décider maintenant, sinon le site aura deux fournisseurs en parallèle :** soit la
landing seule passe à Resend et le reste du site continue d'alimenter beehiiv, soit
l'embed et la modale sont remplacés par le même `<form>` natif partout. Ce n'est pas
tranché, et c'est plus gros que cette page.

### État de la route, vérifié le 26/08

`src/pages/api/subscribe.ts` est déjà plus avancée que ce document ne le décrivait.
Sont **déjà en place** : tables `mg_subscribers` et `mg_rate_limit_hits`, hash d'IP
salé (`IP_HASH_SALT`), rate-limit sur les tentatives et non sur les lignes stockées,
fail-open assumé et journalisé, honeypot répondant 200, bornage de tous les champs,
whitelist `RETURN_PATHS` contre l'open-redirect, upsert qui efface `unsubscribed_at`
au ré-abonnement.

**À toucher :** `pushToBeehiiv` → `sendWelcomeResend`, et une entrée `/fr/peptides`
dans `RETURN_PATHS`. Le reste tient.

### Adapter Vercel, vérifié sur la preview le 26/08

L'adapter génère un `.vercel/output/config.json` sans aucun header de sécurité. La
question était de savoir si `vercel.json` s'applique encore une fois le build passé en
Build Output API. Mesuré sur `maxguerois-git-feat-supabase-capture` contre la prod :

| | prod | preview |
|---|---|---|
| `content-security-policy` | présent | présent, identique |
| `x-frame-options` | DENY | DENY |
| `referrer-policy` | strict-origin-when-cross-origin | idem |
| `permissions-policy` | camera=(), microphone=(), geolocation=() | idem |
| `cleanUrls` | actif | actif |

`vercel.json` continue de s'appliquer. Aucune régression.

Route testée sur la preview : email invalide → 400 `invalid_email` ; honeypot rempli
→ 200 silencieux. Les deux tables sont restées à 0 ligne.

**Pas encore testé :** le chemin nominal, qui demande les variables d'environnement.

## Ce qui existe déjà et doit être réutilisé

| Actif | Où | Usage sur la landing |
|---|---|---|
| Tokens, polices, dark mode | `src/styles/global.css` | tout, aucune valeur en dur |
| `Layout.astro` | `src/layouts/` | coquille, meta, OG |
| **Footer du site** | `src/layouts/Layout.astro:188` | **rendu par défaut**, il suffit de ne PAS passer `hideFooter` : réseaux, lien Newsletter, bascule de langue, thème, copyright. Zéro ligne à écrire |
| **`SubscribeModal.astro`** | `src/components/` | **coquille de la pop-up guide** : `<dialog>` natif, Escape, huit secondes de délai, une fois par visiteur (`localStorage.mg_email_modal_v1`), fermeture par `visibility` et non `display:none`. Tout ça est déjà résolu et douloureusement débogué. Seul le contenu change : l'iframe beehiiv sort, le `<form>` natif entre |
| Callout Box | DESIGN.md, Components | encadré « je ne vends aucun peptide » |
| Writing Item | DESIGN.md, Components | lignes de preuve et lignes d'article, sans la carte |
| **Photo** | `public/health-journey/max-peptides-hero.jpg` | bandeau du héros, recadrée 4/3, 1100 px, 155 ko |
| Route `/api/subscribe` | `src/pages/api/subscribe.ts` | déjà écrite et durcie |
| Lucis | section Work de `src/pages/fr/index.astro` | lien de la preuve 1 |
| Articles FR | `src/content/experiments/fr/*.json` | bloc 6 : retatrutide (16/07/26), supplements (09/04/26), max-biomarkers (08/05/26) |

**Volontairement non réutilisé :** `NewsletterEmbed.astro`, construit autour de
l'iframe beehiiv que D5 et D19 écartent. `SubscribeModal.astro` est en revanche repris :
seul son contenu est remplacé, sa mécanique est gardée.

## Hors périmètre

| Écarté | Pourquoi |
|---|---|
| Refonte de `/newsletter` et `/fr/newsletter` | D11 |
| Grille de cartes de ces deux pages, qui viole DESIGN.md | signalé seulement |
| Sortie de beehiiv sur le reste du site | plus gros que cette page, à trancher à part |
| Toute mention d'Ouros Lab | D13 |
| Toute mention des channels | D17, ils restent secrets |
| Section meetups, photo comprise | D21 |
| Page `/fr/peptides/merci` | D15 |
| Version EN de la landing | le seul canal actif est FR |
| Compteur d'inscrits en direct | « un millier » suffit |

## Prérequis avant implémentation

1. **Ajouter et vérifier `maxguerois.com` dans Resend** (DKIM, SPF, DMARC). Le plus
   long, non commencé, bloque tout envoi
2. Créer le projet Supabase `maxguerois` + tables `mg_subscribers` et
   `mg_rate_limit_hits` ; ajouter `@astrojs/vercel` ; poser `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `IP_HASH_SALT`, `RESEND_API_KEY` en variables Vercel
   (jamais `PUBLIC_`)
3. **Construire le désabonnement.** Obligation légale, et ce que beehiiv fournissait
   gratuitement
4. Supprimer les 2 abonnés de test dans beehiiv, à la main : `maximeguerois+beehiivtest@gmail.com`
   et `maximeguerois+utmtest@gmail.com`
5. Écrire le premier numéro
6. **Repointer le lien ManyChat sur `/fr/peptides`.** Bloquant
7. Produire la couverture du guide et le PDF du guide lui-même
8. ~~Passer le FR au vouvoiement~~ **fait**, commit `e070d8c`
9. ~~Vérifier l'endpoint beehiiv~~ **caduc**, D19

## Implementation Tasks

- [ ] **T1 (P1, human: ~30min / CC: —)** — infra — Vérifier `maxguerois.com` dans Resend
  - Surfacé par : un seul domaine vérifié sur le compte, `ouroslab.co`, interdit par D13
  - Vérifier : statut `verified`, et un email de test reçu hors spam
- [ ] **T2 (P1, human: ~3h / CC: ~25min)** — page — Créer `/fr/peptides`, sept blocs, authored à 390px
  - Surfacé par : D16, D22, D23, D24, D29, D31. **Ne PAS passer `hideFooter`** (D30), et ne pas importer `HeroFooter`
  - Fichiers : `src/pages/fr/peptides.astro`
  - Vérifier : maquette v3 et page rendue superposables à 390, 375, 768, 1280
- [ ] ~~**T3** — api — Remplacer `pushToBeehiiv` par Resend~~ **porté par l'autre agent (D45)**
  - Surfacé par : D19. Garder l'`await` + timeout, la cicatrice ouros-reddit-scam
  - Fichiers : `src/pages/api/subscribe.ts`
  - Vérifier : Supabase écrit même quand Resend échoue, `sync_error` renseigné
- [ ] **T4 (P1, human: ~5min / CC: ~2min)** — api — Ajouter `/fr/peptides` dans `RETURN_PATHS` — **à coordonner avec l'autre agent**
  - Surfacé par : le chemin sans JS renvoie aujourd'hui sur `/fr/newsletter`
  - Fichiers : `src/pages/api/subscribe.ts`
  - Vérifier : JS désactivé, soumettre, atterrir sur `/fr/peptides?ok=1`
- [ ] **T5 (P1, human: ~1h45 / CC: ~18min)** — formulaire — Les huit états d'interaction
  - Surfacé par : Pass 2, états 3/10. S'appliquent aux **3 formulaires en ligne** (D46) ET à la pop-up, donc 4 instances. Un composant unique, pas quatre copies
  - Fichiers : `src/pages/fr/peptides.astro`
  - Vérifier : chaque ligne du tableau États, JS désactivé compris
- [ ] ~~**T6** — légal — Construire le désabonnement~~ **porté par l'autre agent (D45)**, mais reste bloquant pour l'envoi
  - Surfacé par : D19, beehiiv le fournissait, Resend non. Obligation légale
  - Fichiers : nouvelle route + `mg_subscribers.unsubscribed_at`
  - Vérifier : un clic depuis un email réel repasse la ligne en `unsubscribed_at`
- [ ] **T7 (P1, human: ~45min / CC: ~10min)** — pop-up — Recontenir `SubscribeModal` sur le guide
  - Surfacé par : D25 + D32. Garder la mécanique (`<dialog>`, Escape, 8 secondes, une fois par visiteur, `visibility`), remplacer l'iframe beehiiv par le `<form>` natif, **sans couverture de guide**
  - Fichiers : `src/components/SubscribeModal.astro`
  - Vérifier : Escape ferme, une seule apparition, aucun décalage à l'ouverture
- [ ] **T8 (P1, human: ~10min / CC: ~2min)** — a11y — Bouton accent en `#1a1a1a`, **tout le site** (D41)
  - Surfacé par : `#fff` sur `#c4934a` = 2,76:1 et sur `#d4a55e` = 2,25:1
  - `DESIGN.md` **déjà mis à jour** le 26/08. Reste le CSS
  - Fichiers : `src/styles/global.css`
  - Vérifier : ≥ 4,5:1 en clair ET en sombre, sur tous les CTA du site
- [ ] **T9 (P2, human: ~20min / CC: ~5min)** — typo — Verrouiller l'échelle typo
  - Surfacé par : D28, la v2 étalait douze tailles. L'encadré revient au corps 14 de la charte
  - Fichiers : `src/pages/fr/peptides.astro`
  - Vérifier : aucune valeur en dur, toutes les tailles passent par les variables du tableau
- [ ] **T10 (P2, human: ~20min / CC: ~5min)** — mobile — Attributs du champ email
  - Surfacé par : `inputmode`, `autocomplete`, `autocapitalize`, et `font-size: 16px`
  - Vérifier : sur iPhone réel, aucun zoom au focus, aucune majuscule forcée
- [ ] **T11 (P2, human: ~20min / CC: ~5min)** — meta — Titres et descriptions différenciés
  - Surfacé par : D14
  - Fichiers : `src/pages/fr/peptides.astro`, `src/pages/sitemap.xml.ts`
- [ ] **T12 (P2, human: ~1h / CC: ~10min)** — envoi — Synchro Supabase → audience Resend
  - Surfacé par : D19, l'audience se reconstruit avant chaque lundi
  - Fichiers : `scripts/`
- [ ] **T13 (P2, human: ~10min / CC: ~3min)** — copy — Tous les nombres en chiffres
  - Surfacé par : D27, inversée le 26/08. 2 ans, 2021, 12 peptides, 6 signaux, 11 compléments, 1 000
  - Vérifier : aucun nombre écrit en toutes lettres
- [ ] **T15 (P2, human: ~30min / CC: ~10min)** — page — Sortir l'image du héros de `.container`
  - Surfacé par : l'audit des paddings. Dans `.container` elle hérite de 22px de gouttière et cesse d'être un bandeau
  - Fichiers : `src/pages/fr/peptides.astro`
  - Vérifier : l'image touche les deux bords à 375px comme à 1280px
- [x] ~~**T16** — design system — Aligner le padding mobile sur l'échelle~~ **fait le 26/08**, vérifié en navigateur à 375px sur 2 gabarits, build vert
- [ ] **T17 (P3, human: ~30min / CC: ~10min)** — dette — Supprimer le doublon `src/styles/global.css`
  - Surfacé par : les deux copies ont divergé, `public/` est la servie, `.ai-icon--square` n'a jamais été livrée
  - **Touche tout le site.** À faire quand le repo est calme
- [ ] **T14 (P3, human: ~2h / CC: —)** — asset — Guide : le PDF
  - Surfacé par : D4 et D25 rendent le guide bloquant. **Plus besoin de couverture** : ni la page ni la pop-up n'en affichent (D32)
  - Fichiers : `public/`

## Les trois formulaires (D46)

| Emplacement | Pour qui | Distance du précédent |
|---|---|---|
| Héros | celui qui arrive déjà convaincu par le DM Instagram | — |
| Sous la newsletter | pic d'intention : il vient de lire les 3 items du lundi | 2 sections |
| Clôture, bloc guide | rattrapage, avec l'incitation guide | 2 sections |

**Les trois portent le même libellé** — « S'inscrire à la newsletter du lundi » — et la
même micro-ligne. La pop-up aussi. Un libellé qui change d'un formulaire à l'autre est
ce qui fait douter le visiteur au moment de cliquer.

**Le lien entre les deux offres n'est dit qu'une seule fois**, en clôture : « Il arrive
dans le premier email. » C'est la correction demandée par Codex, et elle tient même
avec trois formulaires.

**Le formulaire de la newsletter est isolé** par un filet 1px et 48 px de marge haute.
Sans cette séparation, la liste 1-2-3 et le formulaire se collent, et la section donne
l'impression de se répéter au lieu d'enchaîner.

**Réserve conservée au dossier.** Trois formulaires en ligne sur une page mobile
restent trois. Le garde-fou est le libellé unique et l'espacement de deux sections ;
si la page s'allonge un jour, c'est le premier endroit où regarder.

## Le padding du conteneur, corrigé le 26/08

### Ce que l'audit avait mal lu

Le premier audit concluait que les 80 px de padding haut étaient du vide gaspillé,
« 12 % du premier écran d'un iPhone SE ». **C'était faux, et l'erreur aurait produit
une régression sur tout le site.**

`nav.css:6` déclare `.navbar { position: fixed; top: 0; height: 56px }`, et `body`
n'a **aucun `padding-top`**. Les 80 px de `.container` sont donc la seule chose qui
empêche le contenu de passer sous la navbar : **56 px de dégagement + 24 px de
respiration**. Les descendre à 32 px aurait glissé le contenu sous la barre, sur
chaque page du site.

Le gaspillage réel est de 24 px, pas 48, et il n'est pas gaspillé : c'est la
respiration.

### Ce qui a été corrigé

`public/styles/global.css:628` et `src/styles/global.css`, avec le commentaire qui
explique pourquoi le haut est intouchable :

```
- .container { padding: var(--sp-20) 22px 100px; }
+ .container { padding: var(--sp-20) var(--sp-6) var(--sp-20); }
```

| | Avant | Après | Sur l'échelle |
|---|---|---|---|
| haut | 80px (`--sp-20`) | 80px, inchangé | oui, et non négociable |
| horizontal | **22px en dur** | 24px (`--sp-6`) | oui |
| bas | **100px en dur** | 80px (`--sp-20`) | oui |

`DESIGN.md` est aligné : la ligne « Mobile padding: 22px » devient 24px, et une ligne
neuve documente que les 80 px du haut sont du dégagement de navbar. Entrée au Key
Decisions Log.

### Vérifié sur le site réel, pas sur une maquette

Serveur Astro local, viewport 375 px, mesures prises dans la page :

| | `/fr` | `/fr/newsletter/retatrutide` |
|---|---|---|
| padding calculé | `80 / 24 / 80 / 24` | `80 / 24 / 80 / 24` |
| bas de la navbar | y = 56 | y = 56 |
| haut du contenu | y = 92 | y = 80 |
| recouvrement navbar | **aucun** | **aucun** |
| bord gauche | 24 px | 24 px |
| débordement horizontal | non | non |

`npm run build` passe, garde CSP comprise.

### Deux trouvailles de bord

**1. `.claude/launch.json` était cassé.** Il pointait sur `scripts/dev.sh`, un fichier
qui n'existe pas ; le wrapper Node s'appelle `scripts/with-node.sh`. Corrigé.

**2. `src/styles/global.css` et `public/styles/global.css` ont divergé.** Le `Layout`
charge `/styles/global.css`, donc c'est la copie de `public/` qui part en production.
La copie de `src/` porte une règle de plus, `.ai-icon--square { border-radius: 0 }`,
qui **n'a donc jamais été livrée** : l'icône Grok de la page d'accueil garde ses coins
arrondis. Les deux fichiers ont reçu le correctif de padding pour ne pas aggraver la
dérive, mais **le doublon lui-même reste** et se remordra. Signalé, hors périmètre.

## Coordination avec l'implémentation Resend## Coordination avec l'implémentation Resend

Un autre agent implémente Resend en parallèle. Cette page partage avec lui quatre
fichiers, et deux sont des collisions probables :

| Fichier | Ce que ce plan veut y faire | Risque |
|---|---|---|
| `src/pages/api/subscribe.ts` | remplacer `pushToBeehiiv`, ajouter `/fr/peptides` à `RETURN_PATHS` | **élevé**, l'autre agent réécrit la même fonction |
| `src/components/SubscribeModal.astro` | recontenir sur le guide, sortir l'iframe | **élevé** |
| `src/components/NewsletterEmbed.astro` | rien, hors périmètre | faible |
| `src/styles/global.css` | bouton accent en `#1a1a1a` (D41) | moyen |

**Conséquence sur ce plan :** T3, T4 et T6 sortent du périmètre, l'autre agent les
porte. T7 (la pop-up) reste ici mais doit attendre que son travail ait atterri, sinon
les deux versions du `<form>` natif divergeront. Et D41 devrait être appliqué par
celui des deux qui touche `global.css` en premier.

## Passe Codex, 26/08

`codex exec`, modèle en effort élevé, lecture du plan et de la maquette v4.

**Hard rejection déclenchée : n°2, « belle image, marque faible ».** Verbatim : *« The
hero image is good, but the first screen does not make the product unmistakable fast
enough. The page feels editorial before it feels like a peptide newsletter landing
page. That breaks a cold Instagram funnel. »*

| Litmus | Verdict Codex |
|---|---|
| 1. Marque / produit reconnaissable au premier écran | **NON** |
| 2. Un ancrage visuel fort | OUI |
| 3. Page compréhensible en ne lisant que les titres | **NON** |
| 4. Un job par section | OUI |
| 5. Les cartes sont-elles nécessaires | OUI |
| 6. Le mouvement améliore-t-il la hiérarchie | **NON** (aucun mouvement spécifié) |
| 7. Premium sans les ombres décoratives | OUI |

**Corrections appliquées :** l'eyebrow qui nomme le produit (D34), la photo passée en
3/2 (D36), l'ordre newsletter avant mission (D35), et la relation newsletter / guide
énoncée une seule fois (D40).

**Non appliqué :** Codex note qu'aucun mouvement n'est spécifié. DESIGN.md définit
`fadeUp` et le stagger de 80 ms ; ils s'appliquent, ils n'étaient simplement pas écrits
dans le plan. À préciser à l'implémentation, pas une trouvaille de fond.

**Ce que Codex valide :** *« no SaaS-card sludge, no carousel, no busy text-over-image,
proper fonts, CSS variables, restrained boxed treatment. The problem is not taste. The
problem is first-screen clarity. »*

## Contrainte légale sur la preuve 1

`CLAUDE.md` renvoie à `max-ai/wiki/ventures/lucis/legal.md`, et ce document est
explicite : Max reste tenu par une **confidentialité sur les informations
financières, commerciales, stratégiques et administratives** de la société, plus une
obligation de non-dénigrement et de contrôle de la communication publique.

La phrase retenue — « j'ai aidé des milliers de personnes, en collaboration avec des
médecins » — est un **chiffre de volume opérationnel**. `CLAUDE.md` dit par ailleurs
« never publish exact Lucis ARR or operational volume figures », et « quand ces règles
entrent en conflit, le juridique gagne ».

Ce n'est pas un chiffre *exact*, et la phrase ne nomme pas Lucis directement. Mais la
ligne juste au-dessus le nomme, donc le lien se fait. **Deux replis prêts si vous
préférez ne pas prendre le risque :**

- « J'ai travaillé main dans la main avec des médecins, pendant 4 ans. » — aucun volume
- « Des milliers de personnes ont utilisé ce qu'on a construit. » — sans « j'ai aidé »,
  et sans rattachement direct à votre action

Le document note aussi, pour les profils publics : éviter toute formulation qui
impliquerait un rôle opérationnel actuel. Le passé composé retenu ici est conforme.

**C'est votre appel** : vous connaissez votre protocole mieux que le wiki. Écrit tel
que demandé, et signalé.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `codex exec` | Independent 2nd opinion | 1 | ISSUES_FOUND | hard rejection n°2, 3 litmus sur 7 en échec, 4 corrections appliquées |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | not run on this plan |
| Design Review | `/plan-design-review` | UI/UX gaps | 9 | ISSUES_FOUND | 7 dimensions sur 7, 4/10 → 9/10, 47 décisions, 5 virages, 1 passe Codex, `DESIGN.md` + `global.css` corrigés et vérifiés en navigateur |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**Scores par passe :**

| Passe | Avant | Après |
|---|---|---|
| 1 · Architecture de l'information | 4/10 | 9/10 |
| 2 · États d'interaction | 3/10 | 9/10 |
| 3 · Parcours et arc émotionnel | 5/10 | 9/10 |
| 4 · Risque de slop IA | 7/10 | 9/10 |
| 5 · Conformité DESIGN.md | 6/10 | 9/10 |
| 6 · Responsive et accessibilité | 2/10 | 9/10 |
| 7 · Décisions non tranchées | — | 42 résolues, 1 différée |

**VERDICT:** NOT CLEARED. La page est design-complete à 9/10, mobile-first, et sa
structure porte enfin un projet et non un produit. Quatre choses bloquent.

`maxguerois.com` n'existe pas dans Resend : le seul domaine vérifié du compte est
`ouroslab.co`, dont D13 interdit l'usage. Le désabonnement, que beehiiv fournissait
avec son embed, est à construire et c'est une obligation légale. beehiiv reste branché
sur le reste du site via `NewsletterEmbed` et les deux `preconnect` du `Layout`, donc
le site aura deux fournisseurs tant que ce n'est pas tranché. Et le bouton accent
échoue WCAG AA dans les deux modes.

L'Eng review n'a toujours pas tourné, alors que le plan ajoute un adapter SSR, une
route API et un fournisseur d'email à un site jusqu'ici entièrement statique.

**Ce que cette passe a fait entrer dans la charte.** Deux décisions quittent ce plan
pour `DESIGN.md`, où elles s'appliquent à tout le site : le bouton accent passe en
`#1a1a1a` (le `#fff` échouait AA dans les deux thèmes, sur chaque CTA du site), et le
surlignage devient le composant Text Highlight, plafonné à 3 par section. Les deux
sont au Key Decisions Log de `DESIGN.md`, datées du 26/08.

**Ce que la passe Codex a corrigé.** Le premier écran ne nommait le produit nulle
part : belle photo, marque absente. Un eyebrow « Max Guérois · Newsletter peptides »
règle la hard rejection sans toucher au titre que vous avez choisi. Et l'ordre des
sections a bougé : l'offre atterrit désormais avant la vision.

**Ce que la passe 5 a corrigé, et une erreur de ma part.** Le pied de page : mes
maquettes v2 et v3 dessinaient `HeroFooter` en bloc statique en fin de page. Ce
composant est un dock `position: fixed` qui s'efface au scroll, et l'utiliser
supprime le footer réel du site. Corrigé : `/fr/peptides` ne passe rien et hérite du
footer de `Layout.astro:188`. Zéro ligne de code.

Corrigé aussi : l'encadré revient au corps 14 de la charte, la mission passe de deux
pavés à 4 phrases espacées de 48 px, la pop-up perd sa couverture, l'état succès
passe de trois phrases à une, et tous les nombres redeviennent des chiffres.

**Coût assumé de D19, à ne pas oublier :** beehiiv avait été choisi parce que son
éditeur rendait le lundi tenable. Ce motif disparaît. Écrire le numéro devient plus
coûteux chaque semaine.

**Les quatre décisions ouvertes de la passe précédente sont tranchées** (26/08) :
bouton accent corrigé dans `DESIGN.md` pour tout le site, surlignage entré dans la
charte comme composant Text Highlight, sortie de beehiiv portée par un autre agent, et
la preuve Lucis reste telle quelle en connaissance de la contrainte.

**UNRESOLVED DECISIONS:**
- Doublon `src/styles/global.css` / `public/styles/global.css` : c'est la copie `public/` qui est servie, les deux ont déjà divergé d'une règle, et rien n'empêche que ça recommence. Supprimer l'une des deux touche tout le site, donc à décider quand le repo est calme
