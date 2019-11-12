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

contract('MultiSigSplittedWallet contract', () => {
    before(async () => {
        const accounts = await web3.eth.getAccounts();
        moneyOwners.BORIZ.acc = accounts[4];
        moneyOwners.MICHA.acc = accounts[5];
        moneyOwners.VOVA.acc = accounts[6];

        ownerAccounts.push(moneyOwners.BORIZ.acc);
        ownerAccounts.push(moneyOwners.MICHA.acc);
        ownerAccounts.push(moneyOwners.VOVA.acc);

        multiSigWallet = await MultiSigSplittedWallet.new(
            ownerAccounts,
            moneyShares,
        );
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
    });
});