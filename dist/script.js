
//
// Configuration
//

// ms to wait after dragging before auto-rotating
var rotationDelay = 3000
// scale of the globe (not the canvas element)
var scaleFactor = 0.8
// autorotation speed
var degPerSec = 6
// start angles
var angles = { x: -20, y: 40, z: 0}
// colors
var colorWater = '#fff'
var colorLand = '#111'
var colorGraticule = '#ccc'
var colorCountry = '#a00'
var intervalId = 0;

//
// Handler
//
function enter(country) {
  var country = countryList.find(function(c) {
    return parseInt(c.id, 10) === parseInt(country.id, 10)
  })
  currentCod = country.alp
  current.text(country && country.name || '')
}

function leave(country) {
  current.text('')
}

//
// Variables
//

var current = d3.select('#current')
var canvas = d3.select('#globe')
var context = canvas.node().getContext('2d')
var water = {type: 'Sphere'}
var projection = d3.geoOrthographic().precision(0.1)
var graticule = d3.geoGraticule10()
var path = d3.geoPath(projection).context(context)
var v0 // Mouse position in Cartesian coordinates at start of drag gesture.
var r0 // Projection rotation as Euler angles at start.
var q0 // Projection rotation as versor at start.
var lastTime = d3.now()
var degPerMs = degPerSec / 1000
var width = 800
var height = 650
var land, countries
var countryList
var autorotate, now, diff, roation
var currentCountry
var currentCod
var visible
var anniGraph = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022 ] // anni per grafico
var popGraph = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // array contenente la popolazione dei vari anni default

var selectedCountry

//
// Graph
//

var data = [{ //Serve solo per inizializzarlo, dopo si aggiornerà il grafico senza usare questa variabile
  x: anniGraph,
  y: popGraph,
  type: 'scatter'
}];

var layout = {
  autosize: false,
  width: 700,
  height: 500,
  margin: {
    l: 50,
    r: 50,
    b: 100,
    t: 50,
    pad: 4
  },
  paper_bgcolor: '#111 ',
  plot_bgcolor: '#111 ',
  //title: 'Popolazione nel tempo',
  showlegend: false
};

Plotly.newPlot('myDiv', data, layout, {displayModeBar: false});





//
// Functions
//

function setAngles() {
  var rotation = projection.rotate()
  rotation[0] = angles.y
  rotation[1] = angles.x
  rotation[2] = angles.z
  projection.rotate(rotation)
}

function transform() {
  return d3.zoomIdentity
      .translate(width / 2.75, height / 2.75)
      .scale(zoomLevel)
      .translate(-width/2.75, -height/2.75);
}

var zoomLevel = 2;

function scale() {
  // width = document.documentElement.clientWidth
  // height = document.documentElement.clientHeight 
  canvas
  .attr('width', width).attr('height', height)

    projection
      .scale((scaleFactor * Math.min(width, height)) / 2)
      .translate([width / 2, height / 2])
  render()
}

var zoomInOrOut = 0;

//funzione che decide se zoomare o dezoomare
function scaleG() {
  // width = document.documentElement.clientWidth
  // height = document.documentElement.clientHeight
   
  clearInterval(intervalId) 
   canvas
   .attr('width', widthScale).attr('height', heightScale)

  if(widthScale > width){
    zoomInOrOut = 1;//zoom in
  }else{
    zoomInOrOut = 0;//zoom out
  }
  

  intervalId = setInterval(scaleGlobe,10)
}


function scaleGlobe(){
  
  //alert(zoomInOrOut);
  if(zoomInOrOut == 1){
    //zoom in
    if(width < widthScale){

      width += 10;
      height += 10;

      canvas
      .attr('width', width).attr('height', height)

        projection
            .scale((scaleFactor * Math.min(width, height)) / 2)
            .translate([width / 2, height / 2])
        render()
    }else{
      clearInterval(intervalId) 
    }
  }else{
    //zoom out
    if(width > widthScale){

      width -= 10;
      height -= 10;

      canvas
      .attr('width', width).attr('height', height)

        projection
            .scale((scaleFactor * Math.min(width, height)) / 2)
            .translate([width / 2, height / 2])
        render()
    }else{
      clearInterval(intervalId) 
    }
  }
}

function startRotation(delay) {
  autorotate.restart(rotate, delay || 0)
  var rotation = true
}

function stopRotation() {
  autorotate.stop()
  var rotation = false
}

function dragstarted() {
  v0 = versor.cartesian(projection.invert(d3.mouse(this)))
  r0 = projection.rotate()
  q0 = versor(r0)
  stopRotation()
}

function dragged() {
  var v1 = versor.cartesian(projection.rotate(r0).invert(d3.mouse(this)))
  var q1 = versor.multiply(q0, versor.delta(v0, v1))
  var r1 = versor.rotation(q1)
  projection.rotate(r1)
  render()
}

function dragended() {
  startRotation(rotationDelay)
}

function render() {
  context.clearRect(0, 0, width, height)
  fill(water, colorWater)
  stroke(graticule, colorGraticule)
  fill(land, colorLand)
  if (currentCountry) {
    fill(currentCountry, colorCountry)

  }
}

function fill(obj, color) {
  context.beginPath()
  path(obj)
  context.fillStyle = color
  context.fill()
}

function stroke(obj, color) {
  context.beginPath()
  path(obj)
  context.strokeStyle = color
  context.stroke()
}

function rotate(elapsed) {
  now = d3.now()
  diff = now - lastTime
  if (diff < elapsed) {
    rotation = projection.rotate()
    rotation[0] += diff * degPerMs
    projection.rotate(rotation)
    render()
  }
  lastTime = now
}

function loadData(cb) {
  d3.json('https://unpkg.com/world-atlas@1/world/110m.json', function(error, world) {
    if (error) throw error
    d3.tsv('./world-country-names.tsv', function(error, countries) {
      if (error) throw error
      cb(world, countries)
    })
  })
}


//Crack, funzione che in base al nome della nazione ritorna l'id da passare al parser
function filtraPaesiNonDisponibili(){
  var id = currentCountry.alp;
  if(currentCod.toLowerCase() == "ata" || currentCod.toLowerCase() == "atf"){
    return true;
  }
  return false;
  alert(currentCod.toLowerCase());
}
 
function populationVal(){
  if(filtraPaesiNonDisponibili()){
    // var div = document.getElementById('popInfo');
    //   div.innerHTML = "NA"
    
    var charData = [{
      x: anniGraph,
      y: popGraph,
      type: 'scatter'
    }];
     Plotly.newPlot('myDiv',charData,layout);
    
    return;
  }

   const xhr = new XMLHttpRequest();
   xhr.open("GET", "http://127.0.0.1:6969/?url=https://api.worldbank.org/v2/country/"+currentCod.toLowerCase()+"/indicator/SP.POP.TOTL?");
   xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
   xhr.crossDomain = true;
   xhr.send();
   xhr.responseType = "text";
   xhr.onload = () => {
     if (xhr.readyState == 4 && xhr.status == 200) {
       //var div = document.getElementById('popInfo');
       var result = JSON.parse(xhr.response);
       var coordinateNelFor = []
       for(i = 0; i< anniGraph.length ; i++){
        //alert(result[22-i])
        //data[i]['y'][i] = result[22-i]
        coordinateNelFor.push(result[22-i])
       }
       var charData = [{
        x: anniGraph,
        y: coordinateNelFor,
        type: 'scatter'
      }];
       Plotly.newPlot('myDiv',charData,layout);
     } else {
       console.log(`Error: ${xhr.status}`);
     }
   };
}

// https://github.com/d3/d3-polygon
function polygonContains(polygon, point) {
  var n = polygon.length
  var p = polygon[n - 1]
  var x = point[0], y = point[1]
  var x0 = p[0], y0 = p[1]
  var x1, y1
  var inside = false
  for (var i = 0; i < n; ++i) {
    p = polygon[i], x1 = p[0], y1 = p[1]
    if (((y1 > y) !== (y0 > y)) && (x < (x0 - x1) * (y - y1) / (y0 - y1) + x1)) inside = !inside
    x0 = x1, y0 = y1
  }
  return inside
}

function mousemove() {
  var c = getCountry(this)
  if (!c) {
    if (currentCountry) {
      leave(currentCountry)
      currentCountry = undefined
      render()
    }
    return
  }
  if (c === currentCountry) {
    return
  }
  currentCountry = c
  render()
  enter(c)
}


function mouseclick() {
  
  
  populationVal()

  if(document.getElementById("current").innerText != ""){
    let elCountry = document.getElementById("countryName")
    elCountry.innerHTML = document.getElementById("current").innerText
  }
  // if(el.classList.contains("hidden")) visible = false
  //  else visible = true
  //  if(!visible) {
  //    el.classList.remove("hidden")
  //    el.classList.add("visible")
  //    elCountry.innerHTML = document.getElementById("current").innerText
  //    visible = true
  //  }
  //  else {
  //    el.classList.remove("visible")
  //    el.classList.add("hidden")}
  //    visible = false

}



function getCountry(event) {
  var pos = projection.invert(d3.mouse(event))
  return countries.features.find(function(f) {
    return f.geometry.coordinates.find(function(c1) {
      return polygonContains(c1, pos) || c1.find(function(c2) {
        return polygonContains(c2, pos)
      })
    })
  })
}


window.addEventListener('click', function(e){   
  if (document.getElementById('globe').contains(e.target)){
    //scaleFactor = 1.2;
    widthScale = 1000;
    heightScale = 750;
    scaleG()
    //alert("dentro")
  } else{
    //scaleFactor = 0.8;
    widthScale = 800;
    heightScale = 600;
    scaleG()
    //alert("fuori")
  }
  
  canvas
  .attr('width', 1000).attr('height', 850)
  render()
});


//
// Initialization
//


setAngles()

canvas
  .call(d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
   )
  .on('mousemove', mousemove)
  .on('click', mouseclick)
 

loadData(function(world, cList) {
  land = topojson.feature(world, world.objects.land)
  countries = topojson.feature(world, world.objects.countries)
  countryList = cList
  
  window.addEventListener('resize', scale)
  scale()
  autorotate = d3.timer(rotate)
})

