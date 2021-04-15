  importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js');

  if (workbox) {
    workbox.setConfig({
      debug: false
    });

    var defaultStrategy = new workbox.strategies.StaleWhileRevalidate({
      cacheName: "fallback",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 128,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
          purgeOnQuotaError: true, // Opt-in to automatic cleanup
        }),
        new workbox.cacheableResponse.CacheableResponse({
          statuses: [0, 200] // for opague requests
        }),
      ],
    });
    workbox.routing.setDefaultHandler(
      (args) => {
        if (args.event.request.method === 'GET') {
          return defaultStrategy.handle(args); // use default strategy
        } else {
          return null
        }
      }
    );
    workbox.precaching.precacheAndRoute([
      { url: 'index.html', revision: 'abcd1234' }
    ]);

    workbox.routing.registerRoute(
      new RegExp(/.*\.(?:png|jpg|jpeg|svg|gif|webp|js|css|json)/g),
      new workbox.strategies.StaleWhileRevalidate()
    );
  } else {
    console.log(`No workbox on this browser 😬`);
  }