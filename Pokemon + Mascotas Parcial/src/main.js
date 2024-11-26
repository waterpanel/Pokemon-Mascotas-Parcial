// ----------------------------
// Inicialización de Variables:
// ----------------------------
var scene    = null,
    camera   = null,
    renderer = null,
    controls = null,
    clock = null;

var sound1      = null,
    countPoints = null,
    modelLoad   = null,
    light       = null,
    figuresGeo  = [];

var MovingCube         = null,
    collidableMeshList = [],
    lives              = 3,
    numberToCreate     = 9;

var color = new THREE.Color();

var scale  = 1;
var rotSpd = 0.05;
var spd    = 0.05; 
var input  = {left:0,right:0, up: 0, down: 0};

var posX = 3;
var posY = 0.5;
var posZ = 1;

var isJumping = false; // Indica si el jugador está saltando
var jumpHeight = 5;  // Altura máxima del salto
var jumpSpeed = 0.1;   // Velocidad del salto
var jumpDirection = 1; // Dirección del salto: 1 para subir, -1 para bajar

var collidableMeshList = []; // Lista de objetos con los que se puede colisionar






const objectModels = [
    { generalPath: "./modelos/Pokemon/", gltf: "aron.gltf" },
    { generalPath: "./modelos/Pokemon/", gltf: "dreepy.gltf" },
    { generalPath: "./modelos/Pokemon/", gltf: "fuecoco.gltf" },
    { generalPath: "./modelos/Pokemon/", gltf: "pikachu_male.gltf" },
    { generalPath: "./modelos/Pokemon/", gltf: "piplup.gltf" },
    { generalPath: "./modelos/Pokemon/", gltf: "riolu.gltf" },
    { generalPath: "./modelos/Pokemon/", gltf: "rookidee.gltf" },
    { generalPath: "./modelos/Pokemon/", gltf: "rowlet.gltf" },
    { generalPath: "./modelos/Pokemon/", gltf: "snivy.gltf" }
];

/*const aronModel = "./modelos/Pokemon/aron.gltf";
const dreepyModel = "./modelos/Pokemon/dreepy.gltf";
const fuecocoModel = "./modelos/Pokemon/fuecoco.gltf";
const pikachu_maleModel = "./modelos/Pokemon/pikachu_male.gltf";
const piplupModel = "./modelos/Pokemon/piplup.gltf";
const rioluModel = "./modelos/Pokemon/riolu.gltf";
const rookideeModel = "./modelos/Pokemon/rookidee.gltf";
const rowletModel = "./modelos/Pokemon/rowlet.gltf";
const snivyModel = "./modelos/Pokemon/snivy.gltf";*/

const modelsGlobalInfo = [];
// ----------------------------
// Funciones de creación init:
// ----------------------------
function start() {
    window.onresize = onWindowResize;
    initScene();
    console.log("Lista de objetos colisionables:", collidableMeshList);

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function initScene(){
    initBasicElements(); // Scene, Camera and Render
    //addSkybox();
    initSound();         // To generate 3D Audio
    createLight();       // Create light
    initWorld();
    createPlayerMove();
    createCollectables(9);
    createCenterCube();
    
    
}

function createCenterCube() {
    const loader = new THREE.TextureLoader();

    // Cargar texturas para cada lado del cubo
    const materials = [
        new THREE.MeshBasicMaterial({ map: loader.load('./img/sky/dr.png'), side: THREE.BackSide }), // Lado +X
        new THREE.MeshBasicMaterial({ map: loader.load('./img/sky/iz.png'), side: THREE.BackSide }), // Lado -X
        new THREE.MeshBasicMaterial({ map: loader.load('./img/sky/up.png'), side: THREE.BackSide }), // Lado +Y
        new THREE.MeshBasicMaterial({ map: loader.load('./img/sky/down.png'), side: THREE.BackSide }), // Lado -Y
        new THREE.MeshBasicMaterial({ map: loader.load('./img/sky/fr.png'), side: THREE.BackSide }), // Lado +Z
        new THREE.MeshBasicMaterial({ map: loader.load('./img/sky/at.png'), side: THREE.BackSide })  // Lado -Z
    ];

    // Geometría del cubo
    const geometry = new THREE.BoxGeometry(500, 200, 500);

    // Crear el cubo con las texturas
    const cube = new THREE.Mesh(geometry, materials);

   
    cube.position.set(0, 2.2, 0);


    scene.add(cube);
}



function animate(){

    //updateGrabbedCubePosition(); // Llama para actualizar la posición del cubo frente a la cámara


    requestAnimationFrame(animate);
    renderer.render(scene,camera);
    sound1.update(camera);
    movePlayer();
 
}

// Variable para la caja de colisión del jugador
var playerCollisionBox;

// Modificar la función initBasicElements para agregar la caja de colisión
function initBasicElements() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#app") });
    clock = new THREE.Clock();

    scene.background = new THREE.Color(0x0099ff);
    scene.fog = new THREE.Fog(0xffffff, 0, 750);

    var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);

    renderer.setSize(window.innerWidth, window.innerHeight - 4);
    document.body.appendChild(renderer.domElement);

    camera.position.set(3, 3.7, 1);

    // Crear la caja de colisión del jugador
    const boxGeometry = new THREE.BoxGeometry(1, 4, 1);
    const boxMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
        transparent: true,
        opacity: 0
    });

    playerCollisionBox = new THREE.Mesh(boxGeometry, boxMaterial);
    playerCollisionBox.position.copy(camera.position); // Sincroniza con la posición de la cámara
    scene.add(playerCollisionBox);
}

function initSound() {
    sound1 = new Sound(["./songs/rain.mp3"],5,scene,{   // radio(10)
        debug:true,
        position: {x:camera.position.x,y:camera.position.y,z:camera.position.z}
    });
}

let modelBounds = null; // Variable global para guardar los límites del modelo

function createFistModel(generalPath, pathMtl, pathObj) {
    const mtlLoader = new THREE.MTLLoader();
    mtlLoader.setTexturePath(generalPath);
    mtlLoader.setPath(generalPath);
    mtlLoader.load(pathMtl, function (materials) {
        materials.preload();

        const objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(generalPath);
        objLoader.load(pathObj, function (object) {

            modelLoad = object;
            figuresGeo.push(modelLoad);
            scene.add(object);
            object.scale.set(3, 3, 3);

            object.position.y = 0;
            object.position.x = 5;
            object.position.z = 5;

            // Agregar las mallas a un array para detección de colisiones
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.geometry.computeBoundingBox(); // Recalcular BoundingBox
                    child.geometry.computeBoundingSphere(); // Opcional
                    sceneMeshes.push(child); // Agregar la malla al array global
                }
            });

            // Obtener los límites del objeto (bounding box)
            const box = new THREE.Box3().setFromObject(object);
            modelBounds = {
                minX: box.min.x,
                maxX: box.max.x,
                minZ: box.min.z,
                maxZ: box.max.z
            };
        });
    });
}





function createCollectables(factor2create) {
    // Mezclar aleatoriamente la lista de modelos y seleccionar los primeros 'factor2create'
    const shuffledModels = objectModels.sort(() => 0.5 - Math.random());
    const selectedModels = shuffledModels.slice(0, factor2create);

    for (let k = 0; k < factor2create; k++) {
        createPickUp(selectedModels[k], k);

        // Crear un objeto con el nombre y la ruta completa del modelo
        const modelData = {
            name: `Objeto ${k + 1}`,
            fullPath: `${selectedModels[k].generalPath}${selectedModels[k].gltf}`
        };

        // Agregar la información al arreglo global
        modelsGlobalInfo.push(modelData);
    }

    // Mostrar la primera alerta con la información del arreglo global
    //alert(JSON.stringify(modelsGlobalInfo, null, 2));

    // Mostrar la segunda alerta con la ruta del modelo del primer objeto
    /*if (modelsGlobalInfo.length > 0) {
        alert(`Ruta del modelo del Objeto 1: ${modelsGlobalInfo[0].fullPath}`);
    }*/
}


// Crear función para cargar un modelo aleatorio
function getRandomModel() {
    const index = Math.floor(Math.random() * objectModels.length);
    return objectModels[index];
}
function createPickUp(model, element) {
    const loader = new THREE.GLTFLoader();
    loader.setPath(model.generalPath);
    loader.load(model.gltf, (gltf) => {
        const object = gltf.scene;

        const scale = 0.5; // Escala del modelo
        object.scale.set(scale, scale, scale);

        

        // Dimensiones del cubo principal
        const cubeSizeX = 32;
        const cubeSizeZ = 32;
        const cubeHeight = 25;

        // Crear el cubo "notSpawn"
        const notSpawnSizeX = 6;
        const notSpawnSizeZ = 12;
        const notSpawnHeight = 10;
        const notSpawnPosition = new THREE.Vector3(5, 3, 17);

        const notSpawnGeometry = new THREE.BoxGeometry(notSpawnSizeX, notSpawnHeight, notSpawnSizeZ);
        const notSpawnMaterial = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            wireframe: false,
            transparent: true,
            opacity: 0,
        });

        const notSpawnCube = new THREE.Mesh(notSpawnGeometry, notSpawnMaterial);
        notSpawnCube.position.copy(notSpawnPosition);
        scene.add(notSpawnCube);

        // Crear el cubo "notSpawn2"
        const notSpawn2SizeX = 10;
        const notSpawn2SizeZ = 10;
        const notSpawn2Height = 5;
        const notSpawn2Position = new THREE.Vector3(-8, 1, 20);

        const notSpawn2Geometry = new THREE.BoxGeometry(notSpawn2SizeX, notSpawn2Height, notSpawn2SizeZ);
        const notSpawn2Material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: false,
            transparent: true,
            opacity: 0,
        });

        const notSpawnCube2 = new THREE.Mesh(notSpawn2Geometry, notSpawn2Material);
        notSpawnCube2.position.copy(notSpawn2Position);
        scene.add(notSpawnCube2);

        // Crear el cubo "notSpawn3"
        const notSpawn3SizeX = 6.5; // Dimensiones iniciales (editable manualmente)
        const notSpawn3SizeZ = 6.5;
        const notSpawn3Height = 4;
        const notSpawn3Position = new THREE.Vector3(16, 2, 16); // Posición inicial (editable manualmente)

        const notSpawn3Geometry = new THREE.BoxGeometry(notSpawn3SizeX, notSpawn3Height, notSpawn3SizeZ);
        const notSpawn3Material = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            wireframe: false,
            transparent: true,
            opacity: 0,
        });

        const notSpawnCube3 = new THREE.Mesh(notSpawn3Geometry, notSpawn3Material);
        notSpawnCube3.position.copy(notSpawn3Position);
        scene.add(notSpawnCube3);

        // Crear el cubo FRONTERA
        const cubeGeometry = new THREE.BoxGeometry(cubeSizeX, cubeHeight, cubeSizeZ);
        const cubeMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: false,
            transparent: true,
            opacity: 0,
        });

        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(5, 0, 5);
        scene.add(cube);

        // Calcular posición aleatoria fuera de todos los cubos "notSpawn", "notSpawn2" y "notSpawn3"
        let positionValid = false;
        while (!positionValid) {
            object.position.x = getRandomFloat(
                cube.position.x - cubeSizeX / 2,
                cube.position.x + cubeSizeX / 2
            );
            object.position.y = 2.1; 
            object.position.z = getRandomFloat(
                cube.position.z - cubeSizeZ / 2,
                cube.position.z + cubeSizeZ / 2
            );

            // Verificar si está fuera de todos los cubos notSpawn, notSpawn2 y notSpawn3
            positionValid = !isInside(object.position, notSpawnCube, notSpawnSizeX, notSpawnHeight, notSpawnSizeZ) &&
                            !isInside(object.position, notSpawnCube2, notSpawn2SizeX, notSpawn2Height, notSpawn2SizeZ) &&
                            !isInside(object.position, notSpawnCube3, notSpawn3SizeX, notSpawn3Height, notSpawn3SizeZ);
        }

        object.rotation.y = getRandomFloat(0, Math.PI * 2);
        object.name = "modelToPickUp" + element;
        object.id = "modelToPickUp" + element;

        // Asignar la ruta completa del modelo al objeto
        object.modelPath = `${model.generalPath}${model.gltf}`;

        scene.add(object);
        collidableMeshList.push(object);

        console.log("Añadido a collidableMeshList: ", object.name);
        console.log("Posición del objeto: ", object.position);
    });

    function isInside(position, cube, sizeX, sizeY, sizeZ) {
        return (
            position.x > cube.position.x - sizeX / 2 &&
            position.x < cube.position.x + sizeX / 2 &&
            position.y > cube.position.y - sizeY / 2 &&
            position.y < cube.position.y + sizeY / 2 &&
            position.z > cube.position.z - sizeZ / 2 &&
            position.z < cube.position.z + sizeZ / 2
        );
    }

    function getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}


function createLight() {
    var light2 = new THREE.AmbientLight(0xffffff);
    light2.position.set(10, 10, 10);
    scene.add(light2);
    light = new THREE.DirectionalLight(0xffffff, 0, 1000);
    scene.add(light);
}

function initWorld() {
    // Create Map

    const generalPath = "./modelos/Mapa/Mapa Pokemon/";
    const fileObj = "Mapa Pokemon.obj";
    const fileMtl = "Mapa Pokemon.mtl";
    createFistModel(generalPath,fileMtl,fileObj);

    loadPCPokemon();

    
    

}



// ----------------------------------
// Función Para mover al jugador:
// ----------------------------------
function movePlayer() {
    if (input.right === 1) {
        camera.rotation.y -= rotSpd;
        MovingCube.rotation.y -= rotSpd;
    }
    if (input.left === 1) {
        camera.rotation.y += rotSpd;
        MovingCube.rotation.y += rotSpd;
    }
    if (input.up === 1) {
        camera.position.z -= Math.cos(camera.rotation.y) * spd;
        camera.position.x -= Math.sin(camera.rotation.y) * spd;
        MovingCube.position.z -= Math.cos(camera.rotation.y) * spd;
        MovingCube.position.x -= Math.sin(camera.rotation.y) * spd;
    }
    if (input.down === 1) {
        camera.position.z += Math.cos(camera.rotation.y) * spd;
        camera.position.x += Math.sin(camera.rotation.y) * spd;
        MovingCube.position.z += Math.cos(camera.rotation.y) * spd;
        MovingCube.position.x += Math.sin(camera.rotation.y) * spd;
    }

    // Lógica de salto
    if (isJumping) {
        MovingCube.position.y += jumpSpeed * jumpDirection;
        camera.position.y += jumpSpeed * jumpDirection;

        if (MovingCube.position.y >= jumpHeight) {
            jumpDirection = -1;
        }
        if (MovingCube.position.y <= 3.7) {
            MovingCube.position.y = 3.7;
            camera.position.y = 3.7;
            isJumping = false;
            jumpDirection = 1;
        }
    }

    // Actualiza la posición de la caja de colisión del jugador para que siga la cámara
    playerCollisionBox.position.copy(camera.position);

    // Si hay un cubo recolectado, moverlo con la cámara y alinear su orientación con la cámara
    if (grabbedCube) {
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        grabbedCube.position.copy(camera.position).add(cameraDirection.multiplyScalar(1.5)); // Ajusta la distancia

        // Alinea la rotación del cubo con la rotación de la cámara
        grabbedCube.rotation.copy(camera.rotation);
    }

    // Verificar colisiones
    detectCollisionsWithPlayer();
}

  
window.addEventListener('keydown', function(e) {
    switch (e.keyCode) {
        case 68: // 'D'
            input.right = 1;
            break;
        case 65: // 'A'
            input.left = 1;
            break;
        case 87: // 'W'
            input.up = 1;
            break;
        case 83: // 'S'
            input.down = 1;
            break;
        case 32: // 'Espacio'
            if (!isJumping) { // Sólo salta si no está en el aire
                isJumping = true;
            }
            break;
        case 27: // 'Esc'
            document.getElementById("blocker").style.display = 'block';
            break;
    }
});


  window.addEventListener('keyup', function(e) {
    switch (e.keyCode) {
      case 68:
        input.right = 0;
        break;
      case 65:
        input.left = 0;
        break;
      case 87:
        input.up = 0;
        break;
      case 83:
        input.down = 0;
        break;
    }
  });

  function loadPCPokemon() {
    const generalPath = "./modelos/Mapa/PC Pokemon/"; // Ruta al modelo
    const objFile = "PC Pokemon.obj";           // Archivo OBJ
    const mtlFile = "PC Pokemon.mtl";           // Archivo MTL

    const mtlLoader = new THREE.MTLLoader();
    mtlLoader.setTexturePath(generalPath); // Asegúrate de que las texturas están aquí
    mtlLoader.setPath(generalPath);        // Ruta base
    mtlLoader.load(mtlFile, (materials) => {
        materials.preload();

        const objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials); // Asignar materiales cargados
        objLoader.setPath(generalPath);
        objLoader.load(objFile, (PC) => {
            PC.scale.set(0.3, 0.3, 0.3);     // Escalar el modelo
            PC.position.set(3, 2.1, 11);  // Ajustar posición
            PC.rotation.y = Math.PI; // Rota si es necesario
            scene.add(PC); // Agregar al escenario
            
            // Crear cubo para wireframe
            const wireframeCubeGeometry = new THREE.BoxGeometry(1, 4, 1); // Tamaño del cubo
            const wireframeCubeMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000, // Color negro para el wireframe
                wireframe: true,
                opacity: 0,
                transparent: true
            });
            const wireframeCube = new THREE.Mesh(wireframeCubeGeometry, wireframeCubeMaterial);
            wireframeCube.name = "PC";

            // Posicionar el cubo en la misma posición que PC
            wireframeCube.position.set(3, 2.1, 11); // Misma posición
            scene.add(wireframeCube); // Agregar cubo al escenario

            // Agregar el wireframeCube a la lista de objetos colisionables
            collidableMeshList.push(wireframeCube);
        });
    });
}



// ----------------------------------
// Funciones llamadas desde el index:
// ----------------------------------
function go2Play() {
    document.getElementById('blocker').style.display = 'none';
    document.getElementById('cointainerOthers').style.display = 'block';
    playAudio(x);
    initialiseTimer();
}

function initialiseTimer() {
    let sec = 0;
    function pad(val) { return val > 9 ? val : "0" + val; }

    const timerInterval = setInterval(() => {
        sec++;
        document.getElementById("seconds").innerHTML = String(pad(sec % 60));
        document.getElementById("minutes").innerHTML = String(pad(parseInt(sec / 60, 10)));

        // Si el temporizador llega a 1:30 (90 segundos), muestra la pantalla de derrota
        if (sec === 105) {
            clearInterval(timerInterval); // Detén el temporizador
            showLostScreen();
        }
    }, 1000);
}

function showVictoryScreen() {
    document.getElementById('victory').style.display = 'block';
    document.getElementById('cointainerOthers').style.display = 'none';
    pauseAudio(x); // Pausa la música actual
    playAudio(z); // Reproduce sonido de fin del juego
}

function showLostScreen() {
    document.getElementById('lost').style.display = 'block';
    document.getElementById('cointainerOthers').style.display = 'none';
    pauseAudio(x); // Pausa la música actual
    playAudio(y); // Reproduce sonido de fin del juego
}

function showInfoCreator() {
    if( document.getElementById("myNameInfo").style.display == "none")
        document.getElementById("myNameInfo").style.display = "block";
    else
        document.getElementById("myNameInfo").style.display = "none";

}
// ----------------------------------
// Funciones llamadas desde el index:
// ----------------------------------
function createPlayerMove() {
  var cubeGeometry = new THREE.CubeGeometry(1,1,1,1,1,1);
	var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe:true, transparent: true, opacity: 0.0 } );
	MovingCube = new THREE.Mesh( cubeGeometry, wireMaterial );
	MovingCube.position.set(camera.position.x,camera.position.y,camera.position.z);
	scene.add( MovingCube );
}



// Función para detectar colisiones entre el jugador y los objetos recolectables
let grabbedCube = null; // Variable global para almacenar el cubo recolectado

// Variable global para el puntaje
let score = 0;






// Lista global para rastrear posiciones predefinidas y disponibles
const predefinedPositions = [
    new THREE.Vector3(18, 2.2, 14),
    new THREE.Vector3(17, 2.2, 15),
    new THREE.Vector3(15, 2.2, 15),
    new THREE.Vector3(16, 2.2, 16),
    new THREE.Vector3(17, 2.2, 18),
    new THREE.Vector3(17, 2.2, 17),
    new THREE.Vector3(14, 2.2, 14),
    new THREE.Vector3(14, 2.2, 18),
    new THREE.Vector3(18, 2.2, 16),
];

// Inicializa una copia del arreglo para las posiciones disponibles
let availablePositions = [...predefinedPositions];

function detectCollisionsWithPlayer() {
    let collidedModelPath = '';

    for (let i = 0; i < collidableMeshList.length; i++) {
        const object = collidableMeshList[i];
        const objectBox = new THREE.Box3().setFromObject(object);
        const playerBox = new THREE.Box3().setFromObject(playerCollisionBox);

        // Si un modelo está siguiendo a la cámara, ignorar todos los objetos excepto "PC"
        if (isModelFollowingCamera() && object.name !== "PC") {
            continue; // Salta a la siguiente iteración
        }

        if (playerBox.intersectsBox(objectBox)) {
            if (object.name === "PC") {
                // Busca si hay un modelo siguiendo a la cámara
                const modelFollowingCamera = scene.children.find(child => child.userData.followingCamera);

                if (modelFollowingCamera) {
                    // Elimina el modelo de la escena
                    scene.remove(modelFollowingCamera);

                    // Verifica si hay posiciones disponibles
                    if (availablePositions.length === 0) {
                        console.warn('No hay posiciones disponibles. Reiniciando lista.');
                        availablePositions = [...predefinedPositions]; // Reinicia las posiciones
                    }

                    // Selecciona una posición aleatoria de las disponibles
                    const randomIndex = Math.floor(Math.random() * availablePositions.length);
                    const randomPosition = availablePositions[randomIndex];

                    // Elimina la posición seleccionada del arreglo de disponibles
                    availablePositions.splice(randomIndex, 1);

                    // Mostrar una alerta indicando qué posición se eliminó
                    //alert(`Posición eliminada: ${randomPosition.x}, ${randomPosition.y}, ${randomPosition.z}`);

                    // Crea un duplicado del modelo
                    const duplicatedModel = modelFollowingCamera.clone();

                    // Establece la posición del duplicado
                    duplicatedModel.position.copy(randomPosition);

                    // Asigna una rotación aleatoria en "y"
                    const randomY = Math.random() * Math.PI * 2; // Rango: [0, 2π]
                    duplicatedModel.rotation.set(0, randomY, 0);

                    // Limpia cualquier comportamiento de seguimiento
                    duplicatedModel.userData.followingCamera = false;

                    // Añade el duplicado a la escena
                    scene.add(duplicatedModel);
                    score += 1;
                    document.getElementById('score').textContent = score;

                    if (score === 9) {
                        showVictoryScreen();
                    }
                }

                break; // Sal del bucle
            } else {
                // Elimina el objeto colisionado de la escena y de la lista de colisionables
                scene.remove(object);
                collidableMeshList.splice(i, 1);

                // Obtiene la ruta del modelo colisionado
                collidedModelPath = object.modelPath;

                // Carga el nuevo modelo y lo hace seguir a la cámara
                const loader = new THREE.GLTFLoader();
                loader.load(collidedModelPath, (gltf) => {
                    const model = gltf.scene;
                    model.scale.set(0.5, 0.5, 0.5);
                    model.userData.followingCamera = true;

                    scene.add(model);

                    function updateModelPosition() {
                        const cameraDirection = new THREE.Vector3();
                        camera.getWorldDirection(cameraDirection);
                        model.position.copy(camera.position)
                            .add(cameraDirection.multiplyScalar(0.5)) // Ajusta cercanía
                            .setY(model.position.y - 0.5); // Ajusta hacia abajo en el eje Y
                        model.lookAt(camera.position);
                    }

                    function animate() {
                        updateModelPosition();
                        requestAnimationFrame(animate);
                    }
                    animate();
                });

                break;
            }
        }
    }
}








function isModelFollowingCamera() {
    // Comprueba si hay un modelo siguiendo a la cámara
    return scene.children.some(child => child.userData.followingCamera);
}








