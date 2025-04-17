var mqtt = require('mqtt');
var count = 0;

const MAX_CONNECTIONS = 200;


const clients = [];
const makeMqttConnection = async (clientId) => {
    const client = mqtt.connect("mqtt://192.168.1.148", { clientId: clientId, username: "fine", password: "fine2831" });
    console.log(clientId, "connected flag  " + client.connected);

    //handle incoming messages
    client.on('message', function (topic, message, packet) {
        console.log(clientId, "message is " + message);
        console.log(clientId, "topic is " + topic);
    });

    client.on("connect", function () {
        console.log(clientId, "connected  " + client.connected);
    })

    //handle errors
    client.on("error", function (error) {
        console.log(clientId, "Can't connect" + error);
        // const errIdx = clients.findIndex(v => v.clientId == client.clientId);
        // if( errIdx >= 0 ) {
        //     clients[errIdx] = null;
        // }
    });

    client.clientId = clientId;
    return client;
};

const sendToClientMessage = (client, topic, msg, options) => {    
    if (client.connected == true) {
        console.log(client.clientId, "publishing", msg, client.connected);
        client.publish(topic, msg, options);
    }
    // count += 1;
    // if (count == 10) { //ens script 
    //     clearTimeout(timer_id); //stop timer
    //     client.end();
    // }
}

(async (topic) => {
    var options = { retain: true, qos: 1 };

    console.log("topic:", topic);
    for (let i = 0; i < MAX_CONNECTIONS; i++) {
        // var client = mqtt.connect("mqtt://58.180.10.145", { clientId: "mqttjs-01", username: "fine", password: "fine2831" });
        const clientId = `${topic}-${i + 1}`;;
        const clientConnection = await makeMqttConnection(clientId);
        clients.push(clientConnection);
    }

    setInterval(() => {
        const rand = Math.floor(Math.random() * MAX_CONNECTIONS);
        const message = 'ABCDEFG1234567890';
        if( clients[rand] ) {
            sendToClientMessage(clients[rand], "collected", message, options)
        }
    }, 500);

    //////////////p


    // var message = "test message";
    // var topic_list = ["topic2", "topic3", "topic4"];
    // var topic_o = { "topic22": 0, "topic33": 1, "topic44": 1 };

    clients.forEach((v) => {
        console.log("subscribing to topics ", v.clientId);
        v.subscribe(v.clientId, { qos: 1 }); //single topic
    })
    // client.subscribe(topic_list, { qos: 1 }); //topic list
    // client.subscribe(topic_o); //object
    //  var timer_id = setInterval(() => publish(topic, message, options), 5000);
    //notice this is printed even before we connect
    // console.log("end of script");
})(process.argv[2] || 'finevu');

