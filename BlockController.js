const BlockClass = require('./Block.js');
const BlockchainClass = require('./Blockchain.js');

class BlockController {

    // Initialize here all your endpoints
    constructor(app) {
        this.app = app;
        this.blockchain = new BlockchainClass.Blockchain();
        this.EMPTY_HEIGHT = -1;
        this.UNKNOWN_ERROR_MSG = 'Somethng bad happened ಥ_ಥ, see server logs';
        this.getBlockResponse = block => ({error: false, block});
        this.getErrorResponse = message => ({error: true, message});
        this.convertHeightToInt = (req, res, next) => {
            req.params.height = parseInt(req.params.height, 10);
            next();
        };
        //this.initializeMockData();
        this.getBlockByIndex();
        this.postNewBlock();
    }

    // Implement a GET Endpoint to retrieve a block by index, url: "/block/:height"
    getBlockByIndex() {
        this.app.get('/block/:height(\\d+)', this.convertHeightToInt, (req, res, next) => {
        const requestedHeight = req.params.height;
        this.blockchain.getBlockHeight()
        .then(height => {
            if (height === this.EMPTY_HEIGHT) {
                const emptyBlockchainMessage = 'Blockchain is empty';
                res.status(404).json(this.getErrorResponse(emptyBlockchainMessage));
                next(`ERROR: ${emptyBlockchainMessage}`);
            } else if (requestedHeight < 0 || requestedHeight > height) {
                const invalidBlockMessage = (
                  `Invalid block (${requestedHeight}) requested`);
                res.status(400).json(this.getErrorResponse(invalidBlockMessage));
                next(`ERROR: ${invalidBlockMessage}`);
            } else {
                return this.blockchain.getBlock(requestedHeight)
                .then(curBlock => {
                    let block = JSON.parse(curBlock);
                    res.status(200).json(this.getBlockResponse(block));
                })
            }
        })
        .catch(error => {
            res.status(500).json(this.getErrorResponse(this.UNKNOWN_ERROR_MSG));
            next(`ERROR: ${error}`);
        });
    });
    }

    // Implement a POST Endpoint to add a new Block, url: "/block"
    postNewBlock() {
        this.app.post('/block', (req, res, next) => { 
            res.setHeader('content-type', 'application/json');
            const {data} = req.body;
            if (data === undefined) {
                const noBlockDataMessage = 'No block data provided';
                res.status(400).json(this.getErrorResponse(noBlockDataMessage));
                next(`ERROR: ${noBlockDataMessage}`);
            } else {
                let block = new BlockClass.Block(data);
                this.blockchain.addBlock(block)
                .then(result => {
                    res.status(201).json(this.getBlockResponse(block))
                })
                .catch(error => {
                    res.status(500).json(this.getErrorResponse(this.UNKNOWN_ERROR_MSG));
                    next(`ERROR ${error}`);
                });
            }
        })

    }

    initializeMockData() {
        let bc = this.blockchain;
        var x;
        bc.getBlockHeight()
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
            let blockTest = new BlockClass.Block("Test Block - " + x);
            bc.addBlock(blockTest)
            .then((result) => {
              //console.log(result);
              i++;
              if (i < 10) theLoop(i);
            });
            x++;
          }, 200);
        })(0);
    }

}

module.exports = (app) => { return new BlockController(app);}