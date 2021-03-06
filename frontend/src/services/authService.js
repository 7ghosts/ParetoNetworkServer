import Web3 from 'web3';
import Sig from 'eth-sig-util';
import qs from 'qs';
import http from './HttpService';
import profileService from './profileService';
import errorService from './errorService';
//import ledger from "ledgerco";

/* eslint-disable no-console */
let logged = false;
export default class authService {
    constructor() {
        this._isLogged = true;
    }

    static timer = null;
    static isLedgerWatched = false;
    static ledgerWalletSubProvider = null;
    static ledgerNanoProvider = null;
    static ledgerNanoEngine = null;
    static actualConnection = null;


    static getIsLogged() {
        return logged;
    }

    static logout(onSuccess, onError) {
        http.post('/v1/unsign').then(res => {
            if(res.data.success){
                logged = false;
                onSuccess(res.data.data);
            }else{
                onError(errorService.sendErrorMessage('f11', res.data.message));
            }
        }).catch(error => {
            onError(errorService.sendErrorMessage('f11', error));
        });
    }

    static auth(onSuccess, onError) {
        http.get('/v1/auth', {
            dataType: 'json'
        }).then(res => {
            if(res.data.success){
              return onSuccess(res.data.data);
            }else{
              //const errorInvok = errorService.sendErrorMessage('f12', res.data.message);
              return onError('');
            }
        }).catch(error => {
            //const errorInvok = errorService.sendErrorMessage('f12', error);
            return onError('');
        });
        try {
            profileService.updateConfig();
        }catch (e) {
            console.log(e)
        }
    }

    static signParetoServer(msgParams, from, result, onSuccess, onError){
        let jsonData = {
            data: msgParams,
            owner: from,
            result: result
        };

        http.post('/v1/sign', qs.stringify(jsonData), {
            headers: {
                'accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        }).then(response => {
            if(response.data.success){
                logged = true;
                return onSuccess(from);
            }else{
                errorService.sendErrorMessage('f2', response.data.message)
                return onError(response.data.message);
            }

        }).catch(error => {
            if (error.response && error.response.data) {
                return onError(errorService.sendErrorMessage('f2', error.response.data.message));
            } else {
                return onError(error);
            }

        });
    }

    static manualLogin(address, message, signed, onSuccess, onError){
        try{
            const msgParams = [
                {
                    type: 'string',
                    name: 'Message',
                    value: message //replace with TOS
                }
            ];
            authService.signParetoServer(msgParams, address, signed, onSuccess, onError)
        }catch (e) {
            onError(e);
        }
    }

    static isWalletSupported(onSuccess, onError) {
        this.initLedgerNano(()=>{onSuccess(true)}, onError);
    }

    static doWhenIsConnected(onSuccess) {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.timer = setTimeout(() => {
            this.getWalletAccounts("44'/60'/0'/0/0", 0, 1, data => {
                onSuccess();
            }, error => {
                if(this.isLedgerWatched){
                    this.doWhenIsConnected(onSuccess)
                }
            });

        }, 1000);
    }

    static deleteWatchNano() {
        this.isLedgerWatched = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if(this.ledgerWalletSubProvider && this.ledgerWalletSubProvider.ledger){
            this.ledgerWalletSubProvider.ledger.connectionOpened =false
            if(this.actualConnection){
                this.ledgerWalletSubProvider.ledger.closeLedgerConnection(this.actualConnection);
            }
        }
    }

    static initLedgerNano(onSuccess, onError){
        if( !this.ledgerNanoProvider || !this.ledgerWalletSubProvider){

            //let LedgerWalletSubproviderFactory = require('ledger-wallet-provider').default;

            LedgerWalletSubproviderFactory().then(ledgerWalletSubProvider=>{
                this.ledgerWalletSubProvider = ledgerWalletSubProvider;

                this.ledgerNanoProvider = new Web3(ledgerWalletSubProvider);
         //       this.ledgerNanoEngine.addProvider(ledgerWalletSubProvider);
         //       this.ledgerNanoEngine.addProvider(new RpcSubprovider({rpcUrl: 'https://ropsten.infura.io/QWMgExFuGzhpu2jUr6Pq'})); // you need RPC endpoint
           //     this.ledgerNanoEngine.start();
                const isSupported = ledgerWalletSubProvider.isSupported;
                if(isSupported){
                     onSuccess();
                }else{
                    onError('Your browser does not support this feature');
                }

            });
        }else{
            onSuccess()
        }
    }

    static getWalletAccounts(path, page, limit, onSuccess, onError) {
        this.initLedgerNano(()=>{
            this.ledgerWalletSubProvider.ledger.getMultipleAccounts(path, page, limit)
                .then(res => onSuccess(res))
                .catch(err =>  { onError(err)});
        }, error => {
            onError(errorService.sendErrorMessage('f4', error))
        });

        return true;
    }

    static getTokens(addresses, onSuccess, onError){
        const data = {
            addresses:  addresses
        };
        http.post('/v1/addresses', data , {
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json; charset=UTF-8'
            }
        }).then(response => {
            if(response.data.success){
                return onSuccess(response.data);
            }else{
                return onError(errorService.sendErrorMessage('f13', response.data.message));
            }

        }).catch(error => {
            if (error.response && error.response.data) {
                return onError(errorService.sendErrorMessage('f13', error.data.message));
            } else {
                return onError(errorService.sendErrorMessage('f13', error));
            }

        });
    }

    static  signWallet(pathId, addr, onSuccess, onError) {
        this.initLedgerNano(()=>{
            const msgParams = [
                {
                    type: 'string',
                    name: 'Message',
                    value: 'Pareto Network' //replace with TOS
                }
            ];
            this.ledgerWalletSubProvider.ledger.setDerivationPath(pathId);
            if (this.ledgerNanoProvider.utils.isAddress(addr)) {
                const from = addr.toLowerCase();
                this.ledgerWalletSubProvider.ledger.getLedgerConnection = async function() {
                    if (this.connectionOpened) {
                        throw new Error(
                            "You can only have one ledger connection active at a time"
                        );
                    } else {
                        this.connectionOpened = true;
                        // eslint-disable-next-line new-cap
                        authService.actualConnection = new ledger.eth(
                            this.isNode
                                ? await ledger.comm_node.create_async()
                                : await ledger.comm_u2f.create_async(30)
                        );
                        return  authService.actualConnection;
                    }
                };
                this.ledgerWalletSubProvider.ledger.signMessage({data:  this.ledgerNanoProvider.utils.toHex('Pareto Network')}, (err, result) => {
                    if (err) {
                        if(err.metaData.code ===5){
                           return  authService.signWallet(pathId, addr, onSuccess, onError)
                        }else{
                           return  onError(err.message);
                        }
                    }
                    if(!result){
                        return onError('Connection lost');
                    }
                    if (result.error) {
                        return onError('Please login into MetaMask (or other Web3 browser) in order to access the Pareto Network');
                    }

                    const recovered = Sig.recoverPersonalSignature({data: 'Pareto Network', sig: result});

                    if (recovered === from) {
                        authService.signParetoServer(msgParams, from, result, onSuccess, onError)

                    } else {
                        console.log('Failed to verify signer when comparing ' + result + ' to ' + from);
                        // stopLoading();
                        return onError('Failed to verify signer when comparing ' + result + ' to ' + from);
                    }

                });

            }//end if valid address
            else {
                console.log('address invalid!');
                return onError('Please login into MetaMask (or other web3 browser) in order to access the Pareto Network');

                //set error state on input field
            }
        }, error => {
            onError('f14', error);
        });


        return true;
    }


    static  onMetamaskAccess() {
        return  new Promise( async (resolve, reject)=>{
            if (window.ethereum) {
                window.web3 = new Web3(ethereum);
                try {
                    await ethereum.enable();
                    resolve(window.web3)
                } catch (error) {
                    reject(error)
                }
            } else {
                resolve(window.web3)
            }
        })
    }

    static signSplash(onSuccess, onError) {
       authService.onMetamaskAccess().then( function (web3){
           let provider;
           const version = window.localStorage.getItem('psignversion');
           const network = window.localStorage.getItem('netWorkId');
           const contractAddress = window.localStorage.getItem('paretoAddress');

           if (typeof web3 !== 'undefined') {
               // Use Mist/MetaMask's provider
               provider = new Web3(web3.currentProvider);
           } else {
               console.log('No web3? You should consider trying MetaMask!');
               onError('Please install MetaMask (or other web3 browser) in order to access the Pareto Network');


               // searchLookup();
               // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
               provider = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/QWMgExFuGzhpu2jUr6Pq'));
           }
           if (typeof provider !== 'undefined') {

               // const contractAddr = ('0xea5f88E54d982Cbb0c441cde4E79bC305e5b43Bc');
               // const rankCalculation = 0;
               // const tokenTotal = 0;
               /*if (!metaMask.currentProvider.isMetaMask) { //no mobile users use Metamask, this is too strict

                   return onError('Please install MetaMask in order to access the Pareto Network');
               }*/

               provider.eth.getAccounts((error, accounts) => {
                   if (!error) {
                       if(accounts && accounts[0]){
                           //console.log(accounts);

                           const addr = accounts[0];


                           if (provider.utils.isAddress(addr)) {
                               const from = addr.toLowerCase();

                               // const params = [provider.utils.toHex('Pareto'), from];
                               //  const method = 'personal_sign';
                               let msgParams = {
                                   types: {
                                       EIP712Domain: [
                                           { name: 'name',    type: 'string'  },
                                           { name: 'version', type: 'string' },
                                           { name: 'chainId', type: 'uint256' },
                                           { name: 'verifyingContract', type: 'address' }
                                       ],
                                       CustomType: [
                                           { name: 'message',   type: 'string' }
                                       ],
                                   },
                                   primaryType: 'CustomType',
                                   domain: {
                                       name:    'Pareto Network',
                                       version: version.toString(),
                                       chainId: parseInt(network),
                                       verifyingContract: contractAddress
                                   },
                                   message: {
                                       message: 'Pareto Network'
                                   }
                               };
                               let params = [ from, JSON.stringify(msgParams)];
                               let method = 'eth_signTypedData_v3';
                               let versionMethod = 'v3';
                               // debugger;

                               const resultfunction = function(versionMethod, msgParams, err, result){
                                   if (err) return console.dir(err);
                                   if (result.error) {
                                       return onError('Please login into MetaMask (or other Web3 browser) in order to access the Pareto Network');
                                   }
                                   if (result.error) {
                                       return console.error(result);
                                   }
                                   result = result.result;
                                   let  recovered = '';
                                   if(versionMethod === 'v3') {
                                       recovered = Sig.recoverTypedSignature({data: msgParams, sig: result});
                                   }else{
                                       recovered = Sig.recoverTypedSignatureLegacy({data: msgParams, sig: result});
                                   }

                                   if (recovered === from) {
                                       if(versionMethod === 'v3'){
                                           msgParams = [
                                               {
                                                   type: 'string',
                                                   name: 'Message',
                                                   value: 'Pareto Network' //replace with TOS
                                               }
                                           ];
                                       }

                                       authService.signParetoServer(msgParams, from, result, onSuccess, onError)

                                   } else {
                                       console.log('Failed to verify signer when comparing ' + result + ' to ' + from);
                                       // stopLoading();
                                       return onError('Failed to verify signer when comparing ' + result + ' to ' + from);
                                   }
                               }
                               try{
                                   provider.currentProvider.sendAsync({method,params,from}, (err, result) => {
                                       if(err || result.error){
                                           if(result && result.error.message.indexOf("User denied message signature") >-1 ){
                                               return;
                                           }
                                           method = 'eth_signTypedData';
                                           versionMethod = 'v1';
                                           const msgParams = [
                                               {
                                                   type: 'string',
                                                   name: 'Message',
                                                   value: 'Pareto Network' //replace with TOS
                                               }
                                           ];
                                           const params = [msgParams,from];
                                           provider.currentProvider.sendAsync({method,params, from}, (err, result) => {
                                               if(result && result.error.message.indexOf("User denied message signature") >-1 ){
                                                   return;
                                               }
                                               resultfunction( versionMethod, msgParams,err, result)
                                           });
                                       }else{
                                           resultfunction( versionMethod, msgParams,null, result);
                                       }
                                   })
                               }catch (e) {
                                   method = 'eth_signTypedData';
                                   versionMethod = 'v1';
                                   msgParams = [
                                       {
                                           type: 'string',
                                           name: 'Message',
                                           value: 'Pareto Network' //replace with TOS
                                       }
                                   ];
                                   params = [msgParams,from];
                                   provider.currentProvider.sendAsync({method,params, from}, (err, result) => {
                                       if(result && result.error.message.indexOf("User denied message signature") >-1 ){
                                           return;
                                       }
                                       resultfunction( versionMethod, msgParams,err, result)
                                   });
                               }
                           }//end if valid address
                           else {
                               console.log('address invalid!');
                               return onError('Please login into MetaMask (or other web3 browser) in order to access the Pareto Network');
                               //set error state on input field
                           }
                       }else{
                           return onError('Please login into MetaMask (or other web3 browser) in order to access the Pareto Network');
                       }
                       //end if !error

                   }//end if !error
               });
           }//end if
       }).catch(err=>{
           return onError(err);
       })
    }

    static postSign(onSuccess, onError) {
        http.get('/v1/userinfo?latest=true', { withCredentials: true}).then(res => {
            if(res.data.success){
                onSuccess(res.data.data);
            }else{
                onError(res.data.message);
            }
        }).catch(error => {
            onError(error);
        });
    }
}

