import { WEBHOOK_URL } from "./config.js";

const sheetInput = document.getElementById("sheetUrl");
const gitlabInput = document.getElementById("gitlabKey");
const saveBtn = document.getElementById("saveBtn");
const checkBtn = document.getElementById("checkBtn");

let isSaved = false;

// 저장된 값 불러오기
chrome.storage.sync.get(["sheetUrl", "gitlabKey"], (data) => {
  if (data.sheetUrl) sheetInput.value = data.sheetUrl;
  if (data.gitlabKey) gitlabInput.value = data.gitlabKey;
});

// 입력 시 자동 저장 + 버튼 복구
[sheetInput, gitlabInput].forEach((input) => {
  input.addEventListener("input", () => {
    const sheetUrl = sheetInput.value.trim();
    const gitlabKey = gitlabInput.value.trim();
    chrome.storage.sync.set({ sheetUrl, gitlabKey });

    // 값이 바뀌면 Save 버튼 원상복귀
    if (isSaved) {
      saveBtn.innerHTML = "save";
      saveBtn.classList.remove("saved");
      isSaved = false;
    }
  });

  input.addEventListener("focus", () => {
    input.classList.remove("error");
    input.style.border = "";
  });
});

function highlightInput(input) {
  input.classList.add("shake", "error");
  setTimeout(() => input.classList.remove("shake"), 400);
}

// Save 버튼 클릭
saveBtn.addEventListener("click", async () => {
  const sheetUrl = sheetInput.value.trim();
  const gitlabKey = gitlabInput.value.trim();

  if (!sheetUrl || !gitlabKey) {
    if (!sheetUrl) highlightInput(sheetInput);
    if (!gitlabKey) highlightInput(gitlabInput);
    return;
  }

  // spinner 표시
  saveBtn.disabled = true;
  saveBtn.innerHTML = `<div class="spinner"></div>`;

  await new Promise((res) => setTimeout(res, 800)); // UX용 살짝 딜레이

  // 저장
  chrome.storage.sync.set({ sheetUrl, gitlabKey }, () => {
    // 체크 표시로 변경
    saveBtn.innerHTML = "✓";
    saveBtn.disabled = false;
    saveBtn.classList.add("saved");
    isSaved = true;
  });
});

// 🔹 Check 버튼 클릭 → Webhook 호출
checkBtn.addEventListener("click", async () => {
  const sheetUrl = sheetInput.value.trim();
  const gitlabKey = gitlabInput.value.trim();

  if (!sheetUrl || !gitlabKey) {
    if (!sheetUrl) highlightInput(sheetInput);
    if (!gitlabKey) highlightInput(gitlabInput);
    return;
  }

  const payload = { sheetUrl, gitlabKey };

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Webhook 호출 실패 (${res.status})`);
    showResult("Webhook 전송 완료!", "success");
  } catch (err) {
    showResult(`오류: ${err.message}`, "error");
  }
});

// 결과 메시지 표시
function showResult(message, type) {
  const resultDiv = document.getElementById("result");
  resultDiv.textContent = message;
  resultDiv.className = `result ${type}`;
  resultDiv.classList.remove("hidden");

  if (type === "success") {
    setTimeout(() => resultDiv.classList.add("hidden"), 3000);
  }
}
