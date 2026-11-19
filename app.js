// app.js
// The Gym Log. It uses the helper functions from lib.js.
//
// A workout is saved like this:
// { id, exercise, group, weight, sets, reps, date, done }
// "done" is true for a workout you already did, and false for a planned one.

// All workouts live in this list. We load it from the browser when the page opens.
let workouts = loadData("gym-workouts");

// Elements we use more than once
const form = document.getElementById("workout-form");
const list = document.getElementById("workout-list");
const dateInput = document.getElementById("date");
const doneCount = document.getElementById("done-count");
const weekCount = document.getElementById("week-count");
const plannedCount = document.getElementById("planned-count");
const emptyMessage = document.getElementById("empty-message");

// Small icons (SVG drawings) for the buttons
const checkIcon = "<svg class='icon' viewBox='0 0 24 24'><path d='M20 6 9 17l-5-5'/></svg>";
const undoIcon = "<svg class='icon' viewBox='0 0 24 24'><path d='M3 7v6h6'/><path d='M21 17a9 9 0 0 0-15-6.7L3 13'/></svg>";
const trashIcon = "<svg class='icon' viewBox='0 0 24 24'><path d='M3 6h18'/><path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6'/><path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/></svg>";

// ----- Status of a workout -----
// Done: you did it.
// Planned: not done yet, and the date is today or later.
// Missed: not done, and the date has already passed.

function getStatus(workout) {
  if (workout.done) {
    return "Done";
  }
  if (isBeforeToday(workout.date)) {
    return "Missed";
  }
  return "Planned";
}

// ----- Showing the workouts -----

function showWorkouts() {
  // Put the latest date first (planned workouts in the future are on top)
  workouts.sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });

  let rows = "";
  for (const workout of workouts) {
    // A weight of 0 means the exercise uses only your body
    let weightText = workout.weight + " kg";
    if (workout.weight === 0) {
      weightText = "Bodyweight";
    }

    const status = getStatus(workout);
    let statusClass = "";
    if (status === "Missed") {
      statusClass = "red";
    }

    let doneButton = checkIcon + " Done";
    if (workout.done) {
      doneButton = undoIcon + " Undo";
    }

    rows += "<tr>";
    rows += "<td>" + safeText(workout.exercise) + "</td>";
    rows += "<td>" + workout.group + "</td>";
    rows += "<td>" + weightText + "</td>";
    rows += "<td>" + workout.sets + " x " + workout.reps + "</td>";
    rows += "<td>" + formatDate(workout.date) + "</td>";
    rows += "<td class='" + statusClass + "'>" + status + "</td>";
    rows += "<td>";
    rows += "<button class='button button-small' data-action='done' data-id='" + workout.id + "'>" + doneButton + "</button> ";
    rows += "<button class='button button-small' data-action='delete' data-id='" + workout.id + "'>" + trashIcon + " Delete</button>";
    rows += "</td>";
    rows += "</tr>";
  }
  list.innerHTML = rows;

  // Message when there are no workouts
  if (workouts.length === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");
  }

  // The three numbers at the top
  let done = 0;
  let thisWeek = 0;
  let planned = 0;
  for (const workout of workouts) {
    if (workout.done) {
      done++;
      if (isInLastDays(workout.date, 7)) {
        thisWeek++;
      }
    } else if (getStatus(workout) === "Planned") {
      planned++;
    }
  }
  doneCount.textContent = done;
  weekCount.textContent = thisWeek;
  plannedCount.textContent = planned;
}

function saveAndShow() {
  saveData("gym-workouts", workouts);
  showWorkouts();
}

// The date field starts as today, so you only change it for another day
function setDateToToday() {
  dateInput.value = todayAsText();
}

// ----- Checking the form -----

function checkForm() {
  const exercise = document.getElementById("exercise").value;
  const group = document.getElementById("group").value;
  const weight = document.getElementById("weight").value;
  const sets = document.getElementById("sets").value;
  const reps = document.getElementById("reps").value;
  const date = dateInput.value;

  const errors = {
    exercise:
      checkRequired(exercise, "Please write the exercise.") ||
      checkMinLength(exercise, 3, "The exercise needs at least 3 letters."),
    group: checkRequired(group, "Please choose a muscle group."),
    weight: checkNumberBetween(weight, 0, 1000, "Weight must be from 0 to 1000 kg."),
    sets: checkWholeNumber(sets, 1, 20, "Sets must be a whole number from 1 to 20."),
    reps: checkWholeNumber(reps, 1, 100, "Reps must be a whole number from 1 to 100."),
    date: checkRequired(date, "Please choose a date.")
  };

  // Show every message (an empty message clears the old one)
  showError("exercise", errors.exercise);
  showError("group", errors.group);
  showError("weight", errors.weight);
  showError("sets", errors.sets);
  showError("reps", errors.reps);
  showError("date", errors.date);

  // The form is fine when all messages are empty
  return (
    errors.exercise === "" &&
    errors.group === "" &&
    errors.weight === "" &&
    errors.sets === "" &&
    errors.reps === "" &&
    errors.date === ""
  );
}

// ----- Adding a workout -----

form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  if (checkForm() === false) {
    return;
  }

  const date = dateInput.value;

  const newWorkout = {
    id: Date.now(),
    exercise: document.getElementById("exercise").value.trim(),
    group: document.getElementById("group").value,
    weight: Number(document.getElementById("weight").value),
    sets: Number(document.getElementById("sets").value),
    reps: Number(document.getElementById("reps").value),
    date: date,
    // A date in the future means the workout is only planned
    done: isAfterToday(date) === false
  };

  workouts.push(newWorkout);
  form.reset();
  setDateToToday();
  saveAndShow();
});

// ----- Done / Undo and Delete buttons -----

list.addEventListener("click", function (event) {
  // The click may land on the icon inside the button, so find the button
  const button = event.target.closest("button");
  if (button === null) {
    return;
  }

  const action = button.dataset.action;
  const id = Number(button.dataset.id);

  if (action === "done") {
    for (const workout of workouts) {
      if (workout.id === id) {
        workout.done = !workout.done;
      }
    }
  }

  if (action === "delete") {
    workouts = workouts.filter(function (workout) {
      return workout.id !== id;
    });
  }

  saveAndShow();
});

// When the page opens: fill in today's date and show the saved workouts
setDateToToday();
showWorkouts();
