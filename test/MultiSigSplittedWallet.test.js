const MultiSigSplittedWallet = artifacts.require('MultiSigSplittedWallet');

const moneyOwners = {
    BORIZ: {
      acc: null,
      shares: 60
    },
    MICHA: {
      acc: null,
      shares: 30
    },
    VOVA: {
      acc: null,
      shares: 10
    }
  }

const moneyShares = [
    moneyOwners.BORIZ.shares,
    moneyOwners.MICHA.shares,
    moneyOwners.VOVA.shares
]

const ownerAccounts = [];

let multiSigWallet = null;
let potentialInvestorAddr = null;
const amountOfEther = 50;
contract('MultiSigSplittedWallet contract', () => {
    before(async () => {
        const accounts = await web3.eth.getAccounts();
        moneyOwners.BORIZ.acc = accounts[4];
        moneyOwners.MICHA.acc = accounts[5];
        moneyOwners.VOVA.acc = accounts[6];

        potentialInvestorAddr = accounts[7];

        ownerAccounts.push(moneyOwners.BORIZ.acc);
        ownerAccounts.push(moneyOwners.MICHA.acc);
        ownerAccounts.push(moneyOwners.VOVA.acc);

        multiSigWallet = await MultiSigSplittedWallet.new(
            ownerAccounts,
            moneyShares,
        );

        //send 50 ether to wallet for test    
        const bnAmount = web3.utils.toBN(amountOfEther);
        const amoutInWEI = web3.utils.toWei(bnAmount, 'ether');
        await web3.eth.sendTransaction({from:potentialInvestorAddr,to:multiSigWallet.address, value:amoutInWEI});
    });

    describe("Wallet fields test", () => {
        it("Each user in contract is signer", async () => {
          for(let i = 0; i < ownerAccounts.length; i++) {
            const address = ownerAccounts[i];
            const isSigner = await multiSigWallet.isSigner(address);
            assert.equal(isSigner, true);
          }
        });

        it("Owners should have correct doles", async () => {
          for(let [key, value] of Object.entries(moneyOwners)) {
            const owner = moneyOwners[key];
            const shares = owner.shares;
            const shareByContract = await multiSigWallet.shares(owner.acc);
            const shareNumber = Number(shareByContract);
            assert.equal(shares, shareNumber);
          }
        });

        it("Required count should be equal to owners count", async () => {
          const requirementsCount = await multiSigWallet.required();
          const num = Number(requirementsCount);
          assert.equal(ownerAccounts.length, num);
        });

        it("Start balance should be initialized", async () => {
          const neededBalance = web3.utils.toBN(amountOfEther);
          const neededBalanceWei = web3.utils.toWei(neededBalance, 'ether');
          const balanceOfWallet = await multiSigWallet.getBalance();
          const numBalance = Number(balanceOfWallet);
          const numNeededBalance = Number(neededBalanceWei);
          assert.equal(numBalance, numNeededBalance);
        });

        it("Should have zero transactions before", async () => {
          const currentTransactions = await multiSigWallet.transactionCount();
          assert.equal(Number(currentTransactions), 0);
        });
    });

    describe("Signed wallet functions testing", () => {
      it('Should increase transaction count', async () => {
        await multiSigWallet.submitTransaction(moneyOwners.BORIZ.acc, {from: moneyOwners.BORIZ.acc});
        const currentTransactions = await multiSigWallet.transactionCount();
        assert.equal(Number(currentTransactions), 1);
      });
      it('Should have new transaction', async () => {  
        const transaction = await multiSigWallet.transactions(0);
        assert.equal(transaction.destination, moneyOwners.BORIZ.acc);
        assert.equal(transaction.executed, false);
      });
      it('Should not increase balance', async () => {
        const basicBorizBalance = 100; //100 is basic
        const borizWeiBalanceNowWei = await web3.eth.getBalance(moneyOwners.BORIZ.acc);
        const borizBalananceAfterEth = web3.utils.fromWei(borizWeiBalanceNowWei);
        console.log(`Boriz balance before confirm: ${borizBalananceAfterEth} ETH`);
        assert.equal(borizBalananceAfterEth > basicBorizBalance, false);
      });

      it('Should not executed before confirms', async () => {
        try {
          await multiSigWallet.executeTransaction(0, {from: moneyOwners.BORIZ.acc});
          assert.ok(false);     
        } catch(err) {
          assert.ok(true, err.message);   
        }
      });

      it('Should confirms', async () => {
        try {
          await multiSigWallet.confirmTransaction(0, {from: moneyOwners.MICHA.acc});
          await multiSigWallet.confirmTransaction(0, {from: moneyOwners.VOVA.acc});

          const borizConfirm = await multiSigWallet.confirmations(0,moneyOwners.BORIZ.acc);
          const vovaConfirm = await multiSigWallet.confirmations(0,moneyOwners.VOVA.acc);
          const michaConfirm = await multiSigWallet.confirmations(0,moneyOwners.MICHA.acc);
          
          assert.equal(borizConfirm, true);
          assert.equal(vovaConfirm, true);
          assert.equal(michaConfirm, true);
        } catch(err) {
          assert.ok(false, err.message);   
        }
      });

      it('Should boost boris balance after confirm', async () => {
        const basicBorizBalance = 100; //100 is basic
        const borizWeiBalanceNowWei = await web3.eth.getBalance(moneyOwners.BORIZ.acc);
        const borizBalananceAfterEth = web3.utils.fromWei(borizWeiBalanceNowWei);
        console.log(`Boriz balance after confirm: ${borizBalananceAfterEth} ETH`);
        assert.equal(borizBalananceAfterEth > basicBorizBalance, true);
      });

    });
});