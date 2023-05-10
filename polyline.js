//===========================================
/*

 /$$$$$$$  /$$$$$$ /$$  /$$     /$$/$$      /$$$$$$/$$   /$$/$$$$$$$$
| $$__  $$/$$__  $| $$ |  $$   /$$| $$     |_  $$_| $$$ | $| $$_____/
| $$  \ $| $$  \ $| $$  \  $$ /$$/| $$       | $$ | $$$$| $| $$      
| $$$$$$$| $$  | $| $$   \  $$$$/ | $$       | $$ | $$ $$ $| $$$$$   
| $$____/| $$  | $| $$    \  $$/  | $$       | $$ | $$  $$$| $$__/   
| $$     | $$  | $| $$     | $$   | $$       | $$ | $$\  $$| $$      
| $$     |  $$$$$$| $$$$$$$| $$   | $$$$$$$$/$$$$$| $$ \  $| $$$$$$$$
|__/      \______/|________|__/   |________|______|__/  \__|________/
                                                                                       
*/


class Polyline {
  // Adapted from openFrameworks ofPolyline: 
  // openFrameworks/blob/master/graphics/ofPolyline.cpp

  constructor() {
    this.bClosed = false;
    this.dirty = true;
    this.perimeter = 0;

    this.points = [];
    this.lengths = [];

    this.drawingDistThresh = 3.0;
    this.maxAngleConsideredSharp = 100.0;
    this.clickToCloseRadius = 30.0;
  }

  clear() {
    this.bClosed = false;
    this.dirty = true;
    this.perimeter = 0;

    this.points = [];
    this.lengths = [];
  }

  //--------------------------------------------------
  add(x, y, movedThresh = this.drawingDistThresh) { 
    // Store the new point if it's further than thresh away from prev.
    if (this.bClosed == false) {
      this.dirty = true;
      var N = this.points.length;
      var v2 = createVector(x, y);

      if (N === 0) {
        // Push the first point
        this.points.push(v2);
        this.lengths.push(0);

      } else {
        // Points already exist
        var v1 = this.points[N - 1];
        var moved = p5.Vector.dist(v1, v2);
        if (moved > movedThresh) {
          this.points.push(v2);
          var cumulativeLen = this.lengths[this.lengths.length - 1];
          this.lengths.push(cumulativeLen + moved);
        }
      }
    }
  }

  //--------------------------------------------------
  clickToClose(x, y) { 
    if (this.bClosed == false) {
      var nPoints = this.points.length;
      if (nPoints >= 3) {
        var pt0 = this.points[0];
        var ptClick = createVector(x, y);
        var distFromPt0 = p5.Vector.dist(pt0, ptClick);
        if (distFromPt0 < this.clickToCloseRadius) {
          // user has clicked within neighborhood of pt0

          var ptLast = this.points[nPoints - 1];
          var distClosing = p5.Vector.dist(pt0, ptLast);
          var len = this.lengths[this.lengths.length - 1];
          this.lengths.push(len + distClosing);
          this.bClosed = true;
          this.dirty = true;
        }
      }
    }
  }

  //--------------------------------------------------
  getSmoothed3() { 
    // Simple 1-2-1 pseudo-gaussian 1D averaging
    if (this.bClosed == false) {
      var N = this.points.length;
      if (N > 2) {
        let smoothedPoly = new Polyline();
        smoothedPoly.add(this.points[0].x, this.points[0].y, 0);
        for (var i = 1; i < (N - 1); i++) {
          var v0 = this.points[i - 1];
          var v1 = this.points[i];
          var v2 = this.points[i + 1];
          var x = (v0.x + 2.0 * v1.x + v2.x) / 4.0;
          var y = (v0.y + 2.0 * v1.y + v2.y) / 4.0;
          smoothedPoly.add(x, y, 0);
        }
        smoothedPoly.add(this.points[N - 1].x, this.points[N - 1].y, 0);
        return smoothedPoly;
      } else {
        return this;
      }

    } else { //bClosed == true
      var N = this.points.length;
      if (N > 2) {
        let smoothedPoly = new Polyline();
        for (var i = 0; i < N; i++) {
          var v0 = this.points[(i - 1 + N) % N];
          var v1 = this.points[(i + N) % N];
          var v2 = this.points[(i + 1 + N) % N];
          var x = (v0.x + 2.0 * v1.x + v2.x) / 4.0;
          var y = (v0.y + 2.0 * v1.y + v2.y) / 4.0;
          smoothedPoly.add(x, y, 0);
        }
        var sp0 = smoothedPoly.points[0];
        smoothedPoly.clickToClose(sp0.x, sp0.y);
        return smoothedPoly;
      } else {
        return this;
      }
    }
  }

  //--------------------------------------------------
  display() {
    var N = this.points.length;
    beginShape();
    for (var i = 0; i < N; i++) {
      var p = this.points[i];
      vertex(p.x, p.y);
    }
    if (this.bClosed) {
      endShape(CLOSE);
    } else {
      endShape();
    }
  }

  //--------------------------------------------------
  displayAsCircles() {
    var N = this.points.length;
    for (var i = 0; i < N; i++) {
      var p = this.points[i];
      circle(p.x, p.y, 3);
    }
  }
  
  //--------------------------------------------------
  displayStyledLine (thickness, noiseAmt, noiseMix, curvatureSkip, taperPow, col){
  
    var nf1 = 0.02; // noise frequency 1
    var nf2 = 0.50; 
    var A = 17;
    var B = 99;
    
    var N = this.points.length;
    var sI = (this.bClosed) ? 0 : 1; // start
    var eI = (this.bClosed) ? N : N-1; // end
    var dI = max(0,min(curvatureSkip, floor(N/2)));
    
    stroke(col);
    for (var i = sI; i < eI; i++) {

      var h = (this.bClosed) ? (i-1+N)%N : i-1; 
      var j = (this.bClosed) ? (i+1)%N : i+1;
      var ph = this.points[h];
      var pi = this.points[i];
      var pj = this.points[j];
      
      // var cosTaper = pow(0.5 + 0.5*cos(PI*i/N), taperPow);
      var cosTaper = pow(1.0 - i/(N-1), taperPow); 
      var taper = (this.bClosed) ? 1.0 : cosTaper;

      var nx1 = pi.x*nf1;
      var ny1 = pi.y*nf1;
      var nx2 = pi.x*nf2;
      var ny2 = pi.y*nf2;
      var noiseL = lerp (noise(nx1 + A, ny1), noise(nx2, ny2 + A), noiseMix);
      var noiseR = lerp (noise(nx1, ny1 + B), noise(nx2 + B, ny2), noiseMix);
      var thL = thickness * taper * lerp(0.5, noiseL, noiseAmt);
      var thR = thickness * taper * lerp(0.5, noiseR, noiseAmt);

      var dx = pj.x - ph.x;
      var dy = pj.y - ph.y;
      var dh = sqrt (dx*dx + dy*dy); 
      var qdx = dy/dh;
      var qdy = dx/dh;
      var qxL = pi.x + qdx*thL;
      var qyL = pi.y - qdy*thL;
      var qxR = pi.x - qdx*thR;
      var qyR = pi.y + qdy*thR;
      line(qxL, qyL, qxR, qyR);
      
      // Curvature fakeout
      var u = (this.bClosed) ? (i-dI+N)%N : max(i-dI, 0); 
      var w = (this.bClosed) ? (i+dI)%N : min(i+dI, N-1);
      var pu = this.points[u];
      var pw = this.points[w];
      line(pu.x, pu.y, pw.x, pw.y);
    }
    
  }
  
  
  //--------------------------------------------------
  getPerimeter() {
    if (this.dirty) {
      var N = this.points.length;
      var out = 0;
      
      if (N >= 2) {
        var v1;
        var v2;
        for (var i = 1; i < N; i++) {
          v1 = this.points[i - 1];
          v2 = this.points[i];
          out += p5.Vector.dist(v1, v2);
        }

        if (this.bClosed) {
          v1 = this.points[N - 1];
          v2 = this.points[0];
          out += p5.Vector.dist(v1, v2);
        }
        
      } else {
        out = 0; 
      }
      this.perimeter = out;
      this.dirty = false;
      return this.perimeter;
    }

    return this.perimeter;
  }
  
  //--------------------------------------------------
  getIndexAtLength(len) {
    var perim = this.getPerimeter();

    if (this.points.length < 2) {
      return 0;
    } else if (len < 0) {
      if (this.bClosed) {
        while (len < 0) {
          len += perim;
        }
      } else {
        return 0;
      }

    } else if (len >= perim) {
      if (this.bClosed) {
        while (len > perim) {
          len -= perim;
        }
      } else {
        return (this.points.length - 1);
      }
    }

    var out = 0;
    var lastLength = this.lengths.length - 1;

    for (var i = 0; i < lastLength; i++) {
      var indexLo = i;
      var indexHi = i + 1;

      var lengthLo = this.lengths[indexLo];
      var lengthHi = this.lengths[indexHi];
      if ((len >= lengthLo) && (len < lengthHi)) {
        var t = map(len, lengthLo, lengthHi, 0, 1);
        t = constrain(t, 0, 1);
        out = indexLo + t;
        break;
      }
    }
    return out;
  }

  //--------------------------------------------------
  getIndexAtPercent(pct) {
    var pctPerimeter = pct * this.getPerimeter();
    return this.getIndexAtLength(pctPerimeter);
  }

  //--------------------------------------------------
  getLengthAtIndex(intIndex) {
    if (this.points.length < 2) {
      return 0;
    } else if (intIndex < 0) {
      return 0;
    } else if (intIndex >= this.points.length) {
      return this.getPerimeter();
    }

    intIndex = constrain(intIndex, 0, this.lengths.length - 1);
    return this.lengths[floor(intIndex)];
  }

  //--------------------------------------------------
  getLengthAtIndexInterpolated(findex) {
    var nPoints = this.points.length;
    if (nPoints < 2) {
      return 0;
    } else if (findex < 0) {
      return 0;
    } else if (findex >= (this.points.length - 1)) { // -1 or no? 
      return this.getPerimeter();
    }

    var i1 = floor(findex);
    var i2 = min(i1 + 1, this.points.length - 1);
    var t = findex - i1;
    return lerp(this.getLengthAtIndex(i1), this.getLengthAtIndex(i2), t);
  }

  //-------------------------------------------------- 
  getPointAtIndexInterpolated(findex) {
    var nPoints = this.points.length;

    if (nPoints === 0) {
      return createVector(0, 0, 0);
    } else if (nPoints === 1) {
      return this.points[0];

    } else if (findex >= (nPoints - 1)) {
      if (!this.bClosed) {
        return this.points[nPoints - 1];
      } else {
        findex = findex % nPoints;
      }

    } else if (findex < 0) {
      if (!this.bClosed) {
        return this.points[0];
      } else {
        while (findex < 0) {
          findex += nPoints;
        }
        findex = findex % nPoints;
      }
    }

    var i1 = floor(findex);
    var i2 = min(i1 + 1, this.points.length - 1);
    if (this.bClosed) {
      i2 = floor((i1 + 1) % this.points.length);
    }

    var t = findex - i1;
    var v1 = this.points[i1];
    var v2 = this.points[i2];
    return p5.Vector.lerp(v1, v2, t);
  }

  //--------------------------------------------------
  getPointAtLength(inputLen) {
    if (this.bClosed) {
      inputLen %= this.getPerimeter();
    }

    var nPoints = this.points.length;
    var nLengths = this.lengths.length;
    if (nPoints <= 0) {
      return createVector(0, 0);
    } else if (nPoints == 1) {
      return this.points[0];
    } else if (inputLen > this.lengths[nLengths - 1]) {
      if (this.bClosed) {
        return this.points[0];
      } else {
        return this.points[nPoints - 1];
      }
    }
    return this.getPointAtIndexInterpolated(this.getIndexAtLength(inputLen));
  }

  //--------------------------------------------------
  getPointAtPercent(f) {
    var len = this.getPerimeter();
    return this.getPointAtLength(f * len);
  }

  //----------------------------------------------------------
  getResampledBySpacing(spacing) {
    var nPoints = this.points.length;
    if ((nPoints <= 1) || (spacing <= 0.001)) {
      return this;
    }
    var eps = (spacing*0.1);
    let resampledPoly = new Polyline();
    var totalLength = this.getPerimeter() - eps;
    var resampleCount = 0;
    for (var f = 0; f < totalLength; f += spacing) {
      var pointAtf = this.getPointAtLength(f);
      resampledPoly.add(pointAtf.x, pointAtf.y, 0);
      resampleCount++; 
    }

    // Correction to handle numeric precision error on last point:
    if (!this.bClosed){
      var lastIndex = (this.bClosed) ? 0 : nPoints - 1;
      var lastP = this.points[lastIndex];
      var lastQ = resampledPoly.points[resampledPoly.points.length - 1];
      var pqDist = lastQ.dist(lastP);
      if (pqDist > eps) {
          resampledPoly.add(lastP.x, lastP.y, 0);
      }
    }
    
    if (this.bClosed){
      var rp0 = resampledPoly.points[0];
      resampledPoly.clickToClose(rp0.x, rp0.y);
    }
    return resampledPoly;
  }

  //----------------------------------------------------------
  getResampledByCount(count) {
    var perim = this.getPerimeter();
    count = max(count, 2);
    return this.getResampledBySpacing(perim / (count - 1));
  }
}
