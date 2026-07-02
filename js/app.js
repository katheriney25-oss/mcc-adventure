//------------------------------------
// Constants
//------------------------------------

const STORAGE_KEY = "mccAdventureProgress2026";
const TRANSMISSION_KEY = "mccOpenedTransmissions2026";

//------------------------------------
// Startup
//------------------------------------


document.addEventListener("DOMContentLoaded", () => {
    loadBingoCard();
});

document.getElementById("closeModal").addEventListener("click", closeTransmissionModal);

document
    .getElementById("openTransmissionButton")
    .addEventListener("click", openTransmissionForm);

document
    .getElementById("resetCardButton")
    .addEventListener("click", resetCard);

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
    const openedTransmissions = loadOpenedTransmissions();

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

            square.addEventListener("click", () => {
                if (square.classList.contains("unlocked") || square.classList.contains("opened")) {
                    showTransmissionModal(squareData);
                } else {
                    alert("📡 Transmission Encrypted\n\nEarn the required Bingo to decrypt this transmission.");
                }
            });

                    
        } else {
            square.addEventListener("click", () => {
                toggleSquare(square, squareData.id, data.card);
            });
        }

        bingoCard.appendChild(square);

        updateBingoStatus(data.card, completedSquares);
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

function loadOpenedTransmissions() {

    const opened = localStorage.getItem(TRANSMISSION_KEY);

    if (!opened) {
        return [];
    }

    return JSON.parse(opened);
}

function saveOpenedTransmissions(openedTransmissions) {
    localStorage.setItem(
        TRANSMISSION_KEY,
        JSON.stringify(openedTransmissions)
    );
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
    const openedTransmissions = loadOpenedTransmissions();
    const rank = getDetectiveRank(openedTransmissions.length);

    const bingoStatus = document.getElementById("bingoStatus");

    bingoStatus.innerHTML = 
    `Investigation Progress<br>
    Transmissions Received: ${completedBingos.length}<br>
    Reports Reviewed: ${openedTransmissions.length}<br>
    Rank: ${rank}`;


    updateRiddleUnlocks(card, completedBingos.length);
}

function updateRiddleUnlocks(card, bingoCount) {
    const openedTransmissions = loadOpenedTransmissions();
    const riddleSquares = card.flat().filter((square) => square.kind === "riddle");

    riddleSquares.forEach((riddle) => {
        const riddleButton = document.querySelector(`[data-id="${riddle.id}"]`);

        if (!riddleButton) {
            return;
        }

        if (openedTransmissions.includes(riddle.id)) {

            riddleButton.classList.remove("locked", "unlocked");
            riddleButton.classList.add("opened");
            riddleButton.textContent =
            `📂 Transmission #${riddle.unlock.riddle}
            Transmission Reviewed`;

        } else if(bingoCount >= riddle.unlocksOn) {

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

let activeTransmissionUrl = "";
let activeTransmissionId = null;

function showTransmissionModal(squareData) {
    activeTransmissionUrl = squareData.formUrl;
    activeTransmissionId = squareData.id;

    setDetectiveStatus("Transmission", "Located");

    document.getElementById("modalTitle").textContent =
        `Transmission #${squareData.unlock.riddle} Decrypted`;

    document.getElementById("modalMessage").textContent =
        "You have earned access to a classified message. Open the secure form to submit your answer.";

    document.getElementById("transmissionModal").classList.remove("hidden");
}

function closeTransmissionModal() {
    document.getElementById("transmissionModal").classList.add("hidden");

    setDetectiveStatus("Awaiting", "Coordinates...")
}

function openTransmissionForm() {

    let openedTransmissions = loadOpenedTransmissions();

    if (!openedTransmissions.includes(activeTransmissionId)) {
        openedTransmissions.push(activeTransmissionId);
    }

    saveOpenedTransmissions(openedTransmissions);

    window.open(activeTransmissionUrl, "_blank");

    closeTransmissionModal();

    loadBingoCard();
}

function setDetectiveStatus(line1, line2) {
    document.getElementById("detectiveStatus").innerHTML = 
        `${line1}<br>${line2}`;
}

function getDetectiveRank(openedCount) {
    if (openedCount >= 3) {
        return "Chief Detective";
    }

    if (openedCount === 2) {
        return "Senior Investigator";
    }

    if (openedCount === 1) {
        return "Junior Detective";
    }

    return "Rookie Detective";
}

//------------------------------------
// Event Handlers
//------------------------------------
function resetCard() {
    const confirmReset = confirm(
    `Reset Investigation?

    This will clear:

    • Completed Bingo squares
    • Reviewed transmissions

    Your investigation will begin again from the start.`
    );

    if (!confirmReset) {
        return;
    }

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TRANSMISSION_KEY);

    location.reload();

}
//------------------------------------
// Utility Functions
//------------------------------------