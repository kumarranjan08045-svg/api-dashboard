const BACKEND_URL = "https://api-getway-backend.onrender.com"; // यहाँ अपना असली रेंडर लिंक डालें

const serviceType = document.getElementById('serviceType');
const chatIdGroup = document.getElementById('chatIdGroup');
const aiModelGroup = document.getElementById('aiModelGroup');
const skipChatId = document.getElementById('skipChatId');
const chatIdInput = document.getElementById('chatId');

serviceType.addEventListener('change', (e) => {
    if (e.target.value === 'telegram') {
        chatIdGroup.classList.remove('hidden');
        aiModelGroup.classList.add('hidden');
    } else if (e.target.value === 'ai') {
        chatIdGroup.classList.add('hidden');
        aiModelGroup.classList.remove('hidden');
    } else {
        chatIdGroup.classList.add('hidden');
        aiModelGroup.classList.add('hidden');
    }
});

skipChatId.addEventListener('change', (e) => {
    chatIdInput.disabled = e.target.checked;
    if (e.target.checked) chatIdInput.value = '';
});

document.getElementById('apiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const payload = {
        name: document.getElementById('projectName').value,
        type: serviceType.value,
        token: document.getElementById('token').value,
        chat_id: chatIdInput.value,
        ai_model: document.getElementById('aiModel').value
    };

    const btn = document.querySelector('button');
    const resultBox = document.getElementById('resultBox');
    const errorBox = document.getElementById('errorBox');
    const errorMsg = document.getElementById('errorMsg');

    // UI Reset
    btn.disabled = true;
    resultBox.classList.add('hidden');
    errorBox.classList.add('hidden');

    // Percentage Loading Animation
    let progress = 1;
    btn.innerText = `Generating... ${progress}%`;
    
    const progressInterval = setInterval(() => {
        if (progress < 95) {
            progress += Math.floor(Math.random() * 8) + 1; // 1 से 8 तक रैंडम बढ़ेगा
            if (progress > 95) progress = 95;
            btn.innerText = `Generating... ${progress}%`;
        }
    }, 150);

    try {
        const response = await fetch(`${BACKEND_URL}/api/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        clearInterval(progressInterval);
        
        if (data.success) {
            btn.innerText = `Generating... 100%`;
            setTimeout(() => {
                resultBox.classList.remove('hidden');
                document.getElementById('shortUrl').value = `${BACKEND_URL}/t/${data.short_id}`;
                btn.innerText = "Generate Secure URL";
                btn.disabled = false;
            }, 500); // 100% दिखाने के लिए आधा सेकंड रुकेगा
        } else {
            showError(data.error || "UNKNOWN DATABASE ERROR");
            btn.innerText = "Try Again";
            btn.disabled = false;
        }
    } catch (error) {
        clearInterval(progressInterval);
        showError("CONNECTION FAILED: Unable to reach the backend server. Please wait a moment.");
        btn.innerText = "Try Again";
        btn.disabled = false;
    }

    function showError(text) {
        errorMsg.innerText = text;
        errorBox.classList.remove('hidden');
    }
});
