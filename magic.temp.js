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
    get isResponse() {return typeof $response !== 'undefined' };
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
      // ??????????????????
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
        // Node ??? JSBox????????????
        if (this.isNode) val = val[key];
        if (this.isJSBox) val = JSON.parse(val)[key];
        // ???Session?????????
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
      // ?????????????????????JSON????????????
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
        // ???Session?????????????????????Object
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
          // ????????????
          if (!data.hasOwnProperty(key) || typeof data[key] !== 'object' || data[key] === null){
            data[key] = {};
          }
          if (!data[key].hasOwnProperty(session)){
            data[key][session] = null;
          }
          // ?????????????????????
          if (typeof val === 'undefined'){
            delete data[key][session];
          }
          else{
            data[key][session] = val;
          }
        }
        else {
          // ?????????????????????      
          if (typeof val === 'undefined'){
            delete data[session];
          }
          else{
            data[session] = val;
          }
        }
      }
      // ??????Session???
      else{
        if (this.isNode || this.isJSBox){
          // ????????????
          if (typeof val === 'undefined'){
            delete data[key];
          }
          else{
            data[key] = val;
          }
        }        
        else{    
          // ????????????      
          if (typeof val === 'undefined'){
            data = null;
          }
          else{
            data = val;
          }
        }
      }
      // ????????????
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
     * iOS????????????
     * @param {*} title ????????????
     * @param {*} subTitle ???????????????
     * @param {*} body ????????????
     * @param {*} opts ?????????????????????????????????????????????Object
     * Surge???Loon???QuantumultX????????????URL???Loon???QuantumultX????????????????????????
     * ?????????????????????
     * opts "applestore://" ??????Apple Store
     * opts "https://www.apple.com.cn/" ??????Apple.com.cn
     * opts {'url': 'https://www.apple.com.cn/'} ??????Apple.com.cn
     * opts {'openUrl': 'https://www.apple.com.cn/'} ??????Apple.com.cn
     * opts {'open-url': 'https://www.apple.com.cn/'} ??????Apple.com.cn
     * opts {'open-url': 'https://www.apple.com.cn/', 'media-url': 'https://raw.githubusercontent.com/Orz-3/mini/master/Apple.png'} ??????Apple.com.cn?????????????????????Logo
     * opts {'openUrl': 'https://www.apple.com.cn/', 'mediaUrl': 'https://raw.githubusercontent.com/Orz-3/mini/master/Apple.png'}
     * ?????????????????????Surge???Loon?????????
     * opts {'url': 'https://www.apple.com.cn/', 'mediaUrl': 'https://raw.githubusercontent.com/Orz-3/mini/master/Apple.png'}
     * ??????????????????Key???????????????????????????
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
      // ????????????????????????
      if (arguments.length == 1){
        title = this.scriptName;
        subTitle = '',
        body = arguments[0];
      }
      // ????????????
      if (!!this._unifiedPushUrl){
        let content = encodeURI(`${title}/${subTitle}${!!subTitle? '\n' : ''}${body}`);
        this.get(`${this._unifiedPushUrl}/${content}`, ()=>{});
      }
      // APP????????????
      if (this.isSurge || this.isLoon){
        $notification.post(title, subTitle, body, opts);
      }
      else if (this.isQuanX) {
         $notify(title, subTitle, body, opts);
      }
      // Nodejs ??????????????????????????????????????????
      // else if (this.isNode && !!this._unifiedPushUrl){
      //   let content = encodeURI(`${title}/${subTitle}${!!subTitle? '\n' : ''}${body}`);
      //   this.get(`${this._unifiedPushUrl}/${content}`, ()=>{});
      // }
      // JSBox????????????
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
     * ????????????Http Options??????????????????????????????
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

      // ????????????User-Agent?????????????????????
      if (!!!_options.headers || typeof _options.headers !== 'object' || !!!_options.headers['User-Agent']){
        if (!!!_options.headers || typeof _options.headers !== 'object') _options.headers = {};
        if (this.isNode) _options.headers['User-Agent'] = this.pcUserAgent;
        else _options.headers['User-Agent'] = this.iOSUserAgent;
      }

      let skipScripting = false;
      // ??????????????????????????????
      if ((typeof _options['opts'] === 'object' && (_options['opts']['hints'] === true || _options['opts']['Skip-Scripting'] === true)) || 
          (typeof _options['headers'] === 'object' && _options['headers']['X-Surge-Skip-Scripting'] === true)){
        skipScripting = true;
      }
      // ??????????????????????????????????????????APP???????????????????????????
      if (!skipScripting){
        if (this.isSurge) _options.headers['X-Surge-Skip-Scripting'] = false;
        else if (this.isLoon) _options.headers['X-Requested-With'] = 'XMLHttpRequest'; 
        else if (this.isQuanX){
          if (typeof _options['opts'] !== 'object') _options.opts = {};
          _options.opts['hints'] = false;
        }
      }

      // ????????????????????????
      if (!this.isSurge || skipScripting) delete _options.headers['X-Surge-Skip-Scripting'];
      if (!this.isQuanX && _options.hasOwnProperty('opts')) delete _options['opts'];
      if (this.isQuanX && _options.hasOwnProperty('opts')) delete _options['opts']['Skip-Scripting'];
      
      // GET?????????body?????????QueryString(beta)
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

      // ???????????????
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
     * Http???????????????GET??????
     * @param {*} options 
     * @param {*} callback 
     * options???????????????headers???opts?????????????????????????????????http?????????????????????????????????
     * ??????Surge???Quantumult X?????????????????????
     * ??????????????????????????????????????????options??????opts???opts??????????????????????????????????????????
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
     * Http???????????????POST??????
     * @param {*} options 
     * @param {*} callback 
     * options???????????????headers???opts?????????????????????????????????http?????????????????????????????????
     * ??????Surge???Quantumult X?????????????????????
     * ??????????????????????????????????????????options??????opts???opts??????????????????????????????????????????
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
     * ???await??????????????????????????????????????????????????????????????????try catch??????
     * ?????????let [err,val] = await magicJS.attempt(func(), 'defaultvalue');
     * ?????????let [err, [val1,val2]] = await magicJS.attempt(func(), ['defaultvalue1', 'defaultvalue2']);
     * @param {*} promise Promise ??????
     * @param {*} defaultValue ?????????????????????????????????
     * @returns ?????????????????????????????????????????????????????????????????????
     */
    attempt(promise, defaultValue=null){ return promise.then((args)=>{return [null, args]}).catch(ex=>{this.logError(ex); return [ex, defaultValue]})};

    /**
     * ????????????
     * @param {*} fn ?????????????????????
     * @param {number} [retries=5] ????????????
     * @param {number} [interval=0] ??????????????????
     * @param {function} [callback=null] ?????????????????????????????????????????????????????????result??????callback?????????result???????????????????????????????????????????????????callback???throw???????????????????????????????????????????????????????????????????????????
     * @returns ????????????Promise??????
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