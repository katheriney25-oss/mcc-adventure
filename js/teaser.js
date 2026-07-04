

const targetDate =
new Date("August 14, 2026 08:00:00");

function updateCountdown() {

    const now = new Date();

    const difference = targetDate - now;

    const days =
        Math.floor(difference / (1000*60*60*24));

    const hours =
        Math.floor((difference/(1000*60*60))%24);

    const minutes =
        Math.floor((difference/(1000*60))%60);

    const seconds =
        Math.floor((difference/1000)%60);

    document.getElementById("timer").innerHTML =

        `${days} Days
         ${hours} Hours
         ${minutes} Minutes
         ${seconds} Seconds`;

}

updateCountdown();

setInterval(updateCountdown,1000);