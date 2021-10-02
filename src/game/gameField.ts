import Control from "../common/control";
import {IGameFieldOptions, IGameResult} from './dto';

class Cell extends Control{
  public value: number;
  public isBomb: boolean;
  public onOpenEnd: (result:boolean)=>void;
  public onOpenStart: (result:boolean)=>boolean;
  private isLocked: boolean;

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
    if (!this.isLocked){
      if (!this.onOpenStart(this.isBomb)) {
        return;
      };
      return this.animateOpen().then(()=>{
        this.onOpenEnd(this.isBomb);
      });
    }
  }

  public animateOpen(duration?:number):Promise<void>{
    if(this.isLocked){
      return Promise.resolve();
    }
    this.lock();
    return new Promise((resolve, reject)=>{
      this.node.textContent = this.isBomb ? 'X' : this.value.toString();
      if (duration){
        this.node.style.transitionDuration = `${duration}ms`;
      }
      this.node.classList.add('cell__opened');
      this.node.ontransitionend = (e)=>{
        if (e.target === this.node){
          resolve();
        }
      }
    });
  }

  public lock(){
    this.isLocked = true;
  }

  public unlock(){
    this.isLocked = false;
  }

}

export class GameField extends Control{
  public onFinish: (result:IGameResult)=>void;
  private counter: number;
  private fieldView: Control<HTMLElement>;
  private isLocked: boolean;
  private cells: Array<Array<Cell>> = [[]];

  constructor(parentNode:HTMLElement, {xSize, ySize, bombCount}:IGameFieldOptions){
    super(parentNode, 'div', 'gamefield');

    const fieldData = generatethis(xSize, ySize, bombCount);
    this.counter = xSize * ySize;

    
    this.fieldView = new Control(this.node, 'div', 'field');
    this.isLocked = false;
    for (let i = 0; i< ySize; i++){
      let row = [];
      let rowView = new Control(this.fieldView.node, 'div', 'row');
      for (let j = 0; j< xSize; j++){
        let cell = new Cell(rowView.node, calculateNearest(fieldData, {x:j, y:i}), fieldData[i][j]);
        cell.onOpenStart = ()=>{
          if (this.isLocked){
            return false;
          }
          let lastLocked = this.isLocked
          this.isLocked = true;
          return !lastLocked;
        }
        cell.onOpenEnd = (isBomb)=>{ 
          if (isBomb){
            this.finish({isWin: false});
          } else {
            this.counter--;
            if (this.counter == bombCount){
              this.finish({isWin: true});
            } else {
              this.isLocked = false;
            }
          };
        }
        row.push(cell);
      }
      this.cells.push(row);
    }

    const finishButton = new Control(this.node, 'button', '', 'cancel game');
    finishButton.node.onclick = ()=>{
      console.log('finish')
      this.finish({isWin: false});
    }
  }

  private animateOpenCells(){
    return Promise.all(this.cells.flat().map((cell, index)=>cell.animateOpen(index*30+100)));
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
    this.animateOpenCells().then(()=>{
      return this.animateClose()
    }).then(()=>{
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