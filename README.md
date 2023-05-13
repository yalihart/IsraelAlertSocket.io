# Israel Red Alert Socket.io Server

This is a Socket.io server that sends alerts for Israel's national צבע אדום (red alert) system. The server uses axios to make HTTP requests to the official alert system's API, and then broadcasts any new alerts to connected clients using Socket.io.

**This project was created for educational purposes.**

## How to Use

You can host this on your own or you can use my live version at `wss://alerts.yalihart.com`.

### Hosting the Server

1. Install Node.js and npm on your system if you haven't already.

2. Clone the repository or download the source code.

3. Open a terminal or command prompt and navigate to the project directory.

4. Install the project dependencies by running `npm install` command.

5. Start the server by running `npm run` command. The server should now be running on port 8080 (You can configure the port in `src/app.js`).
   
   You can now connect to the server using the client-side socket.io library and listen for incoming alerts.

### Listening from a client

Refer to the [Socket.io Client Reference](https://socket.io/docs/v4/client-installation/)

*To sum it up:*

```js
const { io } = require("socket.io-client");
const socket = io("wss://alerts.yalihart.com");

socket.on('alert', (alert) => {
    console.log(alert); 
});
```

## Response

```json
{
    "type": "ALERT",
    "timestamp": 1683995327666,
    "cat": 1,
    "location": {
        "id": 235,
        "name": "סעד",
        "lat": 31.4702,
        "lng": 34.5344
    }
}
```

`type` - indicates the type of message in this case `ALERT`

`timestamp` - a unix timestamp of when the Socket.io server sent the data

`cat` - (catagory is a refrence to other resources such as polygons and translations):

1. Category 1 - Missiles

2. Category 2 - Hostile aircraft intrusion

3. Category 3 - Non-conventional

4. Category 4 - Warning

5. Category 5 - Memorial day 1

6. Category 6 - Memorial day 2

7. Category 7 - Earthquake alert 1

8. Category 8 - Earthquake alert 2

9. Category 9 - Radiological event

10. Category 10 - Terrorist infiltration

11. Category 11 - Tsunami

12. Category 12 - Hazardous Materials Event

`location` (represents information about the alerted location) :

- `id` - a reference used to get information from other resources
* `name` - the name of the area that is being alerted (can also be used to get information from other resources like translations & coordinates)

* `lat` - exactly what is sounds like, latitude of the alerted areas

* `lon` - longitude of the alerted areas (I think you got it)



# Contact

If you have any If you have any questions or concerns, please feel free to open an issue or contact me at yali@yalihart.com


