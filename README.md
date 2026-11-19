# Gym Log

A small web page for writing down your gym workouts.
Made for the CEN 311 Web Technologies and Programming midterm, using only HTML, CSS and JavaScript.

## Pages

- `index.html` the home page: navigation bar, hero with a Start now button, and a short "how it works" section
- `log.html` the workout log

## What it does

- Add a workout with an exercise, a muscle group, the weight, the sets, the reps and the date
- The date starts as today. A date in the past or today is saved as done. A date in the future is saved as planned
- The form checks every field and shows a message under each field that is wrong
  (for example: sets must be a whole number from 1 to 20)
- Every workout has a status: Done, Planned, or Missed (planned, but the date has passed, shown in red)
- The Done button marks a planned workout as done, and Undo puts it back. The Delete button removes a workout
- Workouts are shown in a table with the latest date first, so planned workouts are on top
- The top of the page shows the workouts done, how many were in the last 7 days, and how many are planned
- Workouts are saved in the browser, so they are still there after a reload

## Files

- `index.html` and `log.html` the two pages
- `styles.css` the design (reusable classes, flat, small corners, simple SVG icons)
- `lib.js` small helper functions: saving, dates, safe text and form checks
- `app.js` the Gym Log itself, built with the helpers from `lib.js`

## How to run

Open `index.html` in a browser, then press Start now.
No install and no build step.
