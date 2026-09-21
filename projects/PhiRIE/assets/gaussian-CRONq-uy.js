import{P as oe,M as ne,V as X,O as se}from"./OrbitControls-BU1l45DC.js";const ie=`
struct Uniforms { view: mat4x4f, projection: mat4x4f, viewport: vec4f, params: vec4f, center: vec4f };
struct Splat { position: vec4f, color: vec4f, covarianceA: vec4f, covarianceB: vec4f };
@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> splats: array<Splat>;
@group(0) @binding(2) var<storage, read> order: array<u32>;
struct Output { @builtin(position) position: vec4f, @location(0) local: vec2f, @location(1) color: vec4f };
@vertex fn vertexMain(@builtin(vertex_index) vertex: u32, @builtin(instance_index) instance: u32) -> Output {
  let s = splats[order[instance]];
  let group = i32(s.position.w); let mode = i32(u.params.x);
  var out: Output;
  out.position = vec4f(0,0,2,1); out.local=vec2f(0);out.color=vec4f(0);
  if ((group == 1 && mode != 0) || (group == 2 && mode < 2) || (group == 3 && mode != 3)) { return out; }
  var p = s.position.xyz;
  var covariance = mat3x3f(vec3f(s.covarianceA.x,s.covarianceA.y,s.covarianceA.z),
    vec3f(s.covarianceA.y,s.covarianceA.w,s.covarianceB.x),vec3f(s.covarianceA.z,s.covarianceB.x,s.covarianceB.y));
  // Widen background kernels for the downsampled browser preview.
  if (group == 0) { covariance *= 1.96; }
  if (group == 3) {
    let c=cos(u.params.w);let sn=sin(u.params.w);
    let r=mat3x3f(vec3f(c,sn,0),vec3f(-sn,c,0),vec3f(0,0,1));
    p=r*(p-u.center.xyz)+u.center.xyz+vec3f(u.params.y,u.params.z,0);
    covariance=r*covariance*transpose(r);
  }
  let viewP = (u.view*vec4f(p,1)).xyz;
  if (viewP.z > -0.04) { return out; }
  let clip = u.projection*vec4f(viewP,1);
  let rotation = mat3x3f(u.view[0].xyz,u.view[1].xyz,u.view[2].xyz);
  let cov=rotation*covariance*transpose(rotation);
  let fx=u.projection[0].x*u.viewport.x*.5; let fy=u.projection[1].y*u.viewport.y*.5;
  let jx=vec3f(fx/-viewP.z,0,fx*viewP.x/(viewP.z*viewP.z));
  let jy=vec3f(0,fy/-viewP.z,fy*viewP.y/(viewP.z*viewP.z));
  let a=dot(jx,cov*jx)+.3;let b=dot(jx,cov*jy);let d=dot(jy,cov*jy)+.3;
  let mid=(a+d)*.5;let radius=sqrt(max(.0001,(a-d)*(a-d)*.25+b*b));
  let l1=min(20000.0,max(.1,mid+radius));let l2=min(20000.0,max(.1,mid-radius));
  var axis=vec2f(1,0);if (abs(b)>.0001) {axis=normalize(vec2f(b,l1-a));} else if(d>a){axis=vec2f(0,1);}
  let quad=array<vec2f,6>(vec2f(-3,-3),vec2f(3,-3),vec2f(3,3),vec2f(-3,-3),vec2f(3,3),vec2f(-3,3));
  let corner=quad[vertex];
  let offset=axis*sqrt(l1)*corner.x+vec2f(-axis.y,axis.x)*sqrt(l2)*corner.y;
  out.position=vec4f(clip.xy/clip.w+offset*2/u.viewport.xy,.5,1);
  out.local=corner;out.color=s.color;return out;
}
@fragment fn fragmentMain(in: Output) -> @location(0) vec4f {
  let radius=dot(in.local,in.local); if(radius>9){discard;}
  let alpha=min(.99,in.color.a*exp(-.5*radius));if(alpha<.003){discard;}
  return vec4f(in.color.rgb*alpha,alpha);
}`;async function le(s,f){const[d,S]=await Promise.all([fetch("models/desk.json").then(e=>{if(!e.ok)throw new Error("Scene metadata failed to load");return e.json()}),fetch("models/desk.splat").then(e=>{if(!e.ok)throw new Error("Gaussian scene failed to load");return e.arrayBuffer()})]);if(!f.isCurrent())throw new Error("Demo loading cancelled.");const a=f.device,o=document.createElement("canvas");o.setAttribute("aria-label","Interactive 3D Gaussian scene"),s.append(o);const C=f.software?null:o.getContext("webgpu"),Z=f.software?o.getContext("2d"):null,B=navigator.gpu.getPreferredCanvasFormat();C?.configure({device:a,format:B,alphaMode:"opaque"});const G=a.createShaderModule({code:ie}),I=(await G.getCompilationInfo()).messages.filter(e=>e.type==="error");if(I.length)throw o.remove(),new Error(I.map(e=>e.message).join("; "));const $=await a.createRenderPipelineAsync({layout:"auto",vertex:{module:G,entryPoint:"vertexMain"},fragment:{module:G,entryPoint:"fragmentMain",targets:[{format:B,blend:{color:{srcFactor:"one",dstFactor:"one-minus-src-alpha"},alpha:{srcFactor:"one",dstFactor:"one-minus-src-alpha"}}}]},primitive:{topology:"triangle-list"}}),w=new Float32Array(S),p=w.length/16,O=a.createBuffer({size:S.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});a.queue.writeBuffer(O,0,S);const j=a.createBuffer({size:p*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),q=a.createBuffer({size:176,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),ee=a.createBindGroup({layout:$.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:q}},{binding:1,resource:{buffer:O}},{binding:2,resource:{buffer:j}}]}),c=new oe(68,1,.03,30);c.up.set(0,0,1);const te=new ne().fromArray(d.camera.w2c.flat()).transpose().invert(),R=new X().setFromMatrixPosition(te),U=new X(...d.center);R.sub(U).multiplyScalar(1.5).add(U),c.position.copy(R);const u=new se(c,o);u.target.copy(U),u.minDistance=.25,u.maxDistance=5,u.enableDamping=!1,u.update();const W=new AbortController,D=(e,n,P)=>document.querySelector(e).addEventListener(n,P,{signal:W.signal});let v=!0,m=!1,ae=0,h,l,E=!1;const b={stage:3,x:0,y:0,angle:0},Y=()=>{const e=s.getBoundingClientRect(),n=f.software?1:Math.min(devicePixelRatio,1.5);o.width=Math.max(1,Math.round(e.width*n)),o.height=Math.max(1,Math.round(e.height*n)),c.aspect=e.width/e.height,c.updateProjectionMatrix(),v=!0};Y();const L=new ResizeObserver(Y);L.observe(s),u.addEventListener("change",()=>v=!0),D("#scene-stage","change",e=>{b.stage=+e.target.value,v=!0});for(const e of["x","y","angle"])D(`#scene-${e}`,"input",n=>{b[e]=+n.target.value,document.querySelector(`#scene-${e}-value`).textContent=`${n.target.value}${e==="angle"?"°":" cm"}`,b.stage=3,document.querySelector("#scene-stage").value="3",v=!0});D("#reset-demo","click",()=>{Object.assign(b,{stage:3,x:0,y:0,angle:0}),c.position.copy(R),u.target.copy(U),u.update(),document.querySelector("#scene-stage").value="3";for(const e of["x","y","angle"])document.querySelector(`#scene-${e}`).value=0,document.querySelector(`#scene-${e}-value`).textContent=e==="angle"?"0°":"0 cm";v=!0});const T=new Uint32Array(p),F=new Float32Array(p),x=new Float32Array(44);async function re(){const e={...b};c.updateMatrixWorld();const n=c.matrixWorldInverse.elements,P=e.angle*Math.PI/180,H=Math.cos(P),J=Math.sin(P);for(let i=0;i<p;i++){const r=i*16;let t=w[r],A=w[r+1];if(w[r+3]===3){const K=t-d.center[0],Q=A-d.center[1];t=H*K-J*Q+d.center[0]+e.x/100,A=J*K+H*Q+d.center[1]+e.y/100}F[i]=n[2]*t+n[6]*A+n[10]*w[r+2]+n[14],T[i]=i}T.sort((i,r)=>F[i]-F[r]),a.queue.writeBuffer(j,0,T),x.set(n,0),x.set(c.projectionMatrix.elements,16),x.set([o.width,o.height,0,0],32),x.set([e.stage,e.x/100,e.y/100,P],36),x.set([...d.center,0],40),a.queue.writeBuffer(q,0,x);const g=o.width,y=o.height,M=Math.ceil(g*4/256)*256;f.software&&(h?.destroy(),l?.destroy(),h=a.createTexture({size:[g,y],format:B,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC}),l=a.createBuffer({size:M*y,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ}));const _=a.createCommandEncoder(),z=_.beginRenderPass({colorAttachments:[{view:(h||C.getCurrentTexture()).createView(),clearValue:{r:.075,g:.12,b:.09,a:1},loadOp:"clear",storeOp:"store"}]});if(z.setPipeline($),z.setBindGroup(0,ee),z.draw(6,p),z.end(),l&&_.copyTextureToBuffer({texture:h},{buffer:l,bytesPerRow:M},[g,y]),a.queue.submit([_.finish()]),l){await l.mapAsync(GPUMapMode.READ);const i=new Uint8Array(l.getMappedRange()),r=new Uint8ClampedArray(g*y*4);for(let t=0;t<y;t++)r.set(i.subarray(t*M,t*M+g*4),t*g*4);if(B.startsWith("bgra"))for(let t=0;t<r.length;t+=4){const A=r[t];r[t]=r[t+2],r[t+2]=A}l.unmap(),m||Z.putImageData(new ImageData(r,g,y),0,0)}m||(s.dataset.frames=String(++ae),s.dataset.gaussians=String(p),s.dataset.sceneStage=String(e.stage),s.dataset.scenePose=JSON.stringify([e.x,e.y,e.angle]))}let N,k;const V=()=>{m||(v&&!document.hidden&&!E&&(v=!1,E=!0,k=re().catch(e=>{m||(f.status("Rendering paused · reload demo"),console.error(e))}).finally(()=>E=!1)),N=requestAnimationFrame(V))};return V(),a.lost.then(e=>{m||(f.status("WebGPU device lost · reload the demo"),console.warn(e.message))}),{dispose(){m=!0,cancelAnimationFrame(N),W.abort(),L.disconnect(),u.dispose();const e=()=>{O.destroy(),j.destroy(),q.destroy(),h?.destroy(),l?.destroy(),C?.unconfigure()};k?k.then(e,e):e(),o.remove(),delete s.dataset.frames,delete s.dataset.gaussians,delete s.dataset.sceneStage}}}export{le as createDemo};
