// Global state
let chatHistory = [];
let diamonds = parseInt(localStorage.getItem('rpg_diamonds')) || 10; // Start with 10 free diamonds
let lastLoginDate = localStorage.getItem('rpg_last_login') || '';
let loginStreak = parseInt(localStorage.getItem('rpg_login_streak')) || 0;

// Valid giftcodes (Hardcoded for testing)
const VALID_CODES = {
    'TANTHU': 50,
    'VIPPRO': 100,
    'TESTGAME': 10
};
let usedCodes = JSON.parse(localStorage.getItem('rpg_used_codes')) || [];

// DOM Elements
const chatContainer = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const diamondCountEl = document.getElementById('diamond-count');

const panelT1 = document.getElementById('panel-t1');
const panelT235 = document.getElementById('panel-t235');
const toggleT1Btn = document.getElementById('toggle-t1');
const toggleT235Btn = document.getElementById('toggle-t235');
const closeBtns = document.querySelectorAll('.close-btn');

const contentT1 = document.getElementById('content-t1');
const contentT2 = document.getElementById('content-t2');
const contentT35 = document.getElementById('content-t35');

// Initialize
function init() {
    updateDiamondDisplay();
    checkDailyLogin();
    loadGameState();

    // Handle "start" logic -> open modal instead of sending to AI
    const originalSend = handleSend;
    handleSend = async function() {
        const text = userInput.value.trim().toLowerCase();
        if (text === 'start') {
            document.getElementById('create-world-modal').classList.remove('hidden');
            userInput.value = '';
            return;
        }
        await originalSend();
    };

    // Event Listeners
    sendBtn.addEventListener('click', handleSend);

    // Toolbar logic
    const toolBtns = document.querySelectorAll('.tool-btn');
    toolBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const insertText = e.currentTarget.getAttribute('data-insert');
            insertAtCursor(userInput, insertText);
        });
    });

    // World Creation Logic
    document.getElementById('btn-start-world').addEventListener('click', async () => {
        document.getElementById('create-world-modal').classList.add('hidden');
        await submitWorldCreation();
    });

    document.getElementById('btn-roll-world').addEventListener('click', () => {
        const randomSettings = [
            "Vũ trụ giả tưởng sci-fi", "Học viện phép thuật", "Thế giới ngầm Mafia",
            "Isekai chuyển sinh làm slime", "Sống sót trên đảo hoang"
        ];
        const randomGenres = ["Hành động, hài hước", "Kinh dị, giật gân", "Romcom", "Giải đố sinh tồn"];
        const randomBoss = ["Ma vương bóng tối", "Tập đoàn hắc ám", "Kẻ thù không xác định", "Bản thân ở vũ trụ khác"];

        document.getElementById('wc-setting').innerHTML += `<option value="Random" selected>${randomSettings[Math.floor(Math.random() * randomSettings.length)]}</option>`;
        document.getElementById('wc-genre').value = randomGenres[Math.floor(Math.random() * randomGenres.length)];
        document.getElementById('wc-boss').value = randomBoss[Math.floor(Math.random() * randomBoss.length)];
        document.getElementById('wc-char').value = "Roll ngẫu nhiên";

        alert("Đã gacha ra thế giới ngẫu nhiên! Vui lòng ấn 'Bắt Đầu Hành Trình' để trải nghiệm.");
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Toggle Panels
    toggleT1Btn.addEventListener('click', () => {
        panelT1.classList.toggle('collapsed');
    });

    toggleT235Btn.addEventListener('click', () => {
        panelT235.classList.toggle('collapsed');
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            document.getElementById(targetId).classList.add('collapsed');
        });
    });

    // Giftcode logic
    const enterCodeBtn = document.getElementById('enter-code');
    const giftModal = document.getElementById('giftcode-modal');
    const closeModals = document.querySelectorAll('.close-modal');
    const submitCodeBtn = document.getElementById('submit-code');
    const codeInput = document.getElementById('giftcode-input');
    const codeMsg = document.getElementById('code-message');

    enterCodeBtn.addEventListener('click', () => {
        giftModal.classList.remove('hidden');
        codeMsg.textContent = '';
        codeInput.value = '';
    });

    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.add('hidden');
        });
    });

    submitCodeBtn.addEventListener('click', () => {
        const code = codeInput.value.trim().toUpperCase();
        if (!code) return;

        if (usedCodes.includes(code)) {
            codeMsg.innerHTML = '<span class="error-text">Code này đã được sử dụng!</span>';
            return;
        }

        if (VALID_CODES[code]) {
            const reward = VALID_CODES[code];
            addDiamonds(reward);
            usedCodes.push(code);
            localStorage.setItem('rpg_used_codes', JSON.stringify(usedCodes));
            codeMsg.innerHTML = `<span class="success-text">Nhập code thành công! Bạn nhận được ${reward} Kim cương.</span>`;
            setTimeout(() => { giftModal.classList.add('hidden'); }, 1500);
        } else {
            codeMsg.innerHTML = '<span class="error-text">Code không hợp lệ!</span>';
        }
    });

    // Daily Login Logic
    document.getElementById('daily-login').addEventListener('click', () => {
        const today = new Date().toDateString();
        if (lastLoginDate === today) {
            alert(`Bạn đã điểm danh hôm nay rồi! Streak hiện tại: ${loginStreak} ngày.`);
        } else {
            checkDailyLogin(true); // Force claim
        }
    });
}

function updateDiamondDisplay() {
    diamondCountEl.textContent = diamonds;
    localStorage.setItem('rpg_diamonds', diamonds);
}

function addDiamonds(amount) {
    diamonds += amount;
    updateDiamondDisplay();
}

function useDiamond() {
    if (diamonds > 0) {
        diamonds -= 1;
        updateDiamondDisplay();
        return true;
    }
    return false;
}

function insertAtCursor(myField, myValue) {
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
    } else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos)
            + myValue
            + myField.value.substring(endPos, myField.value.length);
        myField.selectionStart = startPos + myValue.length;
        myField.selectionEnd = startPos + myValue.length;
    } else {
        myField.value += myValue;
    }
    myField.focus();
}

async function submitWorldCreation() {
    if (!useDiamond()) {
        alert("Bạn đã hết Kim Cương! Hãy điểm danh hoặc nhập Code để nhận thêm.");
        return;
    }

    const setting = document.getElementById('wc-setting').value;
    const mode = document.getElementById('wc-mode').value;
    const genre = document.getElementById('wc-genre').value;
    const char = document.getElementById('wc-char').value;
    const boss = document.getElementById('wc-boss').value || "Tự do sinh ra theo cốt truyện";
    const gmMode = document.getElementById('wc-gm').value;

    const setupPrompt = `[HỆ THỐNG KHỞI TẠO]
Người chơi đã thiết lập thế giới với thông số:
- Bối cảnh: ${setting}
- Chế độ chơi: ${mode}
- Thể loại: ${genre}
- Nhân vật người chơi: ${char}
- Phản diện: ${boss}
- Phong cách GM dẫn dắt: ${gmMode}

Vui lòng áp dụng ngay lập tức các thông số này, KHÔNG CẦN HỎI LẠI NGƯỜI CHƠI BẤT CỨ CÂU NÀO.
Hãy thiết lập các chỉ số Tầng 1, Tầng 2 ở mức khởi điểm hợp lý.
Tại Tầng 3, hãy viết MỘT ĐOẠN MỞ ĐẦU THẬT HAY, ĐẬM CHẤT ĐIỆN ẢNH VÀ ĐƯA NGƯỜI CHƠI VÀO TÌNH HUỐNG ĐẦU TIÊN để bắt đầu hành trình.`;

    // Add to history (hidden logic for user but visible in chat)
    appendMessage('system', "Hệ thống đang kiến tạo thế giới theo yêu cầu của bạn...");

    // Add to internal history
    chatHistory.push({ role: 'user', content: setupPrompt });

    // Show loading
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'loading-msg');
    loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Thần linh đang kiến tạo thế giới...';
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const responseText = await callGeminiAPI(chatHistory);
        chatContainer.removeChild(loadingDiv);
        chatHistory.push({ role: 'model', content: responseText });
        processAIResponse(responseText);
    } catch (error) {
        if (loadingDiv.parentNode) chatContainer.removeChild(loadingDiv);
        appendMessage('ai', "Lỗi hệ thống: Không thể kết nối với AI lúc này.");
        addDiamonds(1);
    }
}

function checkDailyLogin(forceClaim = false) {
    const today = new Date().toDateString();

    if (lastLoginDate !== today) {
        // Check if consecutive
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastLoginDate === yesterday.toDateString()) {
            loginStreak += 1;
        } else {
            loginStreak = 1; // Reset streak
        }

        if (forceClaim || confirm(`Chào mừng ngày mới! Bạn nhận được quà điểm danh ngày ${loginStreak}.\nNhận 5 Kim Cương?`)) {
            addDiamonds(5);
            lastLoginDate = today;
            localStorage.setItem('rpg_last_login', lastLoginDate);
            localStorage.setItem('rpg_login_streak', loginStreak);
            if(forceClaim) alert(`Điểm danh thành công! Nhận 5 KC. Streak: ${loginStreak} ngày.`);
        }
    }
}

// Render message to UI
function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    if (sender === 'user') msgDiv.classList.add('user-msg');
    else if (sender === 'ai') msgDiv.classList.add('ai-msg');
    else msgDiv.classList.add('system-msg');
    msgDiv.textContent = text;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Parse AI response (Expecting JSON, fallback to raw text if fail)
function processAIResponse(rawText) {
    let jsonStr = rawText;

    // Attempt to extract JSON block if AI wraps it in markdown (```json ... ```)
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = rawText.match(jsonRegex);
    if (match) {
        jsonStr = match[1];
    } else {
        // Find first { and last }
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = rawText.substring(firstBrace, lastBrace + 1);
        }
    }

    try {
        const data = JSON.parse(jsonStr);

        // Update Panels
        if (data.tang1 && data.tang1.trim()) contentT1.textContent = data.tang1;
        if (data.tang2 && data.tang2.trim()) contentT2.textContent = data.tang2;
        if (data.tang3_5 && data.tang3_5.trim()) contentT35.textContent = data.tang3_5;

        // Output Tang3 to Chat
        if (data.tang3 && data.tang3.trim()) {
            appendMessage('ai', data.tang3);
        } else {
            // Fallback if somehow tang3 is missing but json is valid
            appendMessage('ai', "Hệ thống đang xử lý... Xin vui lòng tiếp tục.");
        }

        // Save State
        saveGameState(data);

    } catch (e) {
        console.error("Failed to parse JSON from AI:", e);
        console.log("Raw Response:", rawText);
        // Fallback: just show raw text in chat
        appendMessage('ai', rawText);
    }
}

async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    if (!useDiamond()) {
        alert("Bạn đã hết Kim Cương! Hãy điểm danh hoặc nhập Code để nhận thêm.");
        return;
    }

    // Add user message
    appendMessage('user', text);
    userInput.value = '';
    sendBtn.disabled = true;

    // Add to history
    chatHistory.push({ role: 'user', content: text });

    // Show loading
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'loading-msg');
    loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI đang suy nghĩ...';
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const responseText = await callGeminiAPI(chatHistory);

        // Remove loading
        chatContainer.removeChild(loadingDiv);

        // Add AI response to history
        chatHistory.push({ role: 'model', content: responseText });

        // Process & Render
        processAIResponse(responseText);

    } catch (error) {
        chatContainer.removeChild(loadingDiv);
        appendMessage('ai', "Lỗi hệ thống: Không thể kết nối với AI. Vui lòng kiểm tra API Key hoặc mạng.");
        console.error(error);
        // Refund diamond
        addDiamonds(1);
    } finally {
        sendBtn.disabled = false;
        userInput.focus();
    }
}

function saveGameState(latestData) {
    const gameState = {
        history: chatHistory,
        t1: contentT1.textContent,
        t2: contentT2.textContent,
        t35: contentT35.textContent
    };
    localStorage.setItem('rpg_game_state', JSON.stringify(gameState));
}

function loadGameState() {
    const savedState = localStorage.getItem('rpg_game_state');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            chatHistory = state.history || [];

            // Render history to chat (only tang3 part from AI)
            chatHistory.forEach(msg => {
                if (msg.role === 'user') {
                    appendMessage('user', msg.content);
                } else {
                    // Extract tang3 from past model responses if it's JSON
                    try {
                        let jsonStr = msg.content;
                        const match = msg.content.match(/```json\s*([\s\S]*?)\s*```/);
                        if (match) jsonStr = match[1];
                        else {
                            const first = msg.content.indexOf('{');
                            const last = msg.content.lastIndexOf('}');
                            if (first !== -1 && last !== -1) jsonStr = msg.content.substring(first, last + 1);
                        }
                        const data = JSON.parse(jsonStr);
                        if (data.tang3) appendMessage('ai', data.tang3);
                    } catch(e) {
                         // If fail parse past history, just dump it
                         appendMessage('ai', msg.content);
                    }
                }
            });

            // Restore panels
            if (state.t1) contentT1.textContent = state.t1;
            if (state.t2) contentT2.textContent = state.t2;
            if (state.t35) contentT35.textContent = state.t35;

        } catch (e) {
            console.error("Failed to load game state", e);
        }
    }
}

// Start app
document.addEventListener('DOMContentLoaded', init);
