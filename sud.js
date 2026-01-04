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

// převede text z OCR na 2D pole 9x9
function parseTextToBoard(text) {
  const nums = text.replace(/[^1-9]/g, '').split('');
  const board = [];
  let k = 0;
  for (let i = 0; i < 9; i++) {
    const row = [];
    for (let j = 0; j < 9; j++) {
      row.push(nums[k] ? parseInt(nums[k++]) : 0);
    }
    board.push(row);
  }
  return board;
}

// zobrazí pole do tabulky
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
        if (board[row][col] === 0) {
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

// zpracování souboru + OCR
document.querySelector('#solveBtn').addEventListener('click', async () => {
  const file = document.querySelector('#fileInput').files[0];
  const message = document.querySelector('#message');

  if (!file) {
    message.textContent = 'Nahraj obrázek Sudoku!';
    message.style.color = 'red';
    return;
  }

  message.textContent = 'Skenuji obrázek...';
  message.style.color = 'black';

  try {
    const {
      data: { text },
    } = await Tesseract.recognize(file, 'eng');
    let board = parseTextToBoard(text);
    setBoard(board);

    if (solveSudoku(board)) {
      setBoard(board);
      message.textContent = 'Sudoku bylo vyřešeno!';
      message.style.color = 'green';
    } else {
      message.textContent = 'Sudoku nelze vyřešit!';
      message.style.color = 'red';
    }
  } catch (error) {
    message.textContent = 'Chyba při čtení obrázku!';
    message.style.color = 'red';
    console.error(error);
  }
});
