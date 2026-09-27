import { Font } from '@react-pdf/renderer';
Font.register({
    family: 'Hind',
    fonts: [
        { src: '/fonts/Hind-Regular.ttf', fontWeight: 400 },
        { src: '/fonts/Hind-Bold.ttf', fontWeight: 700 },
    ],
});
Font.registerHyphenationCallback((word) => [word]);
