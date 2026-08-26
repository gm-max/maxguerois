/**
 * The welcome email. Copy lives here, not in the route, so it can be edited without
 * touching request handling and so it can be tested on its own.
 *
 * It replaces a placeholder that promised "le guide peptides arrive très vite" while
 * no guide existed. Promising something that is not ready is how a first impression
 * becomes a broken one, so the guide is not mentioned at all: it goes in once it is
 * real.
 *
 * ON THE DESIGN. The beehiiv original this succeeds was their default template:
 * Arial, a 520px column, dark grey on white, no custom button. Nothing there was
 * worth preserving, so this is built on the site's own palette instead, which is only
 * possible now that we own the sending.
 *
 * ON THE FORMAT. Table-based layout and fully inline styles are not old-fashioned
 * here, they are the only thing that survives Outlook and Gmail: <style> blocks are
 * stripped, flexbox and grid do not render, and a web font never loads. Georgia and
 * the system sans stack approximate the site's Cormorant/DM Sans pairing with fonts
 * that are actually present on the reader's machine.
 *
 * ON THE FOOTER. The postal address is not decoration. A commercial email without a
 * physical sender address breaks both CAN-SPAM and the French rules, and its absence
 * also reads as spam to filters. It matches what beehiiv had on file.
 */

const SITE = 'https://maxguerois.com';
const ADDRESS = '96 rue de Maubeuge, 75010 Paris, France';

// Site tokens, hard-coded because an email cannot read CSS variables.
const C = {
    bg: '#faf9f7',
    card: '#ffffff',
    text: '#2a2a2a',
    soft: '#767676',
    accent: '#c4934a',
    rule: '#e8e4dd',
};

export const WELCOME_SUBJECT = 'Bienvenue, voici ce qui vous attend';

/** Shown in the inbox next to the subject, before anything is opened. */
export const WELCOME_PREVIEW = "L'actu des peptides décryptée, chaque lundi. Voici ce que vous allez recevoir.";

const PARAS: string[] = [
    "Bonjour, et merci pour votre inscription. Moi, c'est Max.",
    "Je suis entrepreneur. J'ai cofondé Lucis, une startup de santé préventive, après qu'un bilan sanguin m'a montré que je vieillissais plus vite que je n'aurais dû. J'ai quitté l'aventure, et je construis aujourd'hui ma prochaine startup à découvert.",
    "Ici, je partage un sujet précis : les peptides. Ce que la recherche montre vraiment, ce que les gens en font, et ce que mes propres essais permettent ou non de comprendre.",
];

const BULLETS: Array<[string, string]> = [
    ['Une étude de la semaine', 'ce qu’elle prouve, et surtout ce qu’elle ne prouve pas.'],
    ['Un peptide décrypté', 'ce qu’il fait, pour qui, et ce qu’il coûte réellement.'],
    ['Une alerte marché', 'un vendeur, un produit ou une pratique à connaître avant d’y toucher.'],
];

const CLOSING: string[] = [
    "Pas de jargon, pas de promesse magique, et je ne vends aucun peptide. Quand je ne sais pas, je le dis.",
    "Le premier numéro arrive lundi. Si vous voulez réagir, répondez simplement à cet email : je lis tout.",
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
        ...PARAS,
        '',
        'Chaque lundi, vous recevez :',
        ...BULLETS.map(([t, d]) => `- ${t} : ${d}`),
        '',
        ...CLOSING,
        '',
        'Max Guérois',
        SITE,
        '',
        ADDRESS,
        `Se désabonner : ${unsubscribeUrl}`,
    ].join('\n');
}

export function welcomeHtml(unsubscribeUrl: string): string {
    const url = escapeHtml(unsubscribeUrl);
    const body = 'font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Helvetica, Arial, sans-serif;';
    const serif = "font-family: Georgia, 'Times New Roman', serif;";

    const paras = PARAS.map(
        (p) =>
            `<p style="margin:0 0 18px; ${body} font-size:16px; line-height:1.65; color:${C.text};">${escapeHtml(p)}</p>`,
    ).join('');

    const bullets = BULLETS.map(
        ([title, desc]) => `
          <tr>
            <td style="padding:0 0 14px; ${body} font-size:16px; line-height:1.6; color:${C.text};">
              <span style="color:${C.accent}; font-weight:600;">${escapeHtml(title)}</span>
              <span style="color:${C.soft};"> : ${escapeHtml(desc)}</span>
            </td>
          </tr>`,
    ).join('');

    const closing = CLOSING.map(
        (p) =>
            `<p style="margin:0 0 18px; ${body} font-size:16px; line-height:1.65; color:${C.text};">${escapeHtml(p)}</p>`,
    ).join('');

    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${escapeHtml(WELCOME_SUBJECT)}</title>
</head>
<body style="margin:0; padding:0; background-color:${C.bg};">
<!-- Preheader: shown beside the subject in the inbox. Hidden in the body itself,
     otherwise it reads as a duplicated first line. -->
<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${escapeHtml(WELCOME_PREVIEW)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.bg};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px; background-color:${C.card}; border:1px solid ${C.rule};">
        <tr>
          <td style="padding:36px 36px 8px;">
            <p style="margin:0 0 4px; ${body} font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:${C.soft};">L'actu peptides</p>
            <h1 style="margin:0 0 24px; ${serif} font-size:30px; font-weight:400; line-height:1.25; color:${C.text};">Bienvenue.</h1>
            ${paras}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 36px 4px;">
            <p style="margin:0 0 14px; ${body} font-size:16px; line-height:1.65; color:${C.text};"><strong>Chaque lundi, vous recevez :</strong></p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${bullets}</table>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 36px 0;">
            ${closing}
            <p style="margin:24px 0 0; ${body} font-size:16px; line-height:1.65; color:${C.text};">Max Guérois<br>
              <a href="${SITE}" style="color:${C.accent}; text-decoration:none;">maxguerois.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 36px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="border-top:1px solid ${C.rule}; font-size:0; line-height:0;">&nbsp;</td></tr>
            </table>
            <p style="margin:16px 0 0; ${body} font-size:12px; line-height:1.6; color:${C.soft};">
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
