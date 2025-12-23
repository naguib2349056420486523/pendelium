const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const sidebarWidth = 300;

function resize() {
    canvas.width = window.innerWidth - sidebarWidth;
    canvas.height = window.innerHeight;
    origin = { x: canvas.width / 2, y: 150 };
}

let origin = { x: 0, y: 0};
resize();
window.addEventListener('resize', resize);

const sLength = document.getElementById('lengthSlider');
const sMass = document.getElementById('massSlider');
const sGravity = document.getElementById('gravitySlider');
const sForce = document.getElementById('forceSlider');
const btnPush = document.getElementById('pushBtn');

const dLength = document.getElementById('lenVal');
const dMass = document.getElementById('massVal');
const dGravity = document.getElementById('gravVal');
const dForce = document.getElementById('forceVal');


let angle = Math.PI / 4; 
let aVel = 0;
let aAcc = 0;
let damping = 0.992;

let isDragging = false;
let mouse = {x:0, y:0};

function updateUI() {
    dLength.innerText = sLength.value + "m";
    dMass.innerText = sMass.value + "kg";
    dGravity.innerText = sGravity.value + "G";
    dForce.innerText = sForce.value + "N"; 
} 

[sLength, sMass, sGravity, sForce].forEach(el => el.addEventListener('input', updateUI));

btnPush.addEventListener('click', ()=>{
    const mass = Number(sMass.value);
    const pushStrength = 2.5 / mass;

    if (aVel > 0) aVel += pushStrength;
    else if (aVel < 0) aVal -= pushStrength;
    else aVel += pushStrength;
});


canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const len = Number(sLength.value);
    const ballX = origin.x + len * Math.sin(angle);
    const ballY = origin.y + len * Math.cos(angle);
    const massRadius = Number(sMass.value) + 15;

    if (Math.hypot(mouseX - ballX, mouseY - ballY) < massRadius + 20) {
        isDragging = true;
        aVel = 0;
    }

});

window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top }
});

window.addEventListener('mouseup', () => isDragging = false);

function animate() {
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const len = Number(sLength.value);
    const mass = Number(sMass.value);
    const grav = Number(sGravity.value);
    const externalForce = Number(sForce.value);

    if (isDragging) { 
        const dx = mouse.x - origin.x;
        const dy = mouse.y - origin.y;
        angle = Math.atan2(dx, dy);
        aVel = 0;
        aAcc = 0; 
    }
    else {
        const gravityPart = -grav * Math.sin(angle);
        const forcePart = (externalForce / (mass * 0.1)) * Math.cos(angle);

        aAcc = (gravityPart + forcePart) / (len / 100);
        aVel += aAcc;
        aVel *= damping;
    
        if (Math.abs(aVel) < 0.0001 && Math.abs(aAcc) < 0.001) {
            aVel = 0;
        } 

        angle += aVel;

    }

    const bobX = origin.x + len * Math.sin(angle);
    const bobY = origin.y + len * Math.cos(angle);
    const radius = 10 + (mass * 0.8);
    
    
    if (Math.abs(externalForce) > 0.1) {
        ctx.beginPath();
        ctx.moveTo(bobX, bobY);
        ctx.lineTo(bobX + externalForce * 100, bobY);
        ctx.strokeStyle = "#ff5e00";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "#ff5e00";
        const headX = bobX + externalForce * 100;
        ctx.arc(headX, bobY, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 6, 0, Math.PI * 2)
    ctx.fillStyle = "#666";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(bobX, bobY, radius, 0, Math.PI * 2);

    let grad = ctx.createRadialGradient(bobX - radius/3, bobY - radius/3, radius/5, bobX, bobY, radius);
    grad.addColorStop(0, "#e0ffe0");
    grad.addColorStop(1, "#00ff88");
    ctx.fillStyle = grad;
    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    requestAnimationFrame(animate);

}

animate();

