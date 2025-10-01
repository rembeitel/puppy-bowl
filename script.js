// Use the API_URL variable to make fetch requests to the API.
// Replace the placeholder with your cohort name (ex: 2109-UNF-HY-WEB-PT)
const cohortName = "2508-FTB-ET-WEB-FT";
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/players`;


//State
let players = [];
let selectedPlayer;

// Components

function PlayerListItem(player){
    const $li = document.createElement("li");
    $li.innerHTML = `
        <a href="#selected">${player.name}</a>
    `;
    $li.addEventListener("click", () => {fetchSinglePlayer(player.id);
        console.log(selectedPlayer);
        renderAllPlayers();
    });
    return $li;
}

function PlayerList (){
    const $ul = document.createElement("ul");
    $ul.classList.add("lineup");

    const $players = players.map(PlayerListItem);
    $ul.replaceChildren(...$players);

    return $ul;
}

/**
 * Fetches all players from the API.
 * @returns {Object[]} the array of player objects
 */
const fetchAllPlayers = async () => {
  try {
    const response = await fetch(API_URL);
    const result = await response.json();
    console.log(result.data);
    players = result.data.players;
   renderAllPlayers()
  } catch (err) {
    console.error("Uh oh, trouble fetching players!", err);
  }
};

/**
 * Fetches a single player from the API.
 * @param {number} playerId
 * @returns {Object} the player object
 */
const fetchSinglePlayer = async (playerId) => {
  try {
    const response = await fetch(API_URL + "/" + playerId);
    const result = await response.json();
    console.log(result.data);
    selectedPlayer = result.data.player;
    console.log(selectedPlayer);
    renderAllPlayers(selectedPlayer.id);
  } catch (err) {
    console.error(`Oh no, trouble fetching player #${playerId}!`, err);
  }
};



/**
 * Adds a new player to the roster via the API.
 * @param {Object} playerObj the player to add
 * @returns {Object} the player returned by the API
 */
const addNewPlayer = async (playerObj) => {
    console.log(playerObj);
  try {
const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(playerObj),
    headers: {"Content-Type": "application/json"},
});
console.log(res);
const json = await res.json();
if (json.success){
    fetchAllPlayers();
}
  } catch (err) {
    console.error("Oops, something went wrong with adding that player!", err);
  }

  return playerObj;
};

/**
 * Removes a player from the roster via the API.
 * @param {number} playerId the ID of the player to remove
 */
const removePlayer = async (playerId) => {
  try {
const res = await fetch(`${API_URL}/${playerId}`, {
    method: "DELETE",
})
console.log(res);
if (res.status === 204) {
    selectedPlayer = null;
    fetchSinglePlayer();
}
} catch (err) {
    console.error(
      `Whoops, trouble removing player #${playerId} from the roster!`,
      err
    );
  }

};

/**
 * Updates `<main>` to display a list of all players.
 *
 * If there are no players, a corresponding message is displayed instead.
 *
 * Each player is displayed in a card with the following information:
 * - name
 * - id
 * - image (with alt text of the player's name)
 *
 * Additionally, each card has two buttons:
 * - "See details" button that, when clicked, calls `renderSinglePlayer` to
 *    display more information about the player
 * - "Remove from roster" button that, when clicked, will call `removePlayer` to
 *    remove that specific player and then re-render all players
 *
 * Note: this function should replace the current contents of `<main>`, not append to it.
 * @param {Object[]} playerList - an array of player objects
 */
const renderAllPlayers = (playerList) => {
const $main = document.querySelector("#main");
$main.innerHTML = `
<h1>Puppy Bowl</h1>
    <main>
      <section>
        <h2>Lineup</h2>
        <PlayerList></PlayerList>
        <h3>Invite a new Player</h3>
        <NewPlayerForm></NewPlayerForm>
      </section>
      <section id="selected">
        <h2>Player Details</h2>
        <PlayerDetails></PlayerDetails>
      </section>
    </main>
`;
$main.querySelector("PlayerList").replaceWith(PlayerList());
$main.querySelector("PlayerDetails").replaceWith(renderSinglePlayer());
$main.querySelector("NewPlayerForm").replaceWith(renderNewPlayerForm());
};



/**
 * Updates `<main>` to display a single player.
 * The player is displayed in a card with the following information:
 * - name
 * - id
 * - breed
 * - image (with alt text of the player's name)
 * - team name, if the player has one, or "Unassigned"
 *
 * The card also contains a "Back to all players" button that, when clicked,
 * will call `renderAllPlayers` to re-render the full list of players.
 * @param {Object} player an object representing a single player
 */
const renderSinglePlayer = () => {
    console.log(selectedPlayer);
    if (!selectedPlayer){
    const $p = document.createElement("p");
    $p.textContent = "Choose your character!";
    return $p;
}
const $player = document.createElement("section");
$player.classList.add("player");
$player.innerHTML = `
<h3>${selectedPlayer.name} #${selectedPlayer.id}</h3>
<figure>
    <img alt="${selectedPlayer.name}" src="${selectedPlayer.imageUrl}"/>
</figure>
<p>${selectedPlayer.breed}</p>
<p>${selectedPlayer.status}</p>
<p>${selectedPlayer.id}</p>


<button>Remove player</button>
`;

 //event listener that removes a player
const $button = $player.querySelector("button");
$button.addEventListener("click", async function (){
   await removePlayer(selectedPlayer.id);
});
return $player;
}

/**
 * Fills in `<form id="new-player-form">` with the appropriate inputs and a submit button.
 * When the form is submitted, it should call `addNewPlayer`, fetch all players,
 * and then render all players to the DOM.
 */
const renderNewPlayerForm = () => {
  try {
const $form = document.createElement("form");
$form.innerHTML = `
<label>
Breed 
<input name="breed" required />
</label>
<label>
Name
<input name="name" required />
</label>
<label>
Description
<input name="description" required />
</label>
<label>
Profile Picture
<input name="imageUrl" required />
</label>
<button>Invite New Player</button>
`;

//event listener to invite new player
$form.addEventListener("submit", function (e){
    e.preventDefault();
    const data = new FormData($form);
    addNewPlayer({
        name: data.get("name"),
        description: data.get("description"),
        imageUrl: data.get("imageUrl"),
        breed: data.get("breed"),
    })
})

return $form

} catch (err) {
    console.error("Uh oh, trouble rendering the new player form!", err);
  }
};

/**
 * Initializes the app by fetching all players and rendering them to the DOM.
 */
const init = async () => {
  const players = await fetchAllPlayers();
  renderAllPlayers(players);

  renderNewPlayerForm();
};

// This script will be run using Node when testing, so here we're doing a quick
// check to see if we're in Node or the browser, and exporting the functions
// we want to test if we're in Node.
if (typeof window === "undefined") {
  module.exports = {
    fetchAllPlayers,
    fetchSinglePlayer,
    addNewPlayer,
    removePlayer,
    renderAllPlayers,
    renderSinglePlayer,
    renderNewPlayerForm,
  };
} else {
  init();
}
