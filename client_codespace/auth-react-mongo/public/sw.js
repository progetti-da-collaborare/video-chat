/* eslint-disable-next-line no-restricted-globals */
self.addEventListener('install', (event) => {
    console.log('Установлен');
});

/* eslint-disable-next-line no-restricted-globals */
self.addEventListener('activate', (event) => {
    console.log('Активирован');
});
/*
self.addEventListener('fetch', (event) => {
    event.respondWith(
    fetch("http://localhost:8081/", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(error => {
        console.error(error)
      }))
});
*/
/*
async function modifyAPIResponse() {
  const apiResponse = await fetch("http://localhost:8080/index.html", {
                              method: 'GET',
                              headers: {
                                'Content-Type': 'application/json'
                                //'Content-Type': 'text/html'
                              }
                            }, {redirect: "manual"}).then(r => {
                              const rClone = r.clone();
                              console.log(rClone.text());
                              return cleanResponse(r);
                            });
                            console.log("---- " + JSON.stringify(apiResponse));
                            const yy = 0.8;

  return new Response(apiResponse, {
    // Ensure that the Content-Type: and other headers are set.
    headers: apiResponse.headers,
  });
}
*/
//Запрос послан service worker - пропустить без обработки
let requestSent = {};
let requestMas = [];

/* eslint-disable-next-line no-restricted-globals */
self.addEventListener('fetch', (event) => {

    const url = new URL(event.request.url).pathname;
    console.log("----     " + url);
    let mode = event.request.redirect;
    const flag = event.request.headers.has("custom");
    /*
    let he = event.request.headers;
    const a1 = he.get("qwe");
    const a2 = he.get("custom");
    const a11 = he.has("qwe");
    const a22 = he.has("custom");
    let s = url.match(/\/([^/]$)/);
    let h = url.match(/(?<=.*\/)((?![/])[.a-zA-Z0-9_]*\.[.a-zA-Z0-9_]*$)/);
    let ext = h && h.match(/\.js$/);
    let ss = (h && !ext && h[0]) || (h && h[0] && ("src/" + h[0])) || "";
    if(!!s) self.clients.matchAll().then(all => all.forEach(client => client.postMessage(s)));
    */
   
    event.respondWith(
        (mode === 'follow' || url === "/iframe" || url === "/iframe.html" || url === "/" || flag) &&
        fetch(event.request.url, {
                                method: 'GET',/*
                                headers: {
                                  'Content-Type': 'application/json',
                                  //'Content-Type': 'text/html',
                                  'cust':'my'
                                }*/
                              }, {redirect: "manual"}).then(r => {
                                return cleanResponse(r);
                              })

    );
    
    /*
      event.respondWith(
        
          !(requestSent) && fetch("http://localhost:8080", {
                              method: 'GET',
                              headers: {
                                'Content-Type': 'application/json',
                                //'Content-Type': 'text/html',
                                'cust':'my'
                              }
                            }, {redirect: "manual"}).then(r => {
                              requestSent = true;
                              requestMas[url]="y";
                              const rClone = r.clone();
                              console.log(rClone.text());
                              return cleanResponse(r);
                            })
                            ||
            !(requestMas[url]) && fetch(event.request.url, {
                              method: 'GET',
                              headers: {
                                'Content-Type': 'application/json'
                                //'Content-Type': 'text/html'
                              }
                            }, {redirect: "manual"}).then(r => {
                              requestSent = true;
                              requestMas[url]="y";
                              const rClone = r.clone();
                              console.log(rClone.text());
                              return cleanResponse(r);
                            })
        
      );
      */
      //self.clients.matchAll().then(all => all.forEach(client => client.postMessage("Ciao")));
      //event.source.postMessage("Responding to " + event.data);
});

function cleanResponse(response) {
  const clonedResponse = response.clone();

  // Not all browsers support the Response.body stream, so fall back to reading
  // the entire body into memory as a blob.
  const bodyPromise = 'body' in clonedResponse ?
    Promise.resolve(clonedResponse.body) :
    clonedResponse.blob();

  return bodyPromise.then((body) => {
    clonedResponse.headers.custom = "sent";
    // new Response() is happy when passed either a stream or a Blob.
    return new Response(body, {
      headers: clonedResponse.headers,
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
    });
  });
}