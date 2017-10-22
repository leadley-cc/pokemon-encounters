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

    var pokemonImg = encounterDiv.querySelector("img.pokemon-sprite")
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

  var StoragePokemon = function (apiPokemon) {
    this.id = apiPokemon.id
    this.name = apiPokemon.name
    this.shiny = apiPokemon.shiny
  }

  var catchCurrentPokemon = function () {
    if (!currentPokemon) return
    if (caughtPokemon.length >= 6) return

    nameText.textContent = "Caught " + currentPokemon.name.toUpperCase() + "!"

    var pokemonImg = encounterDiv.querySelector("img.pokemon-sprite")
    if (pokemonImg) encounterDiv.removeChild(pokemonImg)

    pokeballImg.classList.remove("invisible")

    caughtPokemon.push(new StoragePokemon(currentPokemon))
    localStorage.setItem("caughtPokemon", JSON.stringify(caughtPokemon))
    // console.log("Caught " + currentPokemon.name)
    // console.log(JSON.parse(localStorage.getItem("caughtPokemon")))
    renderPokemonInfo(currentPokemon)
    currentPokemon = null
  }

  var releasePokemon = function (pokemonToRelease) {
    var index = caughtPokemon.findIndex( pokemon =>
      pokemon.id === pokemonToRelease.id && pokemon.shiny === pokemonToRelease.shiny
    )
    if (index !== -1) {
      caughtPokemon.splice(index, 1)
      localStorage.setItem("caughtPokemon", JSON.stringify(caughtPokemon))
    }
    console.log(caughtPokemon)
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

  var createStatsChart = function (pokemon, chartDiv) {
    var stats = {}
    pokemon.stats.forEach(
      statObj => stats[statObj.stat.name] = statObj.base_stat
    )
    console.log(stats)
    new Highcharts.Chart({
      chart: { type: "bar", renderTo: chartDiv, width: 210, height: 230 },
      legend: { enabled: false },
      title: { text: null },
      series: [{
        name: pokemon.name.toUpperCase(),
        color: "tomato",
        data: [
          stats["hp"], stats["attack"], stats["defense"], stats["special-attack"], stats["special-defense"], stats["speed"]
        ]
      }],
      xAxis: {
        categories: [
          "HP", "Attack", "Defense", "Special Attack", "Special Defense", "Speed"
        ]
      },
      yAxis: { title: { text: null }, max: 150, tickAmount: 4 }
    })
  }

  var getPokemonInfoPara = function (pokemon) {
    var typeInfo = () => {
      if (pokemon.types.length == 2) {
        return pokemon.types[1].type.name + "/" + pokemon.types[0].type.name
      } else {
        return pokemon.types[0].type.name
      }
    }

    var infoPara = document.createElement("p")
    infoPara.innerHTML =
      "<h3>" + pokemon.name.toUpperCase() + "</h3>\n" +
      typeInfo().toUpperCase()
    return infoPara
  }

  var renderPokemonInfo = function (pokemon) {
    var pkmnInfoDiv = document.createElement("div")
    pkmnInfoDiv.classList.add("party-pokemon-info")
    var pokemonImg = getPokemonImg(pokemon)
    pkmnInfoDiv.appendChild(pokemonImg)

    var infoPara = getPokemonInfoPara(pokemon)
    pkmnInfoDiv.appendChild(infoPara)

    var chartDiv = document.createElement("div")
    createStatsChart(pokemon, chartDiv)
    pkmnInfoDiv.appendChild(chartDiv)

    var releaseButton = document.createElement("button")
    releaseButton.textContent = "Release " + pokemon.name.toUpperCase()
    releaseButton.addEventListener("click", () => {
      pkmnInfoDiv.classList.add("invisible")
      releasePokemon(pokemon)
    })
    pkmnInfoDiv.appendChild(releaseButton)

    partyDiv.appendChild(pkmnInfoDiv)
  }

  var populatePartyView = function () {
    caughtPokemon.forEach((savedPkmn) => {
      requestPokemonData(savedPkmn.id, savedPkmn.shiny, renderPokemonInfo)
    })
  }

  var searchButton = document.querySelector("button#search-for-pokemon")
  searchButton.addEventListener("click", displayRandomPokemon)

  var catchButton = document.querySelector("button#throw-pokeball")
  catchButton.addEventListener("click", catchCurrentPokemon)

  var viewPartyButton = document.querySelector("button#view-party")
  viewPartyButton.addEventListener("click", toggleDisplayParty)

  populatePartyView()
}

window.addEventListener("DOMContentLoaded", app)
