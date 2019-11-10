const {time, balance} = require('@openzeppelin/test-helpers');

//@ Args
// '_' - creator account
// 'wallet' - wallet for crowdsale
// 'inverstor 1/2' - accounts of investors
contract("Timed crowdsale", function([_, wallet, investor1, investor2]) {

    describe("Blockchain timing", () => {
        it("Should time increased correctly", async () => {    
            const duration = 2;
            const timeBefore = await time.latest();
            await time.increase (time.duration.seconds(duration));
            const timeAfter = await time.latest(); 
            assert.equal(Number(timeAfter) > Number(timeBefore), true);
        });
    });
});