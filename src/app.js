require('axios');
const NodeCache = require("node-cache");

// Importing Constants
const cities = require("../constants/cities")["cities"]

// Constants & Assets should be used on the client side, but if you need them here, you can import them like this:
// const arEvents = require("../constants/ar/arEvents")
// const heEvents = require("../constants/he/heEvents")
// const enEvents = require("../constants/en/enEvents")
// const ruEvents = require("../constants/ru/ruEvents")
// const polygons = require("../constants/polygons")

// Web Socket Setup
const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 8080});
const clients = [];

// Cache
const cache = new NodeCache({stdTTL: 60});

function cacheCity(str) {
    // Add the string to the cache
    cache.set(str, true);
    // Set a timeout to remove the string after 60 seconds
    setTimeout(() => {
        cache.del(str);
    }, 60000);
}

let prevId = 0;

async function getAlerts() {
    const axios = require("axios");

    const headers = {
        "User-Agent":
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://www.oref.org.il/en",
        "Content-Type": "application/json;charset=utf-8",
        "X-Requested-With": "XMLHttpRequest",
        DNT: "1",
        Connection: "keep-alive",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
    };

    const axiosOptions = {
        url: "https://www.oref.org.il/WarningMessages/alert/alerts.json",
        method: "get",
        headers,
        responseType: "arraybuffer",
    };

    return new Promise((resolve, reject) => {
        axios(axiosOptions)
            .then(async (response) => {
                const arrayBuffer = await response.data;
                const decoder = new TextDecoder("utf-8"); //REQUIRED: because api returns hebrew characters
                const responseText = decoder.decode(arrayBuffer).trim();
                if (responseText.length > 0) {
                    //if response is not empty
                    resolve(JSON.parse(responseText));
                } else {
                    resolve(false);
                }
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            });
    });
}

wss.on('connection', (ws) => {
    console.log(`Client connected. ${wss.clients.size} connected clients.`);
    clients.push(ws);
    ws.on('close', () => clients.splice(clients.indexOf(ws), 1));
});

setInterval(async () => {
    try {
        const alerts = await getAlerts();
        if (alerts) {
            if (alerts.id !== prevId) {
                for (const city of (alerts.data)) {
                    if (!cache.has(city)) {
                        const alert = await createAlert(city, parseInt(alerts.cat))
                        console.log(alert)
                        wss.broadcast(JSON.stringify(alert)) // Client side will need to parse the JSON
                        cacheCity(city)
                        prevId = alerts.id
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}, 2500);

wss.broadcast = function broadcast(msg) {
    wss.clients.forEach(function each(client) {
        client.send(msg);
    });
};

async function createAlert(city, cat) {
    const locData = await getLocationInfo(city)
    // Used to get constants data (for client ref)
    // const arEvent = await arEvents[arEvents.findIndex((event) => event.category === cat)]
    // const heEvent = await heEvents[heEvents.findIndex((event) => event.category === cat)]
    // const enEvent = await enEvents[enEvents.findIndex((event) => event.category === cat)]
    // const ruEvent = await ruEvents[ruEvents.findIndex((event) => event.category === cat)]
    // const polygon = await polygons[(locData.id).toString()]


    const alert = {
        type: "ALERT",
        cat: cat,
        location: {
            id: locData.id,
            name: locData.he,
            lat: locData.lat,
            lng: locData.lng
        }

    }
    return alert;
}

async function getLocationInfo(loc) {
    const info = await cities[loc]
    if (info) return info
    else return false
}
