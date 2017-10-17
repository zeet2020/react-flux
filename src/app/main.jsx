


var Dispatcher = Flux.Dispatcher;
var AppDispatcher = new Dispatcher();


var SongCollection = [];
var OrgCollection = [];
var currentSong = {};

function load_songs(){
    get_data().then((r) => {
            
            r.json().then((data) => {  
               
                data.forEach(function(item,i){
                    data[i].id = i;
                });
                
                //this.setState({songs:data});
                
                //this.setState({"nowplaying":song});
                AppDispatcher.handleAction({actionType:ACTIONS.LOAD_SONGS,data:data});
                AppDispatcher.handleAction({actionType:ACTIONS.PLAY_SONG,data:data[0]});                            
                
            }); 
            
        });
};

function searchSongs(term){
    SongCollection = _.filter(OrgCollection,function(item){
        if(term.trim().length === 0){
            return true;
        }
        return (item.song.match(term) && item.song.match(term).length >0); 
    });
};


function setCurrentSong(song){
    currentSong = song;
};

function setSongCollection(collection){
   SongCollection = collection; 
    OrgCollection = collection;
};


var ACTIONS = {
    
    PLAY_SONG:"PLAY_SONG",
    NEXT_SONG:"NEXT_SONG",
    PREV_SONG:"PREV_SONG",
    SEARCH_SONG:"SEARCH_SONG",
    LOAD_SONGS:"LOAD_SONGS"
    
};



states = {
    
};



var SongsStore = _.extend(EventEmitter.prototype,{    
  getSongs:function(){
      return SongCollection;      
  },  
  currentSong:function(){
      return currentSong;
  },    
  emitChange: function() {
    this.emit('change');
  },
  addChangeListener: function(callback) {
    this.on('change', callback);
  },
  removeChangeListener: function(callback) {
    this.removeListener('change', callback);
  }
});



AppDispatcher.register(function(payload) {
  var action = payload.action;
  var text;
  
  switch(action.actionType) {

    
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


AppDispatcher.handleAction = function(action) {
  this.dispatch({
    source: 'VIEW_ACTION',
    action: action
  });
};



function get_data(){
    let url = "http://starlord.hackerearth.com/sureify/cokestudio";
    return fetch(url);
    
    
};


const SearchBox = React.createClass({
    getInitialState:function(){
      return {searchTerm:''};
    },
    search:function(e){
        e.preventDefault();
        AppDispatcher.handleAction({actionType:ACTIONS.SEARCH_SONG,data:this.state.searchTerm});
        
    },
    updateSearchTerm:function(e){
        this.setState({searchTerm:e.target.value},() => {
        this.search(e);    
        });
        
    },
    render:function(){
    
        return (
                <form className="navbar-form navbar-left" role="search">
                <div className="form-group">
				    <input value={this.state.searchTerm} onChange={this.updateSearchTerm} type="text" className="form-control" />
				</div> 
				<button type="submit" onClick={this.search} className="btn btn-default" >search</button>
                </form>
              );
        
        
    }
    
});


const Player = React.createClass({
    getInitialState:function(){
      return {song:{}};  
    },
    next:function(){
        this.props.action("next");
        
    },
    prev:function(){
      this.props.action("prev");  
    },
    ended:function(){
      this.next();  
    },
    render:function(){
        let song = this.props.data || {};
        
        
        return (<div>
        <h2>
				{song.song}
			</h2><b>{song.artists}</b>
			<p>
				<img id="cover" src={ song.cover_image } />
			</p>
			
			
				
        <div id="mainwrap">
            <div id="nowPlay">
                <span className="left" id="npAction">Paused...</span>
                <span className="right" id="npTitle"></span>
            </div>
            <div id="audiowrap">
                <div id="audio0">
                    <audio src={song.url} autoPlay preload id="audio1" controls="controls" onEnded={this.ended}>Your browser does not support HTML5 Audio!</audio>
                </div>
                <div id="tracks">
                    <a onClick={this.prev} id="btnPrev">&laquo;</a>
                    <a onClick={this.next} id="btnNext">&raquo;</a>
                </div>
            </div>
            
        </div>
    
			
                </div>
        );
    }
            
});




const Item = React.createClass({
    getInitialState:function(){
      return {active:''};  
    },
    play:function(){
        AppDispatcher.handleAction({actionType:ACTIONS.PLAY_SONG,data:this.props.data});
          
    },
    render:function(){
        let song = this.props.data;
        let active;
        if(this.props.currentlyPlaying.id === song.id){
            active = "plSel";
        }
        
        return (
          <li onClick={this.play} className={active}>{song.song}</li>
        );
    }
    
});


const SongsList = React.createClass({
    
getInitialState :function() {
    return {
      data:[]
    };
  },
render:function(){
        
        let songs = this.props.data;
    
          songs = songs.map((i) => {
            
            
            return (<Item   currentlyPlaying={this.props.currentlyPlaying} key={i.id} data={i}></Item>);
        });
        
         
        return (<ul id="plList">{songs}</ul>);
        
    }
    
});



const MainPage = React.createClass({
    getInitialState :function() {
    return {
      songs:SongsStore.getSongs(),
      nowplaying:SongsStore.currentSong()
    };
  },
    _onChange:function(){
        this.setState({
                songs:SongsStore.getSongs(),
                nowplaying:SongsStore.currentSong()
        });
    },
    componentWillUnmount: function() {
    SongsStore.removeChangeListener(this._onChange);
     },
    componentWillMount:function(){
        SongsStore.addChangeListener(this._onChange);
        
        
        
    },
    playNow:function(song){
        
        
    },
    nav:function(action){
        let songs = this.state.songs;
        if(action == "next" && this.state.nowplaying.id < songs.length-1){
            push = songs[this.state.nowplaying.id+1];
            AppDispatcher.handleAction({actionType:ACTIONS.NEXT_SONG,data:push});
            
        }
    
       if(action === "prev" && this.state.nowplaying.id > 0 ){ 
           push = songs[this.state.nowplaying.id-1];
           
           AppDispatcher.handleAction({actionType:ACTIONS.PREV_SONG,data:push});
           
       }
        
    },
    render:function(){
        
        return (<div>
		<div className="col-md-4">
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title">
						Songs List
					</h3>
                    
				</div>
				<div id="plwrap" className="panel-body">
					<SongsList  currentlyPlaying={this.state.nowplaying} playNow={this.playNow} data={this.state.songs}/>
				</div>
				<div className="panel-footer">
					
				</div>
			</div>
		</div>
		<div id="player" className="col-md-6">
			<Player action={this.nav} data={this.state.nowplaying} songdata={this.state.songs}/>
		</div>
                <div id="player" className="col-md-2"></div>        
	</div>            
        
        );
        
        
    }
    
    
});



window.onload = function(){



ReactDOM.render(<MainPage />,document.getElementById('row'));
    ReactDOM.render(<SearchBox />,document.getElementById('bs-example-navbar-collapse-1'));
load_songs();    

};
