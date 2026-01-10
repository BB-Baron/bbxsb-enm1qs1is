// ============================================================
// BeyBlade X Scoreboard - script.js (replacement full file)
// ============================================================

/**
 * キー入力の正規化：
 * - keyCode/which: 48-57(上段数字), 96-105(テンキー数字) を '0'..'9' に統一
 * - code: Numpad7 / NumpadDecimal / NumpadDivide / NumpadMultiply 等を吸収
 * - 最後に key にフォールバック
 */
function normalizeShortcutKey(event) {
  const kc = event.keyCode || event.which;

  // 上段数字 0-9
  if (kc >= 48 && kc <= 57) return String(kc - 48);

  // テンキー数字 0-9
  if (kc >= 96 && kc <= 105) return String(kc - 96);

  // 物理キー（テンキー）
  if (event.code && event.code.startsWith('Numpad')) {
    const rest = event.code.replace('Numpad', '');
    if (/^\d$/.test(rest)) return rest;
    if (rest === 'Decimal') return '.';
    if (rest === 'Divide') return '/';
    if (rest === 'Multiply') return '*';
    if (rest === 'Enter') return 'Enter';
  }

  return event.key;
}

document.addEventListener('DOMContentLoaded', function () {
  // ------------------------------------------------------------
  // DOM references
  // ------------------------------------------------------------
  const modal = document.getElementById('setting-modal');
  const menuIcon = document.getElementById('menu-icon');
  const rocketIcon = document.getElementById('rocket-icon');
  const settingForm = document.getElementById('setting-form');

  const leftPlayerNameInput = document.getElementById('left-player-name-input');
  const rightPlayerNameInput = document.getElementById('right-player-name-input');
  const leftPlayerNameDisplay = document.getElementById('left-player-name');
  const rightPlayerNameDisplay = document.getElementById('right-player-name');

  const countdownVideoSelect = document.getElementById('countdown-video-select');
  const countdownVideo = document.getElementById('countdownVideo');

  const resetButton = document.getElementById('reset-button');

  // 決まり手ボタン（左右）
  const leftDecisionButtons = document.querySelectorAll('#left-decision-buttons .decision-button');
  const rightDecisionButtons = document.querySelectorAll('#right-decision-buttons .decision-button');

  // LRボタン
  const limitedRulesButtons = document.querySelectorAll('.lr-button');

  // ------------------------------------------------------------
  // Initial rendering
  // ------------------------------------------------------------
  if (leftPlayerNameDisplay && leftPlayerNameInput) {
    leftPlayerNameDisplay.textContent = leftPlayerNameInput.value;
  }
  if (rightPlayerNameDisplay && rightPlayerNameInput) {
    rightPlayerNameDisplay.textContent = rightPlayerNameInput.value;
  }

  // ------------------------------------------------------------
  // Modal open/close & settings apply
  // ------------------------------------------------------------
  if (menuIcon && modal) {
    menuIcon.addEventListener('click', function () {
      modal.style.display = 'block';
    });
  }

  if (settingForm) {
    settingForm.addEventListener('submit', function (event) {
      event.preventDefault();

      if (leftPlayerNameDisplay && leftPlayerNameInput) {
        leftPlayerNameDisplay.textContent = leftPlayerNameInput.value;
      }
      if (rightPlayerNameDisplay && rightPlayerNameInput) {
        rightPlayerNameDisplay.textContent = rightPlayerNameInput.value;
      }

      // カウントダウン動画差し替え
      if (countdownVideo && countdownVideoSelect) {
        countdownVideo.src = countdownVideoSelect.value;
      }

      if (modal) modal.style.display = 'none';
    });
  }

  // ------------------------------------------------------------
  // Reset / Countdown
  // ------------------------------------------------------------
  function resetScoreboard() {
    const leftScore = document.getElementById('leftScore');
    const rightScore = document.getElementById('rightScore');
    const decisionLog = document.getElementById('decision-log');
    const leftName = document.getElementById('left-player-name');
    const rightName = document.getElementById('right-player-name');

    if (leftScore) leftScore.textContent = '0';
    if (rightScore) rightScore.textContent = '0';
    if (decisionLog) decisionLog.innerHTML = '';

    if (leftName) {
      leftName.style.backgroundColor = '';
      leftName.style.color = '';
    }
    if (rightName) {
      rightName.style.backgroundColor = '';
      rightName.style.color = '';
    }
  }

  if (resetButton) {
    resetButton.addEventListener('click', function () {
      resetScoreboard();
    });
  }

  // HTML head 側にも startCountdown/endCountdown がある前提で呼ぶ
  if (rocketIcon) {
    rocketIcon.addEventListener('click', function () {
      if (typeof startCountdown === 'function') startCountdown();
    });
  }

  // ------------------------------------------------------------
  // Score update
  // ------------------------------------------------------------
  function logDecision(side, value, label) {
    const logElement = document.getElementById('decision-log');
    if (!logElement) return;

    const logEntry = document.createElement('li');
    logEntry.innerHTML = side === 'left' ? `${value}<--${label}` : `${label}-->${value}`;
    logElement.appendChild(logEntry);
  }

  function updateScore(side, value, label) {
    const scoreElement = document.getElementById(side + 'Score');
    if (!scoreElement) return;

    let score = parseInt(scoreElement.textContent || '0', 10);
    score += value;
    scoreElement.textContent = String(score);

    // 勝者の背景色を黄色に
    const victoryPointInput = document.getElementById('victory-point-input');
    const victoryPoint = parseInt(victoryPointInput ? victoryPointInput.value : '0', 10);

    const playerNameDiv = document.getElementById(side + '-player-name');
    if (playerNameDiv) {
      if (victoryPoint > 0 && score >= victoryPoint) {
        playerNameDiv.style.backgroundColor = 'yellow';
        playerNameDiv.style.color = 'black';
      } else {
        playerNameDiv.style.backgroundColor = '';
        playerNameDiv.style.color = '';
      }
    }

    logDecision(side, value, label);
  }

  // 決まり手ボタン（左右）
  const decisionButtons = document.querySelectorAll('.decision-button');
  decisionButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      // もしこのボタンが将来 form 内に入った場合の事故予防
      if (button.closest('form')) e.preventDefault();

      const value = parseInt(this.getAttribute('data-value') || '0', 10);
      const label = this.getAttribute('data-label') || '';

      if (this.parentElement && this.parentElement.id === 'left-decision-buttons') {
        updateScore('left', value, label);
      } else {
        updateScore('right', value, label);
      }
    });
  });

  // LR イベントリスナー（form内にあるので submit 事故を防ぐ）
  limitedRulesButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault(); // ★重要：form submit を止める（HTML側で type="button" を付けるのが本筋）

      const value = parseInt(this.getAttribute('data-value') || '0', 10);
      const side = this.getAttribute('data-side') || '';
      if (side === 'left' || side === 'right') {
        updateScore(side, value, 'LR');
      }
    });
  });

  // ------------------------------------------------------------
  // CSS切り替え（HTMLの onchange="changestyle('mystyle',value)" 用）
  // ------------------------------------------------------------
  window.changestyle = function (sheetId, sheetValue) {
    const el = document.getElementById(sheetId);
    if (el) el.setAttribute('href', sheetValue);
  };

  // ------------------------------------------------------------
  // Keyboard shortcuts (unified here)
  // ------------------------------------------------------------
  document.addEventListener('keydown', function (event) {
    // 入力中（名前入力など）の誤爆防止
    const t = event.target;
    const isTyping = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (isTyping) return;

    const key = normalizeShortcutKey(event);

    switch (key) {
      case '/':
        event.preventDefault();
        resetButton?.click();
        break;

      case '*':
        event.preventDefault();
        if (modal) modal.style.display = 'block';
        break;

      // Left Side: HTML順序 0:Spin, 1:Burst, 2:Over, 3:Xtream, 4:OF
      case '7':
        leftDecisionButtons[3]?.click(); // Xtream
        break;
      case '4':
        leftDecisionButtons[2]?.click(); // Over
        break;
      case '1':
        leftDecisionButtons[1]?.click(); // Burst
        break;
      case '0':
        leftDecisionButtons[0]?.click(); // Spin
        break;

      // Right Side
      case '9':
        rightDecisionButtons[3]?.click(); // Xtream
        break;
      case '6':
        rightDecisionButtons[2]?.click(); // Over
        break;
      case '3':
        rightDecisionButtons[1]?.click(); // Burst
        break;
      case '.':
        rightDecisionButtons[0]?.click(); // Spin
        break;

      default:
        break;
    }
  });
});
