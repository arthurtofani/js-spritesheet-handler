/**  	js-spritesheet-handler - copyleft (2013)
*  Arthur Tofani (gramofone @t gmail dotcom)

*  This software is distributed under GLP2 license
*	js-dragndrop is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
*	without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
*	See the GNU General Public License for more details.
*	(http://www.gnu.org/licenses/gpl2.txt)
*
*/

/*
	receives: id (string): a string for external references
			  container (jquery element): the object which will receive the changing background
			  jsonfile: a text file with the frames (exported from flash as JSON array)
			  pngfile: a spritesheet png from flash spritesheet export (trim option may be activated)
*/
var SpritesheetHandler = function(id, container) {
	this.version = "0.1c";
	this.id = id;
	this.container = container;
	this.defaultFPS = 24;
	this.internalStates = ["unloaded", "stopped", "running"];
	this.internalState = 0;
	this.states = {};
	this.interv = -1;
	this.internalRate = 100; //ms
	
	this.defaultState = null; // always in loop (repeat == -1)	
	this.currentState = null;
	this.currentRepeat = 0;
	this.callbacks = {};
	this.nextStates = [];
	this.maxFrame = 0;
	this.currentFrame = 0;	
	this.currentFPS = this.defaultFPS;
};


/*
	Adds a new state to the character
*/
SpritesheetHandler.prototype.addState = function(state, isdefault){
	state.handler = this;
	this.states[state.id] = state;
	this.callbacks[state.id] = [];
	if(isdefault) this.defaultState = state.id;	
	return this;
};

SpritesheetHandler.prototype.changeState = function(state_id, repeat, callback){
	if(state_id==this.currentState) return;
	
	repeat = repeat || 1;
	
	clearInterval(this.interv);	
	this.currentState = state_id;
	
	var s = this.states[state_id];
	this.currentFPS = s.fps;
	if(!s.fps) this.currentFPS = this.defaultFPS;
	this.maxFrame = s.endFrame;
	this.currentFrame = s.startFrame-1;
	this.currentRepeat = repeat;
	this.callbacks[state_id].push(callback);
	this.internalRate = 1000 / this.currentFPS;
	var d = this;
	this.interv = setInterval(function(){ d.nextFrame(); }, this.internalRate);
	// TODO: parei aqui

	if (this.container.find('.inner').length === 0) {
		// TODO: estava pegando daqui: https://bitbucket.org/heinencreative/flash-cs6-sprite-sheet-animator
        this.container.append('<div class="inner"></div>');
    }
    
	//this.currentFrame = -1;
	this.nextFrame();
	return this;
};

/*
	Enqueues states to be dispatched sequentially after current state ends
*/
SpritesheetHandler.prototype.queueState = function(state_id, repeat, callback){
	if(!this.states[state_id]) return;
	this.nextStates.push([state_id, repeat, callback]);
	return this;
};

/*
	Repeat rules:
	repeat <= 0 	---> infinite loop
	repeat > 0		---> repeats n times and goes back to default state
*/
SpritesheetHandler.prototype.nextFrame = function(){
	this.currentFrame++;
	if(this.currentFrame>this.maxFrame){
		switch(true){
			case (this.currentRepeat <= 0):
				this.currentFrame = this.states[this.currentState].startFrame;
				this.processFrame();
				break;
			case (this.currentRepeat == 1):				
				var cb = this.callbacks[this.currentState].shift();
				if (cb) cb();
				if(this.nextStates.length > 0) {
					var s = this.nextStates.shift();
					if (this.currentState == s[0]){
						this.currentState = "";
					}
					this.changeState(s[0], s[1], s[2]);
				} else {
					this.changeState(this.defaultState, 1);
				}
				break;
			case (this.currentRepeat > 1):
				this.currentRepeat --;
				this.currentFrame = this.states[this.currentState].startFrame;
				this.processFrame();			
				break;
		}
	} else {
		this.processFrame();
	}
};

SpritesheetHandler.prototype.processFrame = function(){
	var state = this.states[this.currentState];
	var current = state.data.frames[this.currentFrame];
	// Set container to max dimensions needed to contain animation
    
    this.container.css({
        position: 'absolute',
        width: current.sourceSize.w,
        height: current.sourceSize.h
    });
	this.container.find('.inner').css({
        position: 'absolute',
        background: 'url('+ state.img +')',
        width: current.frame.w +'px',
        height: current.frame.h +'px',
        backgroundPosition: '-'+current.frame.x+'px -'+current.frame.y+'px'
    }); 
};

var SpritesheetHandlerState = function(id, startFrame, endFrame, data, img) {
	this.id = id;
	this.img = img;
	this.data = this.getJSONFile(data);
	this.startFrame = startFrame;
	this.endFrame = endFrame;
	this.fps = null;

};

SpritesheetHandlerState.prototype.getJSONFile = function(data){
	if(typeof data === "object")
		return data;
	else if(typeof data === "string"){
		var request = new XMLHttpRequest();
		request.open('GET',data,false);
		request.send(null);
		if(request.status === 200)
			return JSON.parse(request.responseText);	
		else
			throw "Spritesheet Handler State: 'Arquivo JSON não encontrado'";		
	}
}

// changes Frame Per Second rate.
SpritesheetHandlerState.prototype.setFPS = function(newfps){
	//reconstructs the frameOrder array	
	this.fps = newfps;
	return this;
};

// how many seconds it takes to play all the frames. it changes FPS.
SpritesheetHandlerState.prototype.inSeconds = function(seconds){
	//calculates new fps and calls setFPS()	
	return this;
};
