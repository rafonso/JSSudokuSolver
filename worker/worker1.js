function id(strId) {
    return document.getElementById(strId);
}

worker = new Worker('worker.js');
worker.onmessage =  function(e) {
    switch(e.data.msg) {
        case "STARTED":
            console.info(e.data);
            id("btnStart").disabled = true;
            id("btnStop").disabled = false;
            break;
        case "STOPPED":
            console.info(e.data);
            id("btnStart").disabled = false;
            id("btnStop").disabled = true;
            break;
        case "TIME":
            id("log").value += e.data.time + '\n';
            break
        default:
            // ...
    }
};

function buttonAction(action) {
    worker.postMessage({msg: action}); 
    return false;
}

function changeStepTime() {
    worker.postMessage({msg: "STEPTIME", stepTime: id("stepTime").value});
}

function clean() {
    id('log').value = ''; 
    return false;
}

function init() {
    id("btnStop").disabled = true;
    changeStepTime();
}
