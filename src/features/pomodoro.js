let pomodoroInterval = null;
let pomodoroSecondsRemaining = 25 * 60;
let isPomodoroRunning = false;

export function initPomodoro() {
  const pomodoroModal = document.getElementById("pomodoro-modal");
  const pomodoroTimerDisplay = document.getElementById("pomodoro-timer");
  const pomodoroStartPause = document.getElementById("pomodoro-start-pause");
  const pomodoroStop = document.getElementById("pomodoro-stop");
  const pomodoroSoundSelect = document.getElementById("pomodoro-sound");
  const pomodoroVolumeSlider = document.getElementById("pomodoro-volume");

  // Inisialisasi Audio Player
  const audioPlayer = new Audio();

  // Pengaturan Event Listener untuk Audio
  if (pomodoroSoundSelect && pomodoroVolumeSlider) {
    audioPlayer.volume = pomodoroVolumeSlider.value;

    pomodoroSoundSelect.addEventListener("change", function () {
      const selectedSound = this.value;

      if (selectedSound === "none") {
        audioPlayer.pause();
      } else {
        audioPlayer.src = selectedSound;
        audioPlayer.play();
        audioPlayer.loop = true;
      }
    });

    pomodoroVolumeSlider.addEventListener("input", function () {
      audioPlayer.volume = this.value;
    });
  }

  // Fungsi Update Angka Timer
  function updateTimer() {
    const m = Math.floor(pomodoroSecondsRemaining / 60)
      .toString()
      .padStart(2, "0");
    const s = (pomodoroSecondsRemaining % 60).toString().padStart(2, "0");
    pomodoroTimerDisplay.textContent = `${m}:${s}`;
  }

  // Logika Tombol Mulai / Pause
  pomodoroStartPause.addEventListener("click", () => {
    if (isPomodoroRunning) {
      clearInterval(pomodoroInterval);
      isPomodoroRunning = false;
      pomodoroStartPause.textContent = "Lanjut";
    } else {
      isPomodoroRunning = true;
      pomodoroStartPause.textContent = "Pause";
      
      pomodoroInterval = setInterval(() => {
        pomodoroSecondsRemaining--;
        updateTimer();
        
        if (pomodoroSecondsRemaining <= 0) {
          clearInterval(pomodoroInterval);
          isPomodoroRunning = false;
          // Timer selesai
        }
      }, 1000);
    }
  });

  // Logika Tombol Stop
  pomodoroStop.addEventListener("click", () => {
    clearInterval(pomodoroInterval);
    isPomodoroRunning = false;
    
    // Stop dan Reset Timer
    audioPlayer.pause();
    audioPlayer.currentTime = 0; 
    
    // Mute
    if (pomodoroSoundSelect) {
      pomodoroSoundSelect.value = "none";
    }
    
    pomodoroModal.classList.add("hidden");
  });

  // Fungsi Modal Focus Mode
  window.appStartFocusMode = function (name) {
    const pomodoroTaskName = document.getElementById("pomodoro-task-name");
    if (pomodoroTaskName) {
      pomodoroTaskName.textContent = name;
    }
    
    pomodoroModal.classList.remove("hidden");
    isPomodoroRunning = false;
    pomodoroSecondsRemaining = 25 * 60;
    updateTimer();
    pomodoroStartPause.textContent = "Mulai";
  };
}