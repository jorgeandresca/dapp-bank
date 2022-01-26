import { tokens, ether, ETHER_ADDRESS, EVM_REVERT, wait } from './helpers'

const Token = artifacts.require('./Token')
const DecentralizedBank = artifacts.require('./Bank')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('bankContract', ([deployer, user]) => {
    let bankContract, tokenContract;
    const interestPerSecond = 31668017; //(10% APY) for min. deposit (0.01 ETH)

    beforeEach(async () => {
        tokenContract = await Token.new();
        bankContract = await DecentralizedBank.new(tokenContract.address);
        await tokenContract.passMinterRole(bankContract.address, { from: deployer });
    })

    describe('testing token contract...', () => {
        describe('success', () => {
            it('checking token name', async () => {
                expect(await tokenContract.name()).to.be.eq('Koins')
            })

            it('checking token symbol', async () => {
                expect(await tokenContract.symbol()).to.be.eq('KNS')
            })

            it('checking token initial total supply', async () => {
                expect(Number(await tokenContract.totalSupply())).to.eq(0)
            })

            it('bankContract should have Token minter role', async () => {
                expect(await tokenContract.minter()).to.eq(bankContract.address)
            })
        })

        describe('failure', () => {
            it('passing minter role should be rejected. Only the Bank can do it', async () => {
                await tokenContract.passMinterRole(user, { from: deployer }).should.be.rejectedWith(EVM_REVERT)
            })

            it('tokens minting should be rejected. Only the bank can do it.', async () => {
                await tokenContract.mint(user, '1', { from: deployer }).should.be.rejectedWith(EVM_REVERT) //unauthorized minter
            })
        })
    })

    describe('testing deposit...', () => {

        describe('success', () => {
            beforeEach(async () => {
                await bankContract.deposit({ value: 10 ** 16, from: user }) //0.01 ETH
            })

            it('balance should increase', async () => {
                expect(Number(await bankContract.etherBalanceOf(user))).to.eq(10 ** 16)
            })

            it('deposit time should > 0', async () => {
                expect(Number(await bankContract.depositStart(user))).to.be.above(0)
            })

            it('deposit status should eq true', async () => {
                expect(await bankContract.isDeposited(user)).to.eq(true)
            })
        })

        describe('failure', () => {
            beforeEach(async () => {
                await bankContract.deposit({ value: 10 ** 16, from: user }) //0.01 ETH
            })

            it('depositing small amount should be rejected', async () => {
                await bankContract.deposit({ value: 10 ** 13, from: user }).should.be.rejectedWith(EVM_REVERT) //too small amount
            })
        })
    })

    describe('testing withdraw...', () => {
        let balance

        describe('success', () => {

            beforeEach(async () => {
                await bankContract.deposit({ value: 10 ** 16, from: user }) //0.01 ETH

                await wait(2) //accruing interest

                balance = await web3.eth.getBalance(user)
                await bankContract.withdraw({ from: user })
            })

            it('balances should decrease', async () => {
                expect(Number(await web3.eth.getBalance(bankContract.address))).to.eq(0) // Balance of user in his wallet
                expect(Number(await bankContract.etherBalanceOf(user))).to.eq(0) // Balance of user in the bank
            })

            it('user should receive ether back', async () => {
                expect(Number(await web3.eth.getBalance(user))).to.be.above(Number(balance))
            })

            it('user should receive proper amount of interest', async () => {
                //time synchronization problem make us check the 1-3s range for 2s deposit time
                balance = Number(await tokenContract.balanceOf(user))
                expect(balance).to.be.above(0)
                expect(balance % interestPerSecond).to.eq(0)
                expect(balance).to.be.below(interestPerSecond * 4)
            })

            it('depositer data should be reseted', async () => {
                expect(Number(await bankContract.depositStart(user))).to.eq(0)
                expect(Number(await bankContract.etherBalanceOf(user))).to.eq(0)
                expect(await bankContract.isDeposited(user)).to.eq(false)
            })
        })

        describe('failure', () => {
            it('withdrawing should be rejected', async () => {
                await bankContract.deposit({ value: 10 ** 16, from: user }) //0.01 ETH
                await wait(2) //accruing interest
                await bankContract.withdraw({ from: deployer }).should.be.rejectedWith(EVM_REVERT) //wrong user
            })
        })
    })


    describe('testing swap...', () => {

        let balance;
        beforeEach(async () => {
            await bankContract.swapETHtoKNS({ value: 10 ** 18, from: user }) //0.01 ETH
        })

        describe('success', () => {
            it('balance should increase', async () => {
                balance = await bankContract.getKoinsBalanceOf(user)
                expect(Number(balance)).to.be.above(0)
            })

        })

    });

})