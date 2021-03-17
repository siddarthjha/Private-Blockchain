const SHA256 = require('crypto-js/sha256');
const LevelSandboxClass = require('./levelSandbox.js');

class Block {
	constructor(data) {
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

class Blockchain {
    constructor() {
        this.chain = new LevelSandboxClass.LevelSandbox();
        this.addGenesisBlock();
    }
  
    addGenesisBlock() {
        let genBlock = new Block("First block in the chain - Genesis block");
        genBlock.time = new Date().getTime().toString().slice(0,-3);
        genBlock.previousBlockHash = '';
        genBlock.hash = SHA256(JSON.stringify(genBlock)).toString();
        // Add Genesis block to the chain. The block height 0 is used as the key.
        this.chain.addLevelDBData(0, JSON.stringify(genBlock).toString())
        .then((value) => {
            if (value) {
                console.log(`Genesis block created`);
            } else {
                console.log(`Error adding Genesis block to chain`);
            }
        });
    }

    // Adds new block. Returns Promise
    addBlock(newBlock) {
        return new Promise((resolve, reject) => {   
            this.getBlock(0)
            .then(value => {
                if (value == undefined) {
                    this.addGenesisBlock(); // Create Genesis Block if not created
                }
                return this.getBlockHeight();
            })
            .then(height => {
                //Set height of new block
                newBlock.height = height;
                newBlock.time = new Date().getTime().toString().slice(0,-3);
                //Get Previous block
                return this.getBlock(height - 1);
            })
            .then(prevBlock => {
                //Set previous block hash of new block
                newBlock.previousBlockHash = JSON.parse(prevBlock).hash;
                //Set Block hash with SHA256 using newBlock and converting to a string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                return this.chain.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());             
            })
            .then(result => {
                    if (result) {
                        resolve(result); // Block Added
                    } else {
                        console.log(`Error adding Block ${newBlock.height} to chain`);
                        reject(undefined);
                    }
            })
            .catch(err => {
                    console.log(err);
            });
        });
    }

    // Get block height of last block in the chain. Returns Promise.
    getBlockHeight(){
        return new Promise((resolve,reject) => {
            //Get the last height in the chain
            this.chain.getLastKey()
            .then(height => {
                resolve(height);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
        });
   }
    
    // get block (Promise)
    getBlock(blockHeight){
        return new Promise ((resolve, reject) => {
            this.chain.getLevelDBData(blockHeight)
            .then(curblock => {
                if (curblock == undefined) {
                    resolve(value);
                } else {
                    //console.log(JSON.parse(JSON.stringify(value)));
                    resolve(JSON.parse(JSON.stringify(curblock)));
                }
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
        });
    }

    // validate block returns Promise
    validateBlock(blockHeight){
        let self = this;
        return new Promise(function(resolve, reject) {
            self.getBlock(blockHeight)
            .then(curBlock => {
                let block = JSON.parse(curBlock);
                let blockHash = block.hash;
                block.hash = '';
                let validBlockHash = SHA256(JSON.stringify(block)).toString();
                if (blockHash === validBlockHash) {
                    resolve(true);
                } else {
                    console.log(`Block # ${blockHeight} invalid hash:\n ${blockHash} <> ${validBlockHash}`);
                    resolve(false);
                }
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

   // Validate blockchain
    validateChain(){
        let errorLog = [];
        let self = this;
        let chainLength = 0;
        let blockHash = '';
        let i = 0;      
        return new Promise(function(resolve, reject) {
            self.getBlockHeight()
            .then(height => {
                if (height == undefined) {
                    console.log(`Empty Chain`);
                    resolve(false);
                } else {
                    chainLength = height - 1;
                    //console.log(`There are ${height} blocks in this Blockchain.`);
                    (async function loop() {  
                        for (i = 0; i <= (chainLength - 1); i++) {
                            await self.validateBlock(i)
                            .then(result => {
                                if (result) {
                                    //console.log(`Block ${i} successfully validated.`);
                                } else {
                                    errorLog.push(i);
                                }
                                //return self.getBlock(i);
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                            self.validateBlock(i).then(result => {
                                if (result) {
                                    //console.log(`Block ${i} successfully validated.`);
                                } else {
                                    errorLog.push(i);
                                }
                                if (errorLog.length>0) {
                                    console.log(`Block errors = ${errorLog.length}`);
                                    console.log(`Blocks: ${errorLog}`);
                                    resolve(false);
                                } else {
                                //console.log('No errors detected');
                                    resolve(true);
                                }
                            })
                            .catch((err) => {
                                console.log(`Error validating block ${i} :  ${err}`);
                                reject(err);
                            });
                        }
                    })();
                }
            })
            .catch((err) => {
                console.log(`Error in validating chain ${err}`);
                reject(err);
            });      
        }); 
    }
}
module.exports.Block = Block;
module.exports.Blockchain = Blockchain;
