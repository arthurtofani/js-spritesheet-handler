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
	this.version = "0.1b"
	this.id = id;
	this.container = container;
	this.defaultFPS = 12;
	this.internalStates = ["unloaded", "stopped", "running"];
	this.internalState = 0;
	this.states = {};
	this.interv = -1;
	this.internalRate = 100; //ms
	
	this.defaultState = null; // always in loop (repeat == -1)	
	this.currentState = null;
	this.currentRepeat = 0;
	this.nextStates = [];
	this.frames = [];
	this.currentFrame = 0;	
	this.currentFPS = this.defaultFPS;
}


/*
	Adds a new state to the character
*/
SpritesheetHandler.prototype.addState = function(state, isdefault){
	state.handler = this;
	this.states[state.id] = state;
	if(isdefault) this.defaultState = state.id;
}
SpritesheetHandler.prototype.changeState = function(state_id, repeat){
	this.currentState = state_id;
	
	var s = states[state_id]
	this.currentFPS = s.fps;
	var qtframes = s.endFrame - s.startFrame;
	// TODO: parei aqui

	

	this.currentFrame = -1;
	if (this.container.find('.inner').length === 0) {
		// TODO: estava pegando daqui: https://bitbucket.org/heinencreative/flash-cs6-sprite-sheet-animator
        this.container.append('<div class="inner"></div>');
    }
	this.nextFrame();
}
/*
	Enqueues states to be dispatched sequentially after current state ends
*/
SpritesheetHandler.prototype.queueState = function(state_id, repeat){
	if(!this.states[state_id]) return;
	this.nextStates.push([state_id, repeat])
}

SpritesheetHandler.prototype.nextFrame = function(){
	this.currentFrame++;
	if(this.currentFrame>=this.frames.length){
		switch(true){
			case (this.currentRepeat < 0):
				this.changeState(this.currentState, -1)
				break;
			case (this.currentRepeat == 0):
				if(this.nextStates.length>0) {
					var s = nextStates.shift;
					this.changeState(s[0], s[1]);
				} else {
					this.changeState(this.defaultState, -1);
				}
				break;
			case (this.currentRepeat > 0):
				break;
				this.changeState(this.defaultState, this.currentRepeat-1);
		}
	} else {
		this.processFrame()
	}
}

SpritesheetHandler.prototype.processFrame = function(){
	var state = this.states(this.currentState);
	var current = state.data.frames[frameCount];
	// Set container to max dimensions needed to contain animation
    
    this.container.css({
        position: 'absolute', // default was relative, but changed for Eliza Corp
        width: current.sourceSize.w,
        height: current.sourceSize.h
    });
	this.container.find('.inner').css({
        position: 'absolute',
        background: 'url('+ state.img +')',
        width: current.frame.w+'px',
        height: current.frame.h+'px',
        backgroundPosition: '-'+current.frame.x+'px -'+current.frame.y+'px',
        top: current.spriteSourceSize.y,
        left: current.spriteSourceSize.x
    });    
}

var SpritesheetHandlerState = function(id, startFrame, endFrame, data, img) {
	this.id = id;
	this.img = img;
	this.data = data;
	this.startFrame = startFrame;
	this.endFrame = endFrame;
	this.fps = null;
}
// changes Frame Per Second rate.
SpritesheetHandlerState.prototype.setFPS = function(newfps){
	//reconstructs the frameOrder array	
	this.fps = newfps;
	return this;
}

// how many seconds it takes to play all the frames. it changes FPS.
SpritesheetHandlerState.prototype.inSeconds = function(seconds){
	//calculates new fps and calls setFPS()	
	return this;
}
