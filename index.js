const Block = require('./Block.js');
const Blockchain = require('./Blockchain.js');

//Create new blockchain
const myBlockChain = new Blockchain.Blockchain();    

var x;
myBlockChain.getBlockHeight()
.then(height => {
  x = height;
  x++;
  console.log(`Height retrieved ${x}`);
})
.catch(err => {
  x = 0; 
});


//Adding Blocks to chain
(function theLoop (i) {
  setTimeout(function () {
    let blockTest = new Block.Block("Test Block - " + x);
    myBlockChain.addBlock(blockTest)
    .then((result) => {
      //console.log(result);
      i++;
      if (i < 11) theLoop(i);
    });
    x++;
  }, 200);
})(0);

//Read the chain
setTimeout(async function () {
    console.log("Reading Blockchain...");
    await myBlockChain.chain.readChain();
},8000);

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
},10000);