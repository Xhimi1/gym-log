// app.js
// The Gym Log. It uses the helper functions from lib.js.

// All workouts live in this list. We load it from the browser when the page opens.
let workouts = loadData("gym-workouts");

// Elements we use more than once
const form = document.getElementById("workout-form");
const list = document.getElementById("workout-list");
const totalCount = document.getElementById("total-count");
const weekCount = document.getElementById("week-count");
const volumeCount = document.getElementById("volume-count");
const emptyMessage = document.getElementById("empty-message");

// A small icon (SVG drawing) for the delete button
const trashIcon = "<svg class='icon' viewBox='0 0 24 24'><path d='M3 6h18'/><path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6'/><path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/></svg>";

// ----- Showing the workouts -----

function showWorkouts() {
  // Put the newest workout first
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

    rows += "<tr>";
    rows += "<td>" + safeText(workout.exercise) + "</td>";
    rows += "<td>" + workout.group + "</td>";
    rows += "<td>" + weightText + "</td>";
    rows += "<td>" + workout.sets + " x " + workout.reps + "</td>";
    rows += "<td>" + formatDate(workout.date) + "</td>";
    rows += "<td><button class='button button-small' data-id='" + workout.id + "'>" + trashIcon + " Delete</button></td>";
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
  let thisWeek = 0;
  let volume = 0;
  for (const workout of workouts) {
    if (isInLastDays(workout.date, 7)) {
      thisWeek++;
    }
    // weight x sets x reps = the total kilograms lifted
    volume += workout.weight * workout.sets * workout.reps;
  }
  totalCount.textContent = workouts.length;
  weekCount.textContent = thisWeek;
  volumeCount.textContent = Math.round(volume).toLocaleString("en-US");
}

function saveAndShow() {
  saveData("gym-workouts", workouts);
  showWorkouts();
}

// ----- Checking the form -----

function checkForm() {
  const exercise = document.getElementById("exercise").value;
  const group = document.getElementById("group").value;
  const weight = document.getElementById("weight").value;
  const sets = document.getElementById("sets").value;
  const reps = document.getElementById("reps").value;
  const date = document.getElementById("date").value;

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

  // A workout cannot be in the future
  if (errors.date === "" && isAfterToday(date)) {
    errors.date = "The date cannot be in the future.";
  }

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

  const newWorkout = {
    id: Date.now(),
    exercise: document.getElementById("exercise").value.trim(),
    group: document.getElementById("group").value,
    weight: Number(document.getElementById("weight").value),
    sets: Number(document.getElementById("sets").value),
    reps: Number(document.getElementById("reps").value),
    date: document.getElementById("date").value
  };

  workouts.push(newWorkout);
  form.reset();
  saveAndShow();
});

// ----- Delete button -----

list.addEventListener("click", function (event) {
  // The click may land on the icon inside the button, so find the button
  const button = event.target.closest("button");
  if (button === null) {
    return;
  }

  const id = Number(button.dataset.id);
  workouts = workouts.filter(function (workout) {
    return workout.id !== id;
  });
  saveAndShow();
});

// Show the saved workouts when the page opens
showWorkouts();
