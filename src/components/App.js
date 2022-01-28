import { Tabs, Tab } from 'react-bootstrap'
import React, { Component } from 'react';
import Token from '../abis/Token.json'
import Bank from '../abis/Bank.json'
import logo_image from '../logo.png';
import Web3 from 'web3';
import Tools from '../Tools'

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {

    async componentWillMount() {
        

        await this.loadBlockchainData(this.props.dispatch)
    }


    async loadBlockchainData(dispatch) {
        let web3;

        //check if MetaMask exists
        if (typeof window.ethereum === 'undefined') {
            this.setState({ errMessage: 'Please install MetaMask' })
            return;
        }

        web3 = new Web3(window.ethereum);
        window.web3 = web3;

        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];

        if (!account) {
            await window.ethereum.enable(); // This line opens up metamask popup
            await this.loadBlockchainData();
            return;
        }

        // Sleep 1 second
        await (new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, 300)
        }));

        const networkId = await web3.eth.net.getId()
        const balance_wei = await web3.eth.getBalance(account);

        let balance_eth = await web3.utils.fromWei(balance_wei, 'ether')
        balance_eth = parseFloat(balance_eth).toFixed(1);

        try {
            console.log(Token.networks[networkId])
            if (Token.networks[networkId] === undefined) {
                this.setState({ errMessage: "Contract not deployed in this network" })
                return;
            }
            // Token
            const tokenContract = new web3.eth.Contract(Token.abi, Token.networks[networkId].address);

            const tokenAddress = Token.networks[networkId].address;

            // Bank
            const bankContract = new web3.eth.Contract(Bank.abi, Bank.networks[networkId].address);

            const bankAddress = Bank.networks[networkId].address;

            const [gasPrice_wei, gasPrice_gwei, gasPrice_eth] = await this.getGasPrice(web3);

            const gasLimit = await this.getGasLimit(web3);

            const ethToKnsConversion = await bankContract.methods
                .ethToKnsConversion().call();

            let balance_kns = await tokenContract.methods
                .balanceOf(account).call();
            balance_kns = web3.utils.fromWei(balance_kns, 'ether');

            let bankBalance = (await web3.eth.getBalance(bankAddress)).toString();
            bankBalance = web3.utils.fromWei(bankBalance, 'ether')

            let bankUserBalance = await bankContract.methods
                .etherBalanceOf(account).call();
            bankUserBalance = web3.utils.fromWei(bankUserBalance, 'ether')


            this.setState({
                web3,
                account,
                balance_wei,
                balance_eth,
                balance_kns,
                gasPrice_wei,
                gasPrice_gwei,
                gasPrice_eth,
                gasLimit,
                tokenContract,
                tokenAddress,
                bankContract,
                bankAddress,
                bankBalance,
                bankUserBalance,
                ethToKnsConversion,
                swapReceive: "___",
                errMessage: ""
            });


        }
        catch (err) {
            console.log(err)
            this.setState({ errMessage: err.message })
            return;
        }
    }

    async getGasPrice(web3) {

        const gasPrice_wei = await web3.eth.getGasPrice();
        const gasPrice_eth = web3.utils.fromWei(gasPrice_wei, 'ether');
        const gasPrice_gwei = web3.utils.fromWei(gasPrice_wei, 'gwei');

        return [gasPrice_wei, gasPrice_gwei, gasPrice_eth];

    }

    async getGasLimit(web3) {
        const latestBlock = await web3.eth.getBlock("latest");

        return latestBlock.gasLimit;
    }

    async depositOnClick(amount_wei) {
        if (this.state.bankContract === 'undefined' || this.state.bankContract === null) {
            console.log("Bank contract: " + this.state.bankContract)
            this.setState({ errMessage: "Bank contract: " + this.state.bankContract })
            return;
        }
        try {

            const bankContract = this.state.bankContract;

            await bankContract.methods
                .deposit()
                .send({
                    value: amount_wei.toString(),
                    from: this.state.account,
                    gasPrice: this.state.gasPrice_wei,
                    gas: this.state.gasLimit // Gas limit
                },
                    async (error, receipt) => {

                        console.log("error: ")
                        console.log(error)
                        console.log("receipt: ")
                        console.log(receipt)

                        if (!error)
                            await this.reset();
                    })
                .catch(err => {
                    let errMessage = err.message;

                    if (errMessage.includes("[ethjs-query] while formatting outputs from RPC '")) {
                        errMessage = errMessage.replace("[ethjs-query] while formatting outputs from RPC '", "");
                        errMessage = errMessage.replace("'", "");

                    }
                    const errMessage_json = JSON.parse(errMessage);
                    console.log(errMessage_json.value.data.message)
                    this.setState({ errMessage: errMessage_json.value.data.message })
                })
        }
        catch (err) {
            console.log(err)
            this.setState({ errMessage: err.message })
        }
    }

    async withdrawOnClick(e) {
        if (this.state.bankContract === 'undefined') return;

        try {
            await this.state.bankContract.methods.withdraw()
                .send({ from: this.state.account },
                    async (error, receipt) => {

                        console.log("error: ")
                        console.log(error)
                        console.log("receipt: ")
                        console.log(receipt)

                        if (!error)
                            await this.reset();
                    });
        }
        catch (err) {
            this.setState({ errMessage: 'Error when withdrawing' })
        }
    }

    async swapOnClick(e) {
        if (this.state.bankContract === 'undefined') return;

        const amountSwap_wei = this.state.web3.utils.toWei(this.swapAmount.value, 'ether');
        console.log(amountSwap_wei)
        try {
            await this.state.bankContract.methods
                .swapETHtoKNS()
                .send({
                    from: this.state.account,
                    value: amountSwap_wei.toString()
                }, async (error, receipt) => {

                    console.log("error: ")
                    console.log(error)
                    console.log("receipt: ")
                    console.log(receipt)
                    if (!error)
                        await this.reset();

                })
        }
        catch (err) {
            console.log(err)
            this.setState({ errMessage: "Error when swapping" })
        }
    }

    async reset() {
        this.swapAmount.value = "";
        this.depositAmount.value = "";

        this.setState({
            balance_eth: 0
        });

        await this.loadBlockchainData();
    }

    swapAmountOnChange() {
        const swapReceive = this.swapAmount.value * this.state.ethToKnsConversion;
        this.setState({ swapReceive });
    }

    constructor(props) {
        super(props)
        this.state = {
            web3: 'undefined',
            account: '',
            tokenContract: null,
            bankContract: null,
            balance_wei: 0,
            balance_eth: 0,
            BankAddress: null
        }
    }

    render() {
        return (
            <div className='text-monospace'>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                    <a
                        className="navbar-brand col-sm-3 col-md-2 mr-0"
                    >
                        <img src={logo_image} className="App-logo" alt="logo" height="32" />
                        <b>   Kobai Bank</b>
                    </a>
                </nav>
                <div className="container-fluid mt-5 text-center">
                    <br></br>
                    <h1>Welcome to Kobai Bank</h1>
                    <h4>{this.state.account}</h4>

                    <h5>Balance:
                        {this.state.balance_eth ?
                            " " + Tools.thousandSeparator(this.state.balance_eth) : "..."} ETH |
                        {this.state.balance_kns ?
                            " " + Tools.thousandSeparator(this.state.balance_kns) : "..."} KNS</h5>
                    <br></br>
                    <h5>Bank balance: {this.state.bankBalance} ETH</h5>
                    <h5>User balance (Bank): {this.state.bankUserBalance} ETH</h5>
                    <br></br>
                    <h5>Gas price: {this.state.gasPrice_gwei} Gwei</h5>
                    <h5>Gas limit: {this.state.gasLimit ? Tools.thousandSeparator(this.state.gasLimit) : "0"}</h5>
                    <h5>Gas fee estimated: {this.state.gasLimit * this.state.gasPrice_eth} ETH</h5>
                    <br></br>
                    <h3>1 Ether = {this.state.ethToKnsConversion ? Tools.thousandSeparator(this.state.ethToKnsConversion) : "___"} Koins</h3>
                    <br></br>
                    <div className="row">
                        <main role="main" className="col-lg-12 d-flex text-center">
                            <div className="content mr-auto ml-auto mw-50 p-3">
                                <div>
                                    <h4 className="text-danger">{this.state.errMessage}</h4>
                                    <br></br>
                                </div>
                                <Tabs defaultActiveKey="swap" id="uncontrolled-tab-example">
                                    <Tab eventKey="deposit" title="Deposit">
                                        <div>
                                            <br></br>
                                            How much do you want to deposit?
                                            <br></br>
                                            (min. amount is 0.01 ETH)
                                            <br></br>
                                            (1 deposit is possible at the time)
                                            <br></br>
                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                const amount_eth = this.depositAmount.value;
                                                const amount_wei = window.web3.utils.toWei(amount_eth, 'ether');

                                                this.depositOnClick(amount_wei);
                                            }}>
                                                <div className="form-group mr-sm-2">
                                                    <br></br>
                                                    <input
                                                        id="deposit"
                                                        step="0.01"
                                                        type="number"
                                                        className="form-control form-control-md"
                                                        placeholder="amount..."
                                                        required
                                                        ref={(input) => { this.depositAmount = input }}
                                                    />
                                                </div>
                                                <button type='submit' className="btn btn-primary">DEPOSIT</button>
                                            </form>
                                        </div>
                                    </Tab>
                                    <Tab eventKey="withdraw" title="Withdraw">
                                        <div>
                                            <br></br>
                                            Do you want to withdraw + take interest?
                                            <br></br>
                                            <br></br>
                                            <button
                                                type='submit'
                                                className="btn btn-primary"
                                                onClick={(e) => this.withdrawOnClick(e)}
                                            >WITHDRAW</button>
                                        </div>
                                    </Tab>
                                    <Tab eventKey="swap" title="Swap">
                                        <div>
                                            <br></br>
                                            How much do you want to Swap?
                                            <br></br>
                                            <div className="form-group mr-sm-2">
                                                <br></br>
                                                <input
                                                    id="swap_amount"
                                                    step="0.01"
                                                    type="number"
                                                    className="form-control form-control-md"
                                                    placeholder="amount ETH..."
                                                    required
                                                    onChange={() => this.swapAmountOnChange()}
                                                    ref={(input) => { this.swapAmount = input }}
                                                />

                                                <br></br>
                                                <h4>Vas a recibir</h4>
                                                <h3> {this.state.swapReceive ? Tools.thousandSeparator(this.state.swapReceive) : "___"} Koins</h3>
                                            </div>
                                            <button
                                                type='submit'
                                                className="btn btn-primary"
                                                onClick={(e) => this.swapOnClick(e)}
                                            >SWAP</button>
                                        </div>
                                    </Tab>
                                </Tabs>
                            </div>
                        </main>
                    </div>
                    <div>
                        <br></br>
                        <br></br>
                        <br></br>
                        <h5>Token address: {this.state.tokenAddress}</h5>
                        <br></br>
                        <br></br>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;