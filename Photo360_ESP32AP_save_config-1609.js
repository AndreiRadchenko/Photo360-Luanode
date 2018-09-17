fs = require("fs");

var config = {
  firmwareVersion: 'Photo360 AP',
  wifiSsid: 'Photo360_AP001',
  wifiPassword: 'Photo360_AP001',
  wsPort: 8000,
  state: 'waiting',//started
  framesLeft: 100,
  frame: 100,
  allSteps: 51000,
  pause: 100,
  delay: 300,
  speed: 300,
  acceleration: 100,
  shootingMode: 'inter',
  direction: 0
};



function saveConfig() {
  fs.writeFileSync('config.txt', JSON.stringify(config));
  console.log('Save config');
}


E.flashFatFS({ format: true });
saveConfig();



var riadTimer = setTimeout(function () {
  var readConfig = JSON.parse(fs.readFileSync("config.txt"));
  console.log(readConfig);
}, 1000);
