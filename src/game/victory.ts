import Control from "../common/control";

export class Victory extends Control{
  public onSelect: (result:boolean)=>void;

  constructor(parentNode:HTMLElement, gameResult:boolean){
    super(parentNode);
    const resultMessage = new Control(this.node, 'div', '', gameResult? "win":"lose");
    const mainMenuButton = new Control(this.node, 'button', '', 'to main menu');
    const playAgainButton = new Control(this.node, 'button', '', 'try again');
    mainMenuButton.node.onclick = ()=>{
      this.onSelect(false);
    }
    playAgainButton.node.onclick = ()=>{
      this.onSelect(true);
    }
  }
}