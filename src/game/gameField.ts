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
      this.open()
    }
  }

  private open():Promise<void>{
    this.node.textContent = this.isBomb ? 'X' : this.value.toString();
    return this.animateOpen().then(()=>{
      this.onOpen(this.isBomb);
    });
  }

  private animateOpen():Promise<void>{
    return new Promise((resolve, reject)=>{
      this.node.classList.add('cell__opened');
      this.node.ontransitionend = (e)=>{
        if (e.target === this.node){
          resolve();
        }
      }
    });
  }
}

export class GameField extends Control{
  public onFinish: (result:IGameResult)=>void;
  private counter: number;
  private fieldView: Control<HTMLElement>;

  constructor(parentNode:HTMLElement, {xSize, ySize, bombCount}:IGameFieldOptions){
    super(parentNode, 'div', 'gamefield');

    const fieldData = generatethis(xSize, ySize, bombCount);
    this.counter = xSize * ySize;

    const cells: Array<Array<Cell>> = [[]];
    this.fieldView = new Control(this.node, 'div', 'field')
    for (let i = 0; i< ySize; i++){
      let row = [];
      let rowView = new Control(this.fieldView.node, 'div', 'row');
      for (let j = 0; j< xSize; j++){
        let cell = new Cell(rowView.node, calculateNearest(fieldData, {x:j, y:i}), fieldData[i][j]);
        cell.onOpen = (isBomb)=>{
          console.log('fdsfsd');
          if (isBomb){
            this.finish({isWin: false});
          } else {
            this.counter--;
            if (this.counter == bombCount){
              this.finish({isWin: true});
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
      console.log('finish')
      this.finish({isWin: false});
    }
  }

  private animateClose():Promise<void>{
    return new Promise((resolve, reject)=>{
      let field = this.fieldView;
      field.node.classList.add('field__closed');
      field.node.ontransitionend = (e)=>{
        if (e.target === field.node){
          resolve();
        }
      }
    });
  }

  private finish(result:IGameResult){
    this.animateClose().then(()=>{
      this.onFinish(result);
    });
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

function generatethis(xSize:number, ySize:number, bombCount:number): Array<Array<boolean>>{
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