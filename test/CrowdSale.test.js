const BigNumber = web3.BigNumber;
const ether = require('./helpers/ether');
const BorgToken = artifacts.require('BorgToken');
const BorgTokenCrowdsale = artifacts.require('BorgTokensCrowdsale');
contract('TokenCrowd sale', function([_, wallet, investor1, investor2]) {

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

});
