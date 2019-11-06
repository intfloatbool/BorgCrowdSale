const BorgToken = artifacts.require("BorgToken");
contract('BorgToken', accounts => {
    const _name = "Borg";
    const _symbol = "BRG";
    const _decimals = 18;

    beforeEach(async () => {
        this.token = await BorgToken.new(_name, _symbol, _decimals);
    });

    describe("Check token attributes", () => {
        it("Has the correct name", async () => {
            const name = await this.token.name();
            assert.equal(name, _name);
        });

        it("Has correct symbol", async () => {
            const symbol = await this.token.symbol();
            assert.equal(symbol, _symbol);
        });

        it("Has correct decimals", async () => {
            const decimals = await this.token.decimals();
            assert.equal(decimals, _decimals);
        });
    });
});