const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let x = 0;
let y = canvas.height;
let vx, vy;

const g = 9.8;
let t = 0;

function launch(){

x = 0;
y = canvas.height;
t = 0;

let velocity = document.getElementById("velocity").value;
let angle = document.getElementById("angle").value * Math.PI/180;

vx = velocity * Math.cos(angle);
vy = velocity * Math.sin(angle);

animate();
}

function animate(){

ctx.clearRect(0,0,canvas.width,canvas.height);

t += 0.1;

x = vx * t;
y = canvas.height - (vy * t - 0.5 * g * t * t);

ctx.beginPath();
ctx.arc(x*5, y, 6, 0, Math.PI*2);
ctx.fillStyle = "red";
ctx.fill();

if(y < canvas.height && x < canvas.width){
requestAnimationFrame(animate);
}

}
