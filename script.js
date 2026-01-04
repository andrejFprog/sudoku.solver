const tableBody = document.querySelector('#sudoku tbody');

// vytvoření 9x9 tabulky
for (let i = 0; i < 9; i++) {
  const row = document.createElement('tr');
  for (let j = 0; j < 9; j++) {
    const cell = document.createElement('td');
    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('maxlength', '1');
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^1-9]/g, '');
    });
    cell.appendChild(input);
    row.appendChild(cell);
  }
  tableBody.appendChild(row);
}

// přečte tabulku do 2D pole
function readBoard() {
  const board = [];
  const rows = document.querySelectorAll('#sudoku tr');
  rows.forEach((tr) => {
    const row = [];
    tr.querySelectorAll('input').forEach((input) => {
      const val = parseInt(input.value);
      row.push(isNaN(val) ? 0 : val);
    });
    board.push(row);
  });
  return board;
}

// zobrazí 2D pole do tabulky
function setBoard(board) {
  const rows = document.querySelectorAll('#sudoku tr');
  rows.forEach((tr, i) => {
    tr.querySelectorAll('input').forEach((input, j) => {
      input.value = board[i][j] === 0 ? '' : board[i][j];
    });
  });
}

// Sudoku solver (backtracking)
function solveSudoku(board) {
  const fixed = board.map(row => row.map(cell => cell !== 0));

  function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
    }
    const startRow = 3 * Math.floor(row / 3);
    const startCol = 3 * Math.floor(col / 3);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        if (board[startRow + i][startCol + j] === num) return false;
    return true;
  }

  function backtrack() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (!fixed[row][col] && board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (backtrack()) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  return backtrack();
}

// tlačítko řešení s timeoutem 5 sekund
document.querySelector('#solveBtn').addEventListener('click', () => {
  const message = document.querySelector('#message');
  const board = readBoard();

  message.textContent = 'Řeším Sudoku...';
  message.style.color = 'black';

  const solveWithTimeout = new Promise((resolve) => {
    let solved = false;

    // timeout 5 sekund
    setTimeout(() => {
      if (!solved) resolve(false);
    }, 5000);

    // spustíme solver
    if (solveSudoku(board)) {
      solved = true;
      resolve(true);
    } else {
      solved = true;
      resolve(false);
    }
  });

  solveWithTimeout.then((success) => {
    if (success) {
      setBoard(board);
      message.textContent = 'Sudoku bylo vyřešeno!';
      message.style.color = 'green';
    } else {
      message.textContent = 'Sudoku nelze vyřešit!';
      message.style.color = 'red';
    }
  });
});



