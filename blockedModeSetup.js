const ENTER_KEY_CODE = 13;

document.addEventListener('DOMContentLoaded', function() {
    let textField = document.getElementById('duration');
    textField.focus();
    textField.select();

    document.getElementById('duration').addEventListener('keyup', function(event) {
        event.preventDefault();
        if (event.keyCode == ENTER_KEY_CODE) {
            setTimer();
        }
    });
    let startButton = document.getElementById('start');
    startButton.addEventListener('click', function() {
        setTimer();
    });

    timer();
});

function setTimer() {
    let currentDateMilliseconds = Date.now();
    let durationMilliseconds =
        document.getElementById('duration').value * 60 * 1000;
    let blockUntil = currentDateMilliseconds + durationMilliseconds;
    let timerData = {
        isTimerEnabled: true,
        blockUntilMilliseconds: blockUntil
    };
    chrome.storage.sync.set({
        'timerData': timerData
    }, function() {
        console.log('Time set to ' + blockUntil);
        timer();
        return;
    });
    chrome.storage.sync.set({
        'isEnabled': true
    }, function() {
        chrome.browserAction.setIcon({
            path: 'on.png'
        });
        console.log('Set to enabled');
    });
}

function timer() {
    chrome.storage.sync.get('timerData', function(data) {
        if (data.timerData.isTimerEnabled == true) {
            var timerInterval = setInterval(function() {
                var now = new Date().getTime();
                var timeLeft = data.timerData.blockUntilMilliseconds - now;
                var days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                var hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                document.getElementById("timer").innerHTML = days + "d " + hours + "h " +
                    minutes + "m " + seconds + "s left";
                if (timeLeft < 0) {
                    clearInterval(timerInterval);
                    document.getElementById("timer").innerHTML = "UNBLOCKED!";
                }
            }, 1000);
        }
    });
}