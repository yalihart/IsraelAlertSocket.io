const fetch = require("node-fetch")
const cities = require("../constants/cities")["cities"]
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 });

function cacheCity(str) {
  // Add the string to the cache
  cache.set(str, true);

  // Set a timeout to remove the string after 60 seconds
  setTimeout(() => {
    cache.del(str);
  }, 60000);
}


function getPrevCity() {
  // Get all the keys from the cache
  const keys = cache.keys();

  // Return the keys as an array
  return keys;
}
Array.prototype.diff = function(arr2) { return this.filter(x => !arr2.includes(x)); } // symmetric difference testing

const sample = {
  id: "133283677150000000",
  cat: 1,
  title: "ירי רקטות וטילים",
  data: [
      "נחל עוז"
  ],
  desc: "היכנסו למרחב המוגן ושהו בו 10 דקות"
};
const sample2 = {
  id: "133283517150000000",
  cat: 1,
  title: "ירי רקטות וטילים",
  data: [
    "נחל עוז",
      "תל אביב - מזרח"
  ],
  desc: "היכנסו למרחב המוגן ושהו בו 10 דקות"
};

const readySample = {
  type: "ALERT",
  label: "Missiles",
  cat:  1,
  duration: 10, // Minutes
  instructions: "Enter protected space and stay for 10 minutes",
  location: {
    id: 849,
    he: 'רעננה',
    en: "Ra'anana",
    ru: 'Раанана',
    ar: 'رعنانا',
    es: "Ra'anana",
    area: 9,
    countdown: 90,
    lat: 32.1848,
    lng: 34.8713,
    polygon: [
        [32.2083, 34.867],
        [32.2078, 34.8669],
        [32.2072, 34.8669],
        // More Data ...
    ]
  }
}
let prevId = 0;
let prevCities = [];
async function getAlerts() {
  const requestHeaders = new fetch.Headers();
  requestHeaders.append(
    "User-Agent",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/112.0"
  );
  requestHeaders.append("Accept", "*/*");
  requestHeaders.append("Accept-Language", "en-US,en;q=0.5");
  requestHeaders.append("Accept-Encoding", "gzip, deflate, br");
  requestHeaders.append("Referer", "https://www.oref.org.il/en");
  requestHeaders.append("Content-Type", "application/json;charset=utf-8");
  requestHeaders.append("X-Requested-With", "XMLHttpRequest");
  requestHeaders.append("DNT", "1");
  requestHeaders.append("Connection", "keep-alive");
  requestHeaders.append("Sec-Fetch-Dest", "empty");
  requestHeaders.append("Sec-Fetch-Mode", "cors");
  requestHeaders.append("Sec-Fetch-Site", "same-origin");

  const requestOptions = {
    method: "GET",
    headers: requestHeaders,
    redirect: "follow",
  };
//TODO: Use different fetch api (fetch is esm)
  const response = await fetch(
    "https://www.oref.org.il/WarningMessages/alert/alerts.json",
    requestOptions
  );
  const arrayBuffer = await response.arrayBuffer();
  const decoder = new TextDecoder("utf-8"); //REQUIRED: because api returns hebrew characters
  const responseText = decoder.decode(arrayBuffer).trim();
  if (responseText.length > 0) {
    //if response is not empty
    const result = JSON.parse(responseText);
    return result;
  } else {
    return false;
  }
}



setInterval(async () => {
  try {
    const alerts = await getAlerts();
    if (alerts) {
      if (alerts.id !== prevId) {
        let addedCities = (alerts.data).diff(prevCities) // gets the symmetric differences
        addedCities.forEach((city) => {
          if (!cache.has(city)) {
            console.log(`Missile Alert - ${city}`)
            cacheCity(city)
          }
        })
      }
    }
  } catch (error) {
    console.log(error);
  }
}, 2500);

async function getLocationInfo(loc) {
  const info = await cities[loc]
  if (info) return info
  else return false
}
