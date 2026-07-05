//------------------------------------
// Constants
//------------------------------------

const STORAGE_KEY = "mccAdventureProgress2026";
const TRANSMISSION_KEY = "mccOpenedTransmissions2026";
const HQ_PROMOTION_KEY = "mccHQPromotionShown2026";
const SUBMIT_CASEFILE_URL = "https://forms.gle/y8nqQ38iVrcWTXCc9";
const UNLOCK_ANIMATION_KEY = "mccUnlockAnimationsShown2026";
const CASE_FILE_REVIEW_KEY = "mccCaseFileReview2026";

//------------------------------------
// Startup
//------------------------------------


document.addEventListener("DOMContentLoaded", () => {
    loadBingoCard();
    renderCaseFileReview();
});

document.getElementById("closeModal").addEventListener("click", closeTransmissionModal);

document
    .getElementById("openTransmissionButton")
    .addEventListener("click", openTransmissionForm);

document
    .getElementById("resetCardButton")
    .addEventListener("click", resetCard);

document
    .getElementById("howtoPlayButton")
    .addEventListener("click", openHowToPlayModal);

document
    .getElementById("closeHowToPlayModal")
    .addEventListener("click", closeHowToPlayModal);

document
    .getElementById("closeHQPromotionModal")
    .addEventListener("click", closeHQPromotionModal);

document
    .getElementById("submitInvestigationButton")
    .addEventListener("click", openSubmitConfirmationModal);

document.getElementById("SubmitInvestigationButtonModal")
    .addEventListener("click", beginCaseFileSubmission);

document.getElementById("ContinueButton")
    .addEventListener("click", continueInvestigation);

document.getElementById("close-submitconfirmationmodal")
    .addEventListener("click", closeSubmitConfirmationModal);

document.getElementById("KeepContinueButton")
    .addEventListener("click", continueInvestigationAgain);

document.getElementById("FinalSubmitButtonModal")
    .addEventListener("click", submitCaseFile);

document.getElementById("ResetConfirmationOK")
    .addEventListener("click", confirmResetCard);

document.getElementById("ResetConfirmationX")
    .addEventListener("click", closeResetConfirmationModal);

document.getElementById("EncryptedTransmissionModal")
    .addEventListener("click", closeEncryptedTransmissionModal);

document
    .getElementById("finalGuessButton")
    .addEventListener("click", openFinalCaseFileModal);

document
    .getElementById("closeFinalCaseFileModal")
    .addEventListener("click", closeFinalCaseFileModal);

document
    .getElementById("ContinueInvestigationFinalButton")
    .addEventListener("click", closeFinalCaseFileModal);

document
    .getElementById("ConfirmSubmitCaseFileButton")
    .addEventListener("click", submitFinalCaseFile);

document
    .getElementById("closeRiddleModal")
    .addEventListener("click", closeRiddleModal);

document
    .getElementById("submitRiddleAnswerButton")
    .addEventListener("click", submitRiddleAnswer);


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
                    openEncryptedTransmissionModal();
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

    updateSubmissionPanel(completedBingos.length);
    updateCaseFileCodePanel();

    updateRiddleUnlocks(card, completedBingos.length);
    updateFinalGuessButton();
}

function updateSubmissionPanel(bingoCount) {
    const submissionPanel = document.getElementById("submissionPanel");
    const submissionStatus = document.getElementById("submissionStatus");
    const closeButton = document.getElementById("submitInvestigationButton");
    const submitCaseFileButton = document.getElementById("finalGuessButton");

    if (!submissionPanel || !submissionStatus || !closeButton || !submitCaseFileButton) {
        return;
    }

    const openedTransmissions = loadOpenedTransmissions();

    const closeInvestigationUnlocked = bingoCount >= 1;

    const submitCaseFileUnlocked = 
        openedTransmissions.length >= 3;
    
    // Optional later blackout requirement: 
    // const blackoutComplete = completedSquares.Length === card.flat().filter(square => square.kind !== "riddle").Length;
    // const submitCaseFileUnlock = openedTransmissions.Length >= 3 && blackoutComplete;

    if (!closeInvestigationUnlocked) {
        closeButton.disabled = true;
        submitCaseFileButton.disabled = true;
        submissionStatus.innerHTML = 
        "🔒 Complete one BINGO to become eligible for the Daily Prize Drawing.";
        
    } else if (!submitCaseFileUnlocked) {
        closeButton.disabled = false;
        submitCaseFileButton.disabled = true;
        submissionStatus.innerHTML =
        "📨 You are eligible for today's Daily Prize Drawing.<br>Closing Investigation ends your case. <br><br>🔒 Finish all transmissions to Submit your Case File and answer: Who is the Meeple Among Us?";
    } else {
        closeButton.disabled = true;
        submitCaseFileButton.disabled = false;

        submissionStatus.innerHTML = 
         "🕵️ All transmissions reviewed. You may now Submit your Case File.";
        
    }
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

            const shownUnlocks = loadShownUnlockAnimations();

            if (!shownUnlocks.includes(riddle.id)) {

                shownUnlocks.push(riddle.id);
                saveShownUnlockAnimations(shownUnlocks);

                setDetectiveStatus("Transmission", "Unlocked!");

                animateDetectiveUnlock(() => {

                    if (riddle.unlocksOn === 1 && !hasSeenHQPromotion()) {

                        setDetectiveStatus("HQ", "Calling...");

                        setTimeout(() => {
                            openHQPromotionModal();
                            markHQPromotionSeen();
                        }, 700);
                    
                    } else if (riddle.unlocksOn === 3) {

                        setDetectiveStatus("All Transmissions", "Received");

                    } else {

                        setDetectiveStatus("Awaiting", "Next Coordinates...");

            }
        });
    }
        } else {
            riddleButton.classList.add("locked");
            riddleButton.classList.remove("unlocked");
            riddleButton.textContent = `${riddle.icon} ${riddle.text}`;
        }

    });
}

let activeTransmissionUrl = "";
let activeTransmissionId = null;
let activeTransmissionData = null;
let selectedRiddleChoice = null;
let activeRiddleSquareData = null;

function showTransmissionModal(squareData) {
    activeTransmissionUrl = squareData.formUrl;
    activeTransmissionId = squareData.id;
    activeTransmissionData = squareData;

    setDetectiveStatus("Transmission", "Located");

    document.getElementById("modalTitle").textContent =
        `Transmission #${squareData.unlock.riddle} Decrypted`;

    document.getElementById("modalMessage").textContent =
        "You have earned access to a classified message. Review the transmission and submit your finding.";

    document.getElementById("transmissionModal").classList.remove("hidden");
}

function closeTransmissionModal() {
    document.getElementById("transmissionModal").classList.add("hidden");

}

function openTransmissionForm() {

    let openedTransmissions = loadOpenedTransmissions();

    if (!openedTransmissions.includes(activeTransmissionId)) {
        openedTransmissions.push(activeTransmissionId);
    }

    saveOpenedTransmissions(openedTransmissions);

    updateFinalGuessButton();

    closeTransmissionModal();

    loadBingoCard();

    openRiddleModal(activeTransmissionData);
    
    
}

function openRiddleModal(squareData) {

    const transmission = squareData.transmission;
    activeRiddleSquareData = squareData;

    selectedRiddleChoice = null;

    document.getElementById("submitRiddleAnswerButton").disabled = true;

    document.getElementById("riddleModalTitle").textContent =
        transmission.title;

    document.getElementById("riddleModalIntro").textContent =
        transmission.intro;

    document.getElementById("riddleQuestion").innerHTML =`
        <div class="classified-label">CLASSIFIED</div>
        <div class="classified-question">${transmission.question}</div>
    `;

    const choicesDiv = document.getElementById("riddleChoices");
    choicesDiv.innerHTML = "";

    transmission.choices.forEach(choice => {

        const button = document.createElement("button");

        button.className = "riddle-choice-button";
        button.textContent = choice.text;

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".riddle-choice-button")
                .forEach(btn => btn.classList.remove("selected"));

            button.classList.add("selected");

            selectedRiddleChoice = choice;

            document.getElementById(
                "submitRiddleAnswerButton"
            ).disabled = false;

        });

        choicesDiv.appendChild(button);

    });

    document
        .getElementById("riddleModal")
        .classList.remove("hidden");

}

function closeRiddleModal() {

    document
        .getElementById("riddleModal")
        .classList.add("hidden");

}

function submitRiddleAnswer() {
    if (!activeRiddleSquareData || !selectedRiddleChoice) {
        return;
    }

    const transmission = activeRiddleSquareData.transmission;
    const isCorrect = selectedRiddleChoice.isCorrect;

    const clue = isCorrect
        ? transmission.clues.correct
        : transmission.clues.incorrect;

    saveRiddleResult(
        activeRiddleSquareData.id,
        {
            riddleId: activeRiddleSquareData.id,
            riddleNumber: activeRiddleSquareData.unlock.riddle,
            answer: selectedRiddleChoice.text,
            correct: isCorrect,
            clue: clue
        }
    );

    closeRiddleModal();

    setDetectiveStatus(
        isCorrect ? "Full" : "Partial",
        "Decryption"
    );

    renderCaseFileReview();

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

function updateFinalGuessButton() {
    const finalGuessButton = document.getElementById("finalGuessButton");

    if (!finalGuessButton) {
        return;
    }

    const openedTransmissions = loadOpenedTransmissions();

    const allTransmissionsOpened = 
        openedTransmissions.length >= 3;

    // Optional later requirement:
    // const blackoutComplete = 
    // completedSquares.length === card.flat().filter(square => square.kind !== "riddle").length;

    const canCloseInvestigation =
        allTransmissionsOpened;
        // && blackoutComplete;

    if (canCloseInvestigation) {
        finalGuessButton.disabled = false;
    } else {
        finalGuessButton.disabled = true;
    }
}

const FINAL_CASEFILE_URL = "https://forms.gle/78MMwpvgkFumrZSP8";

function openFinalCaseFileModal() {
    document
        .getElementById("FinalCaseFileModal")
        .classList.remove("hidden");
}

function closeFinalCaseFileModal() {
    document
        .getElementById("FinalCaseFileModal")
        .classList.add("hidden");
}

function submitFinalCaseFile() {
    closeFinalCaseFileModal();

    window.open(
        FINAL_CASEFILE_URL,
        "_blank"
    );
}

function updateCaseFileCodePanel() {
    const panel = document.getElementById("caseFileCodePanel");
    const openedTransmissions = loadOpenedTransmissions();

    if (openedTransmissions.length >= 1) {
        panel.classList.remove("hidden");
    } else {
        panel.classList.add("hidden");
    }
}
function saveRiddleResult(riddleId, result) {

    const review = loadRiddleResults();

    review[riddleId] = result;

    localStorage.setItem(
        CASE_FILE_REVIEW_KEY,
        JSON.stringify(review)
    );

    renderCaseFileReview();
}

function loadRiddleResults() {

    const saved = localStorage.getItem(CASE_FILE_REVIEW_KEY);

    if (!saved) {
        return {};
    }

    return JSON.parse(saved);
}

function renderCaseFileReview() {

    const panel = document.getElementById("caseFileReviewPanel");
    const list = document.getElementById("caseFileReviewList");

    const review = loadRiddleResults();

    list.innerHTML = "";

    const entries = Object.values(review);

    if (entries.length === 0) {

        panel.classList.add("hidden");
        return;
    }

    panel.classList.remove("hidden");

    entries.forEach(entry => {

        const card = document.createElement("div");
        card.className = "case-file-entry";

        card.innerHTML = `
            <h3>Transmission #${entry.riddleNumber}</h3>

            <p>
                <strong>Findings Submitted:</strong>
                ${entry.answer}
            </p>

            <p class="case-file-status ${entry.correct ? "correct" : "incorrect"}">
                ${entry.correct ? "🔓 HQ Assessment: FULL DECRYPTION" : "🔒 HQ Assessment: PARTIAL DECRYPTION"}
            </p>

            <div class="case-file-clue">

                <strong>${entry.clue.title}</strong>

                ${entry.clue.body
                    .map(line => `<p>${line}</p>`)
                    .join("")}

            </div>
        `;

        list.appendChild(card);

    });

}





//------------------------------------
// Event Handlers
//------------------------------------
function resetCard() {
    openResetConfirmationModal();
}

function openHowToPlayModal() {

    document
        .getElementById("howToPlayModal")
        .classList.remove("hidden");
}

function closeHowToPlayModal() {

    document
        .getElementById("howToPlayModal")
        .classList.add("hidden");
}

function openHQPromotionModal() {

    document
        .getElementById("HQPromotionModal")
        .classList.remove("hidden");
}

function closeHQPromotionModal() {

    document
        .getElementById("HQPromotionModal")
        .classList.add("hidden");

    setDetectiveStatus("Awaiting", "Next Coordinates...")
}

function continueInvestigation() {
    
    closeHQPromotionModal();

}

function continueInvestigationAgain() {
    
    closeSubmitConfirmationModal();

}

function beginCaseFileSubmission() {

    closeHQPromotionModal();

    openSubmitConfirmationModal();
}

function openSubmitConfirmationModal() {

    document
        .getElementById("SubmitConfirmationModal")
        .classList.remove("hidden");
}

function closeSubmitConfirmationModal() {

    document
        .getElementById("SubmitConfirmationModal")
        .classList.add("hidden");
}

function submitCaseFile() {

    closeSubmitConfirmationModal();

    window.open(
        SUBMIT_CASEFILE_URL,
        "_blank"
    );
}

function openEncryptedTransmissionModal() {
    document
        .getElementById("EncryptedTransmissionModal")
        .classList.remove("hidden");
}

function closeEncryptedTransmissionModal() {
    document
        .getElementById("EncryptedTransmissionModal")
        .classList.add("hidden");
}


function openResetConfirmationModal() {
    document
        .getElementById("ResetConfirmationModal")
        .classList.remove("hidden");
}

function closeResetConfirmationModal() {
    document
        .getElementById("ResetConfirmationModal")
        .classList.add("hidden");
}

function confirmResetCard() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TRANSMISSION_KEY);
    localStorage.removeItem(UNLOCK_ANIMATION_KEY);
    localStorage.removeItem(CASE_FILE_REVIEW_KEY);

    // DEVELOPMENT ONLY
    // Remove before MoonCityCon 2026.
    localStorage.removeItem(HQ_PROMOTION_KEY);

    location.reload();
}

function animateDetectiveUnlock(onComplete) {

    const detective = document.getElementById("detectiveCharacter");

    detective.classList.remove("unlocking");
    void detective.offsetWidth;
    detective.classList.add("unlocking");

    setTimeout(() => {

        detective.classList.remove("unlocking");

        if (onComplete) {
            onComplete();
        }

    }, 1200);
}




//------------------------------------
// Utility Functions
//------------------------------------

function hasSeenHQPromotion() {
    return localStorage.getItem(HQ_PROMOTION_KEY) === "true";
}

function markHQPromotionSeen() {
    localStorage.setItem(HQ_PROMOTION_KEY, "true");
}

function loadShownUnlockAnimations() {
    const shown = localStorage.getItem(UNLOCK_ANIMATION_KEY);

    if (!shown) {
        return [];
    }

    return JSON.parse(shown);
}

function saveShownUnlockAnimations(shownUnlocks) {
    localStorage.setItem(
        UNLOCK_ANIMATION_KEY,
        JSON.stringify(shownUnlocks)
    );
}