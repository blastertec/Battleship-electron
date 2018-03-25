function parseGuess(guess) {
	var alphabetCaps = ["A", "B", "C", "D", "E", "F", "G"];
	var alphabet = ["a", "b", "c", "d", "e", "f", "g"];

	if (guess === null || guess.length !== 2) {
		alert("Wrong input! Please, enter a letter and a number on the board.")
	} else {
		var firstChar = guess.charAt(0);
		var row = alphabetCaps.indexOf(firstChar);
		if (row == -1) {
			var row = alphabet.indexOf(firstChar);
		}
		var column = guess.charAt(1);

		if (isNaN(row) || isNaN(column)) {
			alert("That isn't on the board.");
		} else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
			alert("That's off the board.");
		} else {
			return row + column;
		}
	}
	return null;
}

function init() {
	view.displayMessage("You have to destroy " + model.numShips + " ships. Each ship has " + model.shipLength + " decks.");

	var fireButton = document.getElementById("fireButton");
	fireButton.onclick = handleFireButton;

	var guessInput = document.getElementById("guessInput");
	guessInput.onkeypress = handleKeyPress;

	model.generateShipLocations();
}

function handleKeyPress(enterKey) {
	var fireButton = document.getElementById("fireButton");
	if (enterKey.keyCode === 13) {
		fireButton.click();
		return false;
	}
}

function handleFireButton() {
	var guessInput = document.getElementById("guessInput");
	var guess = guessInput.value;
	controller.processGuess(guess);

	guessInput.value = "";
}


window.onload = init;

// =========== MODEL ===========
var model = {
	boardSize: 7,
	numShips: 3,
	shipsSunk: 0,
	shipLength: 3,
	ships: [{ locations: ["0", "0", "0"], hits: ["", "", ""] },
			{ locations: ["0", "0", "0"], hits: ["", "", ""] },
			{ locations: ["0", "0", "0"], hits: ["", "", ""] }],

	isSunk: function(ship) {
		for (var i = 0; i < this.shipLength; i++) {
			if (ship.hits[i] !== "hit") {
				return false;
			}
		}
		return true;
	},		

	checkMiss: function(guess) {
		var cell = document.getElementById(guess);
		if (cell.classList.contains('miss')) {
			return true;
		}
	},

	fire: function(guess) {

				for (var i = 0; i < this.numShips; i++) {
					var ship = this.ships[i];
					var index = ship.locations.indexOf(guess);
					if (ship.hits[index] === "hit"){
						 	view.displayMessage("You already fired at that location.");
							return true;
					} else if (index >= 0) {

							ship.hits[index] = "hit";
							view.displayHit(guess);
							view.displayMessage("Direct hit!");
							if (this.isSunk(ship)) {
								view.displayMessage("Battleship destroyed!");
								this.shipsSunk++;
							
						}
						return true;
					}
				}
				view.displayMiss(guess);
				view.displayMessage("You missed.");
				return false;
	},


	generateShipLocations: function() {
		var locations;
		for (var i = 0; i < this.numShips; i++) {
			do {
				locations = this.generateShip();
			} while (this.collision(locations));
			this.ships[i].locations = locations;
		}
	},

	generateShip: function() {
		var direction = Math.floor(Math.random() * 2);
		var row, col;

		if (direction === 1) {
			row = Math.floor(Math.random() * this.boardSize);
			col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
		} else {
			row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
			col = Math.floor(Math.random() * this.boardSize);
		}

		var newShipLocations = [];
		for (var i = 0; i <this.shipLength; i++) {
			if (direction === 1) {
				newShipLocations.push(row + "" + (col + i));
			} else {
				newShipLocations.push((row + i) + "" + col);
			}
		}
		return newShipLocations;
	},

	collision: function(locations) {
		for (var i = 0; i < this.numShips; i++) {
			var ship = model.ships[i];
			for (j = 0; j < locations.length; j++) {
				if (ship.locations.indexOf(locations[j]) >= 0) {
					return true;
				}
			}
		}
		return false;
	},

	checkGameEnd: function() {
		if (this.shipsSunk == this.numShips) {
			return true;
		} else {
			return false;
		}

	}
};

// =========== VIEW ===========
var view = {
	displayMessage: function(msg) {
		var messageArea = document.getElementById("messageArea");
		messageArea.innerHTML = msg;
	},
	displayHit: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "hit");
	},

	displayMiss: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "miss");
	}
};

// =========== CONTROLLER ===========
var controller = {
	guesses: 0,
	processGuess: function(guess) {
		if (model.checkGameEnd()) {
			view.displayMessage("You won, game is over. All battleships destroyed in " + controller.guesses + " guesses.");
		} else {
			var location = parseGuess(guess);
			if (location) {
				
				if (model.checkMiss(location)) {
				view.displayMessage("You already fired there and missed.");
				} else {

					this.guesses++;
					console.log(model.shipsSunk);
					var hit = model.fire(location);
					if (hit && model.shipsSunk === model.numShips) {
						view.displayMessage("You won. All battleships destroyed in " + controller.guesses + " guesses.");
					}
				}
			}
		}
	},

	processClick: function(guess) {
		if (model.checkGameEnd()) {
			view.displayMessage("You won. All battleships destroyed in " + controller.guesses + " guesses.");
		} else {

			if (model.checkMiss(guess)) {
				view.displayMessage("You already fired there and missed.");
			} else {
				this.guesses++;
				console.log(model.shipsSunk);
				var hit = model.fire(guess);
				if (hit && model.shipsSunk === model.numShips) {
					view.displayMessage("You won. All battleships destroyed in " + controller.guesses + " guesses.");
				}
			}
		}
	}
};