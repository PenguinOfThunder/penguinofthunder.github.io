/* eslint-env browser */

import * as dateFns from "https://cdn.jsdelivr.net/npm/date-fns@3.3.1/+esm";
import {
  followColorScheme,
  getPreferredTheme,
  setTheme,
  setStoredTheme
} from "./bootstrap-helpers.js";

/**
 * Update calculated values
 * @returns {void}
 */
function calc() {
  try {
    /** @type {HTMLFormElement} */
    const form = document.getElementById("calc-form");
    const stepsCompleted = Number.parseInt(
      form.elements.steps_completed.value,
      10
    );
    const stepsRequired = Number.parseInt(
      form.elements.steps_required.value,
      10
    );

    // Calculate
    const today = dateFns.parseISO(form.elements.today.value);
    if (dateFns.isValid(today)) {
      const monthStart = dateFns.startOfMonth(today);
      const monthEnd = dateFns.endOfMonth(today);
      const daysRemaining = dateFns.differenceInDays(monthEnd, today);
      const stepsRemaining =
        stepsRequired > 0 ? stepsRequired - stepsCompleted : 0;
      const stepsRemainingPerDay = Math.ceil(stepsRemaining / daysRemaining);
      const daysPast = dateFns.differenceInDays(today, monthStart) + 1;
      const avgStepsPerDay = stepsCompleted / daysPast;
      const projDaysRemain = Math.ceil(stepsRemaining / avgStepsPerDay);
      const dayToComplete = dateFns.addDays(today, projDaysRemain);
      const msgEl = document.getElementById("message");
      if (Number.isFinite(avgStepsPerDay) && projDaysRemain > 0) {
        const avgStepsPerDayStr = Math.ceil(avgStepsPerDay).toLocaleString(
          undefined,
          {
            maximumFractionDigits: 0
          }
        );
        const projDaysRemainStr = projDaysRemain.toLocaleString(undefined, {
          maximumFractionDigits: 0
        });
        const dayToCompleteStr = dayToComplete.toLocaleDateString(undefined, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        });
        msgEl.innerText =
          `At your current rate of ${avgStepsPerDayStr} steps per day` +
          ", you will complete your steps in " +
          `${projDaysRemainStr} ${projDaysRemain === 1 ? "day" : "days"}: ` +
          `${dayToCompleteStr}.`;
      } else if (projDaysRemain <= 0) {
        msgEl.innerText =
          "Congratulations, you are done with your steps for the month!";
      } else {
        msgEl.innerText = "Hint: Fill in the form and press Calculate";
      }
      // set form values
      form.elements.steps_remaining.value = Number.isFinite(stepsRemaining)
        ? `${stepsRemaining.toLocaleString()}`
        : "N/A";
      form.elements.steps_remaining_per_day.value = Number.isFinite(
        stepsRemainingPerDay
      )
        ? `${stepsRemainingPerDay.toLocaleString()}`
        : "N/A";
    } else {
      form.elements.steps_remaining.value = "";
      form.elements.steps_remaining_per_day.value = "";
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

/**
 * Restore the saved step goal from localStorage
 * @returns {void}
 */
function restoreSavedGoal() {
  const savedGoal = Number.parseInt(localStorage.getItem("steps_required"), 10);
  if (Number.isInteger(savedGoal)) {
    document.getElementById("steps_required").value = String(savedGoal);
  }
}

/**
 * Initialize defaults and event handlers
 * @returns {void} Nothing
 */
function init() {
  try {
    // Handle theme
    setTheme(getPreferredTheme());
    followColorScheme();

    // Fill in defaults
    /** @type {HTMLFormElement} */
    const form = document.getElementById("calc-form");
    form.elements.today.value = dateFns.format(new Date(), "yyyy-MM-dd");

    // Wire up event handlers
    document
      .getElementById("app-theme-select")
      .addEventListener("change", (e) => {
        const theme = e.target.value;
        setTheme(theme);
        setStoredTheme(theme);
      });
    document
      .getElementById("daily-step-goal")
      .addEventListener("change", (e) => {
        const newVal = e.target.value;
        const form = document.getElementById("calc-form");
        form.elements.steps_required.value = newVal;
        localStorage.setItem("steps_required", newVal);
      });

    const optionsModal = document.getElementById("optionsModal");
    optionsModal.addEventListener("show.bs.modal", () => {
      const form = document.getElementById("calc-form");
      const optForm = document.getElementById("optionsForm");
      optForm.elements["daily-step-goal"].value =
        form.elements.steps_required.value;
    });
    optionsModal.addEventListener("hidden.bs.modal", () => {
      calc();
    });
    // Recalculate when window is focused
    window.addEventListener("focus", calc, false);

    // Handle form submit
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        e.stopPropagation();
      }
      // form.classList.add("was-validated");
      calc();
      return false;
    });
    // Recalculate when an input is updated
    ["today", "steps_completed", "steps_required"].forEach((id) => {
      const e = document.getElementById(id);
      e.addEventListener("change", () => {
        calc();
      });
    });
    document
      .getElementById("steps_completed")
      .addEventListener("focus", (e) => {
        e.target.select(); // select all when focused
      });
    // Calculate initial value
    restoreSavedGoal();
    calc();
  } catch (err) {
    console.error(err);
    window.alert(`ERROR: ${err}`);
  }
}

// Wait for page to be fully loaded
window.addEventListener("DOMContentLoaded", init, false);
