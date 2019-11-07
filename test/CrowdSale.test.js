const BigNumber = web3.BigNumber;
const ether = require('./helpers/ether');
const BorgToken = artifacts.require('BorgToken');
const BorgTokenCrowdsale = artifacts.require('BorgTokensCrowdsale');

//@ Args
// '_' - creator account
// 'wallet' - wallet for crowdsale
// 'inverstor 1/2' - accounts of investors
contract('TokenCrowd sale', function([_, wallet, investor1, investor2]) {
  console.log(`Contract args: \n ${_} \n ${wallet} \n ${investor1} ${investor2}`);
  beforeEach(async function () {
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

    // Crowdsale config
    this.rate = 500;
    this.wallet = wallet;

    this.crowdsale = await BorgTokenCrowdsale.new(
      this.rate,
      this.wallet,
      this.token.address
    );
  });

  describe('crowdsale', function() {
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

  describe('minted crowdsale', function() {
    it('mints tokens after purchase', async function() {
      const originalTotalSupply = await this.token.totalSupply();
      await this.crowdsale.buyTokens(investor1, {value: ether(1, web3), from: _});
      const newTotalSupply = await this.token.totalSupply();
      assert.equal(newTotalSupply > originalTotalSupply, true);
    });
  });

  describe('accepting payments', function() {
    it('should accept payments', async function() {
      const value = ether(1);
      const purchaser = investor2;
      await this.crowdsale.sendTransaction({ value: value, from: investor1 }).should.be.fulfilled;
      await this.crowdsale.buyTokens(investor1, { value: value, from: purchaser }).should.be.fulfilled;
    });
  });

});
