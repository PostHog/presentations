Reveal.initialize({
    width: 1280,
    height: 720,
    margin: 0.06,
    minScale: 0.2,
    maxScale: 2.0,

    hash: true,
    slideNumber: 'c/t',
    transition: 'fade',
    transitionSpeed: 'fast',
    backgroundTransition: 'fade',
    controls: false, // default arrow cluster is ugly; we use a custom .deck-next button (see below)
    progress: true,
    center: false, // we lay out slides top-aligned; section/title slides center themselves

    plugins: [RevealNotes, RevealHighlight],
});

// Custom bottom-right "next" arrow (matches the Figma page-number + arrow pair).
document.querySelector('.deck-next')?.addEventListener('click', () => Reveal.next());
