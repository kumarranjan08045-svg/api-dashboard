const BACKEND_URL = "https://api-getway-backend.onrender.com"; // <-- अपना रेंडर लिंक यहाँ डालें

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

// Load History on Page Load
document.addEventListener('DOMContentLoaded', updateHistoryUI);

document.getElementById('apiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const projectName = document.getElementById('projectName').value;
    const payload = {
        name: projectName,
        type: serviceType.value,
        token: document.getElementById('token').value,
        chat_id: chatIdInput.value,
        ai_model: document.getElementById('aiModel').value
    };

    const btn = document.getElementById('submitBtn');
    const resultBox = document.getElementById('resultBox');
    const errorBox = document.getElementById('errorBox');
    const errorMsg = document.getElementById('errorMsg');
    const formElements = document.querySelectorAll('#apiForm input, #apiForm select, #apiForm button');

    formElements.forEach(el => el.disabled = true);
    resultBox.classList.add('hidden');
    errorBox.classList.add('hidden');

    let progress = 1;
    btn.innerText = `Generating... ${progress}%`;
    
    const progressInterval = setInterval(() => {
        if (progress < 95) {
            progress += Math.floor(Math.random() * 8) + 1;
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
                const finalUrl = `${BACKEND_URL}/t/${data.short_id}`;
                document.getElementById('shortUrl').value = finalUrl;
                resultBox.classList.remove('hidden');
                
                // Auto Copy
                navigator.clipboard.writeText(finalUrl);

                // Save to LocalStorage History
                saveToHistory(projectName, finalUrl);

                btn.innerText = "Generate Hologram URL";
                formElements.forEach(el => el.disabled = false);
            }, 500);
        } else {
            showError(data.error || "DATABASE ERROR");
            resetForm(formElements, btn);
        }
    } catch (error) {
        clearInterval(progressInterval);
        showError("CONNECTION FAILED: Unable to reach backend server.");
        resetForm(formElements, btn);
    }
});

// Copy Button Event
document.getElementById('copyBtn').addEventListener('click', () => {
    const urlInput = document.getElementById('shortUrl');
    urlInput.select();
    navigator.clipboard.writeText(urlInput.value);
    document.getElementById('copyBtn').innerText = "Copied!";
    setTimeout(() => {
        document.getElementById('copyBtn').innerText = "Copy";
    }, 2000);
});

// Clear History Event
document.getElementById('clearHistory').addEventListener('click', () => {
    localStorage.removeItem('api_history');
    updateHistoryUI();
});

function saveToHistory(name, url) {
    let history = JSON.parse(localStorage.getItem('api_history')) || [];
    history.unshift({ name, url }); // Add to top
    if (history.length > 10) history.pop(); // Keep max 10
    localStorage.setItem('api_history', JSON.stringify(history));
    updateHistoryUI();
}

function updateHistoryUI() {
    const historyList = document.getElementById('historyList');
    const historyCount = document.getElementById('historyCount');
    let history = JSON.parse(localStorage.getItem('api_history')) || [];
    
    historyCount.innerText = history.length;
    
    if (history.length === 0) {
        historyList.innerHTML = `<p class="empty-history">No links generated yet.</p>`;
        return;
    }

    historyList.innerHTML = '';
    history.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <span><b>${item.name}</b></span>
            <button class="history-copy" onclick="copyHistoryUrl('${item.url}', this)">Copy</button>
        `;
        historyList.appendChild(div);
    });
}

window.copyHistoryUrl = function(url, btnElement) {
    navigator.clipboard.writeText(url);
    btnElement.innerText = "Done!";
    setTimeout(() => {
        btnElement.innerText = "Copy";
    }, 1500);
};

function showError(text) {
    const errorBox = document.getElementById('errorBox');
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.innerText = text;
    errorBox.classList.remove('hidden');
}

function resetForm(elements, btn) {
    elements.forEach(el => el.disabled = false);
    btn.innerText = "Generate Hologram URL";
}
