module.exports.ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'
module.exports.EVM_REVERT = 'VM Exception while processing transaction: revert'

module.exports.ether = n => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
  )
}

// Same as ether
module.exports.tokens = n => ether(n)

module.exports.wait = s => {
  const milliseconds = s * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}