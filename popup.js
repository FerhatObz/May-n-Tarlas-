document.addEventListener('DOMContentLoaded', () => {
    // Oyun Ayarları
    const size = 6;
    const minesCount = 7;
    const gameContainer = document.getElementById("game");
    const statusText = document.getElementById("status");
    const restartBtn = document.getElementById("restart");

    let cells = [];
    let mines = new Set();
    let gameOver = false;

    // 1. Oyunu Sıfırla ve Başlat
    function initGame() {
        gameContainer.innerHTML = "";
        cells = [];
        mines.clear();
        gameOver = false;
        
        statusText.textContent = "Derse odaklan, arada patla!";
        statusText.style.color = "#64748b"; // Muted text color

        // Rastgele Mayın Konumları Belirle
        while (mines.size < minesCount) {
            const pos = Math.floor(Math.random() * (size * size));
            mines.add(pos);
        }

        // 6x6 Grid Oluştur
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.index = i;
            
            // Sol Tık: Kareyi Aç
            cell.addEventListener("click", () => handleReveal(i));
            
            // Sağ Tık: Bayrak Koy/Kaldır (Derste strateji için!)
            cell.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                if (!gameOver && !cell.classList.contains("revealed")) {
                    cell.classList.toggle("flag");
                }
            });

            gameContainer.appendChild(cell);
            cells.push(cell);
        }
    }

    // 2. Kare Açma Mantığı
    function handleReveal(index) {
        if (gameOver || cells[index].classList.contains("revealed") || cells[index].classList.contains("flag")) return;

        // Mayına mı bastı?
        if (mines.has(index)) {
            endGame(false);
            return;
        }

        recursiveReveal(index);
        checkWin();
    }

    // 3. Otomatik Boşluk Açma (Recursive Flood Fill)
    function recursiveReveal(index) {
        if (index < 0 || index >= size * size || cells[index].classList.contains("revealed")) return;

        const cell = cells[index];
        cell.classList.add("revealed");
        cell.classList.remove("flag");

        const neighbors = getNeighbors(index);
        const mineCount = neighbors.filter(nIdx => mines.has(nIdx)).length;

        if (mineCount > 0) {
            cell.textContent = mineCount;
            // Sayı rengi için CSS dataset'i ata
            cell.dataset.count = mineCount >= 4 ? "4+" : mineCount;
        } else {
            // Etrafta mayın yoksa komşuları da aç
            neighbors.forEach(nIdx => recursiveReveal(nIdx));
        }
    }

    // 4. Komşu İndislerini Bulma
    function getNeighbors(index) {
        const x = index % size;
        const y = Math.floor(index / size);
        const neighbors = [];

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                    const nIdx = ny * size + nx;
                    if (nIdx !== index) neighbors.push(nIdx);
                }
            }
        }
        return neighbors;
    }

    // 5. Oyun Sonu Kontrolü
    function endGame(isWin) {
        gameOver = true;
        statusText.textContent = isWin ? "EFSANESİN! 🎉" : "GÜM! Hoca Bakıyor... 💥";
        statusText.style.color = isWin ? "#00ff88" : "#ff0055"; // Neon Win/Loss

        // Tüm mayınları göster
        cells.forEach((cell, i) => {
            if (mines.has(i)) {
                cell.classList.add("mine");
                cell.textContent = "💣";
            }
        });
    }

    function checkWin() {
        const revealedCount = cells.filter(c => c.classList.contains("revealed")).length;
        if (revealedCount === (size * size) - minesCount) {
            endGame(true);
        }
    }

    // Başlat butonu ve ilk tetikleme
    restartBtn.addEventListener("click", initGame);
    initGame();
});