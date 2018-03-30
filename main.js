'use strict';
const SonosSystem = require('sonos-discovery');

const Speaker = require('./accessories/Speaker');

const hap = require('hap-nodejs');
const path = require('path');

const Accessory = hap.Accessory;

const Wrapper = require('./SpeakerWrapper');

const discovery = new SonosSystem({});

hap.init();

// Our Accessories will each have their own HAP server; we will assign ports sequentially
let targetPort = 51826;

let filter_radio_stations = fav => fav.uri.indexOf('x-sonosapi-stream') >= 0;

discovery.on('topology-change', () => {
  let speakers = [].concat.apply([], discovery.zones.map( zc => zc.members ));
  let living_room = speakers.filter( speaker => speaker.roomName == 'Living Room')[0];
  // // discovery.getPlaylists().then( lists => console.log(lists) );
  discovery.getFavorites()
  .then( favs => favs.filter( filter_radio_stations ) )
  .then( favs => favs.map(fav => { return { type: 'radio' , title: fav.title, uri: fav.uri }; }))
  .then( stations => {
    let accessory = Speaker(Wrapper(living_room),stations);
    accessory.publish({port: targetPort++, username: accessory.username, pincode: accessory.pincode});
    console.log('Published',stations);
  });
});