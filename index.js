const Block = require('./Block.js');
const Blockchain = require('./Blockchain.js');

//Create new blockchain
const myBlockChain = new Blockchain.Blockchain();    

//Adding Blocks to chain
(function theLoop (i) {
  setTimeout(function () {
    myBlockChain.getBlockHeight()
    .then(height => {
      let blockTest = new Block.Block("Test Block - " + ++height);
      myBlockChain.addBlock(blockTest)
      .then((result) => {
        i++;
        if (i < 10) theLoop(i);
      });
    })
    .catch(err => {
      console.log(`Error: ${err}`);
    });
  }, 200);
})(0);

//Read the chain
setTimeout(async function () {
    console.log("Reading Blockchain...");
    await myBlockChain.chain.readChain();
},5000);

//Validate Chain
setTimeout(function () {
    console.log("Validating Blockchain...");
    myBlockChain.validateChain().then((result) => {
        if(result == true){
            console.log ("The Blockchain is validated without errors.");
        }else {
            console.log ("Errors in Blockchain validation.");
        }
    });
},8000);