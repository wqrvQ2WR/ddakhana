// 유튜브에서 영상 "하나"를 다 본 순간을 잡아내고, 카운트다운 뒤 브라우저를 닫는다.
const api = globalThis.browser ?? globalThis.chrome;

const DEFAULTS = {
  mode: "end",        // "end" = 영상이 끝나면, "seconds" = 정해진 시간만큼 보면
  seconds: 300,       // mode가 "seconds"일 때 기준 (초)
  countdown: 5,       // 닫히기 전 보여줄 카운트다운 (초)
  cancelButton: true  // 카운트다운 중 취소 버튼 노출 여부
};

let settings = { ...DEFAULTS };
let watched = 0;      // 실제로 재생된 시간 합계
let lastTime = null;
let maxTime = 0;
let armed = true;     // 아직 이번 영상으로 안 닫혔는지
let lastHref = location.href;
const hooked = new WeakSet();

api.storage.local.get(DEFAULTS).then((stored) => {
  settings = { ...DEFAULTS, ...stored };
});

api.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  for (const [key, { newValue }] of Object.entries(changes)) {
    if (key in DEFAULTS) settings[key] = newValue;
  }
});

function isVideoPage() {
  return location.pathname.startsWith("/watch") || location.pathname.startsWith("/shorts/");
}

function resetProgress() {
  watched = 0;
  lastTime = null;
  maxTime = 0;
  armed = true;
}

function hook(video) {
  if (hooked.has(video)) return;
  hooked.add(video);
  video.addEventListener("timeupdate", onTimeUpdate);
  video.addEventListener("ended", () => {
    if (settings.mode === "end") fire();
  });
}

function onTimeUpdate(event) {
  if (!isVideoPage() || !armed) return;
  const video = event.target;
  const now = video.currentTime;
  const duration = Number.isFinite(video.duration) ? video.duration : 0;

  if (lastTime !== null) {
    const delta = now - lastTime;
    // 2초를 넘는 점프는 탐색이므로 적립하지 않는다.
    if (delta > 0 && delta < 2) watched += delta;
    // 쇼츠처럼 반복 재생되는 영상: 끝까지 갔다가 처음으로 돌아오면 한 편 본 것으로 친다.
    if (delta < -1 && duration > 0 && maxTime >= duration - 1.5) {
      lastTime = now;
      fire();
      return;
    }
  }
  lastTime = now;
  if (now > maxTime) maxTime = now;

  if (settings.mode === "seconds" && watched >= settings.seconds) {
    fire();
  } else if (settings.mode === "end" && duration > 0 && now >= duration - 0.6) {
    fire();
  }
}

function fire() {
  if (!armed) return;
  armed = false;
  startCountdown();
}

function startCountdown() {
  const seconds = Math.max(0, Number(settings.countdown) || 0);
  if (seconds === 0) {
    closeBrowser();
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "ddakhana-overlay";
  overlay.innerHTML = `
    <div class="ddakhana-card">
      <p class="ddakhana-label">오늘 몫은 여기까지</p>
      <p class="ddakhana-count">${seconds}</p>
      <p class="ddakhana-desc">초 뒤에 브라우저 창을 전부 닫습니다</p>
      <button type="button" class="ddakhana-cancel" hidden>취소</button>
    </div>
  `;
  const counter = overlay.querySelector(".ddakhana-count");
  const cancel = overlay.querySelector(".ddakhana-cancel");
  if (settings.cancelButton) cancel.hidden = false;

  document.documentElement.appendChild(overlay);
  pauseVideos();

  let left = seconds;
  const timer = setInterval(() => {
    left -= 1;
    if (left <= 0) {
      clearInterval(timer);
      closeBrowser();
      return;
    }
    counter.textContent = String(left);
  }, 1000);

  cancel.addEventListener("click", () => {
    clearInterval(timer);
    overlay.remove();
    resetProgress();
  });
}

function pauseVideos() {
  for (const video of document.querySelectorAll("video")) {
    try {
      video.pause();
    } catch (e) {
      // 무시
    }
  }
}

function closeBrowser() {
  api.runtime.sendMessage({ type: "ddakhana-close" });
}

// 유튜브는 한 페이지 안에서 주소만 바꾸므로, 주소가 바뀌면 진행도를 초기화한다.
function tick() {
  if (location.href !== lastHref) {
    lastHref = location.href;
    resetProgress();
  }
  const video = document.querySelector("video");
  if (video) hook(video);
}

tick();
setInterval(tick, 1000);

document.addEventListener("yt-navigate-finish", resetProgress);
