var gl, program;

var instances=[];


var mModelLoc, colorLoc, modoLoc;
var mView, mProjection;

var matrixStack=[];
var modelView = mat4();

var mPerS = 0;

var mPerSS = 5;

var acelarar = false;

var acelararTras = false;

var r = 0;

var x = 0;

var rodarBraco = 0;

var rodarBracoCima=0;

var rodarRoda = 0;

var a = -2 ,b = -0.5;

var alterarModo = 0.0;

var filled = false;


window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    
    // Configure WebGL
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 0.8, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    mModelLoc = gl.getUniformLocation(program, "mModel");
    mviewLoc = gl.getUniformLocation(program, "mView");
    mProjectionLoc = gl.getUniformLocation(program, "mProjection");
    colorLoc = gl.getUniformLocation(program, "color");
    modoLoc = gl.getUniformLocation(program, "modo");

    cubeInit(gl);
    sphereInit(gl);
    cylinderInit(gl);
    torusInit(gl);
    parabInit(gl);

    render();
}

window.addEventListener("keydown", function() {
    switch (event.keyCode) {
    case 32: // ’space’ key
    if(alterarModo == 0.0){
        alterarModo = 1.0
    }else if(alterarModo == 1.0){
        alterarModo = 0.0
    }
    break;
    case 70: // ’1’ key
    filled = !filled;
    break;
    case 49: // ’1’ key
    a = 0;
    b = -500;
    break;
    case 50: // ’2’ key
    a = 0;
    b = 0;
    break;
    case 51: // ’3’ key
    a = -500;
    b = 0;
    break;
    case 48: // ’0’ key
    a = -2 ,b = -0.5;
    break;
    case 74: // ’j’ key
    rodarBraco += 1;
    break;
    case 76: // ’l’ key
    rodarBraco -= 1;
    break;
    case 73: // ’i’ key
    if (rodarBracoCima < 90) {
        rodarBracoCima += 1;
    }
    break;
    case 75: // ’k’ key
    if (rodarBracoCima > 0) {
        rodarBracoCima -= 1;
    }
    break;
    case 87: // ’w’ key
    acelarar = true;
    break;
    case 83: // ’s’ key
    acelararTras = true;
    break;
    case 65: // ’a’ key
    if (rodarRoda < 45 && mPerS == 0) {
        rodarRoda += 1;
    }
    break;
    case 68: // ’d’ key
    if (rodarRoda > -45 && mPerS == 0) {
        rodarRoda -= 1;
    }
    }
   });


   window.addEventListener("keyup", function() {
    switch (event.keyCode) {
    case 87: // ’w’ key
    acelarar = false;
    break;
    case 83: // ’s’ key
    acelararTras = false;
    break;
    }
   });

function render() {

    // funcoes complementares//

    function pushMatrix(){
        let m = mat4(modelView[0], modelView[1], modelView[2], modelView[3]);
            matrixStack.push(m);
    }
    
    function popMatrix() {
        modelView = matrixStack.pop();
    }

    function cubo(){
        gl.uniformMatrix4fv(mModelLoc, false, flatten(modelView));
        if (filled) {
            cubeDrawFilled(gl, program);
        } else {
            cubeDrawWireFrame(gl, program);
        }
    }

    function cylinder(){
        gl.uniformMatrix4fv(mModelLoc, false, flatten(modelView));
        if (filled) {
            cylinderDrawFilled(gl, program);
        } else {
            cylinderDrawWireFrame(gl, program);
        }
    }

    function roda(){
        gl.uniform4fv(colorLoc, vec4(0.0, 0.0, 0.0, 1.0));
        modelView = mult(modelView, rotateX(-90));
        modelView = mult(modelView, scalem(70, 25, 70));
        cylinder();
    }

    function jante(){
        gl.uniform4fv(colorLoc, vec4(0.5, 0.5, 0.5, 1.0));
        modelView = mult(modelView, rotateX(-90));
        modelView = mult(modelView, rotateY(r));
        modelView = mult(modelView, scalem(50, 25, 50));
        gl.uniformMatrix4fv(mModelLoc, false, flatten(modelView));
        cylinderDrawWireFrame(gl, program);
    }



    function eixoRoda(){
        modelView = mult(modelView, rotateX(-90));
        modelView = mult(modelView, scalem(20, 180, 20));
        gl.uniform4fv(colorLoc, vec4(0.0, 1.0, 0.0, 1.0));
        cylinder();
    }

    function sphere(){
        gl.uniformMatrix4fv(mModelLoc, false, flatten(modelView));
        gl.uniformMatrix4fv(mModelLoc, false, flatten(modelView));
        if (filled) {
            sphereDrawFilled(gl, program);
        } else {
            sphereDrawWireFrame(gl, program);
        }
    }

    function paraboloide(){
        gl.uniformMatrix4fv(mModelLoc, false, flatten(modelView));
        gl.uniformMatrix4fv(mModelLoc, false, flatten(modelView));
        if (filled) {
            parabDrawFilled(gl, program);
        } else {
            parabDrawWireFrame(gl, program);
        }
    }


    function vidroTriangular(){
        gl.uniformMatrix4fv(mModelLoc, false, flatten(modelView));
        var vertices = [
            vec4(1,0,0,1),
            vec4(0,0,0,1),
            vec4(0,1,0,1),
        ];
    
        var bufferT = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferT);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferT);
        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        gl.uniformMatrix4fv(mModelLoc, false, flatten(modelView));
        if (filled) {
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        } else {
            gl.drawArrays(gl.LINE_LOOP, 0, 3);
        }
    
    }

    function carrinha(){
        gl.uniform4fv(colorLoc, vec4(0.5, 0.5, 0.5, 1.0));
    
        //corpo da carrinha
        modelView = mult(modelView, translate(-190, 90, 0));
        modelView = mult(modelView, scalem(380, 180, 180));
        cubo();
    
        popMatrix();
        pushMatrix();
    
        modelView = mult(modelView, translate(55, 35, 0));
        modelView = mult(modelView, scalem(110, 70, 180));
        cubo();
    
        popMatrix();
        pushMatrix();
    
        modelView = mult(modelView, translate(65, 95, 0)); 
        modelView = mult(modelView, rotateZ(-45));
        modelView = mult(modelView, scalem(150, 90, 180));
        cubo();
    
        popMatrix();
        pushMatrix();
    
        modelView = mult(modelView, translate(11, 125, 0)); 
        modelView = mult(modelView, scalem(70, 110, 180));
        cubo();
    
        popMatrix();
        pushMatrix();
    
        modelView = mult(modelView, translate(125, 35, 0)); 
        modelView = mult(modelView, rotateZ(45));
        modelView = mult(modelView, scalem(70, 30, 180));
        cubo();
    
        popMatrix();
        pushMatrix();
    
        modelView = mult(modelView, translate(90, 70, 0));
        modelView = mult(modelView, scalem(180, 70, 180));
        modelView = mult(modelView, rotateX(90));
        cylinder();
    }

    function vidros(){
        gl.uniform4fv(colorLoc, vec4(0.0, 0.5, 1.0, 1.0));

        //vidro frente
    
        modelView = mult(modelView, translate(66, 95, 0)); 
        modelView = mult(modelView, rotateZ(-45));
        modelView = mult(modelView, scalem(130, 90, 160));
        cubo();
    
        popMatrix();
    
        pushMatrix();
    
            //parte triangular janela
    
            modelView = mult(modelView, translate(50, 110, -90.1)); 
            modelView = mult(modelView, scalem(55, 55, 1));
            //esquerda
            vidroTriangular();
    
            //direita
            modelView = mult(modelView, translate(0, 0, 180.2)); 
            vidroTriangular();
    
    
        popMatrix();
        pushMatrix();
    
            //parte retangular janela
    
            modelView = mult(modelView, translate(74, 105, -90.1)); 
            modelView = mult(modelView, scalem(60, 10, 1));
            //esquerda
            cubo();
    
            //direita
            modelView = mult(modelView, translate(0, 0, 180.2));
            cubo();
    
        popMatrix();
        pushMatrix();
    
            //parte retangular janela
    
            modelView = mult(modelView, translate(45, 132, -90.1)); 
            modelView = mult(modelView, scalem(10, 64, 1));
            //esquerda
            cubo();
    
            //direita
            modelView = mult(modelView, translate(0, 0, 180.2));
            cubo();
    }

    // funcoes complementares//
    
    moverFrente();
    moverTras();

    var at = [0, 0, 0];
    var eye = [a, b, 1];
    var up = [0, 1, 0];
    mView = lookAt(eye, at, up);
    mProjection = ortho(-600,600,-600,600,3000,-3000);

    gl.uniformMatrix4fv(mviewLoc, false, flatten(mView));
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(mProjection));
    gl.uniform1f(modoLoc, alterarModo);


    gl.clear( gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);
 
    matrixStack=[];
    modelView = mat4();

    //floor
    pushMatrix();

    var t = true;
    for (let i = -15; i <= 15; i++) {
        for (let j = -15; j <= 15; j++) {
            if(t){
                gl.uniform4fv(colorLoc, vec4(0.8, 0.6, 0.4, 1.0));
            }else{
                gl.uniform4fv(colorLoc, vec4(0.9, 0.5, 0.3, 1.0));
            }
            pushMatrix();
            modelView = mult(modelView, scalem(200, 1, 200));
            modelView = mult(modelView, translate(i,-35,j));
            cubo();
            popMatrix();
            t = !t;
        }
    }

    if (mPerS >= 150) {
        x += mPerS*1/60 
    }

    if (mPerS <= -150) {
        x += mPerS*1/60 
    }

    modelView = mult(modelView, translate(x,0,0));
    

    pushMatrix();
    
    //carrinha

    carrinha();

    popMatrix();
    pushMatrix();

    //vidros 

    vidros();



    //rodas && jantes

    popMatrix();
    pushMatrix();

        // rodas
        modelView = mult(modelView, translate(-10, 0, 90));
        pushMatrix();
            //esquerda frente
            modelView = mult(modelView, rotateY(rodarRoda));
            pushMatrix();
            roda();

            popMatrix();
            modelView = mult(modelView, translate(0, 0, 0.2));
            jante();

        popMatrix();
        pushMatrix();

            //direita frente
            modelView = mult(modelView, translate(0, 0, -180));

            modelView = mult(modelView, rotateY(rodarRoda));
            pushMatrix();
            roda();

            popMatrix();
            modelView = mult(modelView, translate(0, 0, -0.2));
            jante();
        popMatrix();
            
            //tras
            modelView = mult(modelView, translate(-270, 0, 0));
            pushMatrix();
            
                //esquerda
                pushMatrix();
                roda();

                popMatrix();
                modelView = mult(modelView, translate(0, 0, 0.2));
                jante();

            popMatrix();
                //direita
                modelView = mult(modelView, translate(0, 0, -180));
                pushMatrix();
                roda();
                
                popMatrix();
                modelView = mult(modelView, translate(0, 0, -0.2));
                jante();


    popMatrix();

    //eixo roda
    
    pushMatrix();

        modelView = mult(modelView, translate(-280, 0, 0));
        pushMatrix();

        eixoRoda();

        popMatrix();
        modelView = mult(modelView, translate(270, 0, 0));
        eixoRoda();

    popMatrix();
    
    //antena

    pushMatrix();
        gl.uniform4fv(colorLoc, vec4(0.0, 0.0, 0.0, 1.0));
        modelView = mult(modelView, translate(-200, 200, 0));
        pushMatrix();
            modelView = mult(modelView, scalem(20, 50, 20));
            cylinder();

        popMatrix();

            modelView = mult(modelView, translate(0, 40, 0));
            pushMatrix();
            modelView = mult(modelView, scalem(45, 45, 45));
            sphere();

            popMatrix();
                //antena que roda
                modelView = mult(modelView, rotateY(rodarBraco));
                modelView = mult(modelView, rotateZ(rodarBracoCima));
                pushMatrix();

                
                    modelView = mult(modelView, translate(100, 0, 0));
                    modelView = mult(modelView, rotateZ(-90));
                    modelView = mult(modelView, scalem(20, 200, 20));
                    cylinder();

                popMatrix();

                    modelView = mult(modelView, translate(180, 0, 0));
                    pushMatrix();
                    
                        modelView = mult(modelView, rotateZ(-90));
                        modelView = mult(modelView, scalem(40, 20, 40));
                        cylinder();

                        popMatrix();

                        //antena paraboloide

                        gl.uniform4fv(colorLoc, vec4(1.0, 0.0, 1.0, 1.0));

                        modelView = mult(modelView, translate(0, 15, 0));
                        modelView = mult(modelView, scalem(50, 50, 50));
                        paraboloide();
    popMatrix();
    pushMatrix();

    //eleiron
    popMatrix();

    gl.uniform4fv(colorLoc, vec4(1.0, 0.0, 1.0, 1.0));

    modelView = mult(modelView, translate(-360, 210, 0));
    pushMatrix();
        modelView = mult(modelView, scalem(90, 10, 210));
        cubo();

    popMatrix();

        gl.uniform4fv(colorLoc, vec4(0.0, 0.0, 0.0, 1.0));
        modelView = mult(modelView, translate(10, -20, 60));
        pushMatrix();
        modelView = mult(modelView, rotateZ(57));
        modelView = mult(modelView, scalem(30, 50, 10));
        modelView = mult(modelView, rotateZ(45));
        cubo();

        popMatrix();
        modelView = mult(modelView, translate(0, 0, -120));
        modelView = mult(modelView, rotateZ(57));
        modelView = mult(modelView, scalem(30, 50, 10));
        modelView = mult(modelView, rotateZ(45));
        cubo();

    window.requestAnimationFrame(render);
}

function moverTras(){
    if(acelararTras && mPerS >= -300){
        if (rodarRoda>0) {
            rodarRoda -=1
        }else if (rodarRoda<0) {
            rodarRoda +=1
        }else{
            mPerS -= mPerSS;
            r -= 0.5; 
        }
    }else if (!acelararTras && mPerS < 0) {
        mPerS += mPerSS;
        r -= 0.5;
    }
}

function moverFrente(){
    if(acelarar && mPerS <= 500){
        if (rodarRoda>0) {
            rodarRoda -=1
        }
        if (rodarRoda<0) {
            rodarRoda +=1
        }else{
            mPerS += mPerSS;
            r += 0.5; 
        }
    }else if (!acelarar && mPerS > 0) {
        mPerS -= mPerSS;
        r += 0.5; 
    }
}
