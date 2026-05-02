const clock = document.getElementById('clock');
const hourHand = document.getElementById('hour-hand');
const minuteHand = document.getElementById('minute-hand');
const ticksGroup = document.getElementById('ticks');
const numbersGroup = document.getElementById('numbers');
const optionsContainer = document.getElementById('options-container');
const feedback = document.getElementById('feedback');
const nextBtn = document.getElementById('next-btn');
const scoreValue = document.getElementById('score-value');
const rabbitContainer = document.getElementById('rabbit-container');
const rabbitHappy = document.getElementById('rabbit-happy');
const rabbitSad = document.getElementById('rabbit-sad');

const wrongSound = new Audio('static/audio/wrong.mp3?v=' + Date.now());
const yuhuSound = new Audio('static/audio/yuhu.mp3?v=' + Date.now());

let currentHour = 0;
let currentMinute = 0;
let correctAnswer = "";
let score = parseInt(localStorage.getItem('clockGameScore')) || 0;

// Initialize score display
scoreValue.textContent = score;

function updateScore(points) {
    score += points;
    if (score < 0) score = 0;
    scoreValue.textContent = score;
    try {
        localStorage.setItem('clockGameScore', score);
    } catch (e) {
        console.warn("localStorage not available:", e);
    }
    
    // Simple animation effect
    scoreValue.classList.remove('pop');
    void scoreValue.offsetWidth; // Trigger reflow
    scoreValue.classList.add('pop');
}

function initClock() {
    // Add ticks
    for (let i = 0; i < 60; i++) {
        const angle = (i * 6) * (Math.PI / 180);
        const length = i % 5 === 0 ? 10 : 5;
        const x1 = 150 + 135 * Math.sin(angle);
        const y1 = 150 - 135 * Math.cos(angle);
        const x2 = 150 + (135 - length) * Math.sin(angle);
        const y2 = 150 - (135 - length) * Math.cos(angle);
        
        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tick.setAttribute("x1", x1);
        tick.setAttribute("y1", y1);
        tick.setAttribute("x2", x2);
        tick.setAttribute("y2", y2);
        tick.setAttribute("stroke", "black");
        tick.setAttribute("stroke-width", i % 5 === 0 ? 3 : 1);
        ticksGroup.appendChild(tick);
    }

    // Add numbers
    for (let i = 1; i <= 12; i++) {
        const angle = (i * 30) * (Math.PI / 180);
        const x = 150 + 110 * Math.sin(angle);
        const y = 150 - 110 * Math.cos(angle);
        
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y);
        text.setAttribute("class", "clock-number");
        text.textContent = i;
        numbersGroup.appendChild(text);
    }
}

function setTime(hour, minute) {
    const minuteAngle = minute * 6;
    const hourAngle = (hour % 12) * 30 + minute * 0.5;

    minuteHand.setAttribute("transform", `rotate(${minuteAngle}, 150, 150)`);
    hourHand.setAttribute("transform", `rotate(${hourAngle}, 150, 150)`);
}

function generateQuestion() {
    feedback.textContent = "";
    feedback.classList.add('hidden');
    nextBtn.classList.add('hidden');
    rabbitContainer.classList.add('hidden');
    rabbitHappy.classList.add('hidden');
    rabbitSad.classList.add('hidden');
    rabbitHappy.className = "";
    optionsContainer.innerHTML = "";

    // Generate random hour (1-12)
    currentHour = Math.floor(Math.random() * 12) + 1;
    // Randomly choose 15 or 45 (quarter past or quarter to)
    currentMinute = Math.random() < 0.5 ? 15 : 45;

    setTime(currentHour, currentMinute);

    let displayHour = currentHour;
    if (currentMinute === 15) {
        correctAnswer = `quarter past ${displayHour}`;
    } else {
        // "quarter to" usually refers to the NEXT hour
        // If it's 7:45, it's "quarter to 8"
        let nextHour = displayHour === 12 ? 1 : displayHour + 1;
        correctAnswer = `quarter to ${nextHour}`;
    }

    const options = generateOptions(correctAnswer);
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => handleAnswer(option, btn);
        optionsContainer.appendChild(btn);
    });
}

function generateOptions(correct) {
    const options = [correct];
    
    // Extract hour and type from correct answer
    const parts = correct.split(' ');
    const type = parts[1]; // "past" or "to"
    const hour = parseInt(parts[2]);

    // Distractor 1: same hour, different type
    const otherType = type === "past" ? "to" : "past";
    options.push(`quarter ${otherType} ${hour}`);

    // Distractor 2: different hour, same type
    let diffHour = hour === 12 ? 1 : hour + 1;
    options.push(`quarter ${type} ${diffHour}`);

    // Distractor 3: different hour, different type
    options.push(`quarter ${otherType} ${diffHour}`);

    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

function handleAnswer(selected, btn) {
    // Always hide both first to avoid overlap
    rabbitHappy.classList.add('hidden');
    rabbitSad.classList.add('hidden');

    if (selected === correctAnswer) {
        yuhuSound.play().catch(e => console.error("Error playing sound:", e));
        updateScore(1);
        
        btn.classList.add('correct');
        feedback.textContent = "Well done! 🌟";
        feedback.style.color = "#4caf50";
        feedback.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
        
        // Show cheering rabbit
        rabbitContainer.classList.remove('hidden');
        rabbitHappy.classList.remove('hidden');
        rabbitHappy.className = "cheer";
        
        // Disable all buttons
        document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
    } else {
        wrongSound.play().catch(e => console.error("Error playing sound:", e));
        // No score penalty for errors as per user request
        btn.classList.add('wrong');
        feedback.textContent = "Try again! 😊";
        feedback.style.color = "#f44336";
        feedback.classList.remove('hidden');
        
        // Show sad rabbit image
        rabbitContainer.classList.remove('hidden');
        rabbitSad.classList.remove('hidden');
    }
}

nextBtn.onclick = generateQuestion;

// Initial setup
initClock();
generateQuestion();
