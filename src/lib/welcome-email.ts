/**
 * The welcome email. Copy lives here, not in the route, so it can be edited without
 * touching request handling and so it can be tested on its own.
 *
 * ON THE LAYOUT. This reproduces the beehiiv template Max was using, because he asked
 * for it twice and he was right: an earlier version of this file dismissed it as "their
 * default template, nothing worth preserving" and rebuilt it on the site's cream and
 * amber palette instead. Reading the actual HTML of the email he received on 2026-03-20
 * shows real decisions in there: a white ground rather than the site's cream, a 670px
 * column rather than the usual 600, and 150% line-height. Those carry the body.
 *
 * THE HEADER AND FOOTER ARE THE SITE'S, not beehiiv's, which is what Max asked for
 * after seeing the first version: the name in the display face with "Newsletter" under
 * it, and a footer carrying the same three social links, the newsletter link and the
 * copyright line as maxguerois.com. Their colours are the site's tokens. beehiiv's 3px
 * near-black rule went with them, replaced by the site's 1px border.
 *
 * ON THE RHYTHM. The copy is deliberately airy. A denser draft was rejected in one line:
 * "le content est trop packed, pas mon style de copy". His own English welcome email is
 * the reference, and it runs on one-to-two-sentence paragraphs with a lot of white
 * between them. The bullet list is gone with the density: every bullet carried three
 * ideas, so the list compressed the text instead of opening it.
 *
 * ON THE FORMAT. Table layout and fully inline styles are the only thing that survives
 * Outlook and Gmail: <style> blocks get stripped, flex and grid do not render, and a web
 * font never loads.
 *
 * ON THE FOOTER. The postal address is not decoration. A commercial email with no
 * physical sender address breaks CAN-SPAM and the French rules, and its absence also
 * reads as spam to filters. Two subscribers replied to the beehiiv welcome saying they
 * had found it in their spam folder.
 *
 * NOT MENTIONED ON PURPOSE: the peptides guide. It does not exist yet. A first
 * impression that opens on an unkept promise is worse than no email.
 */

const SITE = 'https://maxguerois.com';
// The site's contact address, the one on the homepage and in security.txt. NOT the
// newsletter's sender address (bonjour@), which is where a reply to this mail lands.
// Two addresses on purpose: reply to the issue, or write fresh.
const CONTACT = 'hi@maxguerois.com';
const ADDRESS = '96 rue de Maubeuge, 75010 Paris, France';

// Body from the beehiiv template Max asked to keep; header, footer and their colours
// from maxguerois.com, which is what he asked for next.
const C = {
    bg: '#ffffff',
    text: '#2d2d2d',
    name: '#1a1a1a',   // site --text
    soft: '#767676',   // site --text-tertiary
    rule: '#e8e6e1',   // site --border
    link: '#c4934a',   // site --accent
    // A wash of the accent, not the accent itself. White text on #c4934a measures
    // 2.62:1 and fails WCAG AA; the body ink on this wash measures 11.8:1.
    hl: '#f7edda',
};
const WIDTH = 670;

export const WELCOME_SUBJECT = 'Bienvenue dans la communauté.';

/** Shown in the inbox next to the subject, before anything is opened. */
// The subject welcomes; the preview says what the welcome is FOR. Neither repeats the
// other, which is the whole job of the pair.
export const WELCOME_PREVIEW = 'Comprendre les peptides, sans jargon.';

/**
 * One entry per paragraph. Short on purpose: the blank space between them is part of
 * the writing, not a gap to be filled.
 *
 * `hl` highlights a line. Three of the sixteen carry it, and that ceiling is the point:
 * highlight a third of the email and the highlight stops meaning anything. The three
 * chosen are the only ones a reader must leave with — what arrives, why to trust it,
 * and when it starts.
 */
type Para = { text: string; hl?: true };

const PARAS: Para[] = [
    { text: "Vous vous êtes inscrit pour une raison simple." },
    { text: "Comprendre les peptides sans jargon. Sans promesse magique. Sans y passer vos soirées." },
    { text: "Vous recevrez un mail court quand il y a quelque chose qui vaut le détour.", hl: true },
    { text: "J'y décrypte une étude utile. Je vous dis ce qu'elle montre. Et ce qu'elle ne permet pas de dire." },
    { text: "Je passe aussi un peptide au crible." },
    { text: "Ce qu'on peut en attendre. Pour qui il peut avoir un intérêt. Et ce qu'il coûte vraiment." },
    { text: "J'ajoute un piège à éviter." },
    { text: "Un vendeur, un produit, ou une pratique qui ne vaut pas votre argent." },
    { text: "Je ne vends aucun peptide.", hl: true },
    { text: "Quand je ne sais pas, je vous le dis. Quand une étude ne permet pas de conclure, je vous le dis aussi." },
    { text: "Moi, c'est Max." },
    { text: "J'ai fondé le leader européen de la santé préventive à partir des prises de sang." },
    { text: "Aujourd'hui, je construis ma prochaine startup." },
    { text: "Cette newsletter me sert à partager ce que je trouve. Ce que je teste. Et ce qui ne tient pas la route." },
    { text: "Premier numéro bientôt.", hl: true },
    { text: "Si vous avez une question, répondez à ce mail. Je lis tout." },
];

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function welcomeText(unsubscribeUrl: string): string {
    return [
        ...PARAS.map((p) => p.text),
        '',
        'Max Guérois',
        '',
        CONTACT,
        SITE,
        '',
        ADDRESS,
        `Se désabonner : ${unsubscribeUrl}`,
    ].join('\n\n');
}

export function welcomeHtml(unsubscribeUrl: string): string {
    const url = escapeHtml(unsubscribeUrl);
    // beehiiv's own stack, kept so the mail renders as it did before.
    const font = "font-family: system-ui, Helvetica, Roboto, Calibri, Arial, sans-serif;";
    // The site's display face. Cormorant Garamond never loads in a mail client, so
    // Georgia carries it, which is already the fallback the site itself declares.
    const serif = "font-family: Georgia, 'Times New Roman', serif;";
    // 150% line-height, and the mso- variant because Outlook ignores the CSS one.
    const para = `margin:0 0 20px; ${font} font-size:16px; line-height:150%; mso-line-height-alt:150%; color:${C.text};`;
    const foot = `${font} font-size:12px; line-height:150%; color:${C.soft};`;

    /**
     * A highlighted line. The wash sits on the <span>, not the <p>, so it hugs the
     * words rather than painting the full column width and reading as a block quote.
     * Outlook drops the background and leaves the bold, which is the right degradation:
     * the emphasis survives even where the colour does not.
     */
    const paras = PARAS.map((pp) => {
        const body = escapeHtml(pp.text);
        if (!pp.hl) return `<p style="${para}">${body}</p>`;
        return `<p style="${para}"><span style="background-color:${C.hl}; color:${C.name}; font-weight:600; padding:2px 5px;">${body}</span></p>`;
    }).join('\n            ');

    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${escapeHtml(WELCOME_SUBJECT)}</title>
</head>
<body style="margin:0 auto; padding:0; word-wrap:normal; word-spacing:normal; background-color:${C.bg};">
<!-- Preheader: shown beside the subject in the inbox, hidden in the body itself so it
     does not read as a duplicated first line. -->
<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${escapeHtml(WELCOME_PREVIEW)}</div>
<table role="none" width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="background-color:${C.bg};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="none" width="${WIDTH}" border="0" cellspacing="0" cellpadding="0" style="width:100%; max-width:${WIDTH}px; table-layout:fixed;">
        <tr>
          <!-- Header and footer are centred; the body stays left-aligned. Centring
               sixteen paragraphs of running text would make every line start in a
               different place and destroy the reading rhythm. The align attribute
               sits alongside text-align because Outlook honours the attribute. -->
          <td align="center" style="padding:0 0 8px; text-align:center;">
            <p style="margin:0 0 2px; ${serif} font-size:21px; font-weight:600; letter-spacing:-0.01em; line-height:1.2; color:${C.name};">Max Guerois</p>
            <p style="margin:0 0 22px; ${font} font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:${C.soft};">Newsletter</p>
            <table role="none" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
              <tr><td style="border-top:1px solid ${C.rule}; font-size:0; line-height:0;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="left" style="text-align:left;">
            ${paras}
            <!-- The signature no longer carries the site link: it now lives in the
                 footer, above the newsletter link, where the rest of the addresses are. -->
            <p style="${para}">Max Guérois</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:16px 0 0; text-align:center;">
            <!-- The site's own footer: same three social links, then the ways to reach
                 him, then the copyright line. Its SVG icons do not render in Gmail, so
                 the icon row becomes text links. Address and unsubscribe sit under it,
                 where the law needs them. -->
            <table role="none" width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr><td style="border-top:1px solid ${C.rule}; font-size:0; line-height:0;">&nbsp;</td></tr>
            </table>
            <p style="margin:20px 0 0; ${foot}">
              <a href="https://linkedin.com/in/maxguerois" style="color:${C.soft}; text-decoration:none;">LinkedIn</a>&nbsp; &middot; &nbsp;<a href="https://x.com/maxguerois" style="color:${C.soft}; text-decoration:none;">X</a>&nbsp; &middot; &nbsp;<a href="https://instagram.com/maxguerois" style="color:${C.soft}; text-decoration:none;">Instagram</a>
            </p>
            <!-- The blank line Max asked for, as a spacer row rather than a <br>:
                 clients disagree about the height of a bare <br>, not about padding. -->
            <table role="none" width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr><td style="height:14px; font-size:0; line-height:0;">&nbsp;</td></tr>
            </table>
            <p style="margin:0 0 4px; ${foot}">
              <a href="mailto:${CONTACT}" style="color:${C.link}; text-decoration:none;">${CONTACT}</a>
            </p>
            <p style="margin:0 0 4px; ${foot}">
              <a href="${SITE}" style="color:${C.link}; text-decoration:none;">maxguerois.com</a>
            </p>
            <p style="margin:0 0 14px; ${foot}">
              <a href="${SITE}/fr/newsletter" style="color:${C.link}; text-decoration:none;">Newsletter</a>
            </p>
            <p style="margin:0 0 18px; ${font} font-size:11px; letter-spacing:0.03em; color:${C.soft};">&copy; 2026 Max Guerois</p>
            <p style="margin:0; ${font} font-size:11px; line-height:150%; color:${C.soft};">
              ${escapeHtml(ADDRESS)}<br>
              <a href="${url}" style="color:${C.soft}; text-decoration:underline;">Se désabonner</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
