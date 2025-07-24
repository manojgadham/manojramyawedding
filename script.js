
const weddingDate = new Date("2025-08-13T00:00:00").getTime();

function updateTimer() {
  const now = new Date().getTime();
  const distance = weddingDate - now;
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("countdown").innerHTML = 
    days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

  if (distance < 0) {
    document.getElementById("countdown").innerHTML = "We're Married!";
  }
}

setInterval(updateTimer, 1000);

function loadImages(eventName) {
  const container = document.getElementById(`${eventName}-gallery`);
  for (let i = 1; i <= 2; i++) {
    const img = document.createElement('img');
    img.src = `${eventName}/${eventName.toLowerCase()}_${i}.jpg`;
    container.appendChild(img);
  }
}

window.onload = function () {
  const events = ['PreWedding', 'Engagement', 'Haldi', 'Wedding', 'Reception'];
  events.forEach(event => loadImages(event));
};
