Reveal.initialize({
    width: 1280,
    height: 720,
    margin: 0.06,
    minScale: 0.2,
    maxScale: 2.0,

    hash: true,
    slideNumber: false, // custom .deck-nav renders the count (reveal's own injects inline styles we can't cleanly center)
    transition: 'fade',
    transitionSpeed: 'fast',
    backgroundTransition: 'fade',
    controls: false, // default arrow cluster is ugly; we use a custom .deck-next button (see below)
    progress: true,
    center: false, // we lay out slides top-aligned; section/title slides center themselves

    plugins: [RevealNotes, RevealHighlight],
});

// Custom bottom-right nav: page-number pill + prev/next arrows (Figma look).
const navNum = document.querySelector('.deck-nav-num');
const navPrev = document.querySelector('[data-nav="prev"]');
const navNext = document.querySelector('[data-nav="next"]');
function updateNav() {
    const current = (Reveal.getState().indexh || 0) + 1;
    navNum.textContent = current + ' / ' + Reveal.getTotalSlides();
    navPrev.disabled = Reveal.isFirstSlide();
    navNext.disabled = Reveal.isLastSlide();
}
Reveal.on('ready', updateNav);
Reveal.on('slidechanged', updateNav);
navPrev.addEventListener('click', () => Reveal.prev());
navNext.addEventListener('click', () => Reveal.next());
