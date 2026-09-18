document.addEventListener("DOMContentLoaded",()=>{

const container=document.getElementById("brand-logo-container");
const path=document.getElementById("brand-logo-path");
const line1=document.querySelector(".brand-line-top");
const line2=document.querySelector(".brand-line-bottom");

if(!container||!path)return;

const length=path.getTotalLength();

path.style.strokeDasharray=length;
path.style.strokeDashoffset=length;

setTimeout(()=>{
path.style.transition="stroke-dashoffset 1.8s cubic-bezier(.65,0,.35,1)";
path.style.strokeDashoffset="0";
},900);

function lerp(a,b,t){
return a+(b-a)*t;
}

function updateLogo(){

const hero=document.querySelector(".hero");
const heroHeight=hero?hero.offsetHeight:window.innerHeight;

let progress=window.scrollY/(heroHeight*.75);
progress=Math.min(Math.max(progress,0),1);

const startX=window.innerWidth/2;
const startY=window.innerHeight*.4;

let endX=window.innerWidth-100;
let endY=40;

const navbarLogo=document.querySelector(".logo");

if(navbarLogo){

const rect=navbarLogo.getBoundingClientRect();

endX=rect.left+130;
endY=rect.top+(rect.height/2)+2;

}

const scale=lerp(1.8,0.22,progress);

const x=lerp(startX,endX,progress);
const y=lerp(startY,endY,progress);

container.style.transform=
`translate(${x}px,${y}px) translate(-50%,-50%) scale(${scale})`;

if(line1){

line1.style.transform=
`translateX(${lerp(-40,-10,progress)}px) rotate(${lerp(-8,-2,progress)}deg)`;

line1.style.opacity=lerp(.55,.1,progress);

}

if(line2){

line2.style.transform=
`translateX(${lerp(40,10,progress)}px) rotate(${lerp(8,2,progress)}deg)`;

line2.style.opacity=lerp(.45,.1,progress);

}

}

let ticking=false;

window.addEventListener("scroll",()=>{

if(!ticking){

requestAnimationFrame(()=>{

updateLogo();
ticking=false;

});

ticking=true;

}

});

window.addEventListener("resize",updateLogo);

updateLogo();

});