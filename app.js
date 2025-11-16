/* =============================
   ① タブ操作
============================= */
const tabs = document.querySelectorAll(".tab-button");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    contents.forEach((c) => c.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});


/* =============================
   ② 面接質問ジェネレーター
============================= */
document.getElementById("genQuestions").addEventListener("click", () => {
  const industry = document.getElementById("industry").value;
  const job = document.getElementById("jobType").value;
  const stage = document.getElementById("stage").value;

  let text = "【基本質問】\n";
  text += "・自己紹介をお願いします。\n";
  text += "・学生時代に力を入れたことは？\n";
  text += "・志望動機を教えてください。\n\n";

  text += "【深掘り質問】\n";
  text += `・${industry} を志望した理由は？\n`;
  text += `・${job} を志望した理由は？\n`;
  text += `・${stage} で特に見てほしい点は？\n\n`;

  text += "【逆質問】\n";
  text += "・御社で活躍する人の特徴は？\n";
  text += "・1日の仕事の流れについて教えてください。\n";

  document.getElementById("questionsResult").textContent = text;
});


/* =============================
   ③ 自己PR生成
============================= */
document.getElementById("genPR").addEventListener("click", () => {
  const category = document.getElementById("prCategory").value;
  const exp = document.getElementById("prExperience").value.trim();

  if (!exp) {
    alert("経験内容を入力してください！");
    return;
  }

  let title = "";
  if (category === "strength") title = "【強み】";
  if (category === "effort") title = "【努力したこと】";
  if (category === "leadership") title = "【リーダーシップ】";
  if (category === "teamwork") title = "【チームワーク】";
  if (category === "problem") title = "【課題解決】";

  const text =
`${title}
私の${title.replace(/[【】]/g, "")}は以下の経験から形成されています。

${exp}

この経験を通じて、目的に向けて粘り強く取り組む姿勢を身につけました。
御社でもこの力を発揮し、貢献していきたいと考えています。`;

  document.getElementById("prResult").textContent = text;
});


/* =============================
   ④ ローカルストレージ（PR保存）
============================= */
function loadPR() {
  return JSON.parse(localStorage.getItem("prList") || "[]");
}

function savePR(list) {
  localStorage.setItem("prList", JSON.stringify(list));
}

function renderPRList() {
  const list = loadPR();
  const box = document.getElementById("prList");
  box.innerHTML = "";

  list.forEach((item) => {
    const div = document.createElement("div");
    div.textContent = `【${item.title}】\n${item.content}\n(${item.date})`;
    box.appendChild(div);
  });
}


/* =============================
   ⑤ PRストック保存ボタン
============================= */
document.getElementById("savePR").addEventListener("click", () => {
  const title = prompt("このPRのタイトル（例：ガクチカ／強み）を入力");
  const content = document.getElementById("prResult").textContent.trim();

  if (!title || !content) {
    alert("タイトルまたは内容が空です！");
    return;
  }

  const list = loadPR();

  list.push({
    title,
    content,
    date: new Date().toLocaleString(),
  });

  savePR(list);
  renderPRList();

  alert("保存しました！");
});


/* =============================
   ⑥ エクスポート
============================= */
function download(filename, text) {
  const a = document.createElement("a");
  a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
  a.download = filename;
  a.click();
}

document.getElementById("exportTxt").addEventListener("click", () => {
  const list = loadPR();
  let txt = "";
  list.forEach((item) => {
    txt += `【${item.title}】\n${item.content}\n(${item.date})\n\n`;
  });
  download("pr_export.txt", txt);
});

document.getElementById("exportJson").addEventListener("click", () => {
  const json = JSON.stringify(loadPR(), null, 2);
  download("pr_export.json", json);
});

document.getElementById("exportZip").addEventListener("click", () => {
  alert("ZIP形式は簡易版です（後で強化できます）");
});


/* =============================
   ⑦ 面接官モード
============================= */
const ivLog = document.getElementById("interviewLog");
const ivAns = document.getElementById("interviewAnswer");
const ivSend = document.getElementById("sendInterviewAnswer");

let interviewRunning = false;
let ivQuestions = [];
let ivStep = 0;

// 質問データ
const ivQuestionBank = [
  "自己紹介をお願いします。",
  "学生時代に力を入れたことは？",
  "あなたの強みは？",
  "弱みは何ですか？",
  "困難を乗り越えた経験は？",
  "チームで工夫した経験は？",
  "なぜ当社なのですか？",
  "5年後のキャリアイメージは？",
  "最近興味を持った社会ニュースは？",
];

// ランダム質問数：3〜8
function generateInterviewQuestions() {
  const count = Math.floor(Math.random() * 6) + 3;
  return ivQuestionBank.sort(() => Math.random() - 0.5).slice(0, count);
}

// ログ表示
function logInterview(text, isUser = false) {
  const div = document.createElement("div");
  div.textContent = (isUser ? "【あなた】 " : "【面接官】 ") + text;
  ivLog.appendChild(div);
  ivLog.scrollTop = ivLog.scrollHeight;
}

// 面接開始
document.getElementById("startInterview").addEventListener("click", () => {
  interviewRunning = true;
  ivQuestions = generateInterviewQuestions();
  ivStep = 0;

  ivLog.innerHTML = "";
  ivAns.disabled = false;
  ivSend.disabled = false;

  logInterview("本日はよろしくお願いします。まずは " + ivQuestions[0]);
});

// 回答送信
ivSend.addEventListener("click", () => {
  if (!interviewRunning) return;

  const answer = ivAns.value.trim();
  if (!answer) {
    alert("回答を入力してください！");
    return;
  }

  logInterview(answer, true);
  ivAns.value = "";
  ivStep++;

  if (ivStep >= ivQuestions.length) {
    finishInterview();
    return;
  }

  logInterview("次の質問です。 " + ivQuestions[ivStep]);
});

// 面接終了
function finishInterview() {
  interviewRunning = false;
  ivAns.disabled = true;
  ivSend.disabled = true;

  logInterview(
    "これで面接を終了します。お疲れさまでした。\n【フィードバック】\n- 要点をまとめるとさらに良い\n- 具体例を増やすと説得力UP\n- 結論から話すとより伝わる"
  );
}


/* =============================
   ⑧ 初期表示
============================= */
renderPRList();
