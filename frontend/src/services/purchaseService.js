export default class PurchaseService {

    static networks = {
        1: {
            https: "https://mainnet.infura.io/v3/8f0be0e5fb5f470ebd4c1a9cfdcc77dd",
            wss: "wss://mainnet.infura.io/ws/v3/8f0be0e5fb5f470ebd4c1a9cfdcc77dd"
        },
        3: {
            https: "https://ropsten.infura.io/v3/8f0be0e5fb5f470ebd4c1a9cfdcc77dd",
            wss: "wss://ropsten.infura.io/ws/v3/8f0be0e5fb5f470ebd4c1a9cfdcc77dd"
        }
    };

    static async generateAddress() {
        let pk = localStorage.getItem("privateKey");

        if (!pk) {
            const {web3} = new Web3();
            const userInfo = web3.eth.accounts.create();
            localStorage.setItem("privateKey", btoa(userInfo.privateKey));
        }
    }

    static async makeDeposit(amount, callback ) {
        const Intel_Contract_Schema = JSON.parse(window.localStorage.getItem('intelc'));
        const Pareto_Token_Schema = JSON.parse(window.localStorage.getItem('paretoc'));

        const Intel = new web3.eth.Contract(
            Intel_Contract_Schema,
            localStorage.getItem('intelAddress')
        );

        const ParetoTokenInstance = new web3.eth.Contract(
            Pareto_Token_Schema,
            localStorage.getItem('paretoAddress')
        );

        const  walletProvider = getWalletProvider();
        try {
            const web3 = walletProvider.web3;
            const wallet = walletProvider.wallet;
            let amountPareto = web3.utils.toWei(amount.toString(), "ether");
            let gasPrice = await web3.eth.getGasPrice();

            let totalTokensToApprove = 10000000000;
            let increaseApprovalTotal = web3.utils.toWei(totalTokensToApprove.toString(), "ether");

            let gasApprove = await ParetoTokenInstance.methods
                .increaseApproval(Intel.options.address, increaseApprovalTotal)
                .estimateGas({from: wallet.getAddressString()});

            await ParetoTokenInstance.methods
                .increaseApproval(Intel.options.address, increaseApprovalTotal)
                .send({
                    from: wallet.getAddressString(),
                    gas: gasApprove,
                    gasPrice: gasPrice * 1.3
                })
                .once("transactionHash", hash => {
                    console.log("Approve hash "+hash);
                    waitForReceipt(hash, async receipt => {
                        console.log("Receipt ");
                        let gasApprove = await Intel.methods
                            .makeDeposit(wallet.getAddressString(), amountPareto)
                            .estimateGas({from: wallet.getAddressString()});
                        await Intel.methods
                            .makeDeposit(wallet.getAddressString(), amountPareto)
                            .send({
                                from: wallet.getAddressString(),
                                gas: gasApprove,
                                gasPrice: gasPrice * 1.3
                            })
                            .once("transactionHash", hash => {
                                console.log("deposit hash "+hash);
                                waitForReceipt(hash, async receipt => {
                                    console.log("Receipt ");
                                    if(walletProvider.engine){ try{  walletProvider.engine.stop(); }catch (e) { } }
                                    callback(null, receipt);
                                });
                            })
                            .once("error", err => {
                                if(walletProvider.engine){ try{  walletProvider.engine.stop(); }catch (e) { } }
                                return callback(err);
                            });

                    });
                })
                .once("error", err => {
                    if(walletProvider.engine){ try{  walletProvider.engine.stop(); }catch (e) { } }
                    return callback(err);
                });


        }catch (e) {
            if(walletProvider.engine){ try{  walletProvider.engine.stop(); }catch (e) { } }
            callback(e);
        }


    }


    static getWalletProvider () {
        const HookedWalletSubprovider = require('web3-provider-engine/subproviders/hooked-wallet-ethtx.js')
        const ProviderEngine = require('web3-provider-engine');
        const WsSubprovider = require('web3-provider-engine/subproviders/websocket.js');
        const Wallet = require('ethereumjs-wallet');
        const myWallet =  Wallet.fromPrivateKey(new Buffer(Buffer.from(localStorage.getItem("privateKey"), "base64").toString("ascii"), "hex"));
        const engine = new ProviderEngine();
        engine.addProvider(new HookedWalletSubprovider({
            getAccounts: function(cb){
                cb(null, [ myWallet.getAddressString()]);
            },
            getPrivateKey: function(address, cb){
                if (address !== myWallet.getAddressString()) {
                    cb(new Error('Account not found'))
                } else {
                    cb(null, myWallet.getPrivateKey())
                }
            }
        }));
        engine.addProvider(new WsSubprovider({rpcUrl:  PurchaseService.networks[localStorage.getItem('netWorkId')].wss}));
        engine.start();
        return   { engine: engine, web3 : new Web3(engine), wallet: myWallet }
    };
}