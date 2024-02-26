/* eslint-env browser */

import * as dateFns from "https://cdn.jsdelivr.net/npm/date-fns@3.3.1/+esm";
import * as bs from "./bootstrap-helpers.js";

/**
 * Update calculated values
 * @returns {void}
 */
function calc() {
  try {
    const form = document.forms["calc-form"];
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
          `, you will complete your steps in ${projDaysRemainStr} days: ` +
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
  // Handle theme
  bs.setTheme(bs.getPreferredTheme());
  bs.followColorScheme();

  // Fill in defaults
  const form = document.getElementById("calc-form");
  form.elements.today.value = dateFns.format(new Date(), "yyyy-MM-dd");

  // Wire up event handlers
  document
    .getElementById("menuItemSaveCurrentGoal")
    .addEventListener("click", () => {
      localStorage.setItem(
        "steps_required",
        form.elements.steps_required.value
      );
    });
  document
    .getElementById("menuItemSetThemeLight")
    .addEventListener("click", () => {
      bs.setTheme("light");
      bs.setStoredTheme("light");
    });
  document
    .getElementById("menuItemSetThemeDark")
    .addEventListener("click", () => {
      bs.setTheme("dark");
      bs.setStoredTheme("dark");
    });
  document
    .getElementById("menuItemSetThemeAuto")
    .addEventListener("click", () => {
      bs.setTheme("auto");
      bs.setStoredTheme("auto");
    });
  window.addEventListener("focus", calc, false);
  // Handle form submit
  document.getElementById("calc-form").addEventListener("submit", (e) => {
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
  document.getElementById("steps_completed").addEventListener("focus", (e) => {
    e.target.select(); // select all when focused
  });
  // Calculate initial value
  restoreSavedGoal();
  calc();
}

// Wait for page to be fully loaded
window.addEventListener("DOMContentLoaded", init, false);
