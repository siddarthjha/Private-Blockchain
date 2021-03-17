const Block = require('./simpleChain.js');
const Blockchain = require('./simpleChain.js');

//Create new blockchain
const myBlockChain = new Blockchain.Blockchain();    

//Adding Blocks to chain
(function theLoop (i) {
    setTimeout(function () {
        let blockTest = new Block.Block("Test Block - " + (i + 1));
        myBlockChain.addBlock(blockTest).then((result) => {
            //console.log(result);
            i++;
            if (i < 11) theLoop(i);
        });
    }, 200);
  })(0);

//Read the chain
setTimeout(function () {
    console.log("Reading Blockchain...");
    myBlockChain.chain.readChain();
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



/*
const Blockchain = require('./blockchain.js');
const blockchainData = require('./blockchainData.js');

const testBlockchain = new Blockchain();

/*
(function populateTestBlockchain(index) {
  setTimeout(() => {
    testBlockchain.addBlock(`TEST BLOCK #${index}`).then(() => {
      console.log(`ADDED TEST BLOCK #${index + 1}`);

      if (++index < 10) {
        populateTestBlockchain(index);
      }
    });
  }, 100);
}(0));
*/


//testBlockchain.addBlock('TEST BLOCK').then(block => console.log(block));


//blockchainData.getChainData()
  //.then(chainData => console.log(chainData));