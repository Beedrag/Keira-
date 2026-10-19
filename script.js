
const container = document.getElementById("hearts-container");

const MAX_HEARTS = 2;
const HEART_DURATION = 7000;
const SPAWN_INTERVAL = 3000;

const activePositions = [];

function getHeartPosition(size) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const centerX = width / 2;
    const centerY = height / 2;

    const spreadX = width * 0.4;
    const spreadY = height * 0.35;

    let x = centerX - size / 2;
    let y = centerY - size / 2;

    for (let attempt = 0; attempt < 40; attempt++) {
        x = centerX - size / 2
            + (Math.random() - 0.5) * spreadX * 2;

        y = centerY - size / 2
            + (Math.random() - 0.5) * spreadY * 2;

        const farEnough = activePositions.every((position) => {
            return Math.hypot(x - position.x, y - position.y) > size * 0.85;
        });

        if (farEnough) break;
    }

    x = Math.max(-size * 0.1, Math.min(x, width - size * 0.9));
    y = Math.max(-size * 0.1, Math.min(y, height - size * 0.9));

    return { x, y };
}

function spawnHeart() {
    if (container.childElementCount >= MAX_HEARTS) return;

    const heart = document.createElement("div");
    heart.className = "heart";

    heart.innerHTML = `
        <svg viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg"
             aria-hidden="true">
            <path d="
                M12 21
                s-9-5.8-9-12
                a5.2 5.2 0 0 1 9-3.5
                A5.2 5.2 0 0 1 21 9
                c0 6.2-9 12-9 12Z
            "/>
        </svg>
    `;

    const size = Math.min(
        container.clientWidth * 0.48,
        620
    );

    const { x, y } = getHeartPosition(size);

    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    const position = { x, y };
    activePositions.push(position);
    container.appendChild(heart);

    heart.addEventListener("animationend", (event) => {
        if (event.animationName !== "heart-float") return;

        heart.remove();

        const index = activePositions.indexOf(position);
        if (index !== -1) {
            activePositions.splice(index, 1);
        }
    });
}

// Spawn pertama langsung, lalu setiap 3 detik
spawnHeart();
setInterval(spawnHeart, SPAWN_INTERVAL);


const starsContainer = document.getElementById("stars-container");

const STAR_COUNT = 24;

function createStar() {
    const star = document.createElement("div");

    const isSparkle = Math.random() < 0.25;
    star.className = isSparkle ? "star sparkle" : "star";

    const size = isSparkle
        ? 5 + Math.random() * 5
        : 2 + Math.random() * 2;

    star.style.left = `${Math.random() * 96 + 2}%`;
    star.style.top = `${Math.random() * 96 + 2}%`;

    star.style.setProperty("--star-size", `${size}px`);
    star.style.setProperty(
        "--star-duration",
        `${2 + Math.random() * 4}s`
    );
    star.style.setProperty(
        "--star-delay",
        `${-Math.random() * 5}s`
    );

    starsContainer.appendChild(star);
}

for (let i = 0; i < STAR_COUNT; i++) {
    createStar();
}
