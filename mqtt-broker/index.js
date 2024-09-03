const aedesPersistenceRedis = require('aedes-persistence-redis');
const port = 1883;

const aedes = require('aedes')({
  persistence: aedesPersistenceRedis({
    port: 6379,          // Redis port
    host: '43.200.72.23',   // Redis host
    family: 4,           // 4 (IPv4) or 6 (IPv6)
    password: 'fine2381',
    db: 0,
    maxSessionDelivery: 100, // maximum offline messages deliverable on client CONNECT, default is 1000
    // packetTTL: (packet) => 10 // offline message TTL, default is disabled
  })
});

aedes.authenticate = function (client, username, password, callback) {
  // console.log('authenticate', username, password.toString());
  callback(null, true);
  //if (/* authentication success */)
  //  callback(null, true);
  //else /* authentication failed */
  //  callback(null, false);
}

aedes.published =(packet, client, callback) => {
  if( client ) {
    const {topic, payload, cmd, qos} = packet;
    console.log('aedes.published:', topic, payload.toString(), client.id);
    aedes.publish({ topic: client.id, payload: "I'm broker " + aedes.id })
  }
  callback(null, true);
}
//
// aedes.clientReady = (client ) => {
//   console.log('aedes.clientReady', client.id);
// };
//
// aedes.clientDisconnect = (client) => {
//   console.log('aedes.clientDisconnect', client.id);
// };
//
// aedes.subscribe = (subscriptions, client) => {
//   console.log('aedes.subscribe', subscriptions, client.id);
// }

aedes.on('client', function(client) {
  console.log(" client connected: " + client.id);
});

aedes.on('clientDisconnect', function(client) {
  console.log(" client disconnected: " + client.id);
});

aedes.on('subscribe', function(subscriptions, client) {
  console.log(" client: " + client.id + " subcribing to: " + JSON.stringify(subscriptions));
});

aedes.on('unsubscribe', function(unsubscriptions, client) {
  console.log(" client: " + client.id + " unsubscribing from: " + JSON.stringify(unsubscriptions));
});

aedes.on('publish', function(packet, client) {
  let id = (client)? client.id : ' no id'
  //console.log(" client: " + id + " publishing: " + packet.payload.toString());
});

const server = require('net').createServer(aedes.handle)
server.listen(port, '0.0.0.0', function () {
  console.log('server listening on port', port)
});
