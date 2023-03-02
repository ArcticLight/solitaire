# SOLITAIRE?

#### Directions.

This is a solver for Fortune Solitaire. You can run it in Solitaire Mode which just solves puzzles randomly (and is kind of fun to watch), or you can input a board state in the input box and click the "solve this" button. The solver will then attempt to solve your board state.

The solver displays its progress as it solves. The board should be self-explanatory; the moves that the solver is exploring are displayed at the bottom. If you click on a move, you can freeze the board at that state. Clicking on the same move again clears the freeze.

Notes on inputting boards:

1. The first row in the input is the home cards, and should always have at least the Aces.
2. The second row is any Arcana cards in the home.
3. All subsequent rows are the card field.
4. To input a blank in a row, use a single comma (",") character instead of a card.
5. The board you've input appears in the bottom.
6. If you input a nonsense board, the solver will get stuck. Input validation doesn't check if cards are missing.
