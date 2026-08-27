/**
 * Carrousel photo, comportement partage.
 *
 * Il vivait en DOUBLE, copie a l'identique dans `index.astro` et
 * `fr/index.astro` (2 850 caracteres chacune, verifie octet pour octet). La
 * landing peptides en aurait fait une troisieme. La premiere copie a diverger
 * aurait ete la plus difficile a reperer : deux accueils qui ne defilent pas
 * pareil, personne ne s'en apercoit avant longtemps.
 *
 * Astro hisse et DEDUPLIQUE les scripts non `is:inline`, donc ce module est
 * telecharge une fois quel que soit le nombre de pages qui l'importent.
 *
 * Le comportement est repris SANS MODIFICATION : meme minuterie de 5,5 s, meme
 * seuil de glissement a 45 px, meme respect de `prefers-reduced-motion`.
 */

function init(slider: Element): void {
    const viewport = slider.querySelector<HTMLElement>('.js-viewport');
    const track = slider.querySelector<HTMLElement>('.js-track');
    const slides = slider.querySelectorAll<HTMLElement>('.js-slide');
    const segs = slider.querySelectorAll<HTMLElement>('.js-segs button');
    if (!viewport || !track || !slides.length) return;

    const n = slides.length;
    let i = 0;
    let timer: ReturnType<typeof setInterval> | null = null;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const noAuto = slider.hasAttribute('data-noautoplay');

    function offset(k: number): number {
        const maxT = track!.scrollWidth - viewport!.clientWidth;
        const t = Math.min(slides[k].offsetLeft, maxT);
        return t < 0 ? 0 : t;
    }
    function go(k: number): void {
        i = (k + n) % n;
        track!.style.transform = 'translateX(' + -offset(i) + 'px)';
        segs.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    }
    function start(): void {
        if (n > 1 && !reduce && !noAuto && !timer) {
            timer = setInterval(() => go(i + 1), 5500);
        }
    }
    function stop(): void {
        if (timer) { clearInterval(timer); timer = null; }
    }

    segs.forEach((seg, idx) => seg.addEventListener('click', () => { go(idx); stop(); start(); }));
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    window.addEventListener('resize', () => go(i));

    let dragging = false, startX = 0, base = 0, moved = 0;
    viewport.addEventListener('pointerdown', (e) => {
        dragging = true; startX = e.clientX; base = -offset(i); moved = 0;
        track.style.transition = 'none'; stop();
        try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* navigateur sans capture */ }
    });
    viewport.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        moved = e.clientX - startX;
        track.style.transform = 'translateX(' + (base + moved) + 'px)';
    });
    function endDrag(): void {
        if (!dragging) return;
        dragging = false;
        track!.style.transition = '';
        // 45px : en dessous, c'est un clic hesitant et non un glissement.
        if (moved < -45) go(i + 1);
        else if (moved > 45) go(i - 1);
        else go(i);
        start();
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('dragstart', (e) => e.preventDefault());

    go(0);
    start();
}

/** Initialise tous les carrousels de la page. Sans effet s'il n'y en a aucun. */
export function initPhotoSliders(): void {
    document.querySelectorAll('.js-slider').forEach(init);
}
