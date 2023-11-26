const endPointRoot = "https://jdefazmxvy.us18.qoddiapp.com";
let savedStory = "";

let userData = "";

getUsersInfo()
  .then(async (data) => {
    if (data.statusCode == 401) {
      window.location.href = "index.html";
    }

    userData = data;

    if (data.role === "ADMIN") {
      document.getElementById("main-content-admin").style.display =
        "inline-block";
      const usersCount = await getUsersCount();
      showUserData(usersCount);
      showEndpointData();
    } else {
      document.getElementById("main-content-user").style.display =
        "inline-block";
    }
  })
  .catch((error) => console.error("Error checking user role:", error));

function logout() {
  const xhttp = new XMLHttpRequest();
  const stringEndPoint = "/api/v1/auth/logout";

  xhttp.open("GET", endPointRoot + stringEndPoint, true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.withCredentials = true;
  xhttp.send();

  xhttp.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        const jsonData = JSON.parse(this.response);
        console.log(jsonData);

        // Redirect to landing.html after successful logout
        window.location.href = "index.html";
      }
    }
  };
}

async function generateStory() {
  const feedback = document.getElementById("feedback");
  const overusage = await checkOverusage();

  if (overusage == true) {
    feedback.innerHTML =
      "You have maxed out your usage. lease me caution with your usage.";
  }

  const TEXTAREA_STORY = document.getElementById("textarea_story");
  const SELECT_GENRE = document.getElementById("select_genre");
  const BUTTON_GENERATE_STORY = document.getElementById(
    "button_generate_story"
  );
  const BUTTON_SAVE_STORY = document.getElementById("button_save_story");
  const generatedTextElement = document.getElementById("generatedText");
  const SELECT_GENRE_TEXT = document.getElementById("select_genre_text");
  const INPUT_TITLE = document.getElementById("input_title");
  const INPUT_TITLE_TEXT = document.getElementById("input_title_text");

  const xhttp = new XMLHttpRequest();
  const endPoint = "/api/v1/story/generateStory";
  // references to the story and genre
  // const TEXTAREA_STORY = document.getElementById("textarea_story");
  // const SELECT_GENRE = document.getElementById("select_genre");
  const DIV_RADIO_BUTTONS = document.getElementById("radio_button_scenarios");
  const DIV_GENERATING = document.getElementById("div_generating");

  const scenariosElement = document.getElementById("scenarios");

  // Get values
  const current_story = TEXTAREA_STORY.value;
  const current_genre = SELECT_GENRE.value;

  // Disable button to prevent spamming
  BUTTON_GENERATE_STORY.disabled = true;
  // Show api call indicator;
  DIV_GENERATING.style.display = "block";

  // User has not given any input
  if (current_story.length < 1) {
    alert("Enter some input.");
    BUTTON_GENERATE_STORY.disabled = false;
    DIV_GENERATING.style.display = "none";
  } else {
    // Set the data for the post request
    const data = {
      sentence: current_story,
      genre: current_genre,
    };

    xhttp.open("POST", endPointRoot + endPoint, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.withCredentials = true;

    console.log("Data: ", data);
    xhttp.send(JSON.stringify(data));

    xhttp.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 201) {
          const jsonData = JSON.parse(this.response);
          console.log("Return data: ", jsonData);

          const updated_story = jsonData[0].generated_text;
          const scenarios = jsonData[1];

          // Set text area with updated story
          TEXTAREA_STORY.value = updated_story;

          // Clear the generated scenarios.
          scenariosElement.innerHTML = "";
          DIV_RADIO_BUTTONS.innerHTML = "";
          // Display all scenarios
          Object.keys(scenarios).forEach((scenarioKey) => {
            scenariosElement.innerText += `${scenarioKey}: ${scenarios[scenarioKey]}\n`;
          });

          createScenarioRadioButtons(scenarios, updated_story, TEXTAREA_STORY);

          BUTTON_GENERATE_STORY.disabled = false;
          DIV_GENERATING.style.display = "none";
        } else {
          BUTTON_GENERATE_STORY.disabled = false;
          DIV_GENERATING.style.display = "none";
        }
      }
    };
  }
}

function createScenarioRadioButtons(
  scenarios,
  current_story,
  textarea_element
) {
  const DIV_RADIO_BUTTONS = document.getElementById("radio_button_scenarios");

  Object.keys(scenarios).forEach(function (scenarioKey) {
    const radioBtn = document.createElement("input");
    radioBtn.type = "radio";
    radioBtn.name = "scenario";
    radioBtn.value = scenarioKey;
    radioBtn.id = scenarioKey;

    radioBtn.addEventListener("change", function () {
      appendScenario(scenarioKey, current_story);
    });

    const label = document.createElement("label");
    label.htmlFor = scenarioKey;
    label.textContent = "Scenario " + scenarioKey.slice(-1);

    DIV_RADIO_BUTTONS.appendChild(radioBtn);
    DIV_RADIO_BUTTONS.appendChild(label);
    DIV_RADIO_BUTTONS.appendChild(document.createElement("br"));
  });

  function appendScenario(selectedScenarioKey, current_story) {
    const selectedScenario = scenarios[selectedScenarioKey];
    textarea_element.value = current_story + ". " + selectedScenario;
  }
}

function getUsersInfo() {
  return fetch(endPointRoot + "/api/v1/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((jsonData) => jsonData)
    .catch((error) => {
      console.error("Error checking user role:", error);
      return jsonData;
    });
}

function saveStory() {
  // const feedback = document.getElementById("feedback")
  // const generatedText = document.getElementById("generatedText").innerText;
  const TEXTAREA_STORY = document.getElementById("textarea_story");
  const SELECT_GENRE = document.getElementById("select_genre");
  const INPUT_TITLE = document.getElementById("input_title");

  const savedStory = TEXTAREA_STORY.value;
  const savedGenre = SELECT_GENRE.value;
  const savedTitle = INPUT_TITLE.value;

  const xhttp = new XMLHttpRequest();
  const endPoint = "/api/v1/story/savestory";
  xhttp.open("POST", endPointRoot + endPoint, true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.withCredentials = true;

  const savedData = {
    title: savedTitle,
    story: savedStory,
    genre: savedGenre,
    username: userData.username,
  };
  console.log(savedData);

  xhttp.send(JSON.stringify(savedData));

  xhttp.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 201) {
        const jsonData = JSON.parse(this.response);
        feedback.innerText = `Saved!\n
      ID: ${jsonData.id}\n
      Title: ${jsonData.title}\n
      Genre: ${jsonData.genre}\n
      Story: ${jsonData.story}\n 
      Saved at: ${jsonData.updatetime}`;
      }
    }
  };
}

function getUsersCount() {
  const endPoint = "/api/v1/user/allusertotalrequest";

  return fetch(endPointRoot + endPoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((jsonData) => {
      // console.log(jsonData)

      return jsonData;
    });
}

function toggleAdminInfo() {
  const userTable = document.getElementById("userTable");
  const endpointTable = document.getElementById("endpointTable");
  const button = document.getElementById("button_info");

  if (endpointTable.style.display == "none") {
    userTable.style.display = "none";
    endpointTable.style.display = "inline-block";
    button.textContent = "Endpoint's Information";
  } else {
    userTable.style.display = "inline-block";
    endpointTable.style.display = "none";
    button.textContent = "User's Information";
  }
}

function showEndpointData() {
  // const userTable = document.getElementById("userTable");
  const table = document.getElementById("endpointTable");

  // userTable.style.display = "none";
  // table.style.display = "inline-block"
  fetch(endPointRoot + "/api/v1/endpoint/info", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((jsonData) => {
      table.innerHTML =
        "<tr><th>ID</th><th>Method</th><th>Name</th><th>Count</th></tr>";

      jsonData.forEach((info) => {
        const row = table.insertRow();
        row.insertCell(0).innerText = info.id;
        row.insertCell(1).innerText = info.method;
        row.insertCell(2).innerText = info.name;
        row.insertCell(3).innerText = info.count;
      });
    })
    .catch((error) => console.error("Error fetching endpoint data:", error));
}

// Function to handle role selection
function handleRoleSelection(userName, currentRole) {
  const xhttp = new XMLHttpRequest();

  const dataRole = {
    username: userName,
    role: currentRole,
  };

  console.log(dataRole);

  const endPoint = "/api/v1/user/changerole";

  xhttp.open("PATCH", endPointRoot + endPoint, true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.withCredentials = true;

  xhttp.send(JSON.stringify(dataRole));

  xhttp.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        console.log("Updated!");
      }
    }
  };
}

// Function to update the role in the table
function updateRoleInTable(userId, newRole) {
  const roleCell = document.getElementById(`role-${userId}`);
  if (roleCell) {
    roleCell.innerText = newRole;
  }
}

function checkOverusage() {
  const endPoint = "/api/v1/user/overusage";

  return fetch(endPointRoot + endPoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((jsonData) => {
      return jsonData.overUsage;
    });
}

function showUserData(usersCount) {
  const table = document.getElementById("userTable");

  const endPoint = "/api/v1/user/getallusers";

  fetch(endPointRoot + endPoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((jsonData) => {
      table.innerHTML =
        "<tr><th>ID</th><th>Email</th><th>Firstname</th><th>Username</th><th>Role</th><th>API Count</th></tr>";

      jsonData.data.forEach((user) => {
        const row = table.insertRow();
        row.insertCell(0).innerText = user.id;
        row.insertCell(1).innerText = user.email;
        row.insertCell(2).innerText = user.firstname;
        row.insertCell(3).innerText = user.username;

        // Create a dropdown list for the "Role" column
        const roleCell = row.insertCell(4);
        const roleSelect = document.createElement("select");
        roleSelect.id = `role-${user.username}`;

        const options = ["USER", "ADMIN"];
        options.forEach((option) => {
          const optionElement = document.createElement("option");
          optionElement.value = option;
          optionElement.text = option;
          roleSelect.add(optionElement);
        });

        // Set the initial selected value
        roleSelect.value = user.role;

        // Add change event to handle role selection
        roleSelect.addEventListener("change", function () {
          const previousRole = user.role;
          const newRole = roleSelect.value;

          const isConfirmed = confirm(
            `Change role of ${user.username} to ${newRole}?`
          );

          if (isConfirmed) {
            handleRoleSelection(user.username, newRole);
          } else {
            roleSelect.value = previousRole;
          }
        });

        // Append the dropdown list to the cell
        roleCell.appendChild(roleSelect);

        const matchingUserCount = usersCount.find(
          (countData) => countData.username === user.username
        );
        row.insertCell(5).innerText = matchingUserCount
          ? matchingUserCount.count
          : 0;
      });
    })
    .catch((error) => console.error("Error fetching user data:", error));
}
