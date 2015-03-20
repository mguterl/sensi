# Sensi

A JavaScript API wrapper for [Sensi thermostats](https://mythermostat.sensicomfort.com/).

## Usage

```javascript
var Sensi = require('sensi');
var sensi = new Sensi({
  username: 'user@example.com',
  password: 'password'
});

sensi.start().then(function() {
  sensi.setHeat({
    icd: '11-1f-12-af-fa-07-8c-d7',
    temperature: 68,
    temperatureScale: 'F'
  }); 
}).catch(err) {
  console.log(err);
});
```

## TODO

* Add tests
* Documentation
* Extract generic method for calling commands
* Additional commands
  * SetFanMode
  * SetSystemMode
  * SetCool
