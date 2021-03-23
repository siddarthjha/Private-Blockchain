const level = require('level');
const chainDB = './chaindata';

//let db = level(chainDB);

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.get(key, (err, value) => {
                if (err) {
                    if (err.type == 'NotFoundError') {
                        console.log('Not Found Error ', key);
                        resolve(undefined);
                    } else {
                        console.log(`Failed to get data for Block ${key}`, err);
                        reject(err);
                    }
                } else {
                    resolve(value);
                }
            });
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.put(key, value, (err) => {
                if (err) {
                    console.log(`Failed to submit Block ${key}`, err);
                    reject(err);
                } else {
                    resolve(value);
                }
            });
        });
    }

    // Add Data to levelDB with the value (Promise)
    addDataToLevelDB(key, value) {
        let self = this;
        let index = 0;
        return new Promise((resolve, reject) => {
            self.db.createReadStream()
                .on('data', (data) => {
                    index += 1;
                })
                .on('error', (err) => {
                    console.log('Unable to read data stream!', err); // ### Might get error
                    reject(err);
                })
                .on('close', () => {
                    addLevelDBData(index, value).then((value) => {
                        console.log(`Block #: ${index} added to chain`);
                        resolve(value);
                    });
                });
        });
    }

    // Gets Last key. It returns the height of last block (Promise)
    getLastKey() {
        let self = this;
        let key = 0;
        let i = -1;
        return new Promise((resolve, reject) => {
            self.db.createReadStream()
                .on('data', (data) => {
                    i++;
                })
                .on('error', (err) => {
                    console.log('Unable to read stream!', err);
                    reject(err);
                })
                .on('close', () => {
                    resolve(i);
                });
        });
    }

    // Reads the chain (For testing Purpose)
    readChain() {
        let self = this;
        console.log('----Start of Chain----');
        self.db.createReadStream()
            .on('data', (data) => {
                console.log(data);
            })
            .on('error', (err) => {
                console.log('Unable to read Data stream', err);
            })
            .on('close', () => {
                console.log('----End of Chain----');
            })
    }
        

}

module.exports.LevelSandbox = LevelSandbox;