// 콘텐츠 스크립트가 "하나 다 봤다"고 알려주면 열려 있는 창을 전부 닫는다.
const api = globalThis.browser ?? globalThis.chrome;

api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "ddakhana-close") return;
  closeAllWindows();
  sendResponse?.({ ok: true });
  return true;
});

async function closeAllWindows() {
  let windows = [];
  try {
    windows = await api.windows.getAll({});
  } catch (e) {
    return;
  }
  // 영상이 떠 있던 창을 마지막에 닫아, 닫히는 과정이 화면에 보이도록 한다.
  windows.sort((a, b) => Number(a.focused) - Number(b.focused));
  for (const win of windows) {
    try {
      await api.windows.remove(win.id);
    } catch (e) {
      // 이미 닫힌 창은 무시
    }
  }
}
