const checkButton = document.getElementById("checkButton");
const result = document.getElementById("result");

checkButton.addEventListener("click", async () => {
    checkButton.disabled = true;
    checkButton.textContent = "Memeriksa...";
    result.className = "result";
    result.textContent = "Sedang menghubungi backend...";

    try {
        const response = await fetch("/api/status");

        if (!response.ok) {
            throw new Error("Server mengembalikan status " + response.status);
        }

        const data = await response.json();
        result.className = "result success";
        result.textContent = `${data.message} Status: ${data.status}. Waktu server: ${data.time}`;
    } catch (error) {
        result.className = "result error";
        result.textContent = "Gagal terhubung ke backend: " + error.message;
    } finally {
        checkButton.disabled = false;
        checkButton.textContent = "Cek Backend";
    }
});
