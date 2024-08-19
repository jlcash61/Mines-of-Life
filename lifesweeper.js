const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 10; // 10x10 grid
const cellSize = canvas.width / gridSize;

const mineProbability = 0.2; // 20% chance of a mine
const cells = [];

// Initialize grid with mines and numbers
function initGrid() {
    for (let y = 0; y < gridSize; y++) {
        cells[y] = [];
        for (let x = 0; x < gridSize; x++) {
            const isMine = Math.random() < mineProbability;
            cells[y][x] = {
                isMine: isMine,
                isRevealed: false,
                isFlagged: false,
                neighbors: 0
            };
        }
    }
    
    // Calculate neighbors for each cell
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (!cells[y][x].isMine) {
                let count = 0;
                for (let j = -1; j <= 1; j++) {
                    for (let i = -1; i <= 1; i++) {
                        const nx = x + i;
                        const ny = y + j;
                        if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize && cells[ny][nx].isMine) {
                            count++;
                        }
                    }
                }
                cells[y][x].neighbors = count;
            }
        }
    }
}

// Render the grid on the canvas
function renderGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = cells[y][x];
            ctx.strokeStyle = 'black';
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);

            if (cell.isRevealed) {
                if (cell.isMine) {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                } else {
                    ctx.fillStyle = 'lightgray';
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                    if (cell.neighbors > 0) {
                        ctx.fillStyle = 'black';
                        ctx.fillText(cell.neighbors, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
                    }
                }
            } else if (cell.isFlagged) {
                ctx.fillStyle = 'orange';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}

// Handle click events
canvas.addEventListener('click', (e) => {
    const x = Math.floor(e.offsetX / cellSize);
    const y = Math.floor(e.offsetY / cellSize);
    revealCell(x, y);
    renderGrid();
});

// Reveal a cell
function revealCell(x, y) {
    if (x >= 0 && y >= 0 && x < gridSize && y < gridSize && !cells[y][x].isRevealed) {
        cells[y][x].isRevealed = true;
        if (cells[y][x].neighbors === 0 && !cells[y][x].isMine) {
            // Reveal adjacent cells if this cell has no neighboring mines
            for (let j = -1; j <= 1; j++) {
                for (let i = -1; i <= 1; i++) {
                    revealCell(x + i, y + j);
                }
            }
        }
    }
}

// Conway's Game of Life rules application
function applyConwayRules() {
    const newCells = JSON.parse(JSON.stringify(cells));
    
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            let liveNeighbors = 0;
            
            // Count live neighbors
            for (let j = -1; j <= 1; j++) {
                for (let i = -1; i <= 1; i++) {
                    const nx = x + i;
                    const ny = y + j;
                    if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize) {
                        if (cells[ny][nx].isRevealed && !cells[ny][nx].isMine) {
                            liveNeighbors++;
                        }
                    }
                }
            }
            
            // Apply Conway's rules
            if (cells[y][x].isRevealed && !cells[y][x].isMine) {
                if (liveNeighbors < 2 || liveNeighbors > 3) {
                    newCells[y][x].isRevealed = false;
                }
            } else if (!cells[y][x].isRevealed && liveNeighbors === 3) {
                newCells[y][x].isRevealed = true;
            }
        }
    }
    
    cells.length = 0;
    cells.push(...newCells);
    renderGrid();
}

document.addEventListener('DOMContentLoaded', () => {
    const howToPlayModal = document.getElementById('howToPlay');
    const closeHowToPlayButton = document.getElementById('closeHowToPlay');
    const disableHowToPlayCheckbox = document.getElementById('disableHowToPlay');
    
    // Check if the user has disabled the tutorial
    if (!localStorage.getItem('disableHowToPlay')) {
        howToPlayModal.style.display = 'block';
    } else {
        howToPlayModal.style.display = 'none';
    }
    
    // Close button functionality
    closeHowToPlayButton.addEventListener('click', () => {
        howToPlayModal.style.display = 'none';
        
        // Save the user's preference if they don't want to see the tutorial again
        if (disableHowToPlayCheckbox.checked) {
            localStorage.setItem('disableHowToPlay', 'true');
        }
    });
    
    // Handle the checkbox state
    disableHowToPlayCheckbox.addEventListener('change', () => {
        if (disableHowToPlayCheckbox.checked) {
            localStorage.setItem('disableHowToPlay', 'true');
        } else {
            localStorage.removeItem('disableHowToPlay');
        }
    });
});


// Initialize and start the game
initGrid();
renderGrid();

// Apply Conway's rules every 5 seconds
setInterval(applyConwayRules, 5000);
