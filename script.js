const MILLISECONDS_PER_DAY = 86400000; // 24時間ｘ60分ｘ60秒ｘ1,000ミリ秒＝86,400,000ミリ秒
const header = document.querySelector(".calendar h2");
const dates = document.querySelector(".dates");
const navs = document.querySelectorAll("#prev, #next");

const message = document.getElementById("message");
const errorMessage = document.getElementById("error-message");

const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "８月", "9月", "10月", "11月", "12月"];

const state = {
  month : new Date().getMonth(),
  year : new Date().getFullYear(),
  checkInDate : null,
  checkOutDate : null,
}

// 適切な日付用クラスを取得する ---------------------------------------------------------------
const getDateClassName = (currentDate, isCurrentMonth) => {
  if (state.checkInDate && currentDate.toDateString() === state.checkInDate.toDateString()) {
    // 選択したチェックイン日の場合
    return ' class="selected"';
  } else if (state.checkOutDate && currentDate.toDateString() === state.checkOutDate.toDateString()) {
    // 選択したチェックアウト日の場合
    return ' class="selected"';
  } else if (state.checkInDate && state.checkOutDate && currentDate > state.checkInDate && currentDate < state.checkOutDate) {
    // チェックイン日とチェックアウト日の間の日付の場合
    return isCurrentMonth ? ' class="in-range"' : ' class="in-range gray"';
  } else if (currentDate.toDateString() === new Date().toDateString()) {
    // 今日の日付の場合
    return ' class="today"';
  } else {
    // その他の場合
    return isCurrentMonth ? "" : ' class="gray"';
  }
}

// 画面の各項目の描画処理を行う --------------------------------------------------------------------
const renderCalendar = () => {
  const startDay = new Date(state.year, state.month, 1).getDay(); // 月の最初の日の曜日
  const endDate = new Date(state.year, state.month + 1, 0).getDate(); // 月の最後の日
  const endDay = new Date(state.year, state.month, endDate).getDay(); // 月の最後の日の曜日
  const endDatePrev = new Date(state.year, state.month, 0).getDate(); // 前月の最後の日

  // カレンダーの日付の描画用変数
  let datesHtml = "";

  // ①カレンダー日付の先頭の余白に、前月の日付を描画用変数にセット
  for (let i = startDay; i > 0; i--) {
    const currentEndDate = endDatePrev - i + 1 // 先頭の余白の計算には、前月最終日を使用
    const currentDate = new Date(state.year, state.month - 1, currentEndDate);
    const className = getDateClassName(currentDate, false);

    // 1月の場合、前年の12月を設定
    const dataDate = state.month === 0
      ? `${state.year - 1}-12-${currentEndDate}`
      : `${state.year}-${state.month}-${currentEndDate}`;

    datesHtml += `<li${className}  data-date="${dataDate}">${currentEndDate}</li$>`;
  }

  // ②現在の月の日付を描画用変数にセット
  for (let i = 1; i <= endDate; i++) {
    const currentDate = new Date(state.year, state.month, i);
    const className = getDateClassName(currentDate, true);
    
    datesHtml += `<li${className} data-date="${state.year}-${state.month + 1}-${i}">${i}</li>`;
  }

  // ③カレンダー日付の終端の余白に、次月の日付を描画用変数にセット
  for (let i = endDay; i < 6; i++) {
    const currentEndDay = i - endDay + 1 // 終端の余白の計算には、当月の最終曜日の要素数を使用
    const currentDate = new Date(state.year, state.month + 1, currentEndDay);
    const className = getDateClassName(currentDate, false);

    // 12月の場合、次年の1月を設定
    const dataDate = state.month === 11
      ? `${state.year + 1}-1-${currentEndDay}`
      : `${state.year}-${state.month + 2}-${currentEndDay}`;

    datesHtml += `<li${className} data-date="${dataDate}">${currentEndDay}</li>`;
  }

  // ①②③の要素をまとめて描画
  dates.innerHTML = datesHtml;
  header.textContent = `${state.year}年 ${months[state.month]}`;
};

// <（前月）、>（次月）ボタンにクリックイベントリスナーを設定 -----------------------------------------------
navs.forEach((nav) => {
  nav.addEventListener("click", (event) => {
    const btnId = event.target.id;

    // <（前月）ボタンを押したとき、現在の月が1月の場合、前年の12月に移動
    if (btnId === "prev" && state.month === 0) {
      state.year--;
      state.month = 11;
    // >（次月）ボタンを押したとき、現在の月が12月の場合、次年の1月に移動
    } else if (btnId === "next" && state.month === 11) {
      state.year++;
      state.month = 0;
    } else {
      state.month = btnId === "next" ? state.month + 1 : state.month - 1;
    }

    renderCalendar();
  });
});

// 各日付にクリックイベントリスナーを設定 -------------------------------------------------------------------
dates.addEventListener("click", (event) => {
  const selectedDate = new Date(event.target.dataset.date);

  if (!state.checkInDate) {
    // チェックイン日を選択時
    state.checkInDate = selectedDate;
  } else if (!state.checkOutDate) {
    // チェックアウト日を選択時
    if (selectedDate <= state.checkInDate) {
      // チェックアウト日がチェックイン日以前の場合、エラーメッセージを表示
      errorMessage.textContent = "チェックアウト日はチェックイン日より後の日付を選択してください";
      return;
    }
    state.checkOutDate = selectedDate;
    // 宿泊日数をメッセージに表示
    const termDay = Math.floor((state.checkOutDate - state.checkInDate) / MILLISECONDS_PER_DAY);
    message.textContent = `宿泊日数は${termDay}日です`;
  } else {
    // チェックイン日を再選択時
    state.checkInDate = selectedDate;
    state.checkOutDate = null;
    message.textContent = "";
  }

  errorMessage.textContent = "";
  renderCalendar();
});

// 初期処理
renderCalendar();
