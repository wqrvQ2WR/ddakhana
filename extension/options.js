const api = globalThis.browser ?? globalThis.chrome;

const DEFAULTS = {
  mode: "end",
  seconds: 300,
  countdown: 5,
  cancelButton: true
};

const form = document.getElementById("form");
const status = document.getElementById("status");

api.storage.local.get(DEFAULTS).then((stored) => {
  const settings = { ...DEFAULTS, ...stored };
  form.querySelector(`input[name="mode"][value="${settings.mode}"]`).checked = true;
  form.seconds.value = settings.seconds;
  form.countdown.value = settings.countdown;
  form.cancelButton.checked = settings.cancelButton;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const settings = {
    mode: form.querySelector('input[name="mode"]:checked').value,
    seconds: clamp(form.seconds.value, 10, 36000, DEFAULTS.seconds),
    countdown: clamp(form.countdown.value, 0, 60, DEFAULTS.countdown),
    cancelButton: form.cancelButton.checked
  };
  form.seconds.value = settings.seconds;
  form.countdown.value = settings.countdown;
  await api.storage.local.set(settings);
  status.textContent = "저장했습니다";
  setTimeout(() => { status.textContent = ""; }, 2000);
});

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}
