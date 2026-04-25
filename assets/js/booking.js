// ========================================
// 散歩予約システム - JavaScript
// ========================================

let selectedDate = null;
let currentDate = new Date();

// ========================================
// カレンダーの初期化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('prevMonth').addEventListener('click', previousMonth);
    document.getElementById('nextMonth').addEventListener('click', nextMonth);
    document.getElementById('bookingForm').addEventListener('submit', handleFormSubmit);
}

// ========================================
// カレンダーレンダリング
// ========================================

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 月表示を更新
    const monthNames = [
        '1月', '2月', '3月', '4月', '5月', '6月',
        '7月', '8月', '9月', '10月', '11月', '12月'
    ];
    document.getElementById('currentMonth').textContent = `${year}年 ${monthNames[month]}`;
    
    // 1日の曜日と月の日数を取得
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = prevLastDay.getDate();
    
    const calendarDates = document.getElementById('calendarDates');
    calendarDates.innerHTML = '';
    
    // 前月の日付
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const cell = createDateCell(daysInPrevMonth - i, 'other-month');
        calendarDates.appendChild(cell);
    }
    
    // 今月の日付
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const cell = createDateCell(i, 'current-month', date);
        
        // 今日の日付をマーク
        if (date.toDateString() === today.toDateString()) {
            cell.classList.add('today');
        }
        
        // 過去の日付は無効化
        if (date < today) {
            cell.classList.add('other-month');
            cell.style.cursor = 'not-allowed';
        }
        
        calendarDates.appendChild(cell);
    }
    
    // 来月の日付
    const nextMonthDays = 42 - (firstDayOfWeek + daysInMonth);
    for (let i = 1; i <= nextMonthDays; i++) {
        const cell = createDateCell(i, 'other-month');
        calendarDates.appendChild(cell);
    }
}

function createDateCell(day, className, date = null) {
    const cell = document.createElement('div');
    cell.classList.add('date-cell', className);
    cell.textContent = day;
    
    if (date && className === 'current-month' && date >= new Date()) {
        cell.addEventListener('click', () => selectDate(date, cell));
    }
    
    return cell;
}

function selectDate(date, element) {
    // 前の選択を削除
    document.querySelectorAll('.date-cell.selected').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    // 新しい選択を追加
    element.classList.add('selected');
    selectedDate = date;
    
    // 入力フィールドに日付を設定
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}年${month}月${day}日`;
    
    document.getElementById('selectedDate').value = dateStr;
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// ========================================
// フォーム送信
// ========================================

function handleFormSubmit(e) {
    e.preventDefault();
    
    // バリデーション
    if (!selectedDate) {
        alert('日付を選択してください');
        return;
    }
    
    // フォームデータを取得
    const formData = {
        date: formatDate(selectedDate),
        time: document.getElementById('timeSlot').value,
        course: document.querySelector('input[name="course"]:checked').value,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        petName: document.getElementById('petName').value,
        message: document.getElementById('message').value,
    };
    
    // データをローカルストレージに保存
    saveBooking(formData);
    
    // 確認メッセージを表示
    showConfirmationMessage();
    
    // フォームをリセット
    document.getElementById('bookingForm').reset();
    selectedDate = null;
    document.querySelectorAll('.date-cell.selected').forEach(cell => {
        cell.classList.remove('selected');
    });
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function saveBooking(formData) {
    // ローカルストレージから既存の予約を取得
    let bookings = JSON.parse(localStorage.getItem('mugiBookings') || '[]');
    
    // 新しい予約を追加
    bookings.push({
        ...formData,
        bookingId: 'MUGI-' + Date.now(),
        bookingDate: new Date().toISOString()
    });
    
    // ローカルストレージに保存
    localStorage.setItem('mugiBookings', JSON.stringify(bookings));
    
    // コンソールに出力（実装テスト用）
    console.log('予約が保存されました:', formData);
}

function showConfirmationMessage() {
    const confirmationMessage = document.getElementById('confirmationMessage');
    confirmationMessage.classList.remove('hidden');
    
    // 5秒後に非表示にする
    setTimeout(() => {
        confirmationMessage.classList.add('hidden');
    }, 5000);
    
    // ページ上部にスクロール
    confirmationMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
