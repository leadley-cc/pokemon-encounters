var randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min
}

var app = function () {
  var baseURL = "https://pokeapi.co/api/v2/"

  var currentPokemon
  var caughtPokemon = JSON.parse(localStorage.getItem("caughtPokemon")) || []

  // Grab DOM Objects we will need
  var container = document.querySelector("div#random-pokemon")
  var nameText = container.querySelector("p#pokemon-name")
  var grassField = container.querySelector("div.grass-field")
  var pokeballImg = container.querySelector("img.pokeball")

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
    if (!pokeballImg.classList.contains("invisible")) {
      pokeballImg.classList.add("invisible")
    }
    grassField.classList.remove("invisible")

    var pokemonImg = document.querySelector("img.pokemon-sprite")
    if (pokemonImg) container.removeChild(pokemonImg)

    var id = randomInt(1, 387)
    var shiny = randomInt(0, 100) >= 90

    var render = function (pokemon) {
      var grassField = container.querySelector("div.grass-field")
      grassField.classList.add("invisible")

      nameText.textContent = pokemon.name.toUpperCase()
      if (pokemon.shiny) nameText.textContent += " (shiny!)"

      var img = getPokemonImg(pokemon)
      container.appendChild(img)
    }

    requestPokemonData(id, shiny, render)
  }

  var catchCurrentPokemon = function () {
    if (!currentPokemon) return
    if (currentPokemon.length >= 6) return

    nameText.textContent = "Caught " + currentPokemon.name.toUpperCase() + "!"

    var pokemonImg = document.querySelector("img.pokemon-sprite")
    if (pokemonImg) container.removeChild(pokemonImg)

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
  }

  var searchButton = document.querySelector("button#search-for-pokemon")
  searchButton.addEventListener("click", displayRandomPokemon)

  var catchButton = document.querySelector("button#throw-pokeball")
  catchButton.addEventListener("click", catchCurrentPokemon)
}

window.addEventListener("DOMContentLoaded", app)
