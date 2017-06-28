function get(){
  let result = {foo: 'bar'};
  return new Promise((resolve, reject) => {
    resolve(result);
  });
}
module.exports = {
  get: get
};
