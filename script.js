// ध्यान दें: यहाँ अपनी Render वेबसाइट का असली लिंक डालें (बिना अंतिम / के)
const BACKEND_URL = "https://your-api.onrender.com"; 

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
    btn.innerText = "Generating...";

    try {
        const response = await fetch(`${BACKEND_URL}/api/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.success) {
            document.getElementById('resultBox').classList.remove('hidden');
            document.getElementById('shortUrl').value = `${BACKEND_URL}/t/${data.short_id}`;
            btn.innerText = "Generate Secure URL";
        } else {
            alert("Error: " + data.error);
            btn.innerText = "Try Again";
        }
    } catch (error) {
        alert("Error! Check if Render backend URL is correct and live.");
        btn.innerText = "Generate Secure URL";
    }
});
