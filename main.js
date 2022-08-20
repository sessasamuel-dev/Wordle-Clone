// selecting required elements
const guessGrid = document.querySelector("[data-guess-grid]"); 
const alertContainer = document.querySelector("[data-alert-container]")
const keyboard = document.querySelector("[data-keyboard]");

// global variables for clean coding
const WORD_LENGTH = 5; 
const FLIP_ANIMATION_DURATION = 500;
const WIN_ANIMATION_DURATION = 500;

// every day there will be a new wordle 
const offsetDate = new Date(2022, 0, 1); // first day of the year 
const msOffset = Date.now() - offsetDate; // miliseconds between current date and offsetDate
const dayOffset = msOffset / 1000 / 60 / 60 / 24; // miliseconds converting to day

// getting wordle of the day from targetWords
const targetWord = targetWords[Math.floor(dayOffset)];

// starting game
startInteraction();

// this function contains event listeners
function startInteraction() {
    // mouse and key events
    document.addEventListener("click", clickEvents);
    document.addEventListener("keydown", keyEvents);
}

// when there is a animation, stops the other events
function stopInteraction() {

    document.removeEventListener("click", clickEvents);
    document.removeEventListener("keydown", keyEvents);
}

// all click events 
function clickEvents(e) {
    
    if (e.target.matches("[data-key]")) {
        pressKey(e.target.dataset.key);
        return;
    }
    else if(e.target.matches("[data-delete]")) {
        console.log("tıklanan:", e.target)
        deleteKey();
        return;
    }
    else if(e.target.matches("[data-enter]")){
        submitGuess();
        return;
    }
    
}

// all keyboard events
function keyEvents(e) {

    if (e.key == 'Enter') {
        submitGuess();
        return;
    }
    
    else if(e.key == 'Backspace') {       
        deleteKey();
        return;
    }

    else if(e.key.match(/^[a-z]$/)) {      
        pressKey(e.key)
        return;
    }
}

// this function will be triggered if we click on a letter or press a letter
function pressKey(key) {
    // check active elements are greater than 5
    let activeTiles = getActiveTiles();
    if(activeTiles.length >= WORD_LENGTH) return;

    // selecting the first tile hasnt a data letter
    let nextTile = guessGrid.querySelector(":not([data-letter])");
    nextTile.dataset.letter = key.toLowerCase();
    nextTile.textContent = key;
    nextTile.dataset.state = "active";
}
// this function will be triggered if user press backspace
function deleteKey() {
    const activeTiles = getActiveTiles();
    // find the last tile
    let lastTile = activeTiles[activeTiles.length - 1];
    if(lastTile === null) return;
    else {
        lastTile.textContent = "";
        // delete active state
        delete lastTile.dataset.state;
        // delete letter from tile
        delete lastTile.dataset.letter;
    }
}

// this function will be triggered if user press enter
function submitGuess() {
    // getting active tiles as an array 
    const activeTiles = [...getActiveTiles()];

    // if user press enter before filling all tiles
    if(activeTiles.length !== WORD_LENGTH) {
        showAlert("Not enough letters");
        shakeTiles(activeTiles);
        return;
    }

    // if all tiles are full, getting guess as a string
    const guess = activeTiles.reduce((word,tile) => {
        return word + tile.dataset.letter;
    }, "")
    
    if(!dictionary.includes(guess)) {
        showAlert("Not in word list");
        shakeTiles(activeTiles);
        return;
    }

    stopInteraction();

    activeTiles.forEach((...params) => {
        flipTiles(...params, guess);
    })
}

// this function returns current active tiles 
function getActiveTiles() {
    // getting active elements for check
    return guessGrid.querySelectorAll('[data-state="active"]');
}

// showing alerts
function showAlert(message, duration = 1000) {
    const alert = document.createElement("div");
    alert.textContent = message;
    alert.classList.add("alert");
    alertContainer.prepend(alert);

    if(duration === null) return;

    setTimeout(() => {
        alert.classList.add("hide");
        alert.addEventListener("transitionend", () => {
            alert.remove()
          })
    },duration)
}

// if user doesnt fill all tiles or inputs a invalid word, this function will trigger shake animation
function shakeTiles(tiles) {
    tiles.forEach(tile=> {
        tile.classList.add("shake");
        tile.addEventListener("animationend", () => {
            tile.classList.remove("shake");
        }, {once:true})
    })
}

// if user filles 5 tiles and press enter, this function will trigger the flip animation
function flipTiles(tile, index, array, guess) {
    const letter = tile.dataset.letter
    const key = keyboard.querySelector(`[data-key="${letter}"i]`)
    setTimeout(() => {
      tile.classList.add("flip")
    }, (index * FLIP_ANIMATION_DURATION) / 2)
  
    tile.addEventListener(
      "transitionend",
      () => {
        tile.classList.remove("flip")
        if (targetWord[index] === letter) {
          tile.dataset.state = "correct"
          key.classList.add("correct")
        } else if (targetWord.includes(letter)) {
          tile.dataset.state = "wrong-location"
          key.classList.add("wrong-location")
        } else {
          tile.dataset.state = "wrong"
          key.classList.add("wrong")
        }

        // checking for is user at last tile
        if (index === array.length - 1) {
          tile.addEventListener(
            "transitionend",
            () => {
              startInteraction()
              checkWinLose(guess, array)
            },
            { once: true }
          )
        }
      },
      { once: true }
    )
  }


function checkWinLose(guess, tiles) {
    // winning
    if(guess === targetWord) {
        showAlert("You Win!");
        winTiles(tiles);
        stopInteraction();
        return;
    }
    // losing
    const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])")
    if (remainingTiles.length === 0) {
    showAlert(targetWord.toUpperCase(), null)
    stopInteraction()
  }
}

function winTiles(tiles) {
    tiles.forEach((tile, index) => {
      setTimeout(() => {
        tile.classList.add("win")
        tile.addEventListener(
          "animationend",
          () => {
            tile.classList.remove("win")
          },
          { once: true }
        )
      }, (index * WIN_ANIMATION_DURATION) / 5)
    })
  }
