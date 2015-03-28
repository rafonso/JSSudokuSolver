var running = false;
var stepTime = 0;

function run() {
	if(running) {
        postMessage({msg: "TIME", time: new Date().toISOString()});
        setTimeout(run, stepTime); 
	}
}

self.addEventListener('message', function(e) {
    switch(e.data.msg) {
    	case "START":
    		running = true;
    		console.debug("[WORKER] STARTING. running = " + running);
            postMessage({msg: "STARTED"});
    		run();
    		break;
    	case "STOP":
    		running = false;
    		console.debug("[WORKER] STOPPING. running = " + running);
			postMessage({msg: "STOPPED"});
    		break;
    	case "STEPTIME":
    		stepTime = parseInt(e.data.stepTime);
    		console.debug("[WORKER] STEP TIME = " + stepTime);
			postMessage({msg: "STEP TIME CHANGED"});
			break;
    	default:
    		console.warn("[WORKER] " + e.data);
    }
});
