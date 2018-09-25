var should = require("chai").should();
var fpmc = require("yf-fpm-client-js").default;

fpmc.init({appkey: '123123', masterKey: '123123', domain: 'http://localhost:9999'});


describe('Function', function(){
  beforeEach(done => {
    done()
  })
  

  afterEach(done => {
    done()
  })

  it('Function A', function(done){
    var func = new YF.Func('test.foo');
    func.invoke({})
      .then(function(data){
        console.log(data)
        done();
      }).catch(function(err){
        done(err);
      })
  })
})
