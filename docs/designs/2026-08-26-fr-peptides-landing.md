---
title: Landing dédiée /fr/peptides pour le funnel Instagram
date: 2026-08-26
status: implemented, not launched
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
| **48** | **Héros en deux colonnes au-dessus de 900 px**, ancré sur la colonne du site | tranché le 26/08. En pleine largeur, la hauteur de l'image suit la LARGEUR du viewport : 720 px et 88 % du premier écran sur 1280 |
| **49** | **Cadence et preuve fondues dans la micro-ligne du héros** | « Un email chaque lundi. Rejoignez 1 000 lecteurs. » Le premier écran n'avait aucune preuve, et ne disait pas que c'était un email |
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

### Livré le 26/08

- [x] **T2** — `src/pages/fr/peptides.astro`, sept blocs, authored à 390px
- [x] **T4** — `RETURN_PATHS['fr-peptides'] = '/fr/peptides'`, les formulaires postent `?lang=fr-peptides`
- [x] **T5** — les huit états d'interaction, **un seul comportement** pour les 4 formulaires
- [x] **T7** — pop-up guide, `<dialog>` natif, 8 s, une fois par visiteur, sans image
- [x] **T8** — bouton accent en `#1a1a1a` dans `global.css` (les 2 copies), tout le site
- [x] **T9** — échelle typo verrouillée, aucune taille en dur dans la page
- [x] **T10** — `inputmode`, `autocomplete`, `autocapitalize`, `spellcheck`, corps ≥ 16px
- [x] **T11** — `<title>` et description différenciés, entrée sitemap priorité 0.9
- [x] **T15** — l'image sort de `.container`, pleine largeur mesurée à 375 et 1280
- [x] **T16** — padding mobile remis sur l'échelle

### Deux bugs trouvés en construisant, pas dans le plan

**1. L'image se rendait en 375×733 au lieu de 375×250.** Les attributs
`width="1100" height="733"` sont des dimensions présentationnelles : avec
`width: 100%` la boîte avait deux dimensions définies, donc `aspect-ratio` était
ignoré. **Le formulaire tombait à y=1099 sur un viewport de 812**, c'est-à-dire sous
la ligne de flottaison, ce que toute la conception de la page cherche à éviter.
Corrigé par `height: auto`, les attributs restent pour réserver la place.

**2. La navbar coupait la tête du sujet.** L'image démarrait à y=0 et la barre fixe
recouvre les 56 premiers pixels. Corrigé par `margin-top: var(--pep-nav-h)`, une
variable locale qui recopie `nav.css:12` avec le commentaire qui dit pourquoi.

Aucun des deux n'était visible dans la maquette HTML : ils n'existent que dans le
vrai gabarit, avec la vraie navbar et les vrais attributs d'image. C'est l'argument
pour vérifier dans le navigateur plutôt que dans un fichier de démonstration.

### Vérifié dans le navigateur, 26/08

| Contrôle | 375 px | Desktop |
|---|---|---|
| image | 375 px pleine largeur, 3/2, 250 px de haut | colonne droite, 4/5, 306×383, bord à bord à droite |
| formulaire au-dessus de la flottaison | **oui**, bouton à y=672 sur 812 | **oui**, micro-ligne à y=456 sur 820 |
| recouvrement navbar | aucun, image à y=56 | aucun |
| gouttière | 24 px | 24 px |
| alignement héros / sections | dérive 0 | dérive 0 |
| débordement horizontal | non | non |
| bouton accent | `rgb(26,26,26)` sur `rgb(196,147,74)` | idem |
| corps de l'input | 16 px, pas de zoom iOS | idem |
| formulaires | 4, un seul comportement | idem |
| footer | footer du site présent, `hero-dock` absent | idem |
| iframes beehiiv | **0** | 0 |
| email invalide | message + `aria-invalid` + `aria-describedby` | idem |
| correction de l'email | message effacé, `aria-invalid` retiré | idem |

`npm run build` vert, garde CSP comprise. `npm test` : 55 tests passent.

### Le héros, revu le 26/08 après mesure

**Le défaut.** Sur mobile le héros allait bien : image 250 px, bouton à y=672 sur 812.
Sur desktop il était cassé. L'image est pleine largeur, donc sa hauteur suit la
**largeur** du viewport : 250 px sur un téléphone, **720 px sur un 1280**, soit 88 %
du premier écran, et le bouton à y=1091, c'est-à-dire **271 px sous la ligne de
flottaison**. Un visiteur sur portable voyait un canapé et rien d'autre. Plus l'écran
est large, pire c'est. La maquette ne pouvait pas le montrer, elle était mobile.

**La correction (D48).** Au-dessus de 900 px, le héros passe en deux colonnes : texte
et formulaire à gauche, photo verticale 4/5 à droite, filant jusqu'au bord droit.

**Et un second défaut, trouvé en corrigeant le premier.** La grille centrée et la
colonne de 620 px centrée ne peuvent pas partager un bord gauche : **230 px de dérive
mesurés** entre le texte du héros et le label de la première section. Deux systèmes
d'alignement sur une même page se voient immédiatement. La grille est donc **ancrée**
sur le bord de `.container`, et sa colonne de texte reprend la largeur de *contenu*
(620 moins les deux paddings), pas la largeur de boîte — sans ce détail il restait
24 px de dérive.

| | avant | après |
|---|---|---|
| hauteur image, 1280 | 720 px | 383 px |
| part du premier écran | 88 % | 47 % |
| bas du formulaire, 1280 | y=1091, **sous le pli** | y=456, au-dessus |
| dérive d'alignement | 230 px | **0** |
| mobile 375 | image 250, bouton y=672 | inchangé |

**La preuve entre dans le premier écran (D49).** La micro-ligne du héros devient
« Un email chaque lundi. Rejoignez 1 000 lecteurs. Gratuit, désinscription en un
clic. » Elle règle deux manques d'un coup : le premier écran n'offrait aucune raison
de croire, et ne disait nulle part qu'il s'agissait d'un email hebdomadaire — « chaque
lundi » ne vivait que dans le libellé du bouton. Les deux autres formulaires gardent
la micro-ligne courte : la cadence est déjà expliquée juste au-dessus d'eux.

## Revue d'ingénierie, 26/08

Première passe eng sur ce plan. Neuf trouvailles, sept corrigées, deux déjà connues.

### Les deux P1

**Une inscription qui n'envoie rien affichait quand même « C'est fait ».**
`subscribe.ts` attrape l'échec Resend, écrit `sync_error`, et répond 200. Le design
est juste — une panne Resend ne doit jamais perdre une inscription — mais **rien ne
prévenait**. Et comme le domaine est `not_started`, l'échec n'était pas
hypothétique : il se serait produit à chaque inscription dès la mise en ligne. Tout
le monde aurait lu « le guide arrive » et personne n'aurait rien reçu, en silence.

Corrigé (D50-B) : alerte Telegram sur la **première** inscription non envoyée.
Garde anti-déluge sans minuterie et sans deviner de colonne : on compte les lignes
encore en attente (`sync_error` posé, `synced_at` nul). Si celle-ci est la seule,
c'est le début de la panne, ça sonne. Les suivantes voient un compte supérieur à 1 et
se taisent. Vider le retard remet le compteur à zéro, donc la panne suivante sonnera.
L'alerte ne peut jamais faire échouer une requête : credentials absents ou Telegram
en panne, elle dégrade en silence.

**Le lien de désinscription était construit sur `url.origin`.**
Sur une preview Vercel, chaque email partait avec un lien vers un `*.vercel.app`
éphémère — mort quelques jours plus tard, dans une vraie boîte mail, sur une
obligation légale. Corrigé (D51-A) : `SITE_ORIGIN`, tiré de `site:` dans
`astro.config.mjs`, connu à la compilation et correct partout.

### Les P2 corrigés

- **Aucun en-tête `List-Unsubscribe`.** Gmail et Yahoo l'exigent des expéditeurs en
  masse depuis février 2024. Sans lui, le client mail n'affiche aucun bouton de
  désinscription, les gens cliquent « spam » à la place, et la réputation du domaine
  part avec — sur le seul email qui porte le guide. Ajouté avec
  `List-Unsubscribe-Post`, ce qui est honnête ici puisque `/api/unsubscribe` exporte
  bien `POST` en plus de `GET`.
- **Commentaire périmé** dans `subscribe.ts` : « beehiiv is the real validator
  downstream », alors que beehiiv n'est plus dans le chemin.
- **Constante morte** dans `peptides.astro` : `var DONE` déclarée et jamais lue,
  pendant que la même phrase était écrite en dur à deux endroits. Trois copies d'une
  chaîne dont deux allaient dériver. Une seule maintenant, `DONE_HTML`.
- **Le chemin sans JS de la landing n'était couvert par aucun test.** Les 55 tests ne
  contenaient pas une occurrence de `fr-peptides`.

### Tests : 55 → 63

| Ajouté | Ce que ça épingle |
|---|---|
| `fr-peptides` redirige en 303 vers `/fr/peptides?ok=1` | le chemin sans JS de la landing |
| idem avec `?error=invalid_email` | le retour d'erreur sur la même page |
| l'alerte sonne sur la première inscription non envoyée | la panne silencieuse |
| elle se tait quand un retard existe déjà | le déluge |
| elle ne fait rien sans credentials | déploiement sans Telegram |
| la requête répond 200 même si l'alerte lève | l'alerte ne casse jamais une inscription |
| l'email porte les deux en-têtes de désinscription | la délivrabilité |
| le lien est bâti sur l'hôte canonique, pas celui de la requête | la régression preview |

Le faux client Supabase a été corrigé au passage : il renvoyait `rateLimitCount`
pour **tout** `select`, donc la nouvelle requête de comptage aurait lu le compteur du
rate-limiter. Compteurs par table désormais.

### Non corrigé, assumé

- **8 allers-retours réseau séquentiels par inscription** (4 Resend, 4 Supabase). Sur
  un mobile en 4G, « Une seconde… » peut durer 2 à 3 secondes. Le plan recommandait
  à l'origine de sortir les étapes 1 à 3 vers un lot pré-diffusion ; l'implémentation
  les fait en ligne. Ça marche, c'est plus simple, et ça coûte de la latence au
  moment le plus fragile. À reprendre si le taux d'abandon au formulaire le montre.
- **Doublon `src/styles/global.css` / `public/styles/global.css`**, déjà ouvert.

### Deux variables d'environnement de plus

`TELEGRAM_BOT_TOKEN` et `TELEGRAM_ADMIN_CHAT_ID`. **Optionnelles** : sans elles la page
fonctionne, elle est simplement muette en cas de panne d'envoi. À poser dans Vercel.

### Seconde passe eng, voix extérieure (Codex), 26/08

`codex exec` en lecture seule sur le code réel, pas sur le plan. Six trouvailles,
**toutes réelles**, dont une qui désarmait l'alerte ajoutée une heure plus tôt.

**[P1] Le réinscrit gardait un `synced_at` périmé, donc son échec était invisible.**
L'upsert ne remettait pas l'état de synchro à zéro :

```
  .upsert({ email, ip_hash, source, unsubscribed_at: null, ...utm })
```

Un abonné déjà synchronisé qui se réinscrit et dont l'envoi échoue conservait son
ancien `synced_at`. Or la garde de l'alerte compte
`sync_error IS NOT NULL AND synced_at IS NULL` : **cette ligne tombait hors du
prédicat.** Pas d'alerte, et invisible aussi pour n'importe quel script de rattrapage
bâti sur la même requête. La personne recevait un 200, ne recevait rien, et rien ne
sonnait. Corrigé : `synced_at: null, sync_error: null` dans l'upsert, les deux champs
écrits explicitement dans le catch, et `markSync` journalise désormais l'erreur
Supabase au lieu de l'ignorer.

**[P2] La pop-up se rouvrait après une inscription réussie.** Le minuteur de 8 s était
planifié au chargement et rien ne l'annulait. Quelqu'un qui s'inscrivait à t=3 s se
faisait redemander à t=8 s exactement ce qu'il venait de faire. Corrigé par un
`suppressModal()` partagé. Vérifié dans le navigateur : à t=10 s, modale fermée,
message de succès intact.

**[P2] Le rate-limiter se fiait à `x-forwarded-for`.** Sa valeur de gauche est fournie
par l'appelant : un attaquant fait tourner des IP falsifiées et la limite de 5/heure
ne se déclenche jamais. Corrigé : `x-vercel-forwarded-for` puis `x-real-ip`, posés
par l'edge Vercel après nettoyage, avec repli sur XFF pour le dev local.

**[P2] L'alerte Telegram ne vérifiait pas `res.ok`.** Un jeton invalide répond 401 et
`fetch` **résout**. L'alerte se croyait envoyée en ne prévenant personne : la panne
silencieuse qu'elle existe pour éviter, un étage plus haut.

**[P3] Un test épinglait la maquette plutôt que le comportement.** Il injectait
`db.syncErrorCount = 1` au lieu de le dériver de ce que la route écrit, donc il serait
passé **avec** le bug P1. Et un test plus ancien assertait
`expect(synced_at).toBeUndefined()`, c'est-à-dire qu'il épinglait le bug lui-même.
Les deux sont corrigés et trois tests dérivés ajoutés.

**[P2] Le visiteur sans JavaScript ne voyait aucune confirmation.**
Le correctif proposé par Codex — rendre l'état côté serveur — **ne s'appliquait pas** :
la page était statique, donc construite une fois au déploiement et aveugle aux
paramètres d'URL. Le défaut était réel, son remède non.

Tranché en D52-B : `/fr/peptides` passe en `prerender = false`. C'est la **seconde**
route à la demande d'un site dont le plan en annonçait une seule, et c'est assumé.
Mitigation : `Cache-Control: s-maxage=300, stale-while-revalidate=86400`. Vercel
indexe son cache edge sur l'URL complète, donc la page nue et chaque variante `?ok=1`
sont mises en cache séparément, et aucune n'est personnalisée.

Vérifié sur les quatre états :

| URL | confirmation rendue | formulaire |
|---|---|---|
| `/fr/peptides` | non | oui, erreur masquée |
| `?ok=1` | **oui, côté serveur** | remplacé |
| `?error=invalid_email` | non | oui, « Cet email n'a pas l'air valide. » |
| `?error=` inconnu | non | oui, message générique |

`/fr/peptides` ne figure plus dans la sortie prérendue. Tests 63 → 66, build vert.

### Reste à faire

- [ ] **R0 — Poser `TELEGRAM_BOT_TOKEN` et `TELEGRAM_ADMIN_CHAT_ID` dans Vercel.** Sans
  elles, la panne d'envoi redevient silencieuse
- [x] ~~**R1 — DNS Resend pour `maxguerois.com`**~~ **fait le 26/08 : statut `verified`, `Sending: enabled`, région eu-west-1.** Le domaine peut envoyer
- [ ] **R2 — Lien ManyChat vers `/fr/peptides`.** Max s'en occupe
- [ ] **R3 — Écrire le premier numéro.** Sans lui la promesse du lundi n'est pas tenable
- [ ] **R4 — Le PDF du guide.** Promis à 3 endroits, n'existe pas. Décision du 26/08 :
  on lance sans, il suivra
- [ ] **R5 — Sortir beehiiv du reste du site.** `NewsletterEmbed`, `SubscribeModal` et
  les 2 `preconnect` de `Layout` le chargent encore. Sans effet sur cette page, mais
  ses erreurs `attribution.js` polluent la console de tout le site
- [ ] **R6 — Supprimer le doublon `src/styles/global.css`.** Les deux copies ont
  déjà divergé une fois

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
| Codex Review | `codex exec` | Independent 2nd opinion | 2 | ISSUES_FIXED | passe design (4 corrections) + passe code (6 trouvailles, 6 corrigées) |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 2 | ISSUES_FIXED | 15 trouvailles, 3 P1 corrigées, tests 55 → 66 |
| Design Review | `/plan-design-review` | UI/UX gaps | 10 | IMPLEMENTED | 7 dimensions sur 7, 4/10 → 9/10, 47 décisions, 5 virages, 1 passe Codex, `DESIGN.md` + `global.css` corrigés et vérifiés en navigateur |
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

**VERDICT:** IMPLEMENTED, NOT LAUNCHED. La page existe, elle est construite selon
le plan, et elle est vérifiée dans le navigateur aux deux breakpoints. Le build et
les 55 tests passent.

`maxguerois.com` est passé `verified` dans Resend le 26/08, donc le domaine peut
envoyer : le blocage principal est levé. Restent le lien ManyChat, qui envoie toujours
le trafic Instagram sur l'archive, et le premier numéro.

La construction a trouvé deux bugs que la maquette ne pouvait pas montrer, dont un
qui faisait tomber le formulaire sous la ligne de flottaison. Les deux sont corrigés
et commentés dans le code.

L'Eng review a tourné le 26/08 et a sorti deux P1, dont une qui aurait rendu chaque
inscription silencieusement sans effet le jour du lancement. Les deux sont corrigées
et couvertes par des tests.

**UNRESOLVED DECISIONS:**
- La landing est désormais la 2ᵉ route à la demande du site, contre la prémisse « une seule » du plan (D52-B, assumé). À revoir si le TTFB du funnel se dégrade
- 8 allers-retours réseau séquentiels par inscription : sortir les 3 étapes de contact Resend vers un lot pré-diffusion, ou accepter 2 à 3 secondes d'attente sur mobile
- Doublon `src/styles/global.css` / `public/styles/global.css` : c'est la copie `public/` qui est servie, les deux ont déjà divergé d'une règle, et rien n'empêche que ça recommence. Supprimer l'une des deux touche tout le site, donc à décider quand le repo est calme
