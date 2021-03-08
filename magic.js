const SET_VALUE_REGEX = /http:\/\/(www\.)?magic\.js\/value\/write/;
const GET_VALUE_REGEX = /http:\/\/(www\.)?magic\.js\/value\/read/;
const DEL_VALUE_REGEX = /http:\/\/(www\.)?magic\.js\/value\/del/;
const SCRIPT_NAME = "MagicJS";
let body = {};
let magicJS = MagicJS(SCRIPT_NAME, "DEBUG");
// magicJS.unifiedPushUrl = 'https://api.day.app/VFYWvaQ94N3LbsfXg6DgkV/';

async function Main(){
  if (magicJS.isRequest){
    if (SET_VALUE_REGEX.test(magicJS.request.url)){
      try{
        let key = magicJS.request.url.match(/key=([^&]*)/)[1]
        let val = magicJS.request.url.match(/val=([^&]*)/)[1]
        let session = magicJS.request.url.match(/session=([^&]*)/)
        session = !!session? session[1] : '';
        magicJS.write(key, val, session);
        if (magicJS.read(key, session) == val){
          magicJS.notify('变量写入成功');
          body = {'success': true, 'msg': '变量写入成功', 'key': key, 'val': val, 'session': session}
        }
        else{
          magicJS.notify('变量写入失败');
          body = {'success': false, 'msg': '变量写入失败', 'key': key, 'val': magicJS.read(key, session), 'session': session}
        }
      }
      catch (err){
        magicJS.notify('变量写入失败');
        body = {'success': false, 'msg': '变量写入失败'};
      }
    }
    else if (GET_VALUE_REGEX.test(magicJS.request.url)){
      try{
        let key = magicJS.request.url.match(/key=([^&]*)/)[1]
        let session = magicJS.request.url.match(/session=([^&]*)/)
        session = !!session? session[1] : '';
        val = magicJS.read(key, session);
        magicJS.notify('读取变量成功');
        body = {'success': true, 'msg': '读取变量成功', 'key': key, 'val': val, 'session': session}
      }
      catch (err){
        magicJS.notify('读取变量失败');
        body = {'success': false, 'msg': '读取变量失败'};
      }
    }
    else if (DEL_VALUE_REGEX.test(magicJS.request.url)){
      try{
        let key = magicJS.request.url.match(/key=([^&]*)/)[1]
        let session = magicJS.request.url.match(/session=([^&]*)/)
        session = !!session? session[1] : '';
        val = magicJS.del(key, session);
        if (!!magicJS.read(key, session)){
          magicJS.notify('删除变量失败');
          body = {'success': true, 'msg': '删除变量失败', 'key': key, 'session': session}
        }
        else{
          magicJS.notify('删除变量成功');
          body = {'success': true, 'msg': '删除变量成功', 'key': key, 'session': session}
        }
      }
      catch (err){
        magicJS.notify('删除变量失败');
        body = {'success': false, 'msg': '删除变量失败'};
      }
    }
    else{
      magicJS.notify('请求格式错误');
      body = {'success': false, 'msg': '请求格式错误'};
    }
    body = JSON.stringify(body);
    let resp = {}
    if (magicJS.isSurge || magicJS.isLoon){
      resp = {
        response: {
          status: 200,
          body: body, 
          headers: {
            'Content-type': 'application/json;charset=utf-8'
          }
        }
      }
    }
    if (magicJS.isQuanX){
      resp = {
        body: body, 
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        },
        status: "HTTP/1.1 200 OK"
      }
    }
    magicJS.done(resp);
  }
  else if(magicJS.isResponse){
  
  }
  else{
    const testKey = 'magicjs_test';
    const testSessionKey = 'magicjs_session_test';
    const testGetUrl = 'https://postman-echo.com/get';
    const testPostUrl = 'https://postman-echo.com/post';
    let val1 = new Date().getTime() + 'val1';
    let val2 = new Date().getTime() + 'val2';
    let readVal = null;

    function skipScripting(obj) {
      let xRequestedWith = !!obj.headers['X-Requested-With'] ? obj.headers['X-Requested-With'] : obj.headers['x-requested-with']
      let xSurgeSkipScripting = !!obj.headers['X-Surge-Skip-Scripting'] ? obj.headers['X-Surge-Skip-Scripting'] : obj.headers['x-surge-skip-scripting']
      if ((magicJS.isSurge && (xSurgeSkipScripting === true || xSurgeSkipScripting === 'true')) || 
          (magicJS.isQuanX && !!xRequestedWith && xRequestedWith.toLowerCase().indexOf('quantumult') >= 0) || 
          magicJS.isLoon && xRequestedWith.toLowerCase() === 'loon'){
        return true;
      }
      else{
        return false;
      }
    }

    // 运行平台判断
    magicJS.logInfo(`🧿当前运行的平台是${magicJS.platform}`);
    // 读写变量
    magicJS.logInfo('---------读写变量开始---------')
    if (true){
      // 读取错误的Key
      magicJS.logInfo('🧿开始测试读取无Session且错误的Key。');
      readVal = magicJS.read('magicjs_error');
      if (readVal === null){
        magicJS.logInfo('✅测试读取无Session且错误的Key通过。');
      }
      else{
        magicJS.logError('❌测试读取无Session且错误的Key失败。');
      }
      // 写入有Session变量
      magicJS.write(testKey, val1, 'session0');
      // 读取有Session变量
      readVal = magicJS.read(testKey, 'session0');
      if (readVal == val1){
        magicJS.logInfo('✅有Session数据读写验证通过。');
      }
      else{
        magicJS.logError('❌有Session数据读写验证失败。');
      }

      // 写入无Session变量
      magicJS.write(testKey, val1);
      // 读取无Session变量
      readVal = magicJS.read(testKey);
      if (readVal == val1){
        magicJS.logInfo('✅无Session数据读写验证通过。');
      }
      else{
        magicJS.logError('❌无Session数据读写验证失败。');
      }
      // 清理无Session变量
      magicJS.del(testKey);
      readVal = magicJS.read(testKey);
      if (readVal === null){
        magicJS.logInfo('✅无Session数据删除成功。');
      }
      else{
        magicJS.logError('❌无Session数据删除失败。');
      }

      // 读取有Session且错误的Key
      magicJS.logInfo('开始测试读取有Session且错误的Key。');
      readVal = magicJS.read('magicjs_session_error', 'session1');
      if (readVal === null){
        magicJS.logInfo('✅测试读取有Session且错误的Key通过。');
      }
      else{
        magicJS.logError('❌测试读取有Session且错误的Key失败。');
      }
      // 写入有Session变量
      magicJS.write(testSessionKey, val1, 'session1');
      magicJS.write(testSessionKey, val2, 'session2');
      // 读取有Session变量
      readVal = magicJS.read(testSessionKey, 'session1');
      if (readVal == val1){
        magicJS.logInfo('✅有Session1数据读写验证通过。');
      }
      else{
        magicJS.logError('❌有Session1数据读写验证失败。');
      }
      readVal = magicJS.read(testSessionKey, 'session2');
      if (readVal == val2){
        magicJS.logInfo('✅有Session2数据读写验证通过。');
      }
      else{
        magicJS.logError('❌有Session2数据读写验证失败。');
      }
      // 清理有Session变量
      magicJS.del(testSessionKey, 'session1');
      readVal = magicJS.read(testSessionKey, 'session1');
      if (readVal === null){
        magicJS.logInfo('✅有Session数据删除成功。');
      }
      else{
        magicJS.logError('❌有Session数据删除失败。');
      }
      // 测试正确的Key，错误的Session
      readVal = magicJS.read(testSessionKey, 'err_session');
      if (readVal === null){
        magicJS.logInfo('✅正确的Key，错误的Session，读取通过。');
      }
      else{
        magicJS.logError('❌正确的Key，错误的Session，读取失败。');
      }
      // 无session写入成功后，又改为有Session
      magicJS.write(testSessionKey, val2);
      magicJS.write(testSessionKey, val2, 'session2');
      readVal = magicJS.read(testSessionKey, 'session2');
      if (readVal == val2){
        magicJS.logInfo('✅无session写入成功后，又改为有Session，验证通过。')
      }
      else{
        magicJS.logError('❌无session写入成功后，又改为有Session，验证失败。')
      }
      magicJS.write(testSessionKey, val2);
      readVal = magicJS.read(testSessionKey);
      if (readVal == val2){
        magicJS.logInfo('✅有session写入成功后，又改为无Session，验证通过。')
      }
      else{
        magicJS.logError('❌有session写入成功后，又改为无Session，验证失败。')
      }
      // 无Seesion写入JSON字符串成功后，又改为有Session
      magicJS.write(testSessionKey, JSON.stringify({hello: 'world'}));
      readVal = magicJS.read(testSessionKey);
      if (readVal.hello == 'world'){
        magicJS.logInfo('✅无session时，写入JSON字符串，读取时为Object，测试通过。')
      }
      else{
        magicJS.logError('❌无session时，写入JSON字符串，读取时为Object，测试失败。')
      }
      magicJS.write(testSessionKey, JSON.stringify({magicjs: true}), 'session2');
      readVal = magicJS.read(testSessionKey, 'session2');
      if (readVal.magicjs == true){
        magicJS.logInfo('✅有session时，写入JSON字符串，读取时为Object，测试通过。')
      }
      else{
        magicJS.logError('❌有session时，写入JSON字符串，读取时为Object，测试失败。')
      }
      magicJS.write(testSessionKey, {hello: 'world'});
      readVal = magicJS.read(testSessionKey);
      if (readVal.hello == 'world'){
        magicJS.logInfo('✅无session时，写入Object，读取时为Object，测试通过。')
      }
      else{
        magicJS.logError('❌无session时，写入Object，读取时为Object，测试失败。')
      }
      magicJS.write(testSessionKey, {hello: 'world'}, 'session3');
      readVal = magicJS.read(testSessionKey);
      if (readVal.hello == 'world'){
        magicJS.logInfo('✅有session时，写入Object，读取时为Object，测试通过。')
      }
      else{
        magicJS.logError('❌有session时，写入Object，读取时为Object，测试失败。')
      }

      // 目前只有Surge能实现自己返回response，自己访问，原因不明，所以这里只测试Surge
      if (magicJS.isSurge){
        let key = 'test_key';
        let val3 = new Date().getTime() + 'val3';
        let url = 'http://www.magic.js/value';

        await new Promise((resolve)=>{
          magicJS.get(`${url}/write?key=${key}&val=${val3}`, (err, resp, data)=>{
            if (err){
              magicJS.logError(`❌通过GET请求写入数据，测试失败，http请求异常：${err}`);
            }
            else{
              let obj = JSON.parse(data);
              if (obj.success && obj.val == val3){
                magicJS.logInfo('✅通过GET请求写入数据，测试通过！');
              }
              else{
                magicJS.logError(`❌通过GET请求写入数据，测试失败！接口响应：${data}。`);
              }
            }
            resolve();
          });
        });
        
        await new Promise((resolve)=>{
          magicJS.get(`${url}/read?key=${key}`, (err, resp, data)=>{
            if (err){
              magicJS.logError(`❌通过GET请求读取数据，测试失败，http请求异常：${err}`);
            }
            else{
              let obj = JSON.parse(data);
              if (obj.success && obj.val == val3){
                magicJS.logInfo('✅通过GET请求读取数据，测试通过！');
              }
              else{
                magicJS.logError(`❌通过GET请求读取数据，测试失败！接口响应：${data}。`);
              }
            }
            resolve();
          });
        });

        await new Promise((resolve)=>{
          magicJS.get(`${url}/del??key=${key}`, (err, resp, data)=>{
            if (err){
              magicJS.logError(`❌通过GET删除读取数据，测试失败，http请求异常：${err}`);
            }
            else{
              let obj = JSON.parse(data);
              if (obj.success){
                magicJS.logInfo('✅通过GET请求删除数据，测试通过！');
              }
              else{
                magicJS.logError(`❌通过GET请求删除数据，测试失败！接口响应：${data}。`);
              }
            }
            resolve();
          });
        });
      }
    }
    magicJS.logInfo('---------读写变量结束---------')

    // 测试通知
    magicJS.logInfo('---------测试通知开始---------')
    magicJS.notify(SCRIPT_NAME, '01 测试标准通知成功', '这是一个最普通的通知。');
    if (magicJS.isQuanX || magicJS.isLoon || magicJS.isSurge){
      magicJS.notify(SCRIPT_NAME, '02 测试超链接通知成功', '这是一个传入Object的无效超链接。', {'open-url': ''});
      magicJS.notify(SCRIPT_NAME, '03 测试超链接通知成功', '这是一个传入String的无效超链接。', '');
      magicJS.notify(SCRIPT_NAME, '04 测试超链接通知成功', '这是一个传入String的有效超链接。', 'https://www.qq.com');
      magicJS.notify(SCRIPT_NAME, '05 测试超链接通知成功', '这是一个传入Object的有效超链接，QuantumultX写法。', {'open-url': 'https://www.qq.com'});
      magicJS.notify(SCRIPT_NAME, '06 测试超链接通知成功', '这是一个传入Object的有效超链接，loon写法。', {'openUrl': 'https://www.qq.com'});
      magicJS.notify(SCRIPT_NAME, '07 测试超链接通知成功', '这是一个传入Object的有效超链接，Surge写法。', {'url': 'https://www.qq.com'});
      magicJS.notify(SCRIPT_NAME, '08 测试超链接通知成功', '这是一个url schemes的有效链接。\n点击打开Apple Store。', 'applestore://');
      magicJS.notify(SCRIPT_NAME, '09 测试超链接与多媒体通知成功', '这是一个传入Object的有效超链接，QuantumultX写法。\n点击打开Apple.com.cn。', {'open-url': 'https://www.apple.com.cn/', 'media-url': 'https://raw.githubusercontent.com/Orz-3/mini/master/Apple.png'});
      magicJS.notify(SCRIPT_NAME, '10 测试超链接与多媒体通知成功', '这是一个传入Object的有效超链接，Loon写法。\n点击打开Apple.com.cn。', {'openUrl': 'https://www.apple.com.cn/', 'mediaUrl': 'https://raw.githubusercontent.com/Orz-3/mini/master/Apple.png'});
      magicJS.notify(SCRIPT_NAME, '11 测试超链接与多媒体通知成功', '这是一个传入Object的有效超链接，混合QuantumultX与Loon的写法。\n点击打开Apple.com.cn。', {'openUrl': 'https://www.apple.com.cn/', 'media-url': 'https://raw.githubusercontent.com/Orz-3/mini/master/Apple.png'});
    }
    magicJS.logInfo('---------测试通知结束---------')

    // Http请求
    magicJS.logInfo('---------Http请求开始---------')
    if (true){

      // 直接通过URL发起GET请求
      await new Promise(resolve=>{
        magicJS.logInfo('🧿开始测试直接通过url地址请求发起GET请求');
        magicJS.get(testGetUrl, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌GET请求出现异常，测试失败，http请求异常：${err}`);
            magicJS.logError(`❌自动补完UserAgent测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            magicJS.logInfo('✅通过GET请求接口，测试通过！');
            let obj = JSON.parse(data);
            let ua = !!obj.headers['User-Agent'] ? obj.headers['User-Agent'] : obj.headers['user-agent']
            if ((magicJS.isNode && ua.indexOf('Windows') >=0) || (!magicJS.isNode && ua.indexOf('iPhone') >=0)){
              magicJS.logInfo('✅自动补完UserAgent测试通过!');
            }
            else{
              magicJS.logError('❌自动补完UserAgent测试失败!');
            }
          }
          resolve();
        })
      }) 

      // 直接通过URL发起POST请求
      await new Promise(resolve=>{
        magicJS.logInfo('🧿开始测试直接通过url地址请求发起POST请求');
        magicJS.post(testPostUrl, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌POST请求出现异常，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            magicJS.logInfo('✅通过POST请求接口，测试通过！');
          }
          resolve();
        })
      }) 

      // GET请求带参数
      await new Promise(resolve=>{
        magicJS.logInfo('🧿开始测试GET请求带参数');
        let options = {url: testGetUrl, body: {'key1': 'val1', 'key2': 'val2'}}
        magicJS.get(options, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌GET请求出现异常，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            if (obj.args['key1'] === 'val1' && obj.args['key2'] === 'val2'){
              magicJS.logInfo('✅通过GET请求带参数测试通过!');
            }
            else{
              magicJS.logError('❌通过GET请求带参数测试失败!');
            }
          }
          resolve();
        })
      }) 

      // GET请求混合参数01
      await new Promise(resolve=>{
        magicJS.logInfo('🧿开始测试GET请求混合参数01');
        let options = {url: `${testGetUrl}?key0=val0`, body: {'key1': 'val1', 'key2': 'val2'}}
        magicJS.get(options, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌GET请求混合参数01，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            if (obj.args['key0'] === 'val0' && obj.args['key1'] === 'val1' && obj.args['key2'] === 'val2'){
              magicJS.logInfo('✅通过GET请求混合参数01测试通过!');
            }
            else{
              magicJS.logError('❌通过GET请求混合参数01测试失败!');
            }
          }
          resolve();
        })
      }) 

      // GET请求混合参数02
      await new Promise(resolve=>{
        magicJS.logInfo('🧿开始测试GET请求混合参数02');
        let options = {url: `${testGetUrl}?`, body: {'key1': 'val1', 'key2': 'val2'}}
        magicJS.get(options, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌GET请求混合参数01，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            if (obj.args['key1'] === 'val1' && obj.args['key2'] === 'val2'){
              magicJS.logInfo('✅通过GET请求混合参数02测试通过!');
            }
            else{
              magicJS.logError('❌通过GET请求混合参数02测试失败!');
            }
          }
          resolve();
        })
      }) 

      // GET请求混合参数03
      await new Promise(resolve=>{
        magicJS.logInfo('🧿开始测试GET请求混合参数03');
        let options = {url: `${testGetUrl}?key0=val0&`, body: {'key1': 'val1', 'key2': 'val2'}}
        magicJS.get(options, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌GET请求混合参数03，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            if (obj.args['key0'] === 'val0' && obj.args['key1'] === 'val1' && obj.args['key2'] === 'val2'){
              magicJS.logInfo('✅通过GET请求混合参数03测试通过!');
            }
            else{
              magicJS.logError('❌通过GET请求混合参数03测试失败!');
            }
          }
          resolve();
        })
      }) 

      // POST请求带参数
      await new Promise(resolve=>{
        magicJS.logInfo('🧿开始测试POST请求带参数');
        let options = {url: testPostUrl, body: {scriptname: SCRIPT_NAME}, headers: {'content-type': 'application/json'}}
        magicJS.post(options, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌POST请求出现异常，测试失败，http请求异常：${err}`);
          }
          else{
            let obj = typeof data === 'string'? JSON.parse(data) : data;
            magicJS.logDebug(`接口返回：${typeof data === 'object'? JSON.stringify(data) : data}`);
            if (obj.data['scriptname'] === SCRIPT_NAME){
              magicJS.logInfo('✅通过POST请求带参数测试通过!');
            }
            else{
              magicJS.logError('❌通过POST请求带参数测试失败!');
            }
          }
          resolve();
        })
      }) 

      // 自定义User-Agent测试
      await new Promise(resolve=>{
        let options = {url: testGetUrl, headers: {'User-Agent': `MagicJS/${magicJS.version} (Windows NT 10.0; Win64; x64)`}}
        magicJS.logInfo('🧿开始测试自定义User-Agent，Key规范，GET请求');
        magicJS.get(options, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌测试自定义User-Agent失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            let ua = !!obj.headers['User-Agent'] ? obj.headers['User-Agent'] : obj.headers['user-agent']
            if (ua.indexOf('MagicJS') >=0){
              magicJS.logInfo('✅自定义User-Agent，测试通过！');
            }
            else{
              magicJS.logError(`❌自定义User-Agent，请求体未达预期。`);
            }
          }
          resolve();
        })
      })

      // 自定义user-agent测试
      await new Promise(resolve=>{
        let options = {url: testGetUrl, headers: {'user-agent': `MagicJS/${magicJS.version} (Windows NT 10.0; Win64; x64)`}}
        magicJS.logInfo('🧿开始测试自定义user-agent，Key不规范，GET请求');
        magicJS.get(options, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌测试自定义user-agent失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            let ua = !!obj.headers['User-Agent'] ? obj.headers['User-Agent'] : obj.headers['user-agent']
            if (ua.indexOf('MagicJS') >=0){
              magicJS.logInfo('✅自定义user-agent，测试通过！');
            }
            else{
              magicJS.logError(`❌自定义user-agent，请求体未达预期。`);
            }
          }
          resolve();
        })
      })
        
      // 开始测试发起GET请求, 跳过脚本处理，Surge写法
      await new Promise(resolve=>{
        let options = {url: testGetUrl, headers: {'X-Surge-Skip-Scripting': true}}
        magicJS.logInfo('🧿开始测试发起GET请求, 跳过脚本处理，Surge写法');
        magicJS.get(options, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌GET请求出现异常，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            if (skipScripting(obj) || !(magicJS.isQuanX || magicJS.isSurge || magicJS.isLoon)){
              magicJS.logInfo('✅发起GET请求, 跳过脚本处理，测试通过！');
            }
            else{
              magicJS.logError(`❌发起GET请求, 跳过脚本处理，请求体未达预期。`);
            }
          }
          resolve();
        })
      })
    
      // 开始测试发起GET请求, 跳过脚本处理，QuanX写法
      await new Promise(resolve=>{
        let options = {url: testGetUrl, opts: {'hints': true}}
        magicJS.logInfo('🧿开始测试发起GET请求, 跳过脚本处理，QuanX写法');
        magicJS.get(options, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌GET请求出现异常，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            if (skipScripting(obj) || !(magicJS.isQuanX || magicJS.isSurge || magicJS.isLoon)){
              magicJS.logInfo('✅通过GET请求接口，测试通过！');
            }
            else{
              magicJS.logError(`❌GET请求出现异常，请求体未达预期。`);
            }
          }
          resolve();
        })
      })

      // 开始测试发起GET请求, 跳过脚本处理，MagicJS写法
      await new Promise(resolve=>{
        let options = {url: testGetUrl, opts: {'Skip-Scripting': true}}
        magicJS.logInfo('🧿开始测试发起GET请求, 跳过脚本处理，MagicJS写法');
        magicJS.get(options, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌GET请求出现异常，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            if (skipScripting(obj) || !(magicJS.isQuanX || magicJS.isSurge || magicJS.isLoon)){
              magicJS.logInfo('✅通过GET请求接口，测试通过！');
            }
            else{
              magicJS.logError(`❌GET请求出现异常，请求体未达预期。`);
            }
          }
          resolve();
        })
      })

      // 开始测试发起GET请求, 不跳过脚本处理，Surge写法
      await new Promise(resolve=>{
        let options = {url: testGetUrl, headers: {'X-Surge-Skip-Scripting': false}}
        magicJS.logInfo('🧿开始测试发起GET请求, 不跳过脚本处理，Surge写法');
        magicJS.get(options, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌GET请求出现异常，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            if (!skipScripting(obj) || !(magicJS.isQuanX || magicJS.isSurge || magicJS.isLoon)){
              magicJS.logInfo('✅通过GET请求接口，测试通过！');
            }
            else{
              magicJS.logError(`❌GET请求出现异常，请求体未达预期。`);
            }
          }
          resolve();
        })
      })
      
      // 开始测试发起GET请求, 不跳过脚本处理，QuanX写法
      await new Promise(resolve=>{
        let options = {url: testGetUrl, opts: {'hints': false}}
        magicJS.get(options, (err, resp, data)=>{
          magicJS.logInfo('🧿开始测试发起GET请求, 不跳过脚本处理，QuanX写法');
          if (err){
            magicJS.logError(`❌GET请求出现异常，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            if (!skipScripting(obj) || !(magicJS.isQuanX || magicJS.isSurge || magicJS.isLoon)){
              magicJS.logInfo('✅通过GET请求接口，测试通过！');
            }
            else{
              magicJS.logError(`❌GET请求出现异常，请求体未达预期。`);
            }
          }
          resolve();
        })
      })
    
      // 开始测试发起GET请求, 不跳过脚本处理，MagicJS写法
      await new Promise(resolve=>{
        let options = {url: testGetUrl, opts: {'Skip-Scripting': false}}
        magicJS.get(options, (err, resp, data)=>{
          magicJS.logInfo('🧿开始测试发起GET请求, 不跳过脚本处理，MagicJS写法');
          if (err){
            magicJS.logError(`❌GET请求出现异常，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            if (!skipScripting(obj) || !(magicJS.isQuanX || magicJS.isSurge || magicJS.isLoon)){
              magicJS.logInfo('✅通过GET请求接口，测试通过！');
              magicJS.logDebug(JSON.stringify(obj));
            }
            else{
              magicJS.logError(`❌GET请求出现异常，请求体未达预期。`);
            }
          }
          resolve();
        })
      })

      // ------------- GET请求测试结束 -------------

      // 开始测试发起POST请求, 跳过脚本处理，Surge写法
      await new Promise(resolve=>{
        let options = {url: testPostUrl, headers: {'X-Surge-Skip-Scripting': true}}
        magicJS.logInfo('🧿开始测试发起POST请求, 跳过脚本处理，Surge写法');
        magicJS.post(options, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌POST请求出现异常，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            if (skipScripting(obj) || !(magicJS.isQuanX || magicJS.isSurge || magicJS.isLoon)){
              magicJS.logInfo('✅通过POST请求接口，测试通过！');
            }
            else{
              magicJS.logError(`❌POST请求出现异常，请求体未达预期。`);
            }
          }
          resolve();
        })
      })
    
      // 开始测试发起POST请求, 跳过脚本处理，QuanX写法
      await new Promise(resolve=>{
        let options = {url: testPostUrl, opts: {'hints': true}}
        magicJS.logInfo('🧿开始测试发起POST请求, 跳过脚本处理，QuanX写法');
        magicJS.post(options, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌POST请求出现异常，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            if (skipScripting(obj) || !(magicJS.isQuanX || magicJS.isSurge || magicJS.isLoon)){
              magicJS.logInfo('✅通过POST请求接口，测试通过！');
            }
            else{
              magicJS.logError(`❌POST请求出现异常，请求体未达预期。`);
            }
          }
          resolve();
        })
      })

      // 开始测试发起POST请求, 跳过脚本处理，MagicJS写法
      await new Promise(resolve=>{
        let options = {url: testPostUrl, opts: {'Skip-Scripting': true}}
        magicJS.logInfo('🧿开始测试发起POST请求, 跳过脚本处理，MagicJS写法');
        magicJS.post(options, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌POST请求出现异常，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            if (skipScripting(obj) || !(magicJS.isQuanX || magicJS.isSurge || magicJS.isLoon)){
              magicJS.logInfo('✅通过POST请求接口，测试通过！');
            }
            else{
              magicJS.logError(`❌POST请求出现异常，请求体未达预期。`);
            }
          }
          resolve();
        })
      })

      // 开始测试发起POST请求, 不跳过脚本处理，Surge写法
      await new Promise(resolve=>{
        let options = {url: testPostUrl, headers: {'X-Surge-Skip-Scripting': false}}
        magicJS.logInfo('🧿开始测试发起POST请求, 不跳过脚本处理，Surge写法');
        magicJS.post(options, (err, resp, data)=>{
          if (err){
            magicJS.logError(`❌POST请求出现异常，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            if (!skipScripting(obj) || !(magicJS.isQuanX || magicJS.isSurge || magicJS.isLoon)){
              magicJS.logInfo('✅通过POST请求接口，测试通过！');
            }
            else{
              magicJS.logError(`❌POST请求出现异常，请求体未达预期。`);
            }
          }
          resolve();
        })
      })
      
      // 开始测试发起POST请求, 不跳过脚本处理，QuanX写法
      await new Promise(resolve=>{
        let options = {url: testPostUrl, opts: {'hints': false}}
        magicJS.post(options, (err, resp, data)=>{
          magicJS.logInfo('🧿开始测试发起POST请求, 不跳过脚本处理，QuanX写法');
          if (err){
            magicJS.logError(`❌POST请求出现异常，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            if (!skipScripting(obj) || !(magicJS.isQuanX || magicJS.isSurge || magicJS.isLoon)){
              magicJS.logInfo('✅通过POST请求接口，测试通过！');
            }
            else{
              magicJS.logError(`❌POST请求出现异常，请求体未达预期。`);
            }
          }
          resolve();
        })
      })
    
      // 开始测试发起POST请求, 不跳过脚本处理，MagicJS写法
      await new Promise(resolve=>{
        let options = {url: testPostUrl, opts: {'Skip-Scripting': false}}
        magicJS.post(options, (err, resp, data)=>{
          magicJS.logInfo('🧿开始测试发起POST请求, 不跳过脚本处理，MagicJS写法');
          if (err){
            magicJS.logError(`❌POST请求出现异常，测试失败，http请求异常：${err}`);
          }
          else{
            magicJS.logDebug(`接口返回：${data}`);
            let obj = JSON.parse(data);
            if (!skipScripting(obj) || !(magicJS.isQuanX || magicJS.isSurge || magicJS.isLoon)){
              magicJS.logInfo('✅通过POST请求接口，测试通过！');
              magicJS.logDebug(JSON.stringify(obj));
            }
            else{
              magicJS.logError(`❌POST请求出现异常，请求体未达预期。`);
            }
          }
          resolve();
        })
      })

        // ------------- POST请求测试结束 -------------

    }
    magicJS.logInfo('---------Http请求结束---------')

    magicJS.logInfo('---------测试日志开始---------')
    if (true){
      magicJS.logInfo('🧿传入错误的日志级别TEST');
      magicJS.logLevel = "TEST";
      magicJS.logDebug('✅DEBUG日志成功输出');
      magicJS.logInfo('✅INFO日志成功输出');
      magicJS.logWarning('✅WARNING日志成功输出');
      magicJS.logError('✅ERROR日志成功输出');
      magicJS.log('✅本条日志级别错误，正常输出', 'TEST');
      magicJS.logInfo('🧿恢复日志级别为WARNING');
      magicJS.logLevel = "WARNING";
      magicJS.logDebug('❌不应输出DEBUG级别日志');
      magicJS.logInfo('❌不应输出INFO级别日志');
      magicJS.logWarning('✅WARNING日志成功输出');
      magicJS.logError('✅ERROR日志成功输出');
      magicJS.logLevel = "INFO";
      magicJS.logInfo('🧿修改日志级别为INFO');
      magicJS.logInfo(`✅当前日志等级为${magicJS.logLevel}`);
      magicJS.log('✅本条日志级别错误，正常输出', 'TEST');
      magicJS.logDebug('❌不应输出DEBUG级别日志');
      magicJS.logInfo('✅INFO日志成功输出');
      magicJS.logInfo('🧿修改日志级别为NONE，以下不可输出任何日志');
      magicJS.logLevel = "NONE";
      magicJS.logDebug('❌不应输出DEBUG级别日志');
      magicJS.logInfo('❌不应输出INFO级别日志');
      magicJS.logWarning('❌不应输出WARNING级别日志');
      magicJS.logError('❌不应输出ERROR级别日志');
      magicJS.logLevel = "DEBUG";
      magicJS.logInfo('🧿修改日志级别为DEBUG');
      magicJS.logDebug('✅DEBUG日志成功输出');
      magicJS.logInfo('🧿修改日志级别为info');
      magicJS.logLevel = "info";
      magicJS.logDebug('❌不应输出DEBUG级别日志');
      magicJS.logInfo('✅INFO日志成功输出');
      magicJS.logWarning('✅WARNING日志成功输出');
      magicJS.logError('✅ERROR日志成功输出');
      magicJS.logInfo('🧿传入非字符串的日志等级：123456');
      magicJS.logLevel = 123456;
      magicJS.logDebug('✅DEBUG日志成功输出');
      magicJS.logInfo('✅INFO日志成功输出');
      magicJS.logWarning('✅WARNING日志成功输出');
      magicJS.logError('✅ERROR日志成功输出');
    }
    magicJS.logInfo('---------测试日志结束---------')

    magicJS.logInfo('---------测试重试开始---------')
    if (true){

      await new Promise(resolve =>{
        function Test1(){
          magicJS.logInfo('🧿函数Test1已执行，引发异常，等待重试');
          throw 'Test1';
        }
        let retryTest1 = magicJS.retry(Test1, 3, 1000);
        retryTest1().then(()=>{resolve();}).catch(ex=>{magicJS.logError(`重试结束，出现异常：${ex}`);resolve();});
      }) 

      await new Promise(resolve =>{
        function Test2(){
          magicJS.logInfo('🧿函数Test2已执行，没有异常，回调函数出现异常，需要重试。');
        }
        function Test2Callback(){
          throw 'Test2Callback';
        }
        let retryTest2 = magicJS.retry(Test2, 3, 1000, Test2Callback);
        retryTest2().then(()=>{resolve();}).catch(ex=>{magicJS.logError(`重试结束，出现异常：${ex}`);resolve();});
      }) 

      await(async() =>{
        function Test3(){
          return new Promise((resolve, reject) =>{
            magicJS.logInfo('🧿函数Test3已执行，引发异常，等待重试');
            reject('Test3');
          })
        }
        let [err,] = await magicJS.attempt(Test3());
        magicJS.logError(err);
      })()

      await(async() =>{
        function Test4(){
          return new Promise((resolve, reject) =>{
            magicJS.logInfo('🧿函数Test4已执行reject，等待重试');
            reject('Test4');
          })
        }
        let [err,val] = await magicJS.attempt(Test4(), 'val4');
        if (val == 'val4'){
          magicJS.logInfo('✅捕获Promise异常并返回默认值，测试通过！')
        }
        else{
          magicJS.logError('❌捕获Promise异常并返回默认值，测试失败！');
        }
        magicJS.logError(err);
      })()
    }
    magicJS.logInfo('---------测试重试结束---------')
    magicJS.done();
  }
};

Main();

function MagicJS(scriptName='MagicJS', logLevel='INFO'){
  const headersMap={'accept':'Accept','accept-ch':'Accept-CH','accept-charset':'Accept-Charset','accept-features':'Accept-Features','accept-encoding':'Accept-Encoding','accept-language':'Accept-Language','accept-ranges':'Accept-Ranges','access-control-allow-credentials':'Access-Control-Allow-Credentials','access-control-allow-origin':'Access-Control-Allow-Origin','access-control-allow-methods':'Access-Control-Allow-Methods','access-control-allow-headers':'Access-Control-Allow-Headers','access-control-max-age':'Access-Control-Max-Age','access-control-expose-headers':'Access-Control-Expose-Headers','access-control-request-method':'Access-Control-Request-Method','access-control-request-headers':'Access-Control-Request-Headers','age':'Age','allow':'Allow','alternates':'Alternates','authorization':'Authorization','cache-control':'Cache-Control','connection':'Connection','content-encoding':'Content-Encoding','content-language':'Content-Language','content-length':'Content-Length','content-location':'Content-Location','content-md5':'Content-MD5','content-range':'Content-Range','content-security-policy':'Content-Security-Policy','content-type':'Content-Type','cookie':'Cookie','dnt':'DNT','date':'Date','etag':'ETag','expect':'Expect','expires':'Expires','from':'From','host':'Host','if-match':'If-Match','if-modified-since':'If-Modified-Since','if-none-match':'If-None-Match','if-range':'If-Range','if-unmodified-since':'If-Unmodified-Since','last-event-id':'Last-Event-ID','last-modified':'Last-Modified','link':'Link','location':'Location','max-forwards':'Max-Forwards','negotiate':'Negotiate','origin':'Origin','pragma':'Pragma','proxy-authenticate':'Proxy-Authenticate','proxy-authorization':'Proxy-Authorization','range':'Range','referer':'Referer','retry-after':'Retry-After','sec-websocket-extensions':'Sec-Websocket-Extensions','sec-websocket-key':'Sec-Websocket-Key','sec-websocket-origin':'Sec-Websocket-Origin','sec-websocket-protocol':'Sec-Websocket-Protocol','sec-websocket-version':'Sec-Websocket-Version','server':'Server','set-cookie':'Set-Cookie','set-cookie2':'Set-Cookie2','strict-transport-security':'Strict-Transport-Security','tcn':'TCN','te':'TE','trailer':'Trailer','transfer-encoding':'Transfer-Encoding','upgrade':'Upgrade','user-agent':'User-Agent','variant-vary':'Variant-Vary','vary':'Vary','via':'Via','warning':'Warning','www-authenticate':'WWW-Authenticate','x-content-duration':'X-Content-Duration','x-content-security-policy':'X-Content-Security-Policy','x-dnsprefetch-control':'X-DNSPrefetch-Control','x-frame-options':'X-Frame-Options','x-requested-with':'X-Requested-With','x-surge-skip-scripting':'X-Surge-Skip-Scripting'};
  return new class{
    constructor(){
      this.version = '2.2.3.3';
      this.scriptName = scriptName;
      this.logLevels = {DEBUG: 5, INFO: 4, NOTIFY: 3, WARNING: 2, ERROR: 1, CRITICAL: 0, NONE: -1};
      this.isLoon = typeof $loon !== 'undefined';
      this.isQuanX = typeof $task !== 'undefined';
      this.isJSBox = typeof $drive !== 'undefined';
      this.isNode = typeof module !== 'undefined' && !this.isJSBox;
      this.isSurge = typeof $httpClient !== 'undefined' && !this.isLoon;
      this.platform = this.getPlatform();
      this.node = {'request': undefined, 'fs': undefined, 'data': {}};
      this.iOSUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Safari/604.1';
      this.pcUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36 Edg/84.0.522.59';
      this.logLevel = logLevel;
      this._unifiedPushUrl = '';
      if (this.isNode){
        this.node.fs = require('fs');
        this.node.request = require('request');
        try{
          this.node.fs.accessSync('./magic.json', this.node.fs.constants.R_OK | this.node.fs.constants.W_OK);
        }
        catch(err){
          this.node.fs.writeFileSync('./magic.json', '{}', {encoding: 'utf8'});
        }
        this.node.data = require('./magic.json');
      }
      else if (this.isJSBox){
        if (!$file.exists('drive://MagicJS')){
          $file.mkdir('drive://MagicJS');
        }
        if (!$file.exists('drive://MagicJS/magic.json')){
          $file.write({
            data: $data({string: '{}'}),
            path: 'drive://MagicJS/magic.json'
          })
        }
      }
    }

    /**
     * @param {string} url
     */
    set unifiedPushUrl(url){this._unifiedPushUrl = !!url ? url.replace(/\/+$/g, ''): ''};
    set logLevel(level) {this._logLevel = typeof level === 'string'? level.toUpperCase(): 'DEBUG'};
    get logLevel() {return this._logLevel};
    get isRequest() {return typeof $request !== 'undefined' && typeof $response === 'undefined'};
    get isResponse() {return typeof $response !== 'undefined'};
    get request() {return typeof $request !== 'undefined' ? $request : undefined };
    get response() { 
      if (typeof $response !== 'undefined'){
        if ($response.hasOwnProperty('status')) $response['statusCode'] = $response['status'];
        if ($response.hasOwnProperty('statusCode')) $response['status'] = $response['statusCode'];
        return $response;
      }
      else{
        return undefined;
      }
    }

    getPlatform(){
      if (this.isSurge) return "Surge";
      else if (this.isQuanX) return "QuantumultX";
      else if (this.isLoon) return "Loon";
      else if (this.isJSBox) return "JSBox";
      else if (this.isNode) return "Node.js";
      else return "unknown";
    }

    read(key, session=''){
      let val = '';
      // 读取原始数据
      if (this.isSurge || this.isLoon) {
        val = $persistentStore.read(key);
      }
      else if (this.isQuanX) {
        val = $prefs.valueForKey(key);
      }
      else if (this.isNode){
        val = this.node.data;
      }
      else if (this.isJSBox){
        val = $file.read('drive://MagicJS/magic.json').string;
      }
      try {
        // Node 和 JSBox数据处理
        if (this.isNode) val = val[key];
        if (this.isJSBox) val = JSON.parse(val)[key];
        // 带Session的情况
        if (!!session){
          if(typeof val === 'string') val = JSON.parse(val);
          val = !!val && typeof val === 'object' ? val[session]: null;
        }
      } 
      catch (err){ 
        this.logError(err);
        val = !!session? {} : null;
        this.del(key);
      }
      if (typeof val === 'undefined') val = null;
      try {if(!!val && typeof val === 'string') val = JSON.parse(val)} catch(err) {};
      this.logDebug(`READ DATA [${key}]${!!session? `[${session}]`: ''}(${typeof val})\n${JSON.stringify(val)}`);
      return val;
    };

    write(key, val, session=''){
      let data = !!session ? {} : '';
      // 读取原先存储的JSON格式数据
      if (!!session && (this.isSurge || this.isLoon)) {
        data = $persistentStore.read(key);
      }
      else if (!!session && this.isQuanX) {
        data = $prefs.valueForKey(key);
      }
      else if (this.isNode){
        data = this.node.data;
      }
      else if (this.isJSBox){
        data = JSON.parse($file.read('drive://MagicJS/magic.json').string);
      }
      if (!!session){
        // 有Session，所有数据都是Object
        try {
          if (typeof data === 'string') data = JSON.parse(data);
          data = typeof data === 'object' && !!data ? data : {};
        }
        catch(err){
          this.logError(err);
          this.del(key); 
          data = {};
        };
        if (this.isJSBox || this.isNode){
          // 构造数据
          if (!data.hasOwnProperty(key) || typeof data[key] !== 'object' || data[key] === null){
            data[key] = {};
          }
          if (!data[key].hasOwnProperty(session)){
            data[key][session] = null;
          }
          // 写入或删除数据
          if (typeof val === 'undefined'){
            delete data[key][session];
          }
          else{
            data[key][session] = val;
          }
        }
        else {
          // 写入或删除数据      
          if (typeof val === 'undefined'){
            delete data[session];
          }
          else{
            data[session] = val;
          }
        }
      }
      // 没有Session时
      else{
        if (this.isNode || this.isJSBox){
          // 删除数据
          if (typeof val === 'undefined'){
            delete data[key];
          }
          else{
            data[key] = val;
          }
        }        
        else{    
          // 删除数据      
          if (typeof val === 'undefined'){
            data = null;
          }
          else{
            data = val;
          }
        }
      }
      // 数据回写
      if (typeof data === 'object') data = JSON.stringify(data);
      if (this.isSurge || this.isLoon) {
        $persistentStore.write(data, key);
      }
      else if (this.isQuanX) {
        $prefs.setValueForKey(data, key);
      }
      else if (this.isNode){
        this.node.fs.writeFileSync('./magic.json', data);
      }
      else if (this.isJSBox){
        $file.write({data: $data({string: data}), path: 'drive://MagicJS/magic.json'});
      }
      this.logDebug(`WRITE DATA [${key}]${!!session? `[${session}]`: ''}(${typeof val})\n${JSON.stringify(val)}`);
    };

    del(key, session=''){
      this.logDebug(`DELETE KEY [${key}]${!!session ? `[${session}]`:''}`);
      this.write(key, null, session);
    }

    /**
     * iOS系统通知
     * @param {*} title 通知标题
     * @param {*} subTitle 通知副标题
     * @param {*} body 通知内容
     * @param {*} opts 通知选项，目前支持传入超链接或Object
     * Surge、Loon、QuantumultX支持打开URL，Loon、QuantumultX还支持多媒体通知
     * 你可以这么写：
     * opts "applestore://" 打开Apple Store
     * opts "https://www.apple.com.cn/" 打开Apple.com.cn
     * opts {'url': 'https://www.apple.com.cn/'} 打开Apple.com.cn
     * opts {'openUrl': 'https://www.apple.com.cn/'} 打开Apple.com.cn
     * opts {'open-url': 'https://www.apple.com.cn/'} 打开Apple.com.cn
     * opts {'open-url': 'https://www.apple.com.cn/', 'media-url': 'https://raw.githubusercontent.com/Orz-3/mini/master/Apple.png'} 打开Apple.com.cn，显示一个苹果Logo
     * opts {'openUrl': 'https://www.apple.com.cn/', 'mediaUrl': 'https://raw.githubusercontent.com/Orz-3/mini/master/Apple.png'}
     * 你甚至可以混合Surge与Loon的写法
     * opts {'url': 'https://www.apple.com.cn/', 'mediaUrl': 'https://raw.githubusercontent.com/Orz-3/mini/master/Apple.png'}
     * 注意！所有的Key都是大小写敏感的！
     */ 
    notify(title=this.scriptName, subTitle='', body='', opts=''){
      let convertOptions = (_opts) =>{
        let newOpts = {};
          if (this.isSurge || this.isQuanX || this.isLoon){
            if (typeof _opts === 'string'){
              if (this.isLoon) newOpts = {'openUrl': _opts};
              else if (this.isQuanX) newOpts = {'open-url': _opts};
              else if (this.isSurge) newOpts = {'url': _opts};
            }
            else if (typeof _opts === 'object'){
              let keyMaps = {
                "Surge": {
                  "openUrl": "url",
                  "open-url": "url"
                },
                "Loon": {
                  "url": "openUrl",
                  "open-url": "openUrl",
                  "media-url": "mediaUrl"
                },
                "QuantumultX":{
                  "url": "open-url",
                  "openUrl": "open-url",
                  "mediaUrl": "media-url"
                }
              };
              let keys = Object.keys(_opts);
              for (let i=0; i<keys.length; i++){
                if (!!keyMaps[this.platform][keys[i]]){
                  newOpts[keyMaps[this.platform][keys[i]]] = _opts[keys[i]];
                }
                else{
                  newOpts[keys[i]] = _opts[keys[i]];
                }
              }
            }
        }
        return newOpts;
      };
      opts = convertOptions(opts);
      this.logNotify(`title:${title}\nsubTitle:${subTitle}\nbody:${body}\noptions:${typeof opts === 'object'? JSON.stringify(opts) : opts}`);
      // 支持单个参数通知
      if (arguments.length == 1){
        title = this.scriptName;
        subTitle = '',
        body = arguments[0];
      }
      // 统一推送
      if (!!this._unifiedPushUrl){
        let content = encodeURI(`${title}/${subTitle}${!!subTitle? '\n' : ''}${body}`);
        this.get(`${this._unifiedPushUrl}/${content}`, ()=>{});
      }
      // APP本地推送
      if (this.isSurge || this.isLoon){
        $notification.post(title, subTitle, body, opts);
      }
      else if (this.isQuanX) {
         $notify(title, subTitle, body, opts);
      }
      // Nodejs 跨设备使用统一推送，暂时注释
      // else if (this.isNode && !!this._unifiedPushUrl){
      //   let content = encodeURI(`${title}/${subTitle}${!!subTitle? '\n' : ''}${body}`);
      //   this.get(`${this._unifiedPushUrl}/${content}`, ()=>{});
      // }
      // JSBox本地推送
      else if (this.isJSBox){
        let push = {
          title: title,
          body: !!subTitle ? `${subTitle}\n${body}` : body,
        };
        $push.schedule(push);
      } 
    }
    
    log(msg, level="INFO"){
      if (!(this.logLevels[this._logLevel] < this.logLevels[level.toUpperCase()])) console.log(`[${level}] [${this.scriptName}]\n${msg}\n`);
    }

    logDebug(msg){
      this.log(msg, "DEBUG");
    }

    logInfo(msg){
      this.log(msg, "INFO");
    }

    logNotify(msg){
      this.log(msg, "NOTIFY");
    }

    logWarning(msg){
      this.log(msg, "WARNING");
    }

    logError(msg){
      this.log(msg, "ERROR");
    }

    /**
     * 对传入的Http Options根据不同环境进行适配
     * @param {*} options 
     */
    adapterHttpOptions(options, method){
      let _options = typeof options === 'object'? Object.assign({}, options): {'url': options, 'headers': {}};
      
      if (_options.hasOwnProperty('header') && !_options.hasOwnProperty('headers')){
        _options['headers'] = _options['header'];
        delete _options['header'];
      }

      if (typeof _options.headers === 'object' && !!headersMap){
        for (let key in _options.headers){
          if (headersMap[key]) {
            _options.headers[headersMap[key]] = _options.headers[key];
            delete _options.headers[key];
          }
        }
      }

      // 自动补完User-Agent，减少请求特征
      if (!!!_options.headers || typeof _options.headers !== 'object' || !!!_options.headers['User-Agent']){
        if (!!!_options.headers || typeof _options.headers !== 'object') _options.headers = {};
        if (this.isNode) _options.headers['User-Agent'] = this.pcUserAgent;
        else _options.headers['User-Agent'] = this.iOSUserAgent;
      }

      let skipScripting = false;
      // 判断是否跳过脚本处理
      if ((typeof _options['opts'] === 'object' && (_options['opts']['hints'] === true || _options['opts']['Skip-Scripting'] === true)) || 
          (typeof _options['headers'] === 'object' && _options['headers']['X-Surge-Skip-Scripting'] === true)){
        skipScripting = true;
      }
      // 如果不跳过脚本处理，根据不同APP对请求参数进行修改
      if (!skipScripting){
        if (this.isSurge) _options.headers['X-Surge-Skip-Scripting'] = false;
        else if (this.isLoon) _options.headers['X-Requested-With'] = 'XMLHttpRequest'; 
        else if (this.isQuanX){
          if (typeof _options['opts'] !== 'object') _options.opts = {};
          _options.opts['hints'] = false;
        }
      }

      // 对请求数据做清理
      if (!this.isSurge || skipScripting) delete _options.headers['X-Surge-Skip-Scripting'];
      if (!this.isQuanX && _options.hasOwnProperty('opts')) delete _options['opts'];
      if (this.isQuanX && _options.hasOwnProperty('opts')) delete _options['opts']['Skip-Scripting'];
      
      // GET请求将body转换成QueryString(beta)
      if (method === 'GET' && !this.isNode && !!_options.body){
        let qs = Object.keys(_options.body).map(key=>{
          if (typeof _options.body === 'undefined') return '';
          return `${encodeURIComponent(key)}=${encodeURIComponent(_options.body[key])}`;
        }).join('&');
        if (_options.url.indexOf('?') < 0) _options.url += '?';
        if (_options.url.lastIndexOf('&')+1 != _options.url.length && _options.url.lastIndexOf('?')+1 != _options.url.length) _options.url += '&';
        _options.url += qs;
        delete _options.body;
      }

      // 适配多环境
      if (this.isQuanX){
        if (_options.hasOwnProperty('body') && typeof _options['body'] !== 'string') _options['body'] = JSON.stringify(_options['body']);
        _options['method'] = method;
      }
      else if (this.isNode){
        delete _options.headers['Accept-Encoding'];
        if (typeof _options.body === 'object'){
          if (method === 'GET'){
            _options.qs = _options.body;
            delete _options.body
          }
          else if (method === 'POST'){
            _options['json'] = true;
            _options.body = _options.body;
          }
        }
      }
      else if (this.isJSBox){
        _options['header'] = _options['headers'];
        delete _options['headers']
      }

      return _options;
    }
    
    /**
     * Http客户端发起GET请求
     * @param {*} options 
     * @param {*} callback 
     * options可配置参数headers和opts，用于判断由脚本发起的http请求是否跳过脚本处理。
     * 支持Surge和Quantumult X两种配置方式。
     * 以下几种配置会跳过脚本处理，options没有opts或opts的值不匹配，则不跳过脚本处理
     * {opts:{"hints": true}}
     * {opts:{"Skip-Scripting": true}}
     * {headers: {"X-Surge-Skip-Scripting": true}}
     */
    get(options, callback){
      let _options = this.adapterHttpOptions(options, 'GET');
      this.logDebug(`HTTP GET: ${JSON.stringify(_options)}`);
      if (this.isSurge || this.isLoon) {
        $httpClient.get(_options, callback);
      }
      else if (this.isQuanX) {
        $task.fetch(_options).then(
          resp => {
            resp['status'] = resp.statusCode;
            callback(null, resp, resp.body);
          },
          reason => callback(reason.error, null, null),
        )
      }
      else if(this.isNode){
        return this.node.request.get(_options, callback);
      }
      else if(this.isJSBox){
        _options['handler'] = (resp)=>{
          let err = resp.error? JSON.stringify(resp.error) : undefined;
          let data = typeof resp.data === 'object' ? JSON.stringify(resp.data) : resp.data;
          callback(err, resp.response, data);
        };
        $http.get(_options);
      }
    }

    /**
     * Http客户端发起POST请求
     * @param {*} options 
     * @param {*} callback 
     * options可配置参数headers和opts，用于判断由脚本发起的http请求是否跳过脚本处理。
     * 支持Surge和Quantumult X两种配置方式。
     * 以下几种配置会跳过脚本处理，options没有opts或opts的值不匹配，则不跳过脚本处理
     * {opts:{"hints": true}}
     * {opts:{"Skip-Scripting": true}}
     * {headers: {"X-Surge-Skip-Scripting": true}}
     */
    post(options, callback){
      let _options = this.adapterHttpOptions(options, 'POST');
      this.logDebug(`HTTP POST: ${JSON.stringify(_options)}`);
      if (this.isSurge || this.isLoon) {
        $httpClient.post(_options, callback);
      }
      else if (this.isQuanX) {
        $task.fetch(_options).then(
          resp => {
            resp['status'] = resp.statusCode;
            callback(null, resp, resp.body);
          },
          reason => {callback(reason.error, null, null)}
        );
      }
      else if(this.isNode){
        return this.node.request.post(_options, callback);
      }
      else if(this.isJSBox){
        _options['handler'] = (resp)=>{
          let err = resp.error? JSON.stringify(resp.error) : undefined;
          let data = typeof resp.data === 'object' ? JSON.stringify(resp.data) : resp.data;
          callback(err, resp.response, data);
        };
        $http.post(_options);
      }
    }

    done(value = {}){
      if (typeof $done !== 'undefined'){
        $done(value);
      }
    }

    isToday(day){
      if (day == null){
          return false;
      }
      else{
        let today = new Date();
        if (typeof day == 'string'){
            day = new Date(day);
        }
        if (today.getFullYear() == day.getFullYear() && today.getMonth() == day.getMonth() && today.getDay() == day.getDay()){
            return true;
        }
        else{
            return false;
        }
      }
    }

    isNumber(val) {
      return parseFloat(val).toString() === "NaN"? false: true;
    }

    /**
     * 对await执行中出现的异常进行捕获并返回，避免写过多的try catch语句
     * 示例：let [err,val] = await magicJS.attempt(func(), 'defaultvalue');
     * 或者：let [err, [val1,val2]] = await magicJS.attempt(func(), ['defaultvalue1', 'defaultvalue2']);
     * @param {*} promise Promise 对象
     * @param {*} defaultValue 出现异常时返回的默认值
     * @returns 返回两个值，第一个值为异常，第二个值为执行结果
     */
    attempt(promise, defaultValue=null){ return promise.then((args)=>{return [null, args]}).catch(ex=>{this.logError(ex); return [ex, defaultValue]})};

    /**
     * 重试方法
     * @param {*} fn 需要重试的函数
     * @param {number} [retries=5] 重试次数
     * @param {number} [interval=0] 每次重试间隔
     * @param {function} [callback=null] 函数没有异常时的回调，会将函数执行结果result传入callback，根据result的值进行判断，如果需要再次重试，在callback中throw一个异常，适用于函数本身没有异常但仍需重试的情况。
     * @returns 返回一个Promise对象
     */
    retry(fn, retries=5, interval=0, callback=null) {
      return (...args)=>{
        return new Promise((resolve, reject) =>{
          function _retry(...args){
            Promise.resolve().then(()=>fn.apply(this,args)).then(
              result => {
                if (typeof callback === 'function'){
                  Promise.resolve().then(()=>callback(result)).then(()=>{resolve(result)}).catch(ex=>{
                    this.logError(ex);
                    if (retries >= 1 && interval > 0){
                      setTimeout(() => _retry.apply(this, args), interval);
                    }
                    else if (retries >= 1) {
                      _retry.apply(this, args);
                    }
                    else{
                      reject(ex);
                    }
                    retries --;
                  });
                }
                else{
                  resolve(result);
                }
              }
              ).catch(ex=>{
              this.logError(ex);
              if (retries >= 1 && interval > 0){
                setTimeout(() => _retry.apply(this, args), interval);
              }
              else if (retries >= 1) {
                _retry.apply(this, args);
              }
              else{
                reject(ex);
              }
              retries --;
            })
          }
          _retry.apply(this, args);
        });
      };
    }

    formatTime(time, fmt="yyyy-MM-dd hh:mm:ss") {
      var o = {
        "M+": time.getMonth() + 1,
        "d+": time.getDate(),
        "h+": time.getHours(),
        "m+": time.getMinutes(),
        "s+": time.getSeconds(),
        "q+": Math.floor((time.getMonth() + 3) / 3),
        "S": time.getMilliseconds()
      };
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
      for (let k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      return fmt;
    };

    now(){
      return this.formatTime(new Date(), "yyyy-MM-dd hh:mm:ss");
    }

    today(){
      return this.formatTime(new Date(), "yyyy-MM-dd");
    }

    sleep(time) {
      return new Promise(resolve => setTimeout(resolve, time));
    }
    
  }(scriptName);
};