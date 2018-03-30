'use strict';
const SonosSystem = require('sonos-discovery');

const Speaker = require('./accessories/Speaker');

const hap = require('hap-nodejs');
const path = require('path');

const Accessory = hap.Accessory;
const Bridge = hap.Bridge;

const Wrapper = require('./SpeakerWrapper');

const discovery = new SonosSystem({});

hap.init();

// Our Accessories will each have their own HAP server; we will assign ports sequentially
let targetPort = 51826;

const room_whitelist = ['Living Room','Kitchen'];

let filter_radio_stations = fav => fav.uri.indexOf('x-sonosapi-stream') >= 0;

let bridge = new Bridge('Sonos Bridge', hap.uuid.generate('Sonos Bridge'));

bridge.on('identify', function(paired, callback) {
  console.log("Sonos Bridge identify");
  callback();
});


discovery.on('topology-change', () => {
  let speakers = [].concat.apply([], discovery.zones.map( zc => zc.members ));
  let accepted_speakers = speakers.filter( speaker => room_whitelist.indexOf(speaker.roomName) >= 0);
  // // discovery.getPlaylists().then( lists => console.log(lists) );
  discovery.getFavorites()
  .then( favs => favs.filter( filter_radio_stations ) )
  .then( favs => favs.map(fav => { return { type: 'radio' , title: fav.title, uri: fav.uri }; }))
  .then( stations => {
    accepted_speakers.forEach( room => {
      let accessory = Speaker(Wrapper(room),stations);
      let target_port = targetPort++;
      bridge.addBridgedAccessory(accessory);

      // accessory.publish({port: target_port, username: accessory.username, pincode: accessory.pincode});
      console.log('Published',room.roomName,stations,'on port',target_port);
    });
    // Publish the Bridge on the local network.
    bridge.publish({
      username: "CC:22:3D:E3:CE:F6",
      port: 51826,
      pincode: "031-45-154",
      category: Accessory.Categories.BRIDGE
    });
  });
});