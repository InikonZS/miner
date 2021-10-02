import Control from "../common/control";

class Cell extends Control{
  public value: number;
  public isBomb: boolean;

  constructor(parentNode:HTMLElement, value:number, isBomb:boolean){
    super(parentNode, 'div', 'cell');
    this.value = value;
    this.isBomb = isBomb;
    this.node.textContent = '_';
  }

  open(){
    this.node.textContent = this.isBomb ? 'X' : this.value.toString();
  }
}

export class GameField extends Control{
  public onFinish: (result:boolean)=>void;

  constructor(parentNode:HTMLElement, options:string){
    super(parentNode);
    const gameElement = new Control(this.node, 'div', '', options);

    let xSize = 10;
    let ySize = 7;

    const fieldData = generateField(xSize, ySize);

    const field: Array<Array<Cell>> = [[]];
    const fieldView = new Control(this.node, 'div', 'field')
    for (let i = 0; i< ySize; i++){
      let row = [];
      let rowView = new Control(fieldView.node, 'div', 'row');
      for (let j = 0; j< xSize; j++){
        let cell = new Cell(rowView.node, calculateNearest(fieldData, {x:j, y:i}), fieldData[i][j]);
        cell.node.onclick = ()=>{
          cell.open();
        }
        row.push(cell);
      }
      field.push(row);
    }

    const userInput = new Control<HTMLInputElement>(this.node, 'input', '');

    const finishButton = new Control(this.node, 'button', '', 'finish game');
    finishButton.node.onclick = ()=>{
      this.onFinish(options.length < userInput.node.value.length);
    }
  }
}

function calculateNearest(field:Array<Array<boolean>>, position:{x:number, y:number}):number{
  let result = 0;
  for (let i = -1; i<= 1; i++){
    for (let j = -1; j<=1; j++){ 
      let y = i+position.y;
      let x = j+position.x;
      if (y>=0 && x>=0 && y<field.length && x<field[0].length){
        result += field[y][x] ? 1:0;
      }
    }
  }
  return result;
}

function generateField(xSize:number, ySize:number): Array<Array<boolean>>{
  let result:Array<Array<boolean>> = [];
  let cells: Array<{x:number, y:number}> = [];
  for (let i = 0; i< ySize; i++){
    let row = [];
    for (let j = 0; j< xSize; j++){  
      row.push(false);
      cells.push({x:j, y:i});
    }
    result.push(row);
  }

  let bombCells:Array<{x:number, y:number}> = [];
  for (let i = 0; i< 10; i++){
    if (!cells.length){
      throw new Error('genaration error');
    }
    let last = cells[cells.length-1];
    let rand = Math.floor(Math.random() * cells.length);
    cells[cells.length-1] = cells[rand];
    cells[rand] = last;
    bombCells.push(cells.pop());
  }

  bombCells.forEach(bombPosition=>{
    result[bombPosition.y][bombPosition.x] = true;
  });

  return result;
}