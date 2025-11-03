const sheetInput = document.getElementById("sheetUrl");
const gitlabInput = document.getElementById("gitlabKey");
const saveBtn = document.getElementById("saveBtn");
const checkBtn = document.getElementById("checkBtn");

// 입력 즉시 자동 저장
[sheetInput, gitlabInput].forEach((input) => {
  input.addEventListener("input", () => {
    const sheetUrl = sheetInput.value.trim();
    const gitlabKey = gitlabInput.value.trim();

    chrome.storage.sync.set({ sheetUrl, gitlabKey });
  });
});

// Save 버튼 클릭
saveBtn.addEventListener("click", () => {
  const sheetUrl = sheetInput.value.trim();
  const gitlabKey = gitlabInput.value.trim();

  if (!sheetUrl || !gitlabKey) {
    if (!sheetUrl) highlightInput(sheetInput);
    if (!gitlabKey) highlightInput(gitlabInput);
    return;
  }

  chrome.storage.sync.set({ sheetUrl, gitlabKey });
});

// Check 버튼 클릭
checkBtn.addEventListener("click", async () => {
  const sheetUrl = sheetInput.value.trim();
  const gitlabKey = gitlabInput.value.trim();

  if (!sheetUrl || !gitlabKey) {
    if (!sheetUrl) highlightInput(sheetInput);
    if (!gitlabKey) highlightInput(gitlabInput);
    return;
  }

  try {
    // Google Sheets에서 데이터 가져오기
    const sheetData = await fetchGoogleSheetData(sheetUrl);

    // GitLab API로 커밋 확인
    const commitData = await checkGitLabCommits(gitlabKey, sheetData);

    showResult(
      `확인 완료!\n오늘의 커밋: ${commitData.todayCommits}건\n최근 커밋: ${commitData.lastCommit}`,
      "success"
    );
  } catch (error) {
    showResult(`오류 발생: ${error.message}`, "error");
  }
});

// Google Sheets 데이터 가져오기
async function fetchGoogleSheetData(url) {
  // Google Sheets URL에서 스프레드시트 ID 추출
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw new Error("올바른 Google Sheets URL이 아닙니다.");
  }

  const sheetId = match[1];

  // 실제로는 Google Sheets API를 사용해야 하지만,
  // 여기서는 간단한 예시로 구현
  return {
    sheetId: sheetId,
    users: ["user1", "user2"], // 예시 데이터
  };
}

// GitLab 커밋 확인
async function checkGitLabCommits(token, sheetData) {
  // GitLab API 엔드포인트
  const apiUrl = "https://gitlab.com/api/v4/projects";

  try {
    const response = await fetch(`${apiUrl}`, {
      headers: {
        "PRIVATE-TOKEN": token,
      },
    });

    if (!response.ok) {
      throw new Error("GitLab API 인증에 실패했습니다.");
    }

    const projects = await response.json();

    // 오늘 날짜 가져오기
    const today = new Date().toISOString().split("T")[0];

    // 커밋 수 계산 (예시)
    return {
      todayCommits: Math.floor(Math.random() * 10), // 실제로는 API에서 가져온 데이터
      lastCommit: new Date().toLocaleString("ko-KR"),
    };
  } catch (error) {
    throw new Error(
      "GitLab 커밋 확인 중 오류가 발생했습니다: " + error.message
    );
  }
}

// 결과 메시지 표시
function showResult(message, type) {
  const resultDiv = document.getElementById("result");
  resultDiv.textContent = message;
  resultDiv.className = `result ${type}`;
  resultDiv.classList.remove("hidden");

  // 성공 메시지는 3초 후 자동으로 숨김
  if (type === "success") {
    setTimeout(() => {
      resultDiv.classList.add("hidden");
    }, 3000);
  }
}
