document.getElementById('sendQuery').addEventListener('click', async function () {
    const query = document.getElementById('query').value;
    if (query) {
        document.getElementById('sendQuery').disabled = true;
        document.getElementById('verse').textContent = "Loading..."; // Show loading message
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second delay
        await interpretQueryWithAI(query);
        document.getElementById('sendQuery').disabled = false;
    }
});

async function getApiKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['openaiApiKey'], function (result) {
            if (chrome.runtime.lastError) {
                reject(new Error("Error retrieving API key"));
            } else {
                resolve(result.openaiApiKey || null);
            }
        });
    });
}

async function interpretQueryWithAI(query, retryCount = 0) {
    try {
        const apiKey = await getApiKey();
        console.log("API Key:", apiKey);
        if (!apiKey) {
            document.getElementById('verse').textContent = "API key not found. Please set it in the extension settings.";
            return;
        }

        const apiUrl = 'https://api.openai.com/v1/chat/completions';
        const prompt = `You are a helpful assistant that finds relevant Bible verses based on user queries. The user's query is: "${query}". Please provide a relevant Bible verse and its reference.`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful assistant that finds relevant Bible verses based on user queries." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 100
            })
        });

        console.log("Request Headers:", {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        });

        if (!response.ok) {
            if (response.status === 429 && retryCount < 3) {
                const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff (1s, 2s, 4s)
                console.warn(`Rate limit exceeded. Retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return interpretQueryWithAI(query, retryCount + 1);
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            const verse = data.choices[0].message.content;
            document.getElementById('verse').innerHTML = verse;
            if (typeof BLB !== "undefined" && BLB.Tagger) {
                BLB.Tagger.tag(); // Trigger BLB ScriptTagger if available
            }
        } else {
            document.getElementById('verse').textContent = "No verse found.";
        }
    } catch (error) {
        console.error('Error fetching verse:', error);
        document.getElementById('verse').textContent = error.message.includes("429")
            ? "Too many requests. Please wait a moment and try again."
            : "Error fetching verse. Please check your API key and try again.";
    }
}
