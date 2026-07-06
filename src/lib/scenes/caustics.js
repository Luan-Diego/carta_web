import { rotRgb, tintDelta } from './util.js';

// Água cristalina: a luz refratada que dança no fundo de uma piscina (cáusticas),
// calculada por um shader WebGL (sem bibliotecas, nem API externa). Roda em baixa
// resolução num canvas à parte; as cenas desenham esse canvas por cima do seu fundo.
// Devolve null se o navegador não tiver WebGL (a cena então usa o desenho 2D).
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS = `precision highp float;
uniform vec2 uRes;uniform float uT,uDark,uPw;uniform vec3 uA,uB;uniform vec3 uR[8];uniform vec2 uP;
float luz(vec2 q,float t,float sc){
  vec2 p=mod(q*6.28318*sc,6.28318)-250.;
  vec2 i=p;float c=1.;
  for(int n=0;n<5;n++){
    float tt=t*(1.-3.5/float(n+1));
    i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));
    c+=1./length(vec2(p.x/(sin(i.x+tt)/.005),p.y/(cos(i.y+tt)/.005)));
  }
  c/=5.;c=1.17-pow(c,1.4);
  return pow(abs(c),8.);
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes.y;
  vec2 d=vec2(0.);
  for(int i=0;i<8;i++){
    vec3 r=uR[i];
    if(r.z>=0.){vec2 v=uv-r.xy;float L=length(v);d+=normalize(v+1e-5)*sin(L*38.-r.z*7.)*exp(-L*5.-r.z*1.1)*.035;}
  }
  vec2 v=uv-uP;float L2=dot(v,v);
  d+=v*exp(-L2*30.)*.05*uPw;
  vec2 q=uv+d;
  float t=uT*.5+23.;
  float a=pow(luz(q,t,1.2),1.7);
  float b=pow(luz(q*1.7+.3,t*1.3+7.,1.),1.7);
  vec3 base=mix(uB,uA,smoothstep(0.,1.,gl_FragCoord.y/uRes.y*.8+.1+(a-.2)*.15));
  vec3 col=base+vec3(.9,1.,1.)*a*1.15+vec3(.7,.95,1.)*b*.45;
  col+=uPw*exp(-L2*35.)*.14;
  col=clamp(col,0.,1.);
  col*=mix(1.,.55,uDark);
  gl_FragColor=vec4(col,1.);
}`;

export function createCaustics(w, h, dark, hue) {
  let canvas, gl, prog, loc;
  try {
    canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false });
    if (!gl) return null;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    loc = {};
    for (const n of ['uRes', 'uT', 'uDark', 'uPw', 'uA', 'uB', 'uR', 'uP']) loc[n] = gl.getUniformLocation(prog, n);
  } catch (e) {
    console.warn('WebGL indisponível para a água:', e.message);
    return null;
  }

  const d = tintDelta(hue, 195);
  const n3 = (c) => rotRgb(c, d).map((v) => v / 255);
  gl.uniform3fv(loc.uA, n3([22, 165, 205]));
  gl.uniform3fv(loc.uB, n3([4, 88, 150]));
  gl.uniform1f(loc.uDark, dark ? 1 : 0);

  let t = 0, pw = 0, px = 0.5, py = 0.5, W = w, H = h;
  const rip = [];
  const buf = new Float32Array(24);

  function resize(nw, nh) {
    W = nw; H = nh;
    const s = Math.min(0.6, 720 / Math.max(nw, nh));
    canvas.width = Math.max(2, Math.ceil(nw * s));
    canvas.height = Math.max(2, Math.ceil(nh * s));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize(w, h);

  const spot = (x, y) => [x / H, 1 - y / H]; // mesmo espaço do shader (altura = 1)

  return {
    canvas,
    resize,
    ripple(x, y) { rip.push({ ...{ x: spot(x, y)[0], y: spot(x, y)[1] }, age: 0 }); if (rip.length > 8) rip.shift(); },
    step(dt, ptr) {
      t += dt;
      const on = ptr.x > -1000;
      pw += ((on ? 1 : 0) - pw) * Math.min(1, dt * 4);
      if (on) [px, py] = spot(ptr.x, ptr.y);
      for (const r of rip) r.age += dt;
      while (rip.length && rip[0].age > 4) rip.shift();
    },
    render() {
      for (let i = 0; i < 8; i++) {
        const r = rip[i];
        buf[i * 3] = r ? r.x : 0; buf[i * 3 + 1] = r ? r.y : 0; buf[i * 3 + 2] = r ? r.age : -1;
      }
      gl.uniform2f(loc.uRes, canvas.width, canvas.height);
      gl.uniform1f(loc.uT, t);
      gl.uniform1f(loc.uPw, pw);
      gl.uniform2f(loc.uP, px, py);
      gl.uniform3fv(loc.uR, buf);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return canvas;
    },
    destroy() { gl.getExtension('WEBGL_lose_context')?.loseContext(); },
  };
}
