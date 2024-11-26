class Sound {

    constructor(sources, radius, scene, aditionalParams) {

        this.audio = document.createElement("audio");
        this.radius = radius;
        this.scene = scene;

        for (var i = 0; i < sources.length; i++) {
            var source = document.createElement("source");
            source.src = sources[i];
            this.audio.appendChild(source);
        }

        //Additional params 
        let ap = aditionalParams;
        if("volume" in ap){
            this.volume = (ap.volume <= 1) ? ap.volume : 1;
        }else{
            this.volume = 1;
        }

        this.position = ("position" in ap) ?
            new THREE.Vector3(ap.position.x, ap.position.y, ap.position.z) :
            new THREE.Vector3(0, 0, 0);

        if ("debug" in ap) {
            if (ap.debug) {
                this.debugMode();
            }
        }
    }

    debugMode = function () {
       
    }

    play(){
        this.audio.play().catch(function(e) {
            console.log(e);
        });
    }

    update (element) {
        var distance = this.position.distanceTo(element.position);

        let volume = (distance <= this.radius) ? this.volume * (1 - distance / this.radius) : 0;
        this.audio.volume = volume;
    }
}