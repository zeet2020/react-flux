"use strict";

var Dispatcher = Flux.Dispatcher;
var AppDispatcher = new Dispatcher();

var SongCollection = [];
var OrgCollection = [];
var _currentSong = {};

function load_songs() {
    get_data().then(function (r) {

        r.json().then(function (data) {

            data.forEach(function (item, i) {
                data[i].id = i;
            });

            //this.setState({songs:data});

            //this.setState({"nowplaying":song});
            AppDispatcher.handleAction({ actionType: ACTIONS.LOAD_SONGS, data: data });
            AppDispatcher.handleAction({ actionType: ACTIONS.PLAY_SONG, data: data[0] });
        });
    });
};

function searchSongs(term) {
    SongCollection = _.filter(OrgCollection, function (item) {
        if (term.trim().length === 0) {
            return true;
        }
        return item.song.match(term) && item.song.match(term).length > 0;
    });
};

function setCurrentSong(song) {
    _currentSong = song;
};

function setSongCollection(collection) {
    SongCollection = collection;
    OrgCollection = collection;
};

var ACTIONS = {

    PLAY_SONG: "PLAY_SONG",
    NEXT_SONG: "NEXT_SONG",
    PREV_SONG: "PREV_SONG",
    SEARCH_SONG: "SEARCH_SONG",
    LOAD_SONGS: "LOAD_SONGS"

};

states = {};

var SongsStore = _.extend(EventEmitter.prototype, {
    getSongs: function getSongs() {
        return SongCollection;
    },
    currentSong: function currentSong() {
        return _currentSong;
    },
    emitChange: function emitChange() {
        this.emit('change');
    },
    addChangeListener: function addChangeListener(callback) {
        this.on('change', callback);
    },
    removeChangeListener: function removeChangeListener(callback) {
        this.removeListener('change', callback);
    }
});

AppDispatcher.register(function (payload) {
    var action = payload.action;
    var text;

    switch (action.actionType) {

        case ACTIONS.PLAY_SONG:
            setCurrentSong(action.data);
            break;

        case ACTIONS.NEXT_SONG:
            setCurrentSong(action.data);
            break;

        case ACTIONS.PREV_SONG:
            setCurrentSong(action.data);
            break;
        case ACTIONS.LOAD_SONGS:
            setSongCollection(action.data);
            break;
        case ACTIONS.SEARCH_SONG:
            searchSongs(action.data);
            break;
        default:
            return true;
    }

    // If action was responded to, emit change event
    SongsStore.emitChange();

    return true;
});

AppDispatcher.handleAction = function (action) {
    this.dispatch({
        source: 'VIEW_ACTION',
        action: action
    });
};

function get_data() {
    var url = "http://starlord.hackerearth.com/sureify/cokestudio";
    return fetch(url);
};

var SearchBox = React.createClass({
    displayName: "SearchBox",

    getInitialState: function getInitialState() {
        return { searchTerm: '' };
    },
    search: function search(e) {
        e.preventDefault();
        AppDispatcher.handleAction({ actionType: ACTIONS.SEARCH_SONG, data: this.state.searchTerm });
    },
    updateSearchTerm: function updateSearchTerm(e) {
        var _this = this;

        this.setState({ searchTerm: e.target.value }, function () {
            _this.search(e);
        });
    },
    render: function render() {

        return React.createElement(
            "form",
            { className: "navbar-form navbar-left", role: "search" },
            React.createElement(
                "div",
                { className: "form-group" },
                React.createElement("input", { value: this.state.searchTerm, onChange: this.updateSearchTerm, type: "text", className: "form-control" })
            ),
            React.createElement(
                "button",
                { type: "submit", onClick: this.search, className: "btn btn-default" },
                "search"
            )
        );
    }

});

var Player = React.createClass({
    displayName: "Player",

    getInitialState: function getInitialState() {
        return { song: {} };
    },
    next: function next() {
        this.props.action("next");
    },
    prev: function prev() {
        this.props.action("prev");
    },
    ended: function ended() {
        this.next();
    },
    render: function render() {
        var song = this.props.data || {};

        return React.createElement(
            "div",
            null,
            React.createElement(
                "h2",
                null,
                song.song
            ),
            React.createElement(
                "b",
                null,
                song.artists
            ),
            React.createElement(
                "p",
                null,
                React.createElement("img", { id: "cover", src: song.cover_image })
            ),
            React.createElement(
                "div",
                { id: "mainwrap" },
                React.createElement(
                    "div",
                    { id: "nowPlay" },
                    React.createElement(
                        "span",
                        { className: "left", id: "npAction" },
                        "Paused..."
                    ),
                    React.createElement("span", { className: "right", id: "npTitle" })
                ),
                React.createElement(
                    "div",
                    { id: "audiowrap" },
                    React.createElement(
                        "div",
                        { id: "audio0" },
                        React.createElement(
                            "audio",
                            { src: song.url, autoPlay: true, preload: true, id: "audio1", controls: "controls", onEnded: this.ended },
                            "Your browser does not support HTML5 Audio!"
                        )
                    ),
                    React.createElement(
                        "div",
                        { id: "tracks" },
                        React.createElement(
                            "a",
                            { onClick: this.prev, id: "btnPrev" },
                            "\xAB"
                        ),
                        React.createElement(
                            "a",
                            { onClick: this.next, id: "btnNext" },
                            "\xBB"
                        )
                    )
                )
            )
        );
    }

});

var Item = React.createClass({
    displayName: "Item",

    getInitialState: function getInitialState() {
        return { active: '' };
    },
    play: function play() {
        AppDispatcher.handleAction({ actionType: ACTIONS.PLAY_SONG, data: this.props.data });
    },
    render: function render() {
        var song = this.props.data;
        var active = void 0;
        if (this.props.currentlyPlaying.id === song.id) {
            active = "plSel";
        }

        return React.createElement(
            "li",
            { onClick: this.play, className: active },
            song.song
        );
    }

});

var SongsList = React.createClass({
    displayName: "SongsList",


    getInitialState: function getInitialState() {
        return {
            data: []
        };
    },
    render: function render() {
        var _this2 = this;

        var songs = this.props.data;

        songs = songs.map(function (i) {

            return React.createElement(Item, { currentlyPlaying: _this2.props.currentlyPlaying, key: i.id, data: i });
        });

        return React.createElement(
            "ul",
            { id: "plList" },
            songs
        );
    }

});

var MainPage = React.createClass({
    displayName: "MainPage",

    getInitialState: function getInitialState() {
        return {
            songs: SongsStore.getSongs(),
            nowplaying: SongsStore.currentSong()
        };
    },
    _onChange: function _onChange() {
        this.setState({
            songs: SongsStore.getSongs(),
            nowplaying: SongsStore.currentSong()
        });
    },
    componentWillUnmount: function componentWillUnmount() {
        SongsStore.removeChangeListener(this._onChange);
    },
    componentWillMount: function componentWillMount() {
        SongsStore.addChangeListener(this._onChange);
    },
    playNow: function playNow(song) {},
    nav: function nav(action) {
        var songs = this.state.songs;
        if (action == "next" && this.state.nowplaying.id < songs.length - 1) {
            push = songs[this.state.nowplaying.id + 1];
            AppDispatcher.handleAction({ actionType: ACTIONS.NEXT_SONG, data: push });
        }

        if (action === "prev" && this.state.nowplaying.id > 0) {
            push = songs[this.state.nowplaying.id - 1];

            AppDispatcher.handleAction({ actionType: ACTIONS.PREV_SONG, data: push });
        }
    },
    render: function render() {

        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "col-md-4" },
                React.createElement(
                    "div",
                    { className: "panel panel-default" },
                    React.createElement(
                        "div",
                        { className: "panel-heading" },
                        React.createElement(
                            "h3",
                            { className: "panel-title" },
                            "Songs List"
                        )
                    ),
                    React.createElement(
                        "div",
                        { id: "plwrap", className: "panel-body" },
                        React.createElement(SongsList, { currentlyPlaying: this.state.nowplaying, playNow: this.playNow, data: this.state.songs })
                    ),
                    React.createElement("div", { className: "panel-footer" })
                )
            ),
            React.createElement(
                "div",
                { id: "player", className: "col-md-6" },
                React.createElement(Player, { action: this.nav, data: this.state.nowplaying, songdata: this.state.songs })
            ),
            React.createElement("div", { id: "player", className: "col-md-2" })
        );
    }

});

window.onload = function () {

    ReactDOM.render(React.createElement(MainPage, null), document.getElementById('row'));
    ReactDOM.render(React.createElement(SearchBox, null), document.getElementById('bs-example-navbar-collapse-1'));
    load_songs();
};