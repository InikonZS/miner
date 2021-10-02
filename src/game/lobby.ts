import Control from "../common/control";

export class Lobby extends Control{
  public onStartButtonClick: (options:string)=>void;

  constructor(parentNode:HTMLElement){
    super(parentNode);
    const option = new Control<HTMLInputElement>(this.node, 'input');
    const startButton = new Control(this.node, 'button', '', 'start game');
    startButton.node.onclick = ()=>{
      this.onStartButtonClick(option.node.value);
    }
  }
}