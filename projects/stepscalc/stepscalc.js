/* eslint-env browser */
/* global dateFns */

/**
 * Update calculated values
 * @returns {void}
 */
function calc() {
  try {
    const form = document.forms['calc-form'];
    const stepsCompleted = Number.parseInt(
      form.elements.steps_completed.value,
      10
    );
    const stepsRequired = Number.parseInt(
      form.elements.steps_required.value,
      10
    );

    // Calculate
    const today = dateFns.parse(form.elements.today.value);
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
      const msgEl = document.getElementById('message');
      if (Number.isFinite(avgStepsPerDay) && projDaysRemain > 0) {
        msgEl.innerText = `At your current rate of ${Math.ceil(
          avgStepsPerDay
        ).toLocaleString()} steps per day, you will complete your steps in ${projDaysRemain.toLocaleString()} days: ${dayToComplete.toLocaleDateString(
          undefined,
          { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
        )}.`;
      } else if (projDaysRemain <= 0) {
        msgEl.innerText =
          'Congratulations, you are done with your steps for the month!';
      } else {
        msgEl.innerText = '';
      }
      // set form values
      form.elements.steps_remaining.value = Number.isFinite(stepsRemaining)
        ? `${stepsRemaining}`
        : '';
      form.elements.steps_remaining_per_day.value = Number.isFinite(
        stepsRemainingPerDay
      )
        ? `${stepsRemainingPerDay}`
        : '';
    } else {
      form.elements.steps_remaining.value = '';
      form.elements.steps_remaining_per_day.value = '';
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

/**
 * Initialize defaults and event handlers
 * @returns {void} Nothing
 */
function init() {
  // Fill in defaults
  const form = document.getElementById('calc-form');
  form.elements.today.value = dateFns.format(new Date(), 'YYYY-MM-DD');

  // Wire up event handlers
  window.addEventListener('focus', calc, false);
  // Handle form submit
  document.getElementById('calc-form').addEventListener('submit', (e) => {
    e.preventDefault();
    calc();
    return false;
  });
  // Recalculate when an input is updated
  ['today', 'steps_completed', 'steps_required'].forEach((id) => {
    const e = document.getElementById(id);
    e.addEventListener('change', () => {
      calc();
    });
  });
  document.getElementById('steps_completed').addEventListener('focus', (e) => {
    e.target.select(); // select all when focused
  });
  // Calculate initial value
  calc();
}

// Wait for page to be fully loaded
window.addEventListener('load', init, false);
