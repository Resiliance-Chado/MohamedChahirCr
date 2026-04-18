const vmaInput = document.getElementById("vma");
const distanceInput = document.getElementById("distance");
const vmaPercentInput = document.getElementById("vmaPercent");
const lapDistanceInput = document.getElementById("lapDistance");
const computeBtn = document.getElementById("computeBtn");

const predictedTimeEl = document.getElementById("predictedTime");
const paceEl = document.getElementById("pace");
const speedEl = document.getElementById("speed");
const splitsBody = document.getElementById("splitsBody");
const zonesBody = document.getElementById("zonesBody");

const zones = [
  { name: "Z1 - Recuperation", min: 55, max: 65 },
  { name: "Z2 - Endurance fondamentale", min: 65, max: 75 },
  { name: "Z3 - Seuil aerobie", min: 75, max: 85 },
  { name: "Z4 - Seuil anaerobie", min: 85, max: 95 },
  { name: "Z5 - Puissance VMA", min: 95, max: 110 }
];

function secondsToTime(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  if (h > 0) {
    return `${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
  }
  return `${m}'${String(sec).padStart(2, "0")}"`;
}

function paceFromSpeed(speedKmh) {
  if (!speedKmh || speedKmh <= 0) return "--";
  const minPerKm = 60 / speedKmh;
  const m = Math.floor(minPerKm);
  const s = Math.round((minPerKm - m) * 60);
  return `${m}'${String(s).padStart(2, "0")}"/km`;
}

function buildSplits(totalDistance, totalTimeSec, lapDistance) {
  const rows = [];
  let cumDist = 0;
  let lapIndex = 0;

  while (cumDist < totalDistance) {
    lapIndex += 1;
    const remaining = totalDistance - cumDist;
    const thisLap = Math.min(lapDistance, remaining);
    cumDist += thisLap;

    const cumRatio = cumDist / totalDistance;
    const prevRatio = (cumDist - thisLap) / totalDistance;
    const cumTime = totalTimeSec * cumRatio;
    const prevTime = totalTimeSec * prevRatio;
    const lapTime = cumTime - prevTime;

    rows.push({
      split: lapIndex,
      distance: `${Math.round(cumDist)} m`,
      cumulative: secondsToTime(cumTime),
      lap: secondsToTime(lapTime)
    });
  }

  return rows;
}

function renderZones(vma) {
  zonesBody.innerHTML = "";
  zones.forEach((zone) => {
    const avgPercent = (zone.min + zone.max) / 2;
    const speed = (vma * avgPercent) / 100;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${zone.name}</td>
      <td>${zone.min}-${zone.max}%</td>
      <td>${speed.toFixed(1)}</td>
      <td>${paceFromSpeed(speed)}</td>
    `;
    zonesBody.appendChild(tr);
  });
}

function compute() {
  const vma = parseFloat(vmaInput.value);
  const distance = parseFloat(distanceInput.value);
  const percent = parseFloat(vmaPercentInput.value);
  const lapDistance = parseFloat(lapDistanceInput.value);

  if (!vma || !distance || !percent || !lapDistance) {
    return;
  }

  const targetSpeed = (vma * percent) / 100;
  const timeSec = (distance / 1000) / targetSpeed * 3600;
  const pace = paceFromSpeed(targetSpeed);

  predictedTimeEl.textContent = secondsToTime(timeSec);
  paceEl.textContent = pace;
  speedEl.textContent = `${targetSpeed.toFixed(1)} km/h`;

  const splits = buildSplits(distance, timeSec, lapDistance);
  splitsBody.innerHTML = "";
  splits.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.split}</td>
      <td>${row.distance}</td>
      <td>${row.cumulative}</td>
      <td>${row.lap}</td>
    `;
    splitsBody.appendChild(tr);
  });

  renderZones(vma);
}

computeBtn.addEventListener("click", compute);
window.addEventListener("DOMContentLoaded", compute);
