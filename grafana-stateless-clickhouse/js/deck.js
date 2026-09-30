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

    keyboard: {
        82: () => Motion.restart(), // R — replay the current slide's animation
    },

    plugins: [RevealNotes, RevealHighlight],
}).then(() => Motion.init(Reveal));
