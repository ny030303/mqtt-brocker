const fs = require('fs');
const path = require('path');

const aedes = require('aedes')();
const http = require('http');
const net = require('net');
const express = require('express');

const mqttPort = 1883; // MQTT 포트
const httpPort = 3000; // HTTP 포트

// 이미지 저장 디렉토리
const imageDir = path.join(__dirname, 'images');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir); // 디렉토리가 없으면 생성
}

// MQTT 브로커 설정
const mqttServer = net.createServer(aedes.handle);
mqttServer.listen(mqttPort, () => {
  console.log(`MQTT broker is running on port ${mqttPort}`);
});

// Aedes 이벤트
aedes.on('client', (client) => {
  console.log(`MQTT client connected: ${client.id}`);
});

aedes.on('publish', (packet, client) => {
  const clientId = client ? client.id : 'Broker';
  console.log(`MQTT client ${clientId} published: Topic=${packet.topic}, Payload=${packet.payload.toString()}`);
});

// HTTP 서버 설정
const app = express();

// JSON 본문 파싱 (JSON 데이터가 포함될 경우 사용)
app.use(express.json());

// 이미지 데이터 처리
app.post('/publish', (req, res) => {
  const contentType = req.headers['content-type'];

  if (contentType !== 'image/jpeg') {
    return res.status(400).send('Unsupported Content-Type. Use "image/jpeg".');
  }

  const chunks = [];
  req.on('data', (chunk) => {
    chunks.push(chunk);
  });

  req.on('end', () => {
    const imageBuffer = Buffer.concat(chunks);

    const topic = req.query.topic || 'default/topic'; // 토픽은 쿼리 매개변수로 전달받음
    if (!topic) {
      return res.status(400).send('Missing topic in query string.');
    }

    // 현재 시간 기반 파일 이름 생성
    const timestamp = Date.now();
    const imageName = `image_${timestamp}.jpg`;
    const imagePath = path.join(imageDir, imageName);

    // 이미지 저장
    fs.writeFile(imagePath, imageBuffer, (err) => {
      if (err) {
        console.error('Error saving image:', err);
        return res.status(500).send('Failed to save image.');
      }

      console.log(`Image saved at: ${imagePath}`);

      // MQTT로 이미지 전송
      aedes.publish(
        {
          topic,
          payload: imageBuffer,
          qos: 0,
          retain: false,
        },
        () => {
          console.log(`Published image to MQTT: Topic=${topic}, Payload size=${imageBuffer.length} bytes`);
          res.send(`Image published to topic ${topic} and saved as ${imageName}`);
        }
      );
    });
  });

  req.on('error', (err) => {
    console.error('Error processing request:', err);
    res.status(500).send('Internal Server Error');
  });
});

// HTTP 서버 실행
app.listen(httpPort, () => {
  console.log(`HTTP server is running on port ${httpPort}`);
});
