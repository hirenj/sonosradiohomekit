'use strict';

let make_standalone = function(player) {
  return player.becomeCoordinatorOfStandaloneGroup().then( () => player );
}

let play = function(player) {
  return player.coordinator.play().then( () => player );
};

let runPlaylist = function(playlist,player) {
  return player.coordinator.replaceWithPlaylist(playlist).then( () => player );
};

let runFavourite = function(fav,player) {
  return player.coordinator.replaceWithFavorite(fav).then( () => player );
};


let play_playlist_alone = function(player,playlist) {
  return make_standalone(player)
  .then( runPlaylist.bind(null,playlist) )
  .then( play )
  .then( player => {
    console.log("Played playlist ",playlist,"on",player.roomName);
  });
};

let play_fav_alone = function(player,fav) {
  return make_standalone(player)
  .then( runFavourite.bind(null,fav) )
  .then( play )
  .then( player => {
    console.log("Played favourite ",fav,"on",player.roomName);
  });
}

let Wrapper = function(speaker) {
  speaker.playRadio = function(station) {
    return play_fav_alone(speaker,station);
  };
  speaker.playPlaylist = function(playlist) {
    return play_playlist_alone(speaker,playlist);
  };
  speaker.setPause = function() {
    return speaker.coordinator.pause();
  };
  return speaker;
};


module.exports = Wrapper;