class NoiseBlob {
  constructor(
    centerX,
    centerY,
    numVertices,
    radius,
    noiseScale,
    noiseDetailOctaves = 4,
    noiseDetailFalloff = 0.5,
    strokeThickness = 3,
    strokeColor = color(0),
    fillColor = color(255, 0, 0)
  ) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.numVertices = numVertices;
    this.radius = radius;
    this.noiseScale = noiseScale;
    this.noiseDetailOctaves = noiseDetailOctaves;
    this.noiseDetailFalloff = noiseDetailFalloff;
    this.strokeThickness = strokeThickness;
    this.strokeColor = strokeColor;
    this.fillColor = fillColor;
    
    this.polyline = new Polyline();
    
    const nxOffset = random(30);
    const nyOffset = random(30);
      
    noiseDetail(noiseDetailOctaves, noiseDetailFalloff);

    let x0, y0;
    for (let i = 0; i < numVertices; i++) {
      const a = map(i, 0, numVertices, 0, TWO_PI);

      const nx = nxOffset + 1.0 * cos(a);
      const ny = nyOffset + 1.0 * sin(a);

      // const nx = nxOffset + 1.0 * tan(a);
      // const ny = nyOffset + 1.0 * cos(a);

      // const nx = nxOffset + 1.0 * cos(a);
      // const ny = nyOffset + 1.0 * cos(a);

      // const nx = nxOffset + 1.0 * sin(a);
      // const ny = nyOffset + 1.0 * sin(a);

      const n = noise(nx, ny);
      const r = radius + map(n, 0, 1, -noiseScale, noiseScale);

      const x = centerX + r * cos(a);
      const y = centerY + r * sin(a);

      // const x = centerX + r * sin(a);
      // const y = centerY + r * tan(a);

      // const x = centerX + r * tan(a);
      // const y = centerY + r * sin(a);

      // const x = centerX + r * cos(a);
      // const y = centerY + r * tan(a);

      // const x = centerX + r * tan(a);
      // const y = centerY + r * cos(a);

      this.polyline.add(x, y);

      if (i === 0) {
        x0 = x;
        y0 = y;
      }
    }
    this.polyline.clickToClose(x0, y0);
  }
  
  display() {
    push();
    strokeWeight(this.strokeThickness);
    stroke(this.strokeColor);
    fill(this.fillColor);
    this.polyline.display();
    pop();
  }
}