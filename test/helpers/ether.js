module.exports = function ether(n, web3) {
    const bn = web3.utils.toBN(n);
    const eth = web3.utils.toWei(bn, 'ether');
    return web3.utils.toBN(eth);
}