const ether = require('./helpers/ether');
const BorgToken = artifacts.require('BorgTokenMintable');
const BorgTokenCrowdsale = artifacts.require('BorgTokensCrowdsale');
const WalletSplitter = artifacts.require('WalletSplitter');
//@ Args
// '_' - creator account
// 'wallet' - wallet for crowdsale
// 'inverstor 1/2' - accounts of investors
contract('TokenCrowd sale', function([_, wallet, investor1, investor2]) {
  //console.log(`Contract args: \n ${_} \n ${wallet} \n ${investor1} ${investor2}`);
  beforeEach(async function() {

    //accounts
    this.accounts = await web3.eth.getAccounts();
    this.moneyOwners = {
      BORIZ: {
        acc: this.accounts[4],
        shares: 60
      },
      MICHA: {
        acc: this.accounts[5],
        shares: 30
      },
      VOVA: {
        acc: this.accounts[6],
        shares: 10
      }
    }

    // Token config
    this.name = "Borg";
    this.symbol = "BRG";
    this.decimals = 18;  
    // Deploy Token
    this.token = await BorgToken.new(
      this.name,
      this.symbol,
      this.decimals
    );
    
    //Initialize wallet splitter to split payments between owners
    this.walletOwners = [
      this.moneyOwners.BORIZ.acc,
      this.moneyOwners.MICHA.acc,
      this.moneyOwners.VOVA.acc
    ];

    this.ownersShares = [
      this.moneyOwners.BORIZ.shares,
      this.moneyOwners.MICHA.shares,
      this.moneyOwners.VOVA.shares
    ]

    this.walletSplitter = await WalletSplitter.new(
      this.walletOwners,
      this.ownersShares
    );

    // Crowdsale config
    this.rate = 1;
    this.wallet = wallet;

    this.crowdsale = await BorgTokenCrowdsale.new(
      this.rate,
      this.wallet,
      this.token.address
    );

    //Show minters
    const isAcc1Minter = await this.token.isMinter(_); //true < acc1 is minter !!
    const isInvestor1Minter = await this.token.isMinter(investor1); //false
    const isInvestor2Minter = await this.token.isMinter(investor2); //false
    const minters = [
      isAcc1Minter,
      isInvestor1Minter,
      isInvestor2Minter
    ]
    //console.log(`Coin minters? : \n ${minters}`);
    
    //ADD crowdsale contract as minter to Token!:
    await this.token.addMinter(this.crowdsale.address);
  });

  describe('Money splitter check values', function() {

    it('Should have correct payeer value for BORIZ', async function() {
      const borizAddress = await this.walletSplitter.payee(0);
      assert.equal(borizAddress, this.moneyOwners.BORIZ.acc);
    });
    it('Should have correct payeer value for MICHA', async function() {
      const borizAddress = await this.walletSplitter.payee(1);
      assert.equal(borizAddress, this.moneyOwners.MICHA.acc);
    });
    it('Should have correct payeer value for B0BA', async function() {
      const borizAddress = await this.walletSplitter.payee(2);
      assert.equal(borizAddress, this.moneyOwners.VOVA.acc);
    });

  });

  describe('crowdsale properties', function() {
    it('tracks the rate', async function() {
      const rate = await this.crowdsale.rate();
      console.log(`Rate: ${rate}, type of rate: ${typeof(rate)}`)
      assert.equal(rate, this.rate);
    });

    it('tracks the wallet', async function() {
      const wallet = await this.crowdsale.wallet();
      assert.equal(wallet, this.wallet);
    });

    it('tracks the token', async function() {
      const token = await this.crowdsale.token();
      assert.equal(token, this.token.address);
    });
  });

  describe('tokens sale tests', function() {
    it('balance of investor should be updated ', async function() {
      const countOfBuy = 2;
      const weiToBuy = web3.utils.toWei(countOfBuy.toString());

      await this.crowdsale.buyTokens(investor1, {value: weiToBuy});
      const balanceAfter = await this.token.balanceOf(investor1);
      assert.equal(weiToBuy, balanceAfter);
    });
  });
});
