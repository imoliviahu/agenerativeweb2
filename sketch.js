
let colorPicker;
let blob;
var canvas, saveButton;

// createSlider(min, max, [value], [step])

function setup() {

  cnvs = createCanvas(windowWidth, windowHeight);
  colorMode(RGB);

  colorPicker = createColorPicker('lightblue')
  colorPicker.addClass('backgroundColor')
  colorPicker.input(redraw)

  colorPicker2 = createColorPicker('rgb(255, 221, 0)')
  colorPicker2.addClass('flowerColor')
  colorPicker2.input(redraw)

  colorPicker3 = createColorPicker('rgb(255, 136, 0)')
  colorPicker3.addClass('flowerColor2')
  colorPicker3.input(redraw)

  colorPicker4 = createColorPicker('rgb(255, 0, 252)')
  colorPicker4.addClass('flowerColor3')
  colorPicker4.input(redraw)

  //roundness or number of vertices
  slider1 = createSlider(20, 200, 20, 10);
  slider1.addClass('slider')
  slider1.input(redraw)

  //size or radius
  slider2 = createSlider(10, 500, 20, 30);
  slider2.addClass('slider')
  slider2.input(redraw);

  const inputContainer = createDiv();
  inputContainer.id("input-container")


  const slider1Container = createDiv()

  const slider1Name = createP('roundness')
  slider1Container.child(slider1Name)
  slider1Name.id('label1')


  const slider2Container = createDiv()

  const slider2Name = createP('size')
  slider2Container.child(slider2Name)
  slider2Name.id('label2')


  const bgColorContainer = createDiv()
  
  const bgColorName = createP('background color')
  bgColorContainer.child(bgColorName)
  bgColorName.id('label3')


  const flowerColorContainer = createDiv()

  const flowerColorName = createP('flower color ')
  flowerColorContainer.child(flowerColorName)
  flowerColorName.id('label4');
  

  slider1Container.child(slider1)

  slider2Container.child(slider2)

  bgColorContainer.child(colorPicker)


  const saveButtonContainer = createDiv()

  saveButton = createButton("save flower");
  saveButton.mousePressed(saveit);
  saveButton.id('saveflower');
  saveButton.position(1280, 950);
  


  flowerColorContainer.child(colorPicker2)
  flowerColorContainer.child(colorPicker3)
  flowerColorContainer.child(colorPicker4)

  inputContainer.child(slider1Container)
  inputContainer.child(slider2Container)
  inputContainer.child(bgColorContainer)
  inputContainer.child(flowerColorContainer)
  inputContainer.child(saveButtonContainer)

  noLoop();
}

  
function draw() {

  background(colorPicker.color())

  
  let val2 = slider1.value();
  numVertices = val2

  let val3 = slider2.value();
  radius = val3
  
  for (let i = 0; i < 10; i ++) {
    let color2 = colorPicker2.color()
    color2.setAlpha(80);

    let color3 = colorPicker3.color()
    color3.setAlpha(80);

    let color4 = colorPicker4.color()
    color4.setAlpha(80);

    blob = new NoiseBlob(
      width/ 2,       // centerX
      height/ 2,      // centerY
      numVertices,     // numVertices
      radius,          // radius
      500,             // noiseScale
      3,               // noiseDetailOctaves,
      0.5,             // noiseDetailFalloff
      0.2,             // strokeThickness
      color(255),
      color2
      )
      blob.display()
  

    blob = new NoiseBlob(
      width/ 2,       // centerX
      height/ 2,      // centerY
      numVertices,     // numVertices
      radius,          // radius
      500,      // noiseScale
      3,               // noiseDetailOctaves,
      0.5,             // noiseDetailFalloff
      0.2,             // strokeThickness
      color(255),
      color3
      )
    blob.display() 

    blob.display() 
    blob = new NoiseBlob(
      width/ 2,       // centerX
      height/ 2,      // centerY
      numVertices,     // numVertices
      radius,          // radius
      500,      // noiseScale
      3,               // noiseDetailOctaves,
      0.5,             // noiseDetailFalloff
      0.2,             // strokeThickness
      color(255),
      color4
      )
    blob.display() 
  }

  }

  function saveit(){
    saveCanvas(cnvs,'myflower','jpg');
  }


  