document.getElementById('save').addEventListener('click', function () {
    const apiKey = document.getElementById('apiKey').value;
    if (apiKey) {
        chrome.storage.sync.set({ openaiApiKey: apiKey.trim() }, function () {
            alert('API key saved successfully!');
        });
    } else {
        alert('Please enter a valid API key.');
    }
});