const STORAGE_KEY = "mccAdventureProgress2026";

document.addEventListener("DOMContentLoaded", () => {
    loadBingoCard();
});

async function loadBingoCard() {
    const response = await fetch("data/bingo2026.json");
    const data = await response.json();

    document.getElementById("title").textContent = data.title;
    document.getElementById("subtitle").textContent = data.subtitle;

    buildBingoCard(data);
}

function buildBingoCard(data) {
    const bingoCard = document.getElementById("bingoCard");
    const completedSquares = loadProgress();

    bingoCard.innerHTML = "";

    data.columns.forEach((letter) => {
        const header = document.createElement("div");
        header.className = "bingo-header";
        header.textContent = letter;
        bingoCard.appendChild(header);
    });

    data.card.flat().forEach((squareData) => {
        const square = document.createElement("button");

        square.className = "bingo-square";
        square.textContent = squareData.text;

        square.dataset.Id = squareData.id;
        square.dataset.kind = squareData.kind;
        
        if (completedSquares.includes(squareData.id)) {
            square.classList.add("completed");
        }

        if (squareData.kind === "riddle") {
            square.classList.add("locked");
            square.textContent = `${squareData.icon} ${squareData.text}`;
        } else {
            square.addEventListener("click", () => {
                toggleSquare(square, squareData.id);
            });
        }

        bingoCard.appendChild(square);
    });
}

function toggleSquare(square, Id) {
    square.classList.toggle("completed");

    let completedSquares = loadProgress();

    if (completedSquares.includes(Id)) {
        completedSquares = completedSquares.filter((id) => id !== Id);
    } else {
        completedSquares.push(Id);
    }

    saveProgress(completedSquares);
}

function loadProgress() {
    const saveProgress = localStorage.getItem(STORAGE_KEY);

    if (!saveProgress) {
        return [];
    }

    return JSON.parse(saveProgress);
}

function saveProgress(completedSquares) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedSquares));
}