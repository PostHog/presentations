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
    controls: true,
    progress: true,
    center: false, // we lay out slides top-aligned; section/title slides center themselves

    plugins: [RevealNotes, RevealHighlight],
});
