import Control from "../common/control";
import {IGameFieldOptions, IGameResult} from './dto';

class Cell extends Control{
  public value: number;
  public isBomb: boolean;
  public onOpen: (result:boolean)=>void;

  constructor(parentNode:HTMLElement, value:number, isBomb:boolean){
    super(parentNode, 'div', 'cell');
    this.value = value;
    this.isBomb = isBomb;
    this.node.textContent = '_';

    this.node.onclick = ()=>{
      this.onOpen(this.open());
    }
  }

  private open():boolean{
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

    const cells: Array<Array<Cell>> = [[]];
    const fieldView = new Control(this.node, 'div', 'field')
    for (let i = 0; i< ySize; i++){
      let row = [];
      let rowView = new Control(fieldView.node, 'div', 'row');
      for (let j = 0; j< xSize; j++){
        let cell = new Cell(rowView.node, calculateNearest(fieldData, {x:j, y:i}), fieldData[i][j]);
        cell.onOpen = (isBomb)=>{
          if (isBomb){
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
      cells.push(row);
    }

    //const userInput = new Control<HTMLInputElement>(this.node, 'input', '');

    const finishButton = new Control(this.node, 'button', '', 'cancel game');
    finishButton.node.onclick = ()=>{
      this.onFinish({isWin: false});
    }
  }
}

interface IVector2{
  x:number;
  y:number;
}

function calculateNearest(field:Array<Array<boolean>>, position:IVector2):number{
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
  let cells: Array<IVector2> = [];
  for (let i = 0; i< ySize; i++){
    let row = [];
    for (let j = 0; j< xSize; j++){  
      row.push(false);
      cells.push({x:j, y:i});
    }
    result.push(row);
  }

  let bombCells:Array<IVector2> = [];
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