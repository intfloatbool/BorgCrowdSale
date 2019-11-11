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

contract('MultiSigSplittedWallet', () => {
    before(async () => {
        const accounts = await web3.eth.getAccounts();
        moneyOwners.BORIZ.acc = accounts[4];
        moneyOwners.MICHA.acc = accounts[5];
        moneyOwners.VOVA.acc = accounts[6];

        ownerAccounts.push(moneyOwners.BORIZ.acc);
        ownerAccounts.push(moneyOwners.MICHA.acc);
        ownerAccounts.push(moneyOwners.VOVA.acc);

        multiSigWallet = MultiSigSplittedWallet.new(
            ownerAccounts,
            moneyShares
        );
    });

    describe("Wallet fields test", () => {
        it("Should each user as signer", async () => {
            for(let i = 0; i < ownerAccounts.length; i++) {
              const acc = ownerAccounts[i];
              const isSigner = await multiSigWallet.isSigner(acc);
              asssert.equal(isSigner, true);
            }
        });
    });
});