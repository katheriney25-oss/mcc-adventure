//------------------------------------
// Constants
//------------------------------------

const STORAGE_KEY = "mccAdventureProgress2026";

//------------------------------------
// Startup
//------------------------------------


document.addEventListener("DOMContentLoaded", () => {
    loadBingoCard();
});

//------------------------------------
// Load Data
//------------------------------------

async function loadBingoCard() {
    const response = await fetch("data/bingo2026.json");
    const data = await response.json();

    document.getElementById("title").textContent = data.title;
    document.getElementById("subtitle").textContent = data.subtitle;

    buildBingoCard(data);
}

//------------------------------------
// Build UI
//------------------------------------

function buildBingoCard(data) {
    const bingoCard = document.getElementById("bingoCard");
    const completedSquares = loadProgress();

    updateBingoStatus(data.card, completedSquares);

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

        square.dataset.id = squareData.id;
        square.dataset.kind = squareData.kind;

        if (completedSquares.includes(squareData.id)) {
            square.classList.add("completed");
        }

        if (squareData.kind === "riddle") {
            square.classList.add("locked");
            square.textContent = `${squareData.icon} ${squareData.text}`;

            square.addEventListener("click", () => {
                if (!square.classList.contains("unlocked")) {
                    alert(
`📡 Transmission Encrypted

Earn ${squareData.unlocksOn} Bingo${squareData.unlocksOn > 1 ? "s" : ""} to decrypt this transmission.`
                    );

                    return;
                }

                alert(
`📡 Incoming Transmission

Transmission #${squareData.unlock.riddle} has been decrypted.

You are about to be redirected to the secure submission form.

Good luck, Detective!`
                );

                window.open(squareData.formUrl, "_blank");
            });
        } else {
            square.addEventListener("click", () => {
                toggleSquare(square, squareData.id, data.card);
            });
        }

        bingoCard.appendChild(square);
    });
}
    


//------------------------------------
// Player Progress
//------------------------------------

function toggleSquare(square, squareId, card) {
    square.classList.toggle("completed");

    let completedSquares = loadProgress();

    if (completedSquares.includes(squareId)) {
        completedSquares = completedSquares.filter((id) => id !== squareId);
    } else {
        completedSquares.push(squareId);
    }

    saveProgress(completedSquares);
    updateBingoStatus(card, completedSquares);
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

function checkForBingos(card, completedSquares) {
    const patterns = buildBingoPatterns(card);

    const completedBingos = patterns.filter((pattern) => {
        return pattern.every((square) => 
            isSquareSatisfied(square,completedSquares)
        );
    });

    return completedBingos;
}

function buildBingoPatterns(card) {
    const patterns = [];

    //Rows
    card.forEach((row) => {
        patterns.push(row);
    });

    //Columns
    for (let columnIndex = 0; columnIndex < card[0].length; columnIndex++) {
        const column = card.map((row) => row[columnIndex]);
        patterns.push(column);
    }

    // Diagonal: top-left to bottom-right
    const diagonalOne = card.map((row, index) => row[index]);
    patterns.push(diagonalOne);

    // diagonal: top-right to bottom left
    const diagonalTwo = card.map((row, index) => row[row.length - 1 - index]);
    patterns.push(diagonalTwo);

    return patterns;
}

function isSquareSatisfied(square, completedSquares) {
    //Riddle square count toward a Bingo, 
    //even before they've been unlocked
    if (square.kind === "riddle") {
        return true;
    }

    return completedSquares.includes(square.id)
}

function updateBingoStatus(card, completedSquares) {
    const completedBingos = checkForBingos(card, completedSquares);
    const bingoStatus = document.getElementById("bingoStatus");

    bingoStatus.textContent = `Bingos completed: ${completedBingos.length}`;

    updateRiddleUnlocks(card, completedBingos.length);
}

function updateRiddleUnlocks(card, bingoCount) {
    const riddleSquares = card.flat().filter((square) => square.kind === "riddle");

    riddleSquares.forEach((riddle) => {
        const riddleButton = document.querySelector(`[data-id="${riddle.id}"]`);

        if (!riddleButton) {
            return;
        }

        if (bingoCount >= riddle.unlocksOn) {
            riddleButton.classList.remove("locked");
            riddleButton.classList.add("unlocked");
            riddleButton.textContent = 
            `📡 Transmission #${riddle.unlock.riddle}
            Click Here to Read Transmission`;
        } else {
            riddleButton.classList.add("locked");
            riddleButton.classList.remove("unlocked");
            riddleButton.textContent = `${riddle.icon} ${riddle.text}`;
        }
    });
}


//------------------------------------
// Event Handlers
//------------------------------------

//------------------------------------
// Utility Functions
//------------------------------------