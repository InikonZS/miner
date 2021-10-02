import Control from "../common/control";
import {IGameFieldOptions, IGameResult} from './dto';

class Cell extends Control{
  public value: number;
  public isBomb: boolean;

  constructor(parentNode:HTMLElement, value:number, isBomb:boolean){
    super(parentNode, 'div', 'cell');
    this.value = value;
    this.isBomb = isBomb;
    this.node.textContent = '_';
  }

  open():boolean{
    this.node.textContent = this.isBomb ? 'X' : this.value.toString();
    return this.isBomb;
  }
}

export class GameField extends Control{
  public onFinish: (result:IGameResult)=>void;
  private counter: number;
  constructor(parentNode:HTMLElement, {xSize, ySize, bombCount}:IGameFieldOptions){
    super(parentNode);

    const fieldData = generateField(xSize, ySize, bombCount);
    this.counter = xSize * ySize;

    const field: Array<Array<Cell>> = [[]];
    const fieldView = new Control(this.node, 'div', 'field')
    for (let i = 0; i< ySize; i++){
      let row = [];
      let rowView = new Control(fieldView.node, 'div', 'row');
      for (let j = 0; j< xSize; j++){
        let cell = new Cell(rowView.node, calculateNearest(fieldData, {x:j, y:i}), fieldData[i][j]);
        cell.node.onclick = ()=>{
          if (cell.open()){
            this.onFinish({isWin: false});
          } else {
            this.counter--;
            if (this.counter == bombCount){
              this.onFinish({isWin: true});
            }
          };
        }
        row.push(cell);
      }
      field.push(row);
    }

    const userInput = new Control<HTMLInputElement>(this.node, 'input', '');

    const finishButton = new Control(this.node, 'button', '', 'finish game');
    finishButton.node.onclick = ()=>{
      this.onFinish({isWin: false});
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

function generateField(xSize:number, ySize:number, bombCount:number): Array<Array<boolean>>{
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
  for (let i = 0; i< bombCount; i++){
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