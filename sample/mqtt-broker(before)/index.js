const mosca = require('mosca')

const settings = {
      port: 1883,
      persistence: mosca.persistence.Memory
};


const server = new mosca.Server(settings, function() {
      console.log('Mosca server is up and running')
});

const authenticate = (client, username, password, callback)  => {
   console.log('authenticate', username, password);
   callback(null, true);
   //if (/* authentication success */)
   //  callback(null, true);
   //else /* authentication failed */
   //  callback(null, false);
};

// server.on("ready", setup);
//    console.log('Mosca server setup.');
// });

server.clientConnected = function(client) {
    console.log('client connected', client.id);
};


server.published = function(packet, client, cb) {

  if (packet.topic.indexOf('echo') === 0) {
    console.log('ON PUBLISHED', packet.payload.toString(), 'on topic', packet.topic);
    return cb();
  }

  const newPacket = {
    topic: 'echo/' + packet.topic,
    payload: packet.payload,
    retain: packet.retain,
    qos: packet.qos
  };

  console.log('newPacket', newPacket);

  server.publish(newPacket, cb);
};

