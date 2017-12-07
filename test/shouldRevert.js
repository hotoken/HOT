const {expect} = require('chai')
module.exports = async function(f) {
  try {
    await f()
    expect.fail(true, false, 'Operation should be reverted')
  } catch (e) {
    expect(e.toString()).to.be.include('revert')
  }
}
