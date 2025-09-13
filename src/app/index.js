// you app.js entry point
uppy.use(GoldenRetriever, { serviceWorker: true });

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js") // path to your bundled service worker with GoldenRetriever service worker
    .then((registration) => {
      console.log(
        "ServiceWorker registration successful with scope: ",
        registration.scope
      );
    })
    .catch((error) => {
      console.log(`Registration failed with ${error}`);
    });
}
