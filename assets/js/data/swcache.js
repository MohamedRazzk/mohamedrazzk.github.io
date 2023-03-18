const resource = [
    /* --- CSS --- */
    '/https://razzk.net/assets/css/style.css',

    /* --- PWA --- */
    '/https://razzk.net/app.js',
    '/https://razzk.net/sw.js',

    /* --- HTML --- */
    '/https://razzk.net/index.html',
    '/https://razzk.net/404.html',

    
        '/https://razzk.net/categories/',
    
        '/https://razzk.net/tags/',
    
        '/https://razzk.net/archives/',
    
        '/https://razzk.net/about/',
    

    /* --- Favicons & compressed JS --- */
    
    
        '/https://razzk.net/assets/img/favicons/Rawfav/Cloud-Cyber-Icon-Identity-1.png',
        '/https://razzk.net/assets/img/favicons/Rawfav/favicon.ico',
        '/https://razzk.net/assets/img/favicons/android-chrome-192x192.png',
        '/https://razzk.net/assets/img/favicons/android-chrome-512x512.png',
        '/https://razzk.net/assets/img/favicons/apple-touch-icon.png',
        '/https://razzk.net/assets/img/favicons/favicon-16x16.png',
        '/https://razzk.net/assets/img/favicons/favicon-32x32.png',
        '/https://razzk.net/assets/img/favicons/favicon.ico',
        '/https://razzk.net/assets/img/favicons/mstile-150x150.png',
        '/https://razzk.net/assets/js/dist/categories.min.js',
        '/https://razzk.net/assets/js/dist/commons.min.js',
        '/https://razzk.net/assets/js/dist/misc.min.js',
        '/https://razzk.net/assets/js/dist/page.min.js',
        '/https://razzk.net/assets/js/dist/post.min.js'
];

/* The request url with below domain will be cached */
const allowedDomains = [
    

    'localhost:4000',

    

    'fonts.gstatic.com',
    'fonts.googleapis.com',
    'cdn.jsdelivr.net',
    'polyfill.io'
];

/* Requests that include the following path will be banned */
const denyUrls = [
    
];

