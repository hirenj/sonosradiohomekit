const hap = require('hap-nodejs');
const Accessory = hap.Accessory;
const Service = hap.Service;
const Characteristic = hap.Characteristic;
const uuid = hap.uuid;

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake fan.
let SonosSpeaker = function(speaker,targets) {
  let title = speaker.roomName;
  let title_clean = title.replace(/[^A-Za-z]/g,'').toLowerCase();
  let accessory = new Accessory(`${speaker.roomName} Sonos`, uuid.generate(`hap-nodejs:accessories:${title_clean}-sonos`));
  accessory.room = title;
  basic_setup(accessory);
  targets.forEach( target => {
    add_target_switches(accessory,speaker,target);
  });
  return accessory;
};

let basic_setup = function(accessory) {
  accessory.username = '1A:2B:3C:4D:5E:FF';
  accessory.pincode = '031-45-154';

  accessory
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Sonos");

  // listen for the "identify" event for this Accessory
  accessory.on('identify', function(paired, callback) {
    console.log(`Speaker ${accessory.room} Identified!`);
    callback();
  });

}

let add_target_switches = function(accessory,speaker,target) {
  let SwitchService = accessory.addService(Service.Switch, target.title,target.title);    
  SwitchService.getCharacteristic(Characteristic.On)
    .on('set', function(value, callback) {
      if (value) {
        if (target.type === 'radio') {
          speaker.playRadio(target.title).then(() => callback());          
        } else {
          speaker.playPlaylist(target.title).then( () => callback());
        }
      } else {
        speaker.setPause().then(() => callback());
      }
    });

  SwitchService.getCharacteristic(Characteristic.On)
    .on('get', function(callback) {
      console.log(speaker.state.currentTrack);
      console.log(speaker.state.currentTrack.stationName,target.title);
      console.log(speaker.state.playbackState)
    if ((speaker.state.currentTrack.uri === target.uri) && 
       (speaker.state.playbackState !== 'STOPPED') ) {
      callback(null,true);
    } else {
      callback(null,false);
    }
  });
};

module.exports = SonosSpeaker;
