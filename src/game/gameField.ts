import Control from "../common/control";

export class GameField extends Control{
  public onFinish: (result:boolean)=>void;

  constructor(parentNode:HTMLElement, options:string){
    super(parentNode);
    const gameElement = new Control(this.node, 'div', '', options);

    const userInput = new Control<HTMLInputElement>(this.node, 'input', '');

    const finishButton = new Control(this.node, 'button', '', 'finish game');
    finishButton.node.onclick = ()=>{
      this.onFinish(options.length < userInput.node.value.length);
    }
  }
}