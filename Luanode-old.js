var config = {};
var run = function () {

  function saveConfig() {
    //if (JSON.stringify(config) != fs.readFileSync("config.txt") && !setupMode) {
      fs.writeFileSync('config.txt', JSON.stringify(config));
      console.log('Save config');
    //}
  }

  var photoPizzaIp = 'disconnected';
  var wifi = require('Wifi');
  var wsocket;
  var server;

  function wifiConnect() {
	wifi.disconnect();
    console.log('config.wifiSsid: ' + config.wifiSsid);
    console.log('config.wifiPassword: ' + config.wifiPassword);
	//wifi.startAP("Photo360", {authMode:"open"});
	wifi.startAP(config.wifiSsid, {password:config.wifiPassword,authMode:"wpa_wpa2"});


	console.log(`Web server running at http://${wifi.getAPIP().ip}`);
	photoPizzaIp = wifi.getAPIP().ip;

	wifi.on('sta_joined', function(details) {
		console.log('Sambody connect to Photo360');
    });

    server = require('ws').createServer();
    server.listen(config.wsPort);
    server.on("websocket", function(ws) {
      console.log('Attempt to connect to websocket');

            wsocket = ws;
            ws.on('message',function(msg) {
              var configIn = JSON.parse(msg);
              config = configIn;
              //console.log(config);
              NumControl();
              if (configIn.state === 'start' && config.state != 'started') {
                BtnStart();
                config.state = 'started';
                ws.send(JSON.stringify(config));
              }

              if (configIn.state === 'stop') {
                BtnStop();
              }
            });
            ws.on('close', function() {
              wsocket = false;
            });

    });

  }



///////////////////////////

  require("Font8x16").add(Graphics);

  var irCode = 0;
  var irDigital = '1';
  var simNum = 0;

  //DISPLAY
  var display = true;
  var marker = 0;
  var indent = 13;
  var dispay_2 = false;
  var setupMode = false;
  var dirDisplay = '';

  var nameIndent = 48;

  //STEPPER
  var pinStep = D12;
  var pinEn = D13;
  var pinDir = D14;
  var stOn = 0;
  var stOff = 1;

  var _speed = 1;
  var calibration = false;
  var deg90flag = false;

  digitalWrite(pinStep, 0);
  digitalWrite(pinEn, 1);
  digitalWrite(pinDir, config.direction);

  //RELAY
  var pinRelay = D33;
  var pinLaser = D32;
  var relayOn = false;
  var rOn = 0;
  var rOff = 1;
  digitalWrite(pinRelay, rOn);
  digitalWrite(pinLaser, rOn);
  //P8.mode('analog');

  //FLAGS
  var startFlag = false;
  var poweroff = false;
  var infiniteFlag = false;

  require("IRReceiver").connect(D34, function(code) {
    var _code = parseInt(code, 2);
    var btn;

    if (_code === 17246823007 || _code === 4311705751) {
      btn = 1;
      console.log(btn);
    }
    if (_code === 17246871967 || _code === 4311717991) {
      btn = 2;
      console.log(btn);
    }
    if (_code === 17246896447 || _code === 4311724111) {
      btn = 3;
      console.log(btn);
    }
    if (_code === 17246765887 || _code === 4311691471) {
      btn = 4;
      console.log(btn);
    }
    if (_code === 17246741407 || _code === 4311685351) {
      btn = 5;
      console.log(btn);
    }
    if (_code === 17246841367 || _code === 4311710341) {
      btn = 6;
      console.log(btn);
    }
    if (_code === 17246733247 || _code === 4311683311) {
      btn = 7;
      console.log(btn);
    }
    if (_code === 17246774047 || _code === 4311693511) {
      btn = 8;
      console.log(btn);
    }
    if (_code === 17246808727 || _code === 4311702181) {
      btn = 9;
      console.log(btn);
    }
    if (_code === 17246792407 || _code === 4311698101) {
      btn = 0;
      console.log(btn);
    }

    if (_code === 17246800567 || _code === 4311700141) {
      btn = 'CALIBR';
      console.log(btn);
    }
    // if (_code === 6450774781 || _code === 25803099127) {
    //   btn = 'R POWER';
    //   console.log(btn);
    // }
    if (_code === 17246784247 || _code === 4311696061) {
      btn = 'SETUP';
      console.log(btn);
    }
    if (_code === 17246816887 || _code === 4311704221) {
      btn = 'UP';
      console.log(btn);
    }
    if (_code === 17246888287 || _code === 4311722071) {
      btn = 'DOWN';
      console.log(btn);
    }
    if (_code === 17246751607 || _code === 4311687901) {
      btn = 'LEFT';
      console.log(btn);
    }
    if (_code === 17246914807 || _code === 4311728701) {
      btn = 'RIGHT';
      console.log(btn);
    }
    if (_code === 17246718967 || _code === 4311679741) {
      btn = 'OK';
      console.log(btn);
    }
    if (_code === 6450813031 || _code === 25803252127) {
      btn = '90DEG';
      console.log(btn);
    }

    console.log(_code);

    if (setupMode && btn === 1 || setupMode && btn === 2 || setupMode && btn === 3 ||
			setupMode && btn === 4 || setupMode && btn === 5 || setupMode && btn === 6 ||
			setupMode && btn === 7 || setupMode && btn === 8 || setupMode && btn === 9 || setupMode && btn === 0) {
    console.log('input');
      IrInput(btn);
      return;
    }
    if (btn === 'SETUP' && !setupMode && !poweroff) {
      SettingsDisplay_1();
      console.log('Setup');
      simNum = 0;
      return;
    } else if (btn === 'SETUP' && setupMode) {
      setupMode = false;
      NumControl();
      StartDisplay();
      console.log('Setup Exit');
      return;
    }
    if (btn === 'OK' && startFlag && !poweroff || btn === 'OK' && infiniteFlag && !poweroff) {
      startFlag = false;
      infiniteFlag = false;
      BtnStop();
      console.log('OK STOP');
      simNum = 0;
      return;
    }
    if (btn === 'OK' && !infiniteFlag && !startFlag && !poweroff) {
      BtnStart();
      console.log('OK START');
      simNum = 0;
      return;
    }
    if (btn === 'DOWN' && !dispay_2 && setupMode) {
      marker = marker + indent;
      SettingsDisplay_1();
      simNum = 0;
      console.log('Down D1');
      return;
    } else if (btn === 'DOWN' && dispay_2 && setupMode) {
      marker = marker + indent;
      SettingsDisplay_2();
      console.log('Down D2');
      simNum = 0;
      return;
    }
     if (btn === 'UP' && !dispay_2 && setupMode) {
      marker = marker - indent;
      SettingsDisplay_1();
      simNum = 0;
      console.log('UP D1');
      return;
    } else if (btn === 'UP' && dispay_2 && setupMode) {
      marker = marker - indent;
      SettingsDisplay_2();
      console.log('UP D2');
      simNum = 0;
      return;
    }
    if (btn === 'RIGHT' && !dispay_2 && setupMode) {
      SettingsDisplay_2();
      console.log('Right');
      simNum = 0;
      return;
    }
    if (btn === 'LEFT' && dispay_2 && setupMode) {
      SettingsDisplay_1();
      console.log('Left');
      simNum = 0;
      return;
    }
    if (btn === 'RIGHT' && !setupMode && !startFlag) {
      digitalWrite(pinDir, 1);
      digitalWrite(pinStep, 0);
      digitalWrite(pinEn, stOn);
      _speed = 1;
      infiniteRotation();
      console.log('Right rotation');
      return;
    }
    if (btn === 'LEFT' && !setupMode && !startFlag) {
      digitalWrite(pinDir, 0);
      digitalWrite(pinStep, 0);
      digitalWrite(pinEn, stOn);
      _speed = 1;
      infiniteRotation();
      console.log('Left rotation');
      return;
    }
    if (btn === 'CALIBR' && !calibration && !poweroff) {
      startFlag = true;
      Calibration();
      return;
    } else if (btn === 'CALIBR' && calibration && !poweroff) {
      calibration = false;
      Stop();
    }
    deg90flag = false;
    if (btn === '90DEG' && !calibration && !poweroff && !deg90flag) {
      deg90flag = true;
      deg90();
      return;
    } else if (btn === '90DEG' && calibration && !poweroff) {
      deg90flag = false;
      Stop();
    }
    if (btn === 'R POWER' && !poweroff) {
      g.off();
      poweroff = true;
      Stop();
      digitalWrite(pinLaser, rOff);
      return;
    } else if (btn === 'R POWER' && poweroff) {
      g.on();
      poweroff = false;
      LogoDisplay();
      digitalWrite(pinLaser, rOn);
      return;
    }
  });

  function LogoDisplay(){
    if (!display) {
      NumControl();
      return;
    }
    var x1x2 = 1;
    g.clear();
    g.setFontBitmap();
    g.setFont8x16();
    g.drawString(config.wifiSsid, 10, 45);
    g.flip();
    var preloader = setInterval(function () {
      g.setContrast(x1x2);
      g.drawLine(x1x2, 20, x1x2, 30);
      x1x2 += 2;
      g.drawLine(x1x2, 20, x1x2, 30);
      x1x2 += 2;
      g.drawLine(x1x2, 20, x1x2, 30);
      x1x2 += 2;
      g.drawLine(x1x2, 20, x1x2, 30);
      x1x2 += 2;
      g.drawLine(x1x2, 20, x1x2, 30);
      x1x2 += 2;
      g.drawLine(x1x2, 20, x1x2, 30);
      x1x2 += 2;
      g.flip();
      if (x1x2 > 126) {
        clearInterval(preloader);
        NumControl();
        StartDisplay();
      }
    }, 20);
  }

  function StartDisplay(){
    if (!display) {
      return;
    }
    g.clear();
    g.setFontVector(35);
    g.drawString(config.framesLeft + ' f', 0, 0);
    g.flip();
    g.setFontBitmap();
    g.setFont8x16();
    g.drawString(Math.floor(_shootingTime / 1000) + ' SECONDS', 0, 45);
    g.flip();
  }

  function SettingsDisplay_1(){
    if (!display) {
      return;
    }
    setupMode = true;
    dispay_2 = false;

    if (marker > indent * 4) {
      marker = 0;
    } else if (marker < 0) {
      marker = indent * 4;
    }

    g.clear();

    g.setFontBitmap();
    g.setFont8x16();
    g.drawString('>', 1, marker);
    g.drawString('>', 117, 28);
    g.drawString('1', 117, 0);

    g.drawLine(112, 0, 112, 127);

    g.drawString('frame', 8, 0);
    g.drawString('=', nameIndent, 0);
    g.drawString(config.frame, 57, 0);

    g.drawString('delay', 8, indent);
    g.drawString('=', nameIndent, indent);
    g.drawString(config.delay, 57, indent);

    g.drawString('pause', 8, indent * 2);
    g.drawString('=', nameIndent, indent * 2);
    g.drawString(config.pause, 57, indent * 2);

    g.drawString('speed', 8, indent * 3);
    g.drawString('=', nameIndent, indent * 3);
    g.drawString(config.speed, 57, indent * 3);

    g.drawString('accel', 8, indent * 4);
    g.drawString('=', nameIndent, indent * 4);
    g.drawString(config.acceleration, 57, indent * 4);

    g.flip();
  }

  function SettingsDisplay_2(){
    if (!display) {
      return;
    }
    if (config.direction === 1) {
      dirDisplay = 'right';
    } else {
      dirDisplay = 'left';
    }

    setupMode = true;
    dispay_2 = true;

    if (marker > indent * 2) {
      marker = 0;
    } else if (marker < 0) {
      marker = indent * 2;
    }

    g.clear();

    g.setFontBitmap();
    g.setFont8x16();
    g.drawString('>', 1, marker);
    g.drawString('<', 117, 28);
    g.drawString('2', 117, 0);

    g.drawLine(112, 0, 112, indent*3);

    nameIndent = 48;

    g.drawString('mode', 8, 0);
    g.drawString('=', nameIndent, 0);
    g.drawString(config.shootingMode, 57, 0);

    g.drawString('direc', 8, indent);
    g.drawString('=', nameIndent, indent);
    g.drawString(dirDisplay, 57, indent);

    g.drawString('steps', 8, indent * 2);
    g.drawString('=', nameIndent, indent * 2);
    g.drawString(config.allSteps, 57, indent * 2);

    g.drawString(config.wifiSsid, 8, indent * 3);
    g.flip();

    g.drawString('IP:' + photoPizzaIp, 8, indent * 4);
    g.flip();
  }

  function IrInput(btn) {

    irDigital = btn + '';

    if (!dispay_2 && marker === 0 && simNum <= 7 && simNum > 0) {
      config.frame = (config.frame + irDigital) * 1;
      NumControl();
      SettingsDisplay_1();
      simNum++;
    }
    if (!dispay_2 && marker === 0 && simNum === 0 && irDigital != '0') {
      config.frame = '';
      config.frame = (config.frame + irDigital) * 1;
      NumControl();
      SettingsDisplay_1();
      simNum++;
    }
    if (!dispay_2 && marker === indent && simNum <= 7 && simNum > 0) {
      config.delay = (config.delay + irDigital) * 1;
      SettingsDisplay_1();
      simNum++;
    }
    if (!dispay_2 && marker === indent && simNum === 0 && irDigital != '0') {
      config.delay = '';
      config.delay = (config.delay + irDigital) * 1;
      SettingsDisplay_1();
      simNum++;
    }
    if (!dispay_2 && marker === indent * 2 && simNum <= 7 && simNum > 0) {
      config.pause = (config.pause + irDigital) * 1;
      SettingsDisplay_1();
      simNum++;
    }
    if (!dispay_2 && marker === indent * 2 && simNum === 0 && irDigital != '0') {
      config.pause = '';
      config.pause = (config.pause + irDigital) * 1;
      SettingsDisplay_1();
      simNum++;
    }
    if (!dispay_2 && marker === indent * 3 && simNum <= 7 && simNum > 0) {
      config.speed = (config.speed + irDigital) * 1;
      NumControl();
      SettingsDisplay_1();
      simNum++;
    }
    if (!dispay_2 && marker === indent * 3 && simNum === 0 && irDigital != '0') {
      config.speed = '';
      config.speed = (config.speed + irDigital) * 1;
      SettingsDisplay_1();
      simNum++;
    }
    if (!dispay_2 && marker === indent * 4 && simNum <= 7 && simNum > 0) {
      config.acceleration = (config.acceleration + irDigital) * 1;
      SettingsDisplay_1();
      simNum++;
    }
    if (!dispay_2 && marker === indent * 4 && simNum === 0 && irDigital != '0') {
      config.acceleration = '';
      config.acceleration = (config.acceleration + irDigital) * 1;
      SettingsDisplay_1();
      simNum++;
    }

    //DISPLAY 2
    if (dispay_2 && marker === 0 && irDigital === '1') {
      config.shootingMode = 'inter';
      SettingsDisplay_2();
    }
    if (dispay_2 && marker === 0 && irDigital === '2') {
      config.shootingMode = 'seria';
      SettingsDisplay_2();
    }
    if (dispay_2 && marker === 0 && irDigital === '3') {
      config.shootingMode = 'nonST';
      SettingsDisplay_2();
    }
    if (dispay_2 && marker === 0 && irDigital === '4') {
      config.shootingMode = 'PingP';
      SettingsDisplay_2();
    }
     if (dispay_2 && marker === indent && irDigital === '1') {
      config.direction = 1;
      SettingsDisplay_2();
    }
    if (dispay_2 && marker === indent && irDigital === '2') {
      config.direction = 0;
      SettingsDisplay_2();
    }
    if (dispay_2 && marker === indent * 2 && simNum <= 7 && simNum > 0) {
      config.allSteps = (config.allSteps + irDigital) * 1;
      NumControl();
      SettingsDisplay_2();
      simNum++;
    }
    if (dispay_2 && marker === indent * 2 && simNum === 0 && irDigital != '0') {
      config.allSteps = '';
      config.allSteps = (config.allSteps + irDigital) * 1;
      NumControl();
      SettingsDisplay_2();
      simNum++;
    }
  }

  var stepperTime;
  var accelerationTime;
  var accIntervalSteps;
  var accSpeed;
  var shootingTime1F;
  var shootingTime;
  var _shootingTime;
  var nonStopTimerSpeed;
  var accSteps;
  var accStep;

  function NumControl() {
    console.log('NumControl');
    accSteps = (config.allSteps / config.frame) / 4;
    accStep = (config.speed / accSteps)*2;
    config.framesLeft = config.frame;
    _speed = 1;
    var frameSteps = config.allSteps / config.frame;
    stepperTime = frameSteps / config.speed * 1000;
    //stepperTime = frameSteps / config.speed;
    var accelerationSteps = frameSteps / 4;
    accelerationTime = stepperTime / 4;
    accIntervalSteps = Math.floor(0.04 * accelerationSteps);
    if (accIntervalSteps <= 0) {
      accIntervalSteps = 1;
    }
    //accStep = config.speed / accIntervalSteps;
    accSpeed = accelerationTime / accIntervalSteps;
    shootingTime1F = config.pause + config.delay + stepperTime + 500;
    shootingTime = shootingTime1F * config.frame;
    _shootingTime = shootingTime;
    nonStopTimerSpeed = stepperTime;
    digitalWrite(pinDir, config.direction);
    saveConfig();
  }

  function Start() {
    digitalWrite(pinEn, 0);
    digitalWrite(pinLaser, rOff);
	if (config.allSteps === -1){
		startFlag = true;
		Calibration();
		return;
	}
    if (config.shootingMode === 'nonST') {
      startFlag = true;
      nonStop();
      return;
    }
    if (config.framesLeft > 0) {
      startFlag = true;
      ShotingPause();
    } else {
      Stop();
    }
  }

  function Stop() {
    console.log('stop');
    clearInterval();
    startFlag = false;
    digitalWrite(pinStep, 0);
    digitalWrite(pinEn, 1);
    digitalWrite(pinRelay, rOn);
    digitalWrite(pinLaser, rOn);
    //P8.mode('analog');
    NumControl();
    StartDisplay();
    if (wsocket) {
      config.state = 'waiting';
      wsocket.send(JSON.stringify(config));
      //wsocket.send(JSON.stringify(config));
    }
  }

  function nonStop() {
    if (!startFlag) {
      return;
    }
    digitalWrite(pinLaser, rOff);
    shot();
    config.framesLeft--;
    StartDisplay();
    analogWrite(pinStep, 0.5, { freq : config.speed } );
    console.log('nonStopTimerSpeed ' + nonStopTimerSpeed);
    var nonStopInterval = setInterval(function () {
      if (config.framesLeft <= 0) {
        clearInterval(nonStopInterval);
        Stop();
        return;
      }
      else if (config.framesLeft == 1) {
        shot();
      }
      config.framesLeft--;
      StartDisplay();
      console.log('config.framesLeft ' + config.framesLeft);
      if (wsocket) {
        wsocket.send(JSON.stringify(config));
      }
    }, nonStopTimerSpeed);
  }

  function shot() {
    if (!startFlag) {
      return;
    }
    console.log('shot');
    digitalWrite(pinRelay, rOff);
    relayOn = true;
    var shotTimer = setTimeout(function () {
      digitalWrite(pinRelay, rOn);
      relayOn = false;
      clearTimeout(shotTimer);
    }, 100);
  }

  function Stepper() {
    if (!startFlag) {
      return;
    }
    var startSpeed = 100;
    //analogWrite(pinStep, 0.5, { freq : config.speed } );
    var stepsLeft = config.allSteps / config.frame;
    console.log('accStep ' + accStep);

    var stepTimer = setInterval(function () {

      startSpeed = config.speed;
      analogWrite(pinStep, 0.5, { freq : startSpeed } );

      stepsLeft -= startSpeed / 100;
      console.log('stepsLeft ' + stepsLeft);
      console.log('startSpeed ' + startSpeed);

      if (stepsLeft <= 0) {
        clearInterval(stepTimer);
        _shootingTime = _shootingTime - shootingTime1F;
        digitalWrite(pinStep, 0);
        Start();
        return;
      }


    }, 10);
  }

  function ShotingPause() {
    if (!startFlag) {
      return;
    }
    var pauseTimer = setTimeout(function () {
    Relay();
      clearTimeout(pauseTimer);
    }, config.pause);

  }

  function Relay() {
    if (!startFlag) {
      return;
    }
    console.log('Relay');

    if (config.framesLeft > 0 && startFlag) {
      relayOn = true;
      digitalWrite(pinRelay, rOff);
      //P8.mode('output');
      config.framesLeft--;
      var frameTimer = setTimeout(function () {
        digitalWrite(pinRelay, rOn);
        //P8.mode('analog');
        if (wsocket) {
          wsocket.send(JSON.stringify(config));
        }
        relayOn = false;
        StartDisplay();
        Stepper();
        clearTimeout(frameTimer);
      }, config.delay);
    } else {
      Stop();
    }
  }

  function BtnStop() {
    console.log('BtnStop');
        Stop();
  }
  function BtnStart() {
    startFlag = true;
    StartDisplay();
    Start();
  }

  function infiniteRotation() {
    digitalWrite(pinLaser, rOff);
    infiniteFlag = true;
    g.clear();
    g.setFontVector(20);
    g.drawString('infinite', 0, 0);
    g.flip();

    digitalWrite(pinEn, 0);
    analogWrite(pinStep, 0.5, { freq : config.speed } );
  }

  function Calibration() {
	if (!startFlag) {
      return;
    }
	calibration = true;
    g.clear();
    g.setFontVector(20);
    g.drawString('calibration', 0, 0);
    g.flip();

    digitalWrite(pinEn, 0);
    var step1 = true;
    config.allSteps = 0;
    analogWrite(pinStep, 0.5, { freq : config.speed } );

    setInterval(function () {
      config.allSteps += config.speed / 100;
	  console.log('allSteps = ' + config.allSteps);
	}, 10);

    setInterval(function () {
	  if (wsocket) {
		  wsocket.send(JSON.stringify(config));
		}
	}, 500);

  }

  if (display) {
    g = require("SH1106").connect(I2C1, LogoDisplay);
  }

  wifiConnect();
};

function onInit () {
  I2C1.setup({ 'scl': D4,
             'sda': D15});
  fs = require("fs");

  var riadTimer = setTimeout(function () {
    config = JSON.parse(fs.readFileSync("config.txt"));
    run();
  }, 100);
}

