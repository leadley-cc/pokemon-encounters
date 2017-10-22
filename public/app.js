var randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min
}

var app = function () {
  var baseURL = "https://pokeapi.co/api/v2/"

  var currentPokemon
  var caughtPokemon = JSON.parse(localStorage.getItem("caughtPokemon")) || []

  // Grab DOM Objects we will need
  var encounterDiv = document.querySelector("div#random-pokemon")
  var nameText = encounterDiv.querySelector("p#pokemon-name")
  var grassField = encounterDiv.querySelector("div.grass-field")
  var pokeballImg = encounterDiv.querySelector("img.pokeball")
  var partyDiv = document.querySelector("div#party-view")

  var inPartyView = false

  var requestPokemonData = function (id, shiny, callback) {
    var url = baseURL + "pokemon/" + id + "/"
    var request = new XMLHttpRequest()
    request.open("GET", url)
    request.addEventListener("load", function () {
      currentPokemon = JSON.parse(this.responseText)
      currentPokemon.shiny = shiny
      callback(currentPokemon)
    })
    request.send()
  }

  var getPokemonImg = function (pokemon) {
    var imgURL = pokemon.sprites.front_default
    if (pokemon.shiny) imgURL = pokemon.sprites.front_shiny

    var img = document.createElement("img")
    img.classList.add("pokemon-sprite")
    img.src = imgURL
    return img
  }

  var displayRandomPokemon = function () {
    nameText.textContent = "Searching for Pokémon..."
    pokeballImg.classList.add("invisible")
    grassField.classList.remove("invisible")

    var pokemonImg = document.querySelector("img.pokemon-sprite")
    if (pokemonImg) encounterDiv.removeChild(pokemonImg)

    var id = randomInt(1, 387)
    var shiny = randomInt(0, 100) >= 90

    var render = function (pokemon) {
      var grassField = encounterDiv.querySelector("div.grass-field")
      grassField.classList.add("invisible")

      nameText.textContent = "A wild "+ pokemon.name.toUpperCase() +" appeared!"
      if (pokemon.shiny) nameText.textContent += " (shiny!)"

      var img = getPokemonImg(pokemon)
      encounterDiv.appendChild(img)
    }

    requestPokemonData(id, shiny, render)
  }

  var catchCurrentPokemon = function () {
    if (!currentPokemon) return
    if (caughtPokemon.length >= 6) return

    nameText.textContent = "Caught " + currentPokemon.name.toUpperCase() + "!"

    var pokemonImg = document.querySelector("img.pokemon-sprite")
    if (pokemonImg) encounterDiv.removeChild(pokemonImg)

    pokeballImg.classList.remove("invisible")

    var pokemonToStore = {
      id: currentPokemon.id,
      name: currentPokemon.name,
      shiny: currentPokemon.shiny
    }
    caughtPokemon.push(pokemonToStore)
    localStorage.setItem("caughtPokemon", JSON.stringify(caughtPokemon))
    console.log("Caught " + currentPokemon.name)
    console.log(JSON.parse(localStorage.getItem("caughtPokemon")))
    currentPokemon = null
  }

  var toggleDisplayParty = function () {
    if (inPartyView) {
      inPartyView = false
      partyDiv.classList.add("invisible")
      encounterDiv.classList.remove("invisible")
    } else {
      inPartyView = true
      encounterDiv.classList.add("invisible")
      partyDiv.classList.remove("invisible")
    }
  }

  var populatePartyView = function () {
    var renderPokemonInfo = function (pokemon) {
      var pkmnInfoDiv = document.createElement("div")
      pkmnInfoDiv.classList.add("party-pokemon-info")
      var pokemonImg = getPokemonImg(pokemon)
      pkmnInfoDiv.appendChild(pokemonImg)
      partyDiv.appendChild(pkmnInfoDiv)
    }

    caughtPokemon.forEach(function (savedPkmn) {
      requestPokemonData(savedPkmn.id, savedPkmn.shiny, renderPokemonInfo)
    })
  }

  var searchButton = document.querySelector("button#search-for-pokemon")
  searchButton.addEventListener("click", displayRandomPokemon)

  var catchButton = document.querySelector("button#throw-pokeball")
  catchButton.addEventListener("click", catchCurrentPokemon)

  populatePartyView()

  var viewPartyButton = document.querySelector("button#view-party")
  viewPartyButton.addEventListener("click", toggleDisplayParty)
}

window.addEventListener("DOMContentLoaded", app)
