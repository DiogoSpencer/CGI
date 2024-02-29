var parab_points = [];
var parab_normals = [];
var parab_faces = [];
var parab_edges = [];

var parab_points_buffer;
var parab_normals_buffer;
var parab_faces_buffer;
var parab_edges_buffer;

var raioDiv=20;
var parab_LONS=30;

function parabInit(gl, nlat, nlon) {
    nlat = raioDiv;
    nlon = parab_LONS;
    parabBuild(nlat, nlon);
    parabUploadData(gl);
}

// Generate points using polar coordinates
function parabBuild(nlat, nlon) 
{
    // phi will be latitude
    // theta will be longitude
 
    var r = 1;
    var d_raioDiv = r/nlat;
    var d_theta = 2*Math.PI / nlon;
    
    
    // Generate vertices
    var v = vec3(0,0,0);
    parab_points.push(v);
    parab_normals.push(vec3(0,-1,0));
    
    // Generate middle
    for(var i=0, r=d_raioDiv; i<nlat; i++, r+=d_raioDiv) {

        for(var j=0, theta=0; j<nlon; j++, theta+=d_theta) {
            var x = Math.sin(theta)*r;
            var z = Math.cos(theta)*r;
            var pt = vec3(x, x*x+z*z, z);
            parab_points.push(pt);
            var n = vec3(pt);
            parab_normals.push(normalize(n));
        }
    }
    
    // Generate the faces
    
    // started faces
    for(var i=0; i<nlon-1; i++) {
        parab_faces.push(0);
        parab_faces.push(i+2);
        parab_faces.push(i+1);
    }
    parab_faces.push(0);
    parab_faces.push(1);
    parab_faces.push(nlon);
    
    // general middle faces
    var offset=1;
    
    for(var i=0; i<nlat-1; i++) {
        for(var j=0; j<nlon-1; j++) {
            var p = offset+i*nlon+j;
            parab_faces.push(p);
            parab_faces.push(p+nlon+1);
            parab_faces.push(p+nlon);
            
            parab_faces.push(p);
            parab_faces.push(p+1);
            parab_faces.push(p+nlon+1);
        }
        var p = offset+i*nlon+nlon-1;
        parab_faces.push(p);
        parab_faces.push(p+1);
        parab_faces.push(p+nlon);

        parab_faces.push(p);
        parab_faces.push(p-nlon+1);
        parab_faces.push(p+1);
    }
 
    // Build the edges
    for(var i=0; i<nlon; i++) {
        parab_edges.push(0);   // North pole 
        parab_edges.push(i+1);
    }

    for(var i=0; i<nlat; i++, p++) {
        for(var j=0; j<nlon;j++, p++) {
            var p = 1 + i*nlon + j;
            parab_edges.push(p);   
            if(j!=nlon-1) 
                parab_edges.push(p+1);  // horizontal line (same latitude)
            else parab_edges.push(p+1-nlon);
            
            if(i!=nlat-1) {
                parab_edges.push(p);   // vertical line (same longitude)
                parab_edges.push(p+nlon);
            }
        }
    }    
}

function parabUploadData(gl)
{
    parab_points_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, parab_points_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(parab_points), gl.STATIC_DRAW);
    
    parab_normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, parab_normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(parab_normals), gl.STATIC_DRAW);
    
    parab_faces_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, parab_faces_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(parab_faces), gl.STATIC_DRAW);
    
    parab_edges_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, parab_edges_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(parab_edges), gl.STATIC_DRAW);
}

function parabDrawWireFrame(gl, program)
{    
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, parab_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, parab_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, parab_edges_buffer);
    gl.drawElements(gl.LINES, parab_edges.length, gl.UNSIGNED_SHORT, 0);
}

function parabDrawFilled(gl, program)
{
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, parab_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, parab_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, parab_faces_buffer);
    gl.drawElements(gl.TRIANGLES, parab_faces.length, gl.UNSIGNED_SHORT, 0);
}

function parabDraw(gl, program, filled=false) {
	if(filled) parabDrawFilled(gl, program);
	else parabDrawWireFrame(gl, program);
}