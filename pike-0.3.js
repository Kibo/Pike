// Input 0
var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.DEBUG = true;
goog.LOCALE = "en";
goog.TRUSTED_SITE = true;
goog.provide = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
    var namespace = name;
    while(namespace = namespace.substring(0, namespace.lastIndexOf("."))) {
      if(goog.getObjectByName(namespace)) {
        break
      }
      goog.implicitNamespaces_[namespace] = true
    }
  }
  goog.exportPath_(name)
};
goog.setTestOnly = function(opt_message) {
  if(COMPILED && !goog.DEBUG) {
    opt_message = opt_message || "";
    throw Error("Importing test-only code into non-debug environment" + opt_message ? ": " + opt_message : ".");
  }
};
if(!COMPILED) {
  goog.isProvided_ = function(name) {
    return!goog.implicitNamespaces_[name] && !!goog.getObjectByName(name)
  };
  goog.implicitNamespaces_ = {}
}
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split(".");
  var cur = opt_objectToExportTo || goog.global;
  if(!(parts[0] in cur) && cur.execScript) {
    cur.execScript("var " + parts[0])
  }
  for(var part;parts.length && (part = parts.shift());) {
    if(!parts.length && goog.isDef(opt_object)) {
      cur[part] = opt_object
    }else {
      if(cur[part]) {
        cur = cur[part]
      }else {
        cur = cur[part] = {}
      }
    }
  }
};
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split(".");
  var cur = opt_obj || goog.global;
  for(var part;part = parts.shift();) {
    if(goog.isDefAndNotNull(cur[part])) {
      cur = cur[part]
    }else {
      return null
    }
  }
  return cur
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for(var x in obj) {
    global[x] = obj[x]
  }
};
goog.addDependency = function(relPath, provides, requires) {
  if(!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, "/");
    var deps = goog.dependencies_;
    for(var i = 0;provide = provides[i];i++) {
      deps.nameToPath[provide] = path;
      if(!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {}
      }
      deps.pathToNames[path][provide] = true
    }
    for(var j = 0;require = requires[j];j++) {
      if(!(path in deps.requires)) {
        deps.requires[path] = {}
      }
      deps.requires[path][require] = true
    }
  }
};
goog.ENABLE_DEBUG_LOADER = true;
goog.require = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      return
    }
    if(goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if(path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return
      }
    }
    var errorMessage = "goog.require could not find: " + name;
    if(goog.global.console) {
      goog.global.console["error"](errorMessage)
    }
    throw Error(errorMessage);
  }
};
goog.basePath = "";
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {
};
goog.identityFunction = function(opt_returnValue, var_args) {
  return opt_returnValue
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if(ctor.instance_) {
      return ctor.instance_
    }
    if(goog.DEBUG) {
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor
    }
    return ctor.instance_ = new ctor
  }
};
goog.instantiatedSingletons_ = [];
if(!COMPILED && goog.ENABLE_DEBUG_LOADER) {
  goog.included_ = {};
  goog.dependencies_ = {pathToNames:{}, nameToPath:{}, requires:{}, visited:{}, written:{}};
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != "undefined" && "write" in doc
  };
  goog.findBasePath_ = function() {
    if(goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return
    }else {
      if(!goog.inHtmlDocument_()) {
        return
      }
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName("script");
    for(var i = scripts.length - 1;i >= 0;--i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf("?");
      var l = qmark == -1 ? src.length : qmark;
      if(src.substr(l - 7, 7) == "base.js") {
        goog.basePath = src.substr(0, l - 7);
        return
      }
    }
  };
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    if(!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true
    }
  };
  goog.writeScriptTag_ = function(src) {
    if(goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      if(doc.readyState == "complete") {
        var isDeps = /\bdeps.js$/.test(src);
        if(isDeps) {
          return false
        }else {
          throw Error('Cannot write "' + src + '" after document load');
        }
      }
      doc.write('<script type="text/javascript" src="' + src + '"></' + "script>");
      return true
    }else {
      return false
    }
  };
  goog.writeScripts_ = function() {
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;
    function visitNode(path) {
      if(path in deps.written) {
        return
      }
      if(path in deps.visited) {
        if(!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path)
        }
        return
      }
      deps.visited[path] = true;
      if(path in deps.requires) {
        for(var requireName in deps.requires[path]) {
          if(!goog.isProvided_(requireName)) {
            if(requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName])
            }else {
              throw Error("Undefined nameToPath for " + requireName);
            }
          }
        }
      }
      if(!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path)
      }
    }
    for(var path in goog.included_) {
      if(!deps.written[path]) {
        visitNode(path)
      }
    }
    for(var i = 0;i < scripts.length;i++) {
      if(scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i])
      }else {
        throw Error("Undefined script input");
      }
    }
  };
  goog.getPathFromDeps_ = function(rule) {
    if(rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule]
    }else {
      return null
    }
  };
  goog.findBasePath_();
  if(!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + "deps.js")
  }
}
goog.typeOf = function(value) {
  var s = typeof value;
  if(s == "object") {
    if(value) {
      if(value instanceof Array) {
        return"array"
      }else {
        if(value instanceof Object) {
          return s
        }
      }
      var className = Object.prototype.toString.call((value));
      if(className == "[object Window]") {
        return"object"
      }
      if(className == "[object Array]" || typeof value.length == "number" && typeof value.splice != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("splice")) {
        return"array"
      }
      if(className == "[object Function]" || typeof value.call != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("call")) {
        return"function"
      }
    }else {
      return"null"
    }
  }else {
    if(s == "function" && typeof value.call == "undefined") {
      return"object"
    }
  }
  return s
};
goog.isDef = function(val) {
  return val !== undefined
};
goog.isNull = function(val) {
  return val === null
};
goog.isDefAndNotNull = function(val) {
  return val != null
};
goog.isArray = function(val) {
  return goog.typeOf(val) == "array"
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == "array" || type == "object" && typeof val.length == "number"
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == "function"
};
goog.isString = function(val) {
  return typeof val == "string"
};
goog.isBoolean = function(val) {
  return typeof val == "boolean"
};
goog.isNumber = function(val) {
  return typeof val == "number"
};
goog.isFunction = function(val) {
  return goog.typeOf(val) == "function"
};
goog.isObject = function(val) {
  var type = typeof val;
  return type == "object" && val != null || type == "function"
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_)
};
goog.removeUid = function(obj) {
  if("removeAttribute" in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_)
  }
  try {
    delete obj[goog.UID_PROPERTY_]
  }catch(ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + (Math.random() * 1E9 >>> 0);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.cloneObject(obj[key])
    }
    return clone
  }
  return obj
};
goog.bindNative_ = function(fn, selfObj, var_args) {
  return(fn.call.apply(fn.bind, arguments))
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  if(!fn) {
    throw new Error;
  }
  if(arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs)
    }
  }else {
    return function() {
      return fn.apply(selfObj, arguments)
    }
  }
};
goog.bind = function(fn, selfObj, var_args) {
  if(Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1) {
    goog.bind = goog.bindNative_
  }else {
    goog.bind = goog.bindJs_
  }
  return goog.bind.apply(null, arguments)
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs)
  }
};
goog.mixin = function(target, source) {
  for(var x in source) {
    target[x] = source[x]
  }
};
goog.now = goog.TRUSTED_SITE && Date.now || function() {
  return+new Date
};
goog.globalEval = function(script) {
  if(goog.global.execScript) {
    goog.global.execScript(script, "JavaScript")
  }else {
    if(goog.global.eval) {
      if(goog.evalWorksForGlobals_ == null) {
        goog.global.eval("var _et_ = 1;");
        if(typeof goog.global["_et_"] != "undefined") {
          delete goog.global["_et_"];
          goog.evalWorksForGlobals_ = true
        }else {
          goog.evalWorksForGlobals_ = false
        }
      }
      if(goog.evalWorksForGlobals_) {
        goog.global.eval(script)
      }else {
        var doc = goog.global.document;
        var scriptElt = doc.createElement("script");
        scriptElt.type = "text/javascript";
        scriptElt.defer = false;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt)
      }
    }else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName
  };
  var renameByParts = function(cssName) {
    var parts = cssName.split("-");
    var mapped = [];
    for(var i = 0;i < parts.length;i++) {
      mapped.push(getMapping(parts[i]))
    }
    return mapped.join("-")
  };
  var rename;
  if(goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == "BY_WHOLE" ? getMapping : renameByParts
  }else {
    rename = function(a) {
      return a
    }
  }
  if(opt_modifier) {
    return className + "-" + rename(opt_modifier)
  }else {
    return rename(className)
  }
};
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style
};
goog.global.CLOSURE_CSS_NAME_MAPPING;
if(!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING
}
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for(var key in values) {
    var value = ("" + values[key]).replace(/\$/g, "$$$$");
    str = str.replace(new RegExp("\\{\\$" + key + "\\}", "gi"), value)
  }
  return str
};
goog.getMsgWithFallback = function(a, b) {
  return a
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo)
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if(caller.superClass_) {
    return caller.superClass_.constructor.apply(me, Array.prototype.slice.call(arguments, 1))
  }
  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for(var ctor = me.constructor;ctor;ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if(ctor.prototype[opt_methodName] === caller) {
      foundCaller = true
    }else {
      if(foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args)
      }
    }
  }
  if(me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args)
  }else {
    throw Error("goog.base called from a method of one name " + "to a method of a different name");
  }
};
goog.scope = function(fn) {
  fn.call(goog.global)
};
// Input 1
/*
 Dual licensed under the MIT or GPL licenses.
*/
goog.provide("pike.animation.Animator");
pike.animation.Animator = function(duration) {
  this.duration_ = duration;
  this.repeatCount_ = pike.animation.Animator.INFINITE;
  this.loopsDone_ = 0;
  this.repeatBehavior_ = pike.animation.Animator.RepeatBehavior.REVERSE;
  this.timeSinceLoopStart_ = 0;
  this.started_ = false;
  this.running_ = false;
  this.reverseLoop_ = false
};
pike.animation.Animator.INFINITE = -1;
pike.animation.Animator.RepeatBehavior = {LOOP:1, REVERSE:2};
pike.animation.Animator.prototype.start = function() {
  this.started_ = true;
  this.running_ = true
};
pike.animation.Animator.prototype.isRunning = function() {
  return this.running_
};
pike.animation.Animator.prototype.stop = function() {
  this.loopsDone_ = 0;
  this.timeSinceLoopStart_ = 0;
  this.running_ = false;
  this.started_ = false
};
pike.animation.Animator.prototype.pause = function() {
  this.running_ = false
};
pike.animation.Animator.prototype.update = function(deltaTime) {
  if(!this.started_) {
    return
  }
  if(!this.running_) {
    deltaTime = 0
  }
  this.timeSinceLoopStart_ += deltaTime;
  if(this.timeSinceLoopStart_ >= this.duration_) {
    var loopsSkipped = Math.floor(this.timeSinceLoopStart_ / this.duration_);
    this.timeSinceLoopStart_ %= this.duration_;
    if(this.repeatCount_ != pike.animation.Animator.INFINITE && loopsSkipped > this.repeatCount_ - this.loopsDone_) {
      loopsSkipped = this.repeatCount_ - this.loopsDone_
    }
    this.loopsDone_ += loopsSkipped;
    this.reverseLoop_ = this.repeatBehavior_ == pike.animation.Animator.RepeatBehavior.REVERSE && this.loopsDone_ % 2 == 1;
    if(this.repeatCount_ != pike.animation.Animator.INFINITE && this.loopsDone_ == this.repeatCount_) {
      this.stop();
      return
    }
  }
  var fraction = this.timeSinceLoopStart_ / this.duration_;
  if(this.reverseLoop_) {
    fraction = 0.99999999999999 - fraction
  }
  return fraction
};
pike.animation.Animator.prototype.throwIfStarted_ = function() {
  if(this.started_) {
    throw new Error("Cannot change property on the started animator");
  }
};
pike.animation.Animator.prototype.getDuration = function() {
  return this.duration_
};
pike.animation.Animator.prototype.setDuration = function(duration) {
  this.throwIfStarted_();
  if(duration < 1) {
    throw Error("Duration can't be < 1");
  }
  this.duration_ = duration
};
pike.animation.Animator.prototype.setRepeatCount = function(repeatCount) {
  this.throwIfStarted_();
  if(repeatCount < 1 && repeatCount != pike.animation.Animator.INFINITE) {
    throw Error("Repeat count must be greater than 0 or INFINITE");
  }
  this.repeatCount_ = repeatCount
};
pike.animation.Animator.prototype.getRepeatCount = function() {
  return this.repeatCount_
};
pike.animation.Animator.prototype.setRepeatBehavior = function(repeatBehavior) {
  return this.repeatBehavior_ = repeatBehavior
};
pike.animation.Animator.prototype.getRepeatBehavior = function() {
  return this.repeatBehavior_
};
// Input 2
goog.provide("goog.disposable.IDisposable");
goog.disposable.IDisposable = function() {
};
goog.disposable.IDisposable.prototype.dispose;
goog.disposable.IDisposable.prototype.isDisposed;
// Input 3
goog.provide("goog.Disposable");
goog.provide("goog.dispose");
goog.require("goog.disposable.IDisposable");
goog.Disposable = function() {
  if(goog.Disposable.MONITORING_MODE != goog.Disposable.MonitoringMode.OFF) {
    this.creationStack = (new Error).stack;
    goog.Disposable.instances_[goog.getUid(this)] = this
  }
};
goog.Disposable.MonitoringMode = {OFF:0, PERMANENT:1, INTERACTIVE:2};
goog.Disposable.MONITORING_MODE = 0;
goog.Disposable.instances_ = {};
goog.Disposable.getUndisposedObjects = function() {
  var ret = [];
  for(var id in goog.Disposable.instances_) {
    if(goog.Disposable.instances_.hasOwnProperty(id)) {
      ret.push(goog.Disposable.instances_[Number(id)])
    }
  }
  return ret
};
goog.Disposable.clearUndisposedObjects = function() {
  goog.Disposable.instances_ = {}
};
goog.Disposable.prototype.disposed_ = false;
goog.Disposable.prototype.onDisposeCallbacks_;
goog.Disposable.prototype.creationStack;
goog.Disposable.prototype.isDisposed = function() {
  return this.disposed_
};
goog.Disposable.prototype.getDisposed = goog.Disposable.prototype.isDisposed;
goog.Disposable.prototype.dispose = function() {
  if(!this.disposed_) {
    this.disposed_ = true;
    this.disposeInternal();
    if(goog.Disposable.MONITORING_MODE != goog.Disposable.MonitoringMode.OFF) {
      var uid = goog.getUid(this);
      if(goog.Disposable.MONITORING_MODE == goog.Disposable.MonitoringMode.PERMANENT && !goog.Disposable.instances_.hasOwnProperty(uid)) {
        throw Error(this + " did not call the goog.Disposable base " + "constructor or was disposed of after a clearUndisposedObjects " + "call");
      }
      delete goog.Disposable.instances_[uid]
    }
  }
};
goog.Disposable.prototype.registerDisposable = function(disposable) {
  this.addOnDisposeCallback(goog.partial(goog.dispose, disposable))
};
goog.Disposable.prototype.addOnDisposeCallback = function(callback, opt_scope) {
  if(!this.onDisposeCallbacks_) {
    this.onDisposeCallbacks_ = []
  }
  this.onDisposeCallbacks_.push(goog.bind(callback, opt_scope))
};
goog.Disposable.prototype.disposeInternal = function() {
  if(this.onDisposeCallbacks_) {
    while(this.onDisposeCallbacks_.length) {
      this.onDisposeCallbacks_.shift()()
    }
  }
};
goog.Disposable.isDisposed = function(obj) {
  if(obj && typeof obj.isDisposed == "function") {
    return obj.isDisposed()
  }
  return false
};
goog.dispose = function(obj) {
  if(obj && typeof obj.dispose == "function") {
    obj.dispose()
  }
};
goog.disposeAll = function(var_args) {
  for(var i = 0, len = arguments.length;i < len;++i) {
    var disposable = arguments[i];
    if(goog.isArrayLike(disposable)) {
      goog.disposeAll.apply(null, disposable)
    }else {
      goog.dispose(disposable)
    }
  }
};
// Input 4
goog.provide("goog.events.Event");
goog.provide("goog.events.EventLike");
goog.require("goog.Disposable");
goog.events.EventLike;
goog.events.Event = function(type, opt_target) {
  this.type = type;
  this.target = opt_target;
  this.currentTarget = this.target
};
goog.events.Event.prototype.disposeInternal = function() {
};
goog.events.Event.prototype.dispose = function() {
};
goog.events.Event.prototype.propagationStopped_ = false;
goog.events.Event.prototype.defaultPrevented = false;
goog.events.Event.prototype.returnValue_ = true;
goog.events.Event.prototype.stopPropagation = function() {
  this.propagationStopped_ = true
};
goog.events.Event.prototype.preventDefault = function() {
  this.defaultPrevented = true;
  this.returnValue_ = false
};
goog.events.Event.stopPropagation = function(e) {
  e.stopPropagation()
};
goog.events.Event.preventDefault = function(e) {
  e.preventDefault()
};
// Input 5
goog.provide("goog.events.Listenable");
goog.provide("goog.events.ListenableKey");
goog.require("goog.events.EventLike");
goog.events.Listenable = function() {
};
goog.events.Listenable.USE_LISTENABLE_INTERFACE = false;
goog.events.Listenable.IMPLEMENTED_BY_PROP_ = "__closure_listenable";
goog.events.Listenable.addImplementation = function(cls) {
  cls.prototype[goog.events.Listenable.IMPLEMENTED_BY_PROP_] = true
};
goog.events.Listenable.isImplementedBy = function(obj) {
  return!!(obj && obj[goog.events.Listenable.IMPLEMENTED_BY_PROP_])
};
goog.events.Listenable.prototype.listen;
goog.events.Listenable.prototype.listenOnce;
goog.events.Listenable.prototype.unlisten;
goog.events.Listenable.prototype.unlistenByKey;
goog.events.Listenable.prototype.dispatchEvent;
goog.events.Listenable.prototype.removeAllListeners;
goog.events.Listenable.prototype.fireListeners;
goog.events.Listenable.prototype.getListeners;
goog.events.Listenable.prototype.getListener;
goog.events.Listenable.prototype.hasListener;
goog.events.ListenableKey = function() {
};
goog.events.ListenableKey.counter_ = 0;
goog.events.ListenableKey.reserveKey = function() {
  return++goog.events.ListenableKey.counter_
};
goog.events.ListenableKey.prototype.src;
goog.events.ListenableKey.prototype.type;
goog.events.ListenableKey.prototype.listener;
goog.events.ListenableKey.prototype.capture;
goog.events.ListenableKey.prototype.handler;
goog.events.ListenableKey.prototype.key;
// Input 6
goog.provide("goog.events.Listener");
goog.require("goog.events.ListenableKey");
goog.events.Listener = function() {
  if(goog.events.Listener.ENABLE_MONITORING) {
    this.creationStack = (new Error).stack
  }
};
goog.events.Listener.ENABLE_MONITORING = false;
goog.events.Listener.prototype.isFunctionListener_;
goog.events.Listener.prototype.listener;
goog.events.Listener.prototype.proxy;
goog.events.Listener.prototype.src;
goog.events.Listener.prototype.type;
goog.events.Listener.prototype.capture;
goog.events.Listener.prototype.handler;
goog.events.Listener.prototype.key = 0;
goog.events.Listener.prototype.removed = false;
goog.events.Listener.prototype.callOnce = false;
goog.events.Listener.prototype.creationStack;
goog.events.Listener.prototype.init = function(listener, proxy, src, type, capture, opt_handler) {
  if(goog.isFunction(listener)) {
    this.isFunctionListener_ = true
  }else {
    if(listener && listener.handleEvent && goog.isFunction(listener.handleEvent)) {
      this.isFunctionListener_ = false
    }else {
      throw Error("Invalid listener argument");
    }
  }
  this.listener = listener;
  this.proxy = proxy;
  this.src = src;
  this.type = type;
  this.capture = !!capture;
  this.handler = opt_handler;
  this.callOnce = false;
  this.key = goog.events.ListenableKey.reserveKey();
  this.removed = false
};
goog.events.Listener.prototype.handleEvent = function(eventObject) {
  if(this.isFunctionListener_) {
    return this.listener.call(this.handler || this.src, eventObject)
  }
  return this.listener.handleEvent.call(this.listener, eventObject)
};
// Input 7
goog.provide("goog.debug.errorHandlerWeakDep");
goog.debug.errorHandlerWeakDep = {protectEntryPoint:function(fn, opt_tracers) {
  return fn
}};
// Input 8
goog.provide("goog.string");
goog.provide("goog.string.Unicode");
goog.string.Unicode = {NBSP:"\u00a0"};
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0
};
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l
};
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(prefix, str.substr(0, prefix.length)) == 0
};
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(suffix, str.substr(str.length - suffix.length, suffix.length)) == 0
};
goog.string.subs = function(str, var_args) {
  for(var i = 1;i < arguments.length;i++) {
    var replacement = String(arguments[i]).replace(/\$/g, "$$$$");
    str = str.replace(/\%s/, replacement)
  }
  return str
};
goog.string.collapseWhitespace = function(str) {
  return str.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "")
};
goog.string.isEmpty = function(str) {
  return/^[\s\xa0]*$/.test(str)
};
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str))
};
goog.string.isBreakingWhitespace = function(str) {
  return!/[^\t\n\r ]/.test(str)
};
goog.string.isAlpha = function(str) {
  return!/[^a-zA-Z]/.test(str)
};
goog.string.isNumeric = function(str) {
  return!/[^0-9]/.test(str)
};
goog.string.isAlphaNumeric = function(str) {
  return!/[^a-zA-Z0-9]/.test(str)
};
goog.string.isSpace = function(ch) {
  return ch == " "
};
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= " " && ch <= "~" || ch >= "\u0080" && ch <= "\ufffd"
};
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, " ")
};
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, "\n")
};
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, " ")
};
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, " ")
};
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "")
};
goog.string.trim = function(str) {
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
};
goog.string.trimLeft = function(str) {
  return str.replace(/^[\s\xa0]+/, "")
};
goog.string.trimRight = function(str) {
  return str.replace(/[\s\xa0]+$/, "")
};
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();
  if(test1 < test2) {
    return-1
  }else {
    if(test1 == test2) {
      return 0
    }else {
      return 1
    }
  }
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function(str1, str2) {
  if(str1 == str2) {
    return 0
  }
  if(!str1) {
    return-1
  }
  if(!str2) {
    return 1
  }
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var count = Math.min(tokens1.length, tokens2.length);
  for(var i = 0;i < count;i++) {
    var a = tokens1[i];
    var b = tokens2[i];
    if(a != b) {
      var num1 = parseInt(a, 10);
      if(!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if(!isNaN(num2) && num1 - num2) {
          return num1 - num2
        }
      }
      return a < b ? -1 : 1
    }
  }
  if(tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length
  }
  return str1 < str2 ? -1 : 1
};
goog.string.urlEncode = function(str) {
  return encodeURIComponent(String(str))
};
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, " "))
};
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? "<br />" : "<br>")
};
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {
  if(opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, "&amp;").replace(goog.string.ltRe_, "&lt;").replace(goog.string.gtRe_, "&gt;").replace(goog.string.quotRe_, "&quot;")
  }else {
    if(!goog.string.allRe_.test(str)) {
      return str
    }
    if(str.indexOf("&") != -1) {
      str = str.replace(goog.string.amperRe_, "&amp;")
    }
    if(str.indexOf("<") != -1) {
      str = str.replace(goog.string.ltRe_, "&lt;")
    }
    if(str.indexOf(">") != -1) {
      str = str.replace(goog.string.gtRe_, "&gt;")
    }
    if(str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, "&quot;")
    }
    return str
  }
};
goog.string.amperRe_ = /&/g;
goog.string.ltRe_ = /</g;
goog.string.gtRe_ = />/g;
goog.string.quotRe_ = /\"/g;
goog.string.allRe_ = /[&<>\"]/;
goog.string.unescapeEntities = function(str) {
  if(goog.string.contains(str, "&")) {
    if("document" in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str)
    }else {
      return goog.string.unescapePureXmlEntities_(str)
    }
  }
  return str
};
goog.string.unescapeEntitiesUsingDom_ = function(str) {
  var seen = {"&amp;":"&", "&lt;":"<", "&gt;":">", "&quot;":'"'};
  var div = document.createElement("div");
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    var value = seen[s];
    if(value) {
      return value
    }
    if(entity.charAt(0) == "#") {
      var n = Number("0" + entity.substr(1));
      if(!isNaN(n)) {
        value = String.fromCharCode(n)
      }
    }
    if(!value) {
      div.innerHTML = s + " ";
      value = div.firstChild.nodeValue.slice(0, -1)
    }
    return seen[s] = value
  })
};
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch(entity) {
      case "amp":
        return"&";
      case "lt":
        return"<";
      case "gt":
        return">";
      case "quot":
        return'"';
      default:
        if(entity.charAt(0) == "#") {
          var n = Number("0" + entity.substr(1));
          if(!isNaN(n)) {
            return String.fromCharCode(n)
          }
        }
        return s
    }
  })
};
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, " &#160;"), opt_xml)
};
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for(var i = 0;i < length;i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if(str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1)
    }
  }
  return str
};
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if(opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str)
  }
  if(str.length > chars) {
    str = str.substring(0, chars - 3) + "..."
  }
  if(opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str)
  }
  return str
};
goog.string.truncateMiddle = function(str, chars, opt_protectEscapedCharacters, opt_trailingChars) {
  if(opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str)
  }
  if(opt_trailingChars && str.length > chars) {
    if(opt_trailingChars > chars) {
      opt_trailingChars = chars
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + "..." + str.substring(endPoint)
  }else {
    if(str.length > chars) {
      var half = Math.floor(chars / 2);
      var endPos = str.length - half;
      half += chars % 2;
      str = str.substring(0, half) + "..." + str.substring(endPos)
    }
  }
  if(opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str)
  }
  return str
};
goog.string.specialEscapeChars_ = {"\x00":"\\0", "\b":"\\b", "\f":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\x0B", '"':'\\"', "\\":"\\\\"};
goog.string.jsEscapeCache_ = {"'":"\\'"};
goog.string.quote = function(s) {
  s = String(s);
  if(s.quote) {
    return s.quote()
  }else {
    var sb = ['"'];
    for(var i = 0;i < s.length;i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] || (cc > 31 && cc < 127 ? ch : goog.string.escapeChar(ch))
    }
    sb.push('"');
    return sb.join("")
  }
};
goog.string.escapeString = function(str) {
  var sb = [];
  for(var i = 0;i < str.length;i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i))
  }
  return sb.join("")
};
goog.string.escapeChar = function(c) {
  if(c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c]
  }
  if(c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c]
  }
  var rv = c;
  var cc = c.charCodeAt(0);
  if(cc > 31 && cc < 127) {
    rv = c
  }else {
    if(cc < 256) {
      rv = "\\x";
      if(cc < 16 || cc > 256) {
        rv += "0"
      }
    }else {
      rv = "\\u";
      if(cc < 4096) {
        rv += "0"
      }
    }
    rv += cc.toString(16).toUpperCase()
  }
  return goog.string.jsEscapeCache_[c] = rv
};
goog.string.toMap = function(s) {
  var rv = {};
  for(var i = 0;i < s.length;i++) {
    rv[s.charAt(i)] = true
  }
  return rv
};
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1
};
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0
};
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  if(index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) + s.substr(index + stringLength, s.length - index - stringLength)
  }
  return resultStr
};
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "");
  return s.replace(re, "")
};
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "g");
  return s.replace(re, "")
};
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
};
goog.string.repeat = function(string, length) {
  return(new Array(length + 1)).join(string)
};
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf(".");
  if(index == -1) {
    index = s.length
  }
  return goog.string.repeat("0", Math.max(0, length - index)) + s
};
goog.string.makeSafe = function(obj) {
  return obj == null ? "" : String(obj)
};
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, "")
};
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36)
};
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  var v1Subs = goog.string.trim(String(version1)).split(".");
  var v2Subs = goog.string.trim(String(version2)).split(".");
  var subCount = Math.max(v1Subs.length, v2Subs.length);
  for(var subIdx = 0;order == 0 && subIdx < subCount;subIdx++) {
    var v1Sub = v1Subs[subIdx] || "";
    var v2Sub = v2Subs[subIdx] || "";
    var v1CompParser = new RegExp("(\\d*)(\\D*)", "g");
    var v2CompParser = new RegExp("(\\d*)(\\D*)", "g");
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ["", "", ""];
      var v2Comp = v2CompParser.exec(v2Sub) || ["", "", ""];
      if(v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break
      }
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);
      order = goog.string.compareElements_(v1CompNum, v2CompNum) || goog.string.compareElements_(v1Comp[2].length == 0, v2Comp[2].length == 0) || goog.string.compareElements_(v1Comp[2], v2Comp[2])
    }while(order == 0)
  }
  return order
};
goog.string.compareElements_ = function(left, right) {
  if(left < right) {
    return-1
  }else {
    if(left > right) {
      return 1
    }
  }
  return 0
};
goog.string.HASHCODE_MAX_ = 4294967296;
goog.string.hashCode = function(str) {
  var result = 0;
  for(var i = 0;i < str.length;++i) {
    result = 31 * result + str.charCodeAt(i);
    result %= goog.string.HASHCODE_MAX_
  }
  return result
};
goog.string.uniqueStringCounter_ = Math.random() * 2147483648 | 0;
goog.string.createUniqueString = function() {
  return"goog_" + goog.string.uniqueStringCounter_++
};
goog.string.toNumber = function(str) {
  var num = Number(str);
  if(num == 0 && goog.string.isEmpty(str)) {
    return NaN
  }
  return num
};
goog.string.toCamelCase = function(str) {
  return String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase()
  })
};
goog.string.toSelectorCase = function(str) {
  return String(str).replace(/([A-Z])/g, "-$1").toLowerCase()
};
goog.string.toTitleCase = function(str, opt_delimiters) {
  var delimiters = goog.isString(opt_delimiters) ? goog.string.regExpEscape(opt_delimiters) : "\\s";
  delimiters = delimiters ? "|[" + delimiters + "]+" : "";
  var regexp = new RegExp("(^" + delimiters + ")([a-z])", "g");
  return str.replace(regexp, function(all, p1, p2) {
    return p1 + p2.toUpperCase()
  })
};
goog.string.parseInt = function(value) {
  if(isFinite(value)) {
    value = String(value)
  }
  if(goog.isString(value)) {
    return/^\s*-?0x/i.test(value) ? parseInt(value, 16) : parseInt(value, 10)
  }
  return NaN
};
// Input 9
goog.provide("goog.userAgent");
goog.require("goog.string");
goog.userAgent.ASSUME_IE = false;
goog.userAgent.ASSUME_GECKO = false;
goog.userAgent.ASSUME_WEBKIT = false;
goog.userAgent.ASSUME_MOBILE_WEBKIT = false;
goog.userAgent.ASSUME_OPERA = false;
goog.userAgent.ASSUME_ANY_VERSION = false;
goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_GECKO || goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA;
goog.userAgent.getUserAgentString = function() {
  return goog.global["navigator"] ? goog.global["navigator"].userAgent : null
};
goog.userAgent.getNavigator = function() {
  return goog.global["navigator"]
};
goog.userAgent.init_ = function() {
  goog.userAgent.detectedOpera_ = false;
  goog.userAgent.detectedIe_ = false;
  goog.userAgent.detectedWebkit_ = false;
  goog.userAgent.detectedMobile_ = false;
  goog.userAgent.detectedGecko_ = false;
  var ua;
  if(!goog.userAgent.BROWSER_KNOWN_ && (ua = goog.userAgent.getUserAgentString())) {
    var navigator = goog.userAgent.getNavigator();
    goog.userAgent.detectedOpera_ = ua.indexOf("Opera") == 0;
    goog.userAgent.detectedIe_ = !goog.userAgent.detectedOpera_ && ua.indexOf("MSIE") != -1;
    goog.userAgent.detectedWebkit_ = !goog.userAgent.detectedOpera_ && ua.indexOf("WebKit") != -1;
    goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ && ua.indexOf("Mobile") != -1;
    goog.userAgent.detectedGecko_ = !goog.userAgent.detectedOpera_ && !goog.userAgent.detectedWebkit_ && navigator.product == "Gecko"
  }
};
if(!goog.userAgent.BROWSER_KNOWN_) {
  goog.userAgent.init_()
}
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : goog.userAgent.detectedGecko_;
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : goog.userAgent.detectedWebkit_;
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.detectedMobile_;
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || ""
};
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();
goog.userAgent.ASSUME_MAC = false;
goog.userAgent.ASSUME_WINDOWS = false;
goog.userAgent.ASSUME_LINUX = false;
goog.userAgent.ASSUME_X11 = false;
goog.userAgent.ASSUME_ANDROID = false;
goog.userAgent.ASSUME_IPHONE = false;
goog.userAgent.ASSUME_IPAD = false;
goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_WINDOWS || goog.userAgent.ASSUME_LINUX || goog.userAgent.ASSUME_X11 || goog.userAgent.ASSUME_ANDROID || goog.userAgent.ASSUME_IPHONE || goog.userAgent.ASSUME_IPAD;
goog.userAgent.initPlatform_ = function() {
  goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM, "Mac");
  goog.userAgent.detectedWindows_ = goog.string.contains(goog.userAgent.PLATFORM, "Win");
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM, "Linux");
  goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() && goog.string.contains(goog.userAgent.getNavigator()["appVersion"] || "", "X11");
  var ua = goog.userAgent.getUserAgentString();
  goog.userAgent.detectedAndroid_ = !!ua && ua.indexOf("Android") >= 0;
  goog.userAgent.detectedIPhone_ = !!ua && ua.indexOf("iPhone") >= 0;
  goog.userAgent.detectedIPad_ = !!ua && ua.indexOf("iPad") >= 0
};
if(!goog.userAgent.PLATFORM_KNOWN_) {
  goog.userAgent.initPlatform_()
}
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;
goog.userAgent.ANDROID = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_ANDROID : goog.userAgent.detectedAndroid_;
goog.userAgent.IPHONE = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPHONE : goog.userAgent.detectedIPhone_;
goog.userAgent.IPAD = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPAD : goog.userAgent.detectedIPad_;
goog.userAgent.determineVersion_ = function() {
  var version = "", re;
  if(goog.userAgent.OPERA && goog.global["opera"]) {
    var operaVersion = goog.global["opera"].version;
    version = typeof operaVersion == "function" ? operaVersion() : operaVersion
  }else {
    if(goog.userAgent.GECKO) {
      re = /rv\:([^\);]+)(\)|;)/
    }else {
      if(goog.userAgent.IE) {
        re = /MSIE\s+([^\);]+)(\)|;)/
      }else {
        if(goog.userAgent.WEBKIT) {
          re = /WebKit\/(\S+)/
        }
      }
    }
    if(re) {
      var arr = re.exec(goog.userAgent.getUserAgentString());
      version = arr ? arr[1] : ""
    }
  }
  if(goog.userAgent.IE) {
    var docMode = goog.userAgent.getDocumentMode_();
    if(docMode > parseFloat(version)) {
      return String(docMode)
    }
  }
  return version
};
goog.userAgent.getDocumentMode_ = function() {
  var doc = goog.global["document"];
  return doc ? doc["documentMode"] : undefined
};
goog.userAgent.VERSION = goog.userAgent.determineVersion_();
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2)
};
goog.userAgent.isVersionCache_ = {};
goog.userAgent.isVersion = function(version) {
  return goog.userAgent.ASSUME_ANY_VERSION || goog.userAgent.isVersionCache_[version] || (goog.userAgent.isVersionCache_[version] = goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0)
};
goog.userAgent.isDocumentMode = function(documentMode) {
  return goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE >= documentMode
};
goog.userAgent.DOCUMENT_MODE = function() {
  var doc = goog.global["document"];
  if(!doc || !goog.userAgent.IE) {
    return undefined
  }
  var mode = goog.userAgent.getDocumentMode_();
  return mode || (doc["compatMode"] == "CSS1Compat" ? parseInt(goog.userAgent.VERSION, 10) : 5)
}();
// Input 10
goog.provide("goog.object");
goog.object.forEach = function(obj, f, opt_obj) {
  for(var key in obj) {
    f.call(opt_obj, obj[key], key, obj)
  }
};
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for(var key in obj) {
    if(f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key]
    }
  }
  return res
};
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for(var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj)
  }
  return res
};
goog.object.some = function(obj, f, opt_obj) {
  for(var key in obj) {
    if(f.call(opt_obj, obj[key], key, obj)) {
      return true
    }
  }
  return false
};
goog.object.every = function(obj, f, opt_obj) {
  for(var key in obj) {
    if(!f.call(opt_obj, obj[key], key, obj)) {
      return false
    }
  }
  return true
};
goog.object.getCount = function(obj) {
  var rv = 0;
  for(var key in obj) {
    rv++
  }
  return rv
};
goog.object.getAnyKey = function(obj) {
  for(var key in obj) {
    return key
  }
};
goog.object.getAnyValue = function(obj) {
  for(var key in obj) {
    return obj[key]
  }
};
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val)
};
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for(var key in obj) {
    res[i++] = obj[key]
  }
  return res
};
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for(var key in obj) {
    res[i++] = key
  }
  return res
};
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;
  for(var i = isArrayLike ? 0 : 1;i < keys.length;i++) {
    obj = obj[keys[i]];
    if(!goog.isDef(obj)) {
      break
    }
  }
  return obj
};
goog.object.containsKey = function(obj, key) {
  return key in obj
};
goog.object.containsValue = function(obj, val) {
  for(var key in obj) {
    if(obj[key] == val) {
      return true
    }
  }
  return false
};
goog.object.findKey = function(obj, f, opt_this) {
  for(var key in obj) {
    if(f.call(opt_this, obj[key], key, obj)) {
      return key
    }
  }
  return undefined
};
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key]
};
goog.object.isEmpty = function(obj) {
  for(var key in obj) {
    return false
  }
  return true
};
goog.object.clear = function(obj) {
  for(var i in obj) {
    delete obj[i]
  }
};
goog.object.remove = function(obj, key) {
  var rv;
  if(rv = key in obj) {
    delete obj[key]
  }
  return rv
};
goog.object.add = function(obj, key, val) {
  if(key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val)
};
goog.object.get = function(obj, key, opt_val) {
  if(key in obj) {
    return obj[key]
  }
  return opt_val
};
goog.object.set = function(obj, key, value) {
  obj[key] = value
};
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : obj[key] = value
};
goog.object.clone = function(obj) {
  var res = {};
  for(var key in obj) {
    res[key] = obj[key]
  }
  return res
};
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key])
    }
    return clone
  }
  return obj
};
goog.object.transpose = function(obj) {
  var transposed = {};
  for(var key in obj) {
    transposed[obj[key]] = key
  }
  return transposed
};
goog.object.PROTOTYPE_FIELDS_ = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
goog.object.extend = function(target, var_args) {
  var key, source;
  for(var i = 1;i < arguments.length;i++) {
    source = arguments[i];
    for(key in source) {
      target[key] = source[key]
    }
    for(var j = 0;j < goog.object.PROTOTYPE_FIELDS_.length;j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if(Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key]
      }
    }
  }
};
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if(argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0])
  }
  if(argLength % 2) {
    throw Error("Uneven number of arguments");
  }
  var rv = {};
  for(var i = 0;i < argLength;i += 2) {
    rv[arguments[i]] = arguments[i + 1]
  }
  return rv
};
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if(argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0])
  }
  var rv = {};
  for(var i = 0;i < argLength;i++) {
    rv[arguments[i]] = true
  }
  return rv
};
goog.object.createImmutableView = function(obj) {
  var result = obj;
  if(Object.isFrozen && !Object.isFrozen(obj)) {
    result = Object.create(obj);
    Object.freeze(result)
  }
  return result
};
goog.object.isImmutableView = function(obj) {
  return!!Object.isFrozen && Object.isFrozen(obj)
};
// Input 11
goog.provide("goog.events.BrowserFeature");
goog.require("goog.userAgent");
goog.events.BrowserFeature = {HAS_W3C_BUTTON:!goog.userAgent.IE || goog.userAgent.isDocumentMode(9), HAS_W3C_EVENT_SUPPORT:!goog.userAgent.IE || goog.userAgent.isDocumentMode(9), SET_KEY_CODE_TO_PREVENT_DEFAULT:goog.userAgent.IE && !goog.userAgent.isVersion("9"), HAS_NAVIGATOR_ONLINE_PROPERTY:!goog.userAgent.WEBKIT || goog.userAgent.isVersion("528"), HAS_HTML5_NETWORK_EVENT_SUPPORT:goog.userAgent.GECKO && goog.userAgent.isVersion("1.9b") || goog.userAgent.IE && goog.userAgent.isVersion("8") || goog.userAgent.OPERA && 
goog.userAgent.isVersion("9.5") || goog.userAgent.WEBKIT && goog.userAgent.isVersion("528"), HTML5_NETWORK_EVENTS_FIRE_ON_BODY:goog.userAgent.GECKO && !goog.userAgent.isVersion("8") || goog.userAgent.IE && !goog.userAgent.isVersion("9"), TOUCH_ENABLED:"ontouchstart" in goog.global || !!(goog.global["document"] && document.documentElement && "ontouchstart" in document.documentElement) || !!(goog.global["navigator"] && goog.global["navigator"]["msMaxTouchPoints"])};
// Input 12
goog.provide("goog.debug.Error");
goog.debug.Error = function(opt_msg) {
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.debug.Error)
  }else {
    this.stack = (new Error).stack || ""
  }
  if(opt_msg) {
    this.message = String(opt_msg)
  }
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
// Input 13
goog.provide("goog.asserts");
goog.provide("goog.asserts.AssertionError");
goog.require("goog.debug.Error");
goog.require("goog.string");
goog.asserts.ENABLE_ASSERTS = goog.DEBUG;
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  messageArgs.shift();
  this.messagePattern = messagePattern
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
goog.asserts.AssertionError.prototype.name = "AssertionError";
goog.asserts.doAssertFailure_ = function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = "Assertion failed";
  if(givenMessage) {
    message += ": " + givenMessage;
    var args = givenArgs
  }else {
    if(defaultMessage) {
      message += ": " + defaultMessage;
      args = defaultArgs
    }
  }
  throw new goog.asserts.AssertionError("" + message, args || []);
};
goog.asserts.assert = function(condition, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_("", null, opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return condition
};
goog.asserts.fail = function(opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS) {
    throw new goog.asserts.AssertionError("Failure" + (opt_message ? ": " + opt_message : ""), Array.prototype.slice.call(arguments, 1));
  }
};
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertString = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return(value)
};
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_("instanceof check failed.", null, opt_message, Array.prototype.slice.call(arguments, 3))
  }
  return(value)
};
// Input 14
goog.provide("goog.array");
goog.provide("goog.array.ArrayLike");
goog.require("goog.asserts");
goog.NATIVE_ARRAY_PROTOTYPES = goog.TRUSTED_SITE;
goog.array.ArrayLike;
goog.array.peek = function(array) {
  return array[array.length - 1]
};
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.indexOf ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex)
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? 0 : opt_fromIndex < 0 ? Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex;
  if(goog.isString(arr)) {
    if(!goog.isString(obj) || obj.length != 1) {
      return-1
    }
    return arr.indexOf(obj, fromIndex)
  }
  for(var i = fromIndex;i < arr.length;i++) {
    if(i in arr && arr[i] === obj) {
      return i
    }
  }
  return-1
};
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.lastIndexOf ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex)
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  if(fromIndex < 0) {
    fromIndex = Math.max(0, arr.length + fromIndex)
  }
  if(goog.isString(arr)) {
    if(!goog.isString(obj) || obj.length != 1) {
      return-1
    }
    return arr.lastIndexOf(obj, fromIndex)
  }
  for(var i = fromIndex;i >= 0;i--) {
    if(i in arr && arr[i] === obj) {
      return i
    }
  }
  return-1
};
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.forEach ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      f.call(opt_obj, arr2[i], i, arr)
    }
  }
};
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = l - 1;i >= 0;--i) {
    if(i in arr2) {
      f.call(opt_obj, arr2[i], i, arr)
    }
  }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.filter ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = [];
  var resLength = 0;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      var val = arr2[i];
      if(f.call(opt_obj, val, i, arr)) {
        res[resLength++] = val
      }
    }
  }
  return res
};
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.map ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = new Array(l);
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      res[i] = f.call(opt_obj, arr2[i], i, arr)
    }
  }
  return res
};
goog.array.reduce = function(arr, f, val, opt_obj) {
  if(arr.reduce) {
    if(opt_obj) {
      return arr.reduce(goog.bind(f, opt_obj), val)
    }else {
      return arr.reduce(f, val)
    }
  }
  var rval = val;
  goog.array.forEach(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr)
  });
  return rval
};
goog.array.reduceRight = function(arr, f, val, opt_obj) {
  if(arr.reduceRight) {
    if(opt_obj) {
      return arr.reduceRight(goog.bind(f, opt_obj), val)
    }else {
      return arr.reduceRight(f, val)
    }
  }
  var rval = val;
  goog.array.forEachRight(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr)
  });
  return rval
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.some ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return true
    }
  }
  return false
};
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.every ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
      return false
    }
  }
  return true
};
goog.array.count = function(arr, f, opt_obj) {
  var count = 0;
  goog.array.forEach(arr, function(element, index, arr) {
    if(f.call(opt_obj, element, index, arr)) {
      ++count
    }
  }, opt_obj);
  return count
};
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i]
};
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i
    }
  }
  return-1
};
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i]
};
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = l - 1;i >= 0;i--) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i
    }
  }
  return-1
};
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0
};
goog.array.isEmpty = function(arr) {
  return arr.length == 0
};
goog.array.clear = function(arr) {
  if(!goog.isArray(arr)) {
    for(var i = arr.length - 1;i >= 0;i--) {
      delete arr[i]
    }
  }
  arr.length = 0
};
goog.array.insert = function(arr, obj) {
  if(!goog.array.contains(arr, obj)) {
    arr.push(obj)
  }
};
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj)
};
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd)
};
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if(arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj)
  }else {
    goog.array.insertAt(arr, obj, i)
  }
};
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if(rv = i >= 0) {
    goog.array.removeAt(arr, i)
  }
  return rv
};
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1
};
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if(i >= 0) {
    goog.array.removeAt(arr, i);
    return true
  }
  return false
};
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments)
};
goog.array.toArray = function(object) {
  var length = object.length;
  if(length > 0) {
    var rv = new Array(length);
    for(var i = 0;i < length;i++) {
      rv[i] = object[i]
    }
    return rv
  }
  return[]
};
goog.array.clone = goog.array.toArray;
goog.array.extend = function(arr1, var_args) {
  for(var i = 1;i < arguments.length;i++) {
    var arr2 = arguments[i];
    var isArrayLike;
    if(goog.isArray(arr2) || (isArrayLike = goog.isArrayLike(arr2)) && Object.prototype.hasOwnProperty.call(arr2, "callee")) {
      arr1.push.apply(arr1, arr2)
    }else {
      if(isArrayLike) {
        var len1 = arr1.length;
        var len2 = arr2.length;
        for(var j = 0;j < len2;j++) {
          arr1[len1 + j] = arr2[j]
        }
      }else {
        arr1.push(arr2)
      }
    }
  }
};
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.apply(arr, goog.array.slice(arguments, 1))
};
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);
  if(arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start)
  }else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end)
  }
};
goog.array.removeDuplicates = function(arr, opt_rv) {
  var returnArray = opt_rv || arr;
  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while(cursorRead < arr.length) {
    var current = arr[cursorRead++];
    var key = goog.isObject(current) ? "o" + goog.getUid(current) : (typeof current).charAt(0) + current;
    if(!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      returnArray[cursorInsert++] = current
    }
  }
  returnArray.length = cursorInsert
};
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr, opt_compareFn || goog.array.defaultCompare, false, target)
};
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true, undefined, opt_obj)
};
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target, opt_selfObj) {
  var left = 0;
  var right = arr.length;
  var found;
  while(left < right) {
    var middle = left + right >> 1;
    var compareResult;
    if(isEvaluator) {
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr)
    }else {
      compareResult = compareFn(opt_target, arr[middle])
    }
    if(compareResult > 0) {
      left = middle + 1
    }else {
      right = middle;
      found = !compareResult
    }
  }
  return found ? left : ~left
};
goog.array.sort = function(arr, opt_compareFn) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.sort.call(arr, opt_compareFn || goog.array.defaultCompare)
};
goog.array.stableSort = function(arr, opt_compareFn) {
  for(var i = 0;i < arr.length;i++) {
    arr[i] = {index:i, value:arr[i]}
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index
  }
  goog.array.sort(arr, stableCompareFn);
  for(var i = 0;i < arr.length;i++) {
    arr[i] = arr[i].value
  }
};
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return compare(a[key], b[key])
  })
};
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  for(var i = 1;i < arr.length;i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if(compareResult > 0 || compareResult == 0 && opt_strict) {
      return false
    }
  }
  return true
};
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if(!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) || arr1.length != arr2.length) {
    return false
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for(var i = 0;i < l;i++) {
    if(!equalsFn(arr1[i], arr2[i])) {
      return false
    }
  }
  return true
};
goog.array.compare = function(arr1, arr2, opt_equalsFn) {
  return goog.array.equals(arr1, arr2, opt_equalsFn)
};
goog.array.compare3 = function(arr1, arr2, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  var l = Math.min(arr1.length, arr2.length);
  for(var i = 0;i < l;i++) {
    var result = compare(arr1[i], arr2[i]);
    if(result != 0) {
      return result
    }
  }
  return goog.array.defaultCompare(arr1.length, arr2.length)
};
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0
};
goog.array.defaultCompareEquality = function(a, b) {
  return a === b
};
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if(index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true
  }
  return false
};
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return index >= 0 ? goog.array.removeAt(array, index) : false
};
goog.array.bucket = function(array, sorter) {
  var buckets = {};
  for(var i = 0;i < array.length;i++) {
    var value = array[i];
    var key = sorter(value, i, array);
    if(goog.isDef(key)) {
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value)
    }
  }
  return buckets
};
goog.array.toObject = function(arr, keyFunc, opt_obj) {
  var ret = {};
  goog.array.forEach(arr, function(element, index) {
    ret[keyFunc.call(opt_obj, element, index, arr)] = element
  });
  return ret
};
goog.array.range = function(startOrEnd, opt_end, opt_step) {
  var array = [];
  var start = 0;
  var end = startOrEnd;
  var step = opt_step || 1;
  if(opt_end !== undefined) {
    start = startOrEnd;
    end = opt_end
  }
  if(step * (end - start) < 0) {
    return[]
  }
  if(step > 0) {
    for(var i = start;i < end;i += step) {
      array.push(i)
    }
  }else {
    for(var i = start;i > end;i += step) {
      array.push(i)
    }
  }
  return array
};
goog.array.repeat = function(value, n) {
  var array = [];
  for(var i = 0;i < n;i++) {
    array[i] = value
  }
  return array
};
goog.array.flatten = function(var_args) {
  var result = [];
  for(var i = 0;i < arguments.length;i++) {
    var element = arguments[i];
    if(goog.isArray(element)) {
      result.push.apply(result, goog.array.flatten.apply(null, element))
    }else {
      result.push(element)
    }
  }
  return result
};
goog.array.rotate = function(array, n) {
  goog.asserts.assert(array.length != null);
  if(array.length) {
    n %= array.length;
    if(n > 0) {
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(-n, n))
    }else {
      if(n < 0) {
        goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, -n))
      }
    }
  }
  return array
};
goog.array.zip = function(var_args) {
  if(!arguments.length) {
    return[]
  }
  var result = [];
  for(var i = 0;true;i++) {
    var value = [];
    for(var j = 0;j < arguments.length;j++) {
      var arr = arguments[j];
      if(i >= arr.length) {
        return result
      }
      value.push(arr[i])
    }
    result.push(value)
  }
};
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;
  for(var i = arr.length - 1;i > 0;i--) {
    var j = Math.floor(randFn() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp
  }
};
// Input 15
goog.provide("goog.debug.EntryPointMonitor");
goog.provide("goog.debug.entryPointRegistry");
goog.require("goog.asserts");
goog.debug.EntryPointMonitor = function() {
};
goog.debug.EntryPointMonitor.prototype.wrap;
goog.debug.EntryPointMonitor.prototype.unwrap;
goog.debug.entryPointRegistry.refList_ = [];
goog.debug.entryPointRegistry.monitors_ = [];
goog.debug.entryPointRegistry.monitorsMayExist_ = false;
goog.debug.entryPointRegistry.register = function(callback) {
  goog.debug.entryPointRegistry.refList_[goog.debug.entryPointRegistry.refList_.length] = callback;
  if(goog.debug.entryPointRegistry.monitorsMayExist_) {
    var monitors = goog.debug.entryPointRegistry.monitors_;
    for(var i = 0;i < monitors.length;i++) {
      callback(goog.bind(monitors[i].wrap, monitors[i]))
    }
  }
};
goog.debug.entryPointRegistry.monitorAll = function(monitor) {
  goog.debug.entryPointRegistry.monitorsMayExist_ = true;
  var transformer = goog.bind(monitor.wrap, monitor);
  for(var i = 0;i < goog.debug.entryPointRegistry.refList_.length;i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer)
  }
  goog.debug.entryPointRegistry.monitors_.push(monitor)
};
goog.debug.entryPointRegistry.unmonitorAllIfPossible = function(monitor) {
  var monitors = goog.debug.entryPointRegistry.monitors_;
  goog.asserts.assert(monitor == monitors[monitors.length - 1], "Only the most recent monitor can be unwrapped.");
  var transformer = goog.bind(monitor.unwrap, monitor);
  for(var i = 0;i < goog.debug.entryPointRegistry.refList_.length;i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer)
  }
  monitors.length--
};
// Input 16
goog.provide("goog.events.EventWrapper");
goog.events.EventWrapper = function() {
};
goog.events.EventWrapper.prototype.listen = function(src, listener, opt_capt, opt_scope, opt_eventHandler) {
};
goog.events.EventWrapper.prototype.unlisten = function(src, listener, opt_capt, opt_scope, opt_eventHandler) {
};
// Input 17
goog.provide("goog.events.EventType");
goog.require("goog.userAgent");
goog.events.EventType = {CLICK:"click", DBLCLICK:"dblclick", MOUSEDOWN:"mousedown", MOUSEUP:"mouseup", MOUSEOVER:"mouseover", MOUSEOUT:"mouseout", MOUSEMOVE:"mousemove", SELECTSTART:"selectstart", KEYPRESS:"keypress", KEYDOWN:"keydown", KEYUP:"keyup", BLUR:"blur", FOCUS:"focus", DEACTIVATE:"deactivate", FOCUSIN:goog.userAgent.IE ? "focusin" : "DOMFocusIn", FOCUSOUT:goog.userAgent.IE ? "focusout" : "DOMFocusOut", CHANGE:"change", SELECT:"select", SUBMIT:"submit", INPUT:"input", PROPERTYCHANGE:"propertychange", 
DRAGSTART:"dragstart", DRAG:"drag", DRAGENTER:"dragenter", DRAGOVER:"dragover", DRAGLEAVE:"dragleave", DROP:"drop", DRAGEND:"dragend", TOUCHSTART:"touchstart", TOUCHMOVE:"touchmove", TOUCHEND:"touchend", TOUCHCANCEL:"touchcancel", BEFOREUNLOAD:"beforeunload", CONTEXTMENU:"contextmenu", ERROR:"error", HELP:"help", LOAD:"load", LOSECAPTURE:"losecapture", READYSTATECHANGE:"readystatechange", RESIZE:"resize", SCROLL:"scroll", UNLOAD:"unload", HASHCHANGE:"hashchange", PAGEHIDE:"pagehide", PAGESHOW:"pageshow", 
POPSTATE:"popstate", COPY:"copy", PASTE:"paste", CUT:"cut", BEFORECOPY:"beforecopy", BEFORECUT:"beforecut", BEFOREPASTE:"beforepaste", ONLINE:"online", OFFLINE:"offline", MESSAGE:"message", CONNECT:"connect", TRANSITIONEND:goog.userAgent.WEBKIT ? "webkitTransitionEnd" : goog.userAgent.OPERA ? "oTransitionEnd" : "transitionend", MSGESTURECHANGE:"MSGestureChange", MSGESTUREEND:"MSGestureEnd", MSGESTUREHOLD:"MSGestureHold", MSGESTURESTART:"MSGestureStart", MSGESTURETAP:"MSGestureTap", MSGOTPOINTERCAPTURE:"MSGotPointerCapture", 
MSINERTIASTART:"MSInertiaStart", MSLOSTPOINTERCAPTURE:"MSLostPointerCapture", MSPOINTERCANCEL:"MSPointerCancel", MSPOINTERDOWN:"MSPointerDown", MSPOINTERMOVE:"MSPointerMove", MSPOINTEROVER:"MSPointerOver", MSPOINTEROUT:"MSPointerOut", MSPOINTERUP:"MSPointerUp", TEXTINPUT:"textinput", COMPOSITIONSTART:"compositionstart", COMPOSITIONUPDATE:"compositionupdate", COMPOSITIONEND:"compositionend"};
// Input 18
goog.provide("goog.reflect");
goog.reflect.object = function(type, object) {
  return object
};
goog.reflect.sinkValue = function(x) {
  goog.reflect.sinkValue[" "](x);
  return x
};
goog.reflect.sinkValue[" "] = goog.nullFunction;
goog.reflect.canAccessProperty = function(obj, prop) {
  try {
    goog.reflect.sinkValue(obj[prop]);
    return true
  }catch(e) {
  }
  return false
};
// Input 19
goog.provide("goog.events.BrowserEvent");
goog.provide("goog.events.BrowserEvent.MouseButton");
goog.require("goog.events.BrowserFeature");
goog.require("goog.events.Event");
goog.require("goog.events.EventType");
goog.require("goog.reflect");
goog.require("goog.userAgent");
goog.events.BrowserEvent = function(opt_e, opt_currentTarget) {
  if(opt_e) {
    this.init(opt_e, opt_currentTarget)
  }
};
goog.inherits(goog.events.BrowserEvent, goog.events.Event);
goog.events.BrowserEvent.MouseButton = {LEFT:0, MIDDLE:1, RIGHT:2};
goog.events.BrowserEvent.IEButtonMap = [1, 4, 2];
goog.events.BrowserEvent.prototype.target = null;
goog.events.BrowserEvent.prototype.currentTarget;
goog.events.BrowserEvent.prototype.relatedTarget = null;
goog.events.BrowserEvent.prototype.offsetX = 0;
goog.events.BrowserEvent.prototype.offsetY = 0;
goog.events.BrowserEvent.prototype.clientX = 0;
goog.events.BrowserEvent.prototype.clientY = 0;
goog.events.BrowserEvent.prototype.screenX = 0;
goog.events.BrowserEvent.prototype.screenY = 0;
goog.events.BrowserEvent.prototype.button = 0;
goog.events.BrowserEvent.prototype.keyCode = 0;
goog.events.BrowserEvent.prototype.charCode = 0;
goog.events.BrowserEvent.prototype.ctrlKey = false;
goog.events.BrowserEvent.prototype.altKey = false;
goog.events.BrowserEvent.prototype.shiftKey = false;
goog.events.BrowserEvent.prototype.metaKey = false;
goog.events.BrowserEvent.prototype.state;
goog.events.BrowserEvent.prototype.platformModifierKey = false;
goog.events.BrowserEvent.prototype.event_ = null;
goog.events.BrowserEvent.prototype.init = function(e, opt_currentTarget) {
  var type = this.type = e.type;
  goog.events.Event.call(this, type);
  this.target = (e.target) || e.srcElement;
  this.currentTarget = (opt_currentTarget);
  var relatedTarget = (e.relatedTarget);
  if(relatedTarget) {
    if(goog.userAgent.GECKO) {
      if(!goog.reflect.canAccessProperty(relatedTarget, "nodeName")) {
        relatedTarget = null
      }
    }
  }else {
    if(type == goog.events.EventType.MOUSEOVER) {
      relatedTarget = e.fromElement
    }else {
      if(type == goog.events.EventType.MOUSEOUT) {
        relatedTarget = e.toElement
      }
    }
  }
  this.relatedTarget = relatedTarget;
  this.offsetX = goog.userAgent.WEBKIT || e.offsetX !== undefined ? e.offsetX : e.layerX;
  this.offsetY = goog.userAgent.WEBKIT || e.offsetY !== undefined ? e.offsetY : e.layerY;
  this.clientX = e.clientX !== undefined ? e.clientX : e.pageX;
  this.clientY = e.clientY !== undefined ? e.clientY : e.pageY;
  this.screenX = e.screenX || 0;
  this.screenY = e.screenY || 0;
  this.button = e.button;
  this.keyCode = e.keyCode || 0;
  this.charCode = e.charCode || (type == "keypress" ? e.keyCode : 0);
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = goog.userAgent.MAC ? e.metaKey : e.ctrlKey;
  this.state = e.state;
  this.event_ = e;
  if(e.defaultPrevented) {
    this.preventDefault()
  }
  delete this.propagationStopped_
};
goog.events.BrowserEvent.prototype.isButton = function(button) {
  if(!goog.events.BrowserFeature.HAS_W3C_BUTTON) {
    if(this.type == "click") {
      return button == goog.events.BrowserEvent.MouseButton.LEFT
    }else {
      return!!(this.event_.button & goog.events.BrowserEvent.IEButtonMap[button])
    }
  }else {
    return this.event_.button == button
  }
};
goog.events.BrowserEvent.prototype.isMouseActionButton = function() {
  return this.isButton(goog.events.BrowserEvent.MouseButton.LEFT) && !(goog.userAgent.WEBKIT && goog.userAgent.MAC && this.ctrlKey)
};
goog.events.BrowserEvent.prototype.stopPropagation = function() {
  goog.events.BrowserEvent.superClass_.stopPropagation.call(this);
  if(this.event_.stopPropagation) {
    this.event_.stopPropagation()
  }else {
    this.event_.cancelBubble = true
  }
};
goog.events.BrowserEvent.prototype.preventDefault = function() {
  goog.events.BrowserEvent.superClass_.preventDefault.call(this);
  var be = this.event_;
  if(!be.preventDefault) {
    be.returnValue = false;
    if(goog.events.BrowserFeature.SET_KEY_CODE_TO_PREVENT_DEFAULT) {
      try {
        var VK_F1 = 112;
        var VK_F12 = 123;
        if(be.ctrlKey || be.keyCode >= VK_F1 && be.keyCode <= VK_F12) {
          be.keyCode = -1
        }
      }catch(ex) {
      }
    }
  }else {
    be.preventDefault()
  }
};
goog.events.BrowserEvent.prototype.getBrowserEvent = function() {
  return this.event_
};
goog.events.BrowserEvent.prototype.disposeInternal = function() {
};
// Input 20
goog.provide("goog.events");
goog.provide("goog.events.Key");
goog.require("goog.array");
goog.require("goog.debug.entryPointRegistry");
goog.require("goog.debug.errorHandlerWeakDep");
goog.require("goog.events.BrowserEvent");
goog.require("goog.events.BrowserFeature");
goog.require("goog.events.Event");
goog.require("goog.events.EventWrapper");
goog.require("goog.events.Listenable");
goog.require("goog.events.Listener");
goog.require("goog.object");
goog.require("goog.userAgent");
goog.events.Key;
goog.events.ListenableType;
goog.events.listeners_ = {};
goog.events.listenerTree_ = {};
goog.events.sources_ = {};
goog.events.onString_ = "on";
goog.events.onStringMap_ = {};
goog.events.keySeparator_ = "_";
goog.events.listen = function(src, type, listener, opt_capt, opt_handler) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      goog.events.listen(src, type[i], listener, opt_capt, opt_handler)
    }
    return null
  }
  var listenableKey;
  if(goog.events.Listenable.USE_LISTENABLE_INTERFACE && goog.events.Listenable.isImplementedBy(src)) {
    listenableKey = src.listen((type), goog.events.wrapListener_(listener), opt_capt, opt_handler)
  }else {
    listenableKey = goog.events.listen_((src), type, listener, false, opt_capt, opt_handler)
  }
  var key = listenableKey.key;
  goog.events.listeners_[key] = listenableKey;
  return key
};
goog.events.listen_ = function(src, type, listener, callOnce, opt_capt, opt_handler) {
  if(!type) {
    throw Error("Invalid event type");
  }
  var capture = !!opt_capt;
  var map = goog.events.listenerTree_;
  if(!(type in map)) {
    map[type] = {count_:0, remaining_:0}
  }
  map = map[type];
  if(!(capture in map)) {
    map[capture] = {count_:0, remaining_:0};
    map.count_++
  }
  map = map[capture];
  var srcUid = goog.getUid(src);
  var listenerArray, listenerObj;
  map.remaining_++;
  if(!map[srcUid]) {
    listenerArray = map[srcUid] = [];
    map.count_++
  }else {
    listenerArray = map[srcUid];
    for(var i = 0;i < listenerArray.length;i++) {
      listenerObj = listenerArray[i];
      if(listenerObj.listener == listener && listenerObj.handler == opt_handler) {
        if(listenerObj.removed) {
          break
        }
        if(!callOnce) {
          listenerArray[i].callOnce = false
        }
        return listenerArray[i]
      }
    }
  }
  var proxy = goog.events.getProxy();
  listenerObj = new goog.events.Listener;
  listenerObj.init(listener, proxy, src, type, capture, opt_handler);
  listenerObj.callOnce = callOnce;
  proxy.src = src;
  proxy.listener = listenerObj;
  listenerArray.push(listenerObj);
  if(!goog.events.sources_[srcUid]) {
    goog.events.sources_[srcUid] = []
  }
  goog.events.sources_[srcUid].push(listenerObj);
  if(src.addEventListener) {
    if(src == goog.global || !src.customEvent_) {
      src.addEventListener(type, proxy, capture)
    }
  }else {
    src.attachEvent(goog.events.getOnString_(type), proxy)
  }
  return listenerObj
};
goog.events.getProxy = function() {
  var proxyCallbackFunction = goog.events.handleBrowserEvent_;
  var f = goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT ? function(eventObject) {
    return proxyCallbackFunction.call(f.src, f.listener, eventObject)
  } : function(eventObject) {
    var v = proxyCallbackFunction.call(f.src, f.listener, eventObject);
    if(!v) {
      return v
    }
  };
  return f
};
goog.events.listenOnce = function(src, type, listener, opt_capt, opt_handler) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      goog.events.listenOnce(src, type[i], listener, opt_capt, opt_handler)
    }
    return null
  }
  var listenableKey;
  if(goog.events.Listenable.USE_LISTENABLE_INTERFACE && goog.events.Listenable.isImplementedBy(src)) {
    listenableKey = src.listenOnce((type), goog.events.wrapListener_(listener), opt_capt, opt_handler)
  }else {
    listenableKey = goog.events.listen_((src), type, listener, true, opt_capt, opt_handler)
  }
  var key = listenableKey.key;
  goog.events.listeners_[key] = listenableKey;
  return key
};
goog.events.listenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.listen(src, listener, opt_capt, opt_handler)
};
goog.events.unlisten = function(src, type, listener, opt_capt, opt_handler) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      goog.events.unlisten(src, type[i], listener, opt_capt, opt_handler)
    }
    return null
  }
  if(goog.events.Listenable.USE_LISTENABLE_INTERFACE && goog.events.Listenable.isImplementedBy(src)) {
    return src.unlisten((type), goog.events.wrapListener_(listener), opt_capt, opt_handler)
  }
  var capture = !!opt_capt;
  var listenerArray = goog.events.getListeners_(src, type, capture);
  if(!listenerArray) {
    return false
  }
  for(var i = 0;i < listenerArray.length;i++) {
    if(listenerArray[i].listener == listener && listenerArray[i].capture == capture && listenerArray[i].handler == opt_handler) {
      return goog.events.unlistenByKey(listenerArray[i].key)
    }
  }
  return false
};
goog.events.unlistenByKey = function(key) {
  var listener = goog.events.listeners_[key];
  if(!listener) {
    return false
  }
  if(listener.removed) {
    return false
  }
  var src = listener.src;
  if(goog.events.Listenable.USE_LISTENABLE_INTERFACE && goog.events.Listenable.isImplementedBy(src)) {
    return src.unlistenByKey(listener)
  }
  var type = listener.type;
  var proxy = listener.proxy;
  var capture = listener.capture;
  if(src.removeEventListener) {
    if(src == goog.global || !src.customEvent_) {
      src.removeEventListener(type, proxy, capture)
    }
  }else {
    if(src.detachEvent) {
      src.detachEvent(goog.events.getOnString_(type), proxy)
    }
  }
  var srcUid = goog.getUid(src);
  if(goog.events.sources_[srcUid]) {
    var sourcesArray = goog.events.sources_[srcUid];
    goog.array.remove(sourcesArray, listener);
    if(sourcesArray.length == 0) {
      delete goog.events.sources_[srcUid]
    }
  }
  listener.removed = true;
  var listenerArray = goog.events.listenerTree_[type][capture][srcUid];
  if(listenerArray) {
    listenerArray.needsCleanup_ = true;
    goog.events.cleanUp_(type, capture, srcUid, listenerArray)
  }
  delete goog.events.listeners_[key];
  return true
};
goog.events.unlistenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.unlisten(src, listener, opt_capt, opt_handler)
};
goog.events.cleanUp = function(listenableKey) {
  delete goog.events.listeners_[listenableKey.key]
};
goog.events.cleanUp_ = function(type, capture, srcUid, listenerArray) {
  if(!listenerArray.locked_) {
    if(listenerArray.needsCleanup_) {
      for(var oldIndex = 0, newIndex = 0;oldIndex < listenerArray.length;oldIndex++) {
        if(listenerArray[oldIndex].removed) {
          var proxy = listenerArray[oldIndex].proxy;
          proxy.src = null;
          continue
        }
        if(oldIndex != newIndex) {
          listenerArray[newIndex] = listenerArray[oldIndex]
        }
        newIndex++
      }
      listenerArray.length = newIndex;
      listenerArray.needsCleanup_ = false;
      if(newIndex == 0) {
        delete goog.events.listenerTree_[type][capture][srcUid];
        goog.events.listenerTree_[type][capture].count_--;
        if(goog.events.listenerTree_[type][capture].count_ == 0) {
          delete goog.events.listenerTree_[type][capture];
          goog.events.listenerTree_[type].count_--
        }
        if(goog.events.listenerTree_[type].count_ == 0) {
          delete goog.events.listenerTree_[type]
        }
      }
    }
  }
};
goog.events.removeAll = function(opt_obj, opt_type) {
  var count = 0;
  var noObj = opt_obj == null;
  var noType = opt_type == null;
  if(!noObj) {
    if(goog.events.Listenable.USE_LISTENABLE_INTERFACE && opt_obj && goog.events.Listenable.isImplementedBy(opt_obj)) {
      return opt_obj.removeAllListeners(opt_type)
    }
    var srcUid = goog.getUid((opt_obj));
    if(goog.events.sources_[srcUid]) {
      var sourcesArray = goog.events.sources_[srcUid];
      for(var i = sourcesArray.length - 1;i >= 0;i--) {
        var listener = sourcesArray[i];
        if(noType || opt_type == listener.type) {
          goog.events.unlistenByKey(listener.key);
          count++
        }
      }
    }
  }else {
    goog.object.forEach(goog.events.listeners_, function(listener, key) {
      goog.events.unlistenByKey(key);
      count++
    })
  }
  return count
};
goog.events.getListeners = function(obj, type, capture) {
  if(goog.events.Listenable.USE_LISTENABLE_INTERFACE && goog.events.Listenable.isImplementedBy(obj)) {
    return obj.getListeners(type, capture)
  }else {
    return goog.events.getListeners_(obj, type, capture) || []
  }
};
goog.events.getListeners_ = function(obj, type, capture) {
  var map = goog.events.listenerTree_;
  if(type in map) {
    map = map[type];
    if(capture in map) {
      map = map[capture];
      var objUid = goog.getUid(obj);
      if(map[objUid]) {
        return map[objUid]
      }
    }
  }
  return null
};
goog.events.getListener = function(src, type, listener, opt_capt, opt_handler) {
  var capture = !!opt_capt;
  if(goog.events.Listenable.USE_LISTENABLE_INTERFACE && goog.events.Listenable.isImplementedBy(src)) {
    return src.getListener((type), goog.events.wrapListener_(listener), capture, opt_handler)
  }
  var listenerArray = goog.events.getListeners_(src, type, capture);
  if(listenerArray) {
    for(var i = 0;i < listenerArray.length;i++) {
      if(!listenerArray[i].removed && listenerArray[i].listener == listener && listenerArray[i].capture == capture && listenerArray[i].handler == opt_handler) {
        return listenerArray[i]
      }
    }
  }
  return null
};
goog.events.hasListener = function(obj, opt_type, opt_capture) {
  if(goog.events.Listenable.USE_LISTENABLE_INTERFACE && goog.events.Listenable.isImplementedBy(obj)) {
    return obj.hasListener(opt_type, opt_capture)
  }
  var objUid = goog.getUid(obj);
  var listeners = goog.events.sources_[objUid];
  if(listeners) {
    var hasType = goog.isDef(opt_type);
    var hasCapture = goog.isDef(opt_capture);
    if(hasType && hasCapture) {
      var map = goog.events.listenerTree_[opt_type];
      return!!map && !!map[opt_capture] && objUid in map[opt_capture]
    }else {
      if(!(hasType || hasCapture)) {
        return true
      }else {
        return goog.array.some(listeners, function(listener) {
          return hasType && listener.type == opt_type || hasCapture && listener.capture == opt_capture
        })
      }
    }
  }
  return false
};
goog.events.expose = function(e) {
  var str = [];
  for(var key in e) {
    if(e[key] && e[key].id) {
      str.push(key + " = " + e[key] + " (" + e[key].id + ")")
    }else {
      str.push(key + " = " + e[key])
    }
  }
  return str.join("\n")
};
goog.events.getOnString_ = function(type) {
  if(type in goog.events.onStringMap_) {
    return goog.events.onStringMap_[type]
  }
  return goog.events.onStringMap_[type] = goog.events.onString_ + type
};
goog.events.fireListeners = function(obj, type, capture, eventObject) {
  if(goog.events.Listenable.USE_LISTENABLE_INTERFACE && goog.events.Listenable.isImplementedBy(obj)) {
    return obj.fireListeners(type, capture, eventObject)
  }
  var map = goog.events.listenerTree_;
  if(type in map) {
    map = map[type];
    if(capture in map) {
      return goog.events.fireListeners_(map[capture], obj, type, capture, eventObject)
    }
  }
  return true
};
goog.events.fireListeners_ = function(map, obj, type, capture, eventObject) {
  var retval = 1;
  var objUid = goog.getUid(obj);
  if(map[objUid]) {
    var remaining = --map.remaining_;
    var listenerArray = map[objUid];
    if(!listenerArray.locked_) {
      listenerArray.locked_ = 1
    }else {
      listenerArray.locked_++
    }
    try {
      var length = listenerArray.length;
      for(var i = 0;i < length;i++) {
        var listener = listenerArray[i];
        if(listener && !listener.removed) {
          retval &= goog.events.fireListener(listener, eventObject) !== false
        }
      }
    }finally {
      map.remaining_ = Math.max(remaining, map.remaining_);
      listenerArray.locked_--;
      goog.events.cleanUp_(type, capture, objUid, listenerArray)
    }
  }
  return Boolean(retval)
};
goog.events.fireListener = function(listener, eventObject) {
  if(listener.callOnce) {
    goog.events.unlistenByKey(listener.key)
  }
  return listener.handleEvent(eventObject)
};
goog.events.getTotalListenerCount = function() {
  return goog.object.getCount(goog.events.listeners_)
};
goog.events.dispatchEvent = function(src, e) {
  if(goog.events.Listenable.USE_LISTENABLE_INTERFACE) {
    return src.dispatchEvent(e)
  }
  var type = e.type || e;
  var map = goog.events.listenerTree_;
  if(!(type in map)) {
    return true
  }
  if(goog.isString(e)) {
    e = new goog.events.Event(e, src)
  }else {
    if(!(e instanceof goog.events.Event)) {
      var oldEvent = e;
      e = new goog.events.Event((type), src);
      goog.object.extend(e, oldEvent)
    }else {
      e.target = e.target || src
    }
  }
  var rv = 1, ancestors;
  map = map[type];
  var hasCapture = true in map;
  var targetsMap;
  if(hasCapture) {
    ancestors = [];
    for(var parent = src;parent;parent = parent.getParentEventTarget()) {
      ancestors.push(parent)
    }
    targetsMap = map[true];
    targetsMap.remaining_ = targetsMap.count_;
    for(var i = ancestors.length - 1;!e.propagationStopped_ && i >= 0 && targetsMap.remaining_;i--) {
      e.currentTarget = ancestors[i];
      rv &= goog.events.fireListeners_(targetsMap, ancestors[i], e.type, true, e) && e.returnValue_ != false
    }
  }
  var hasBubble = false in map;
  if(hasBubble) {
    targetsMap = map[false];
    targetsMap.remaining_ = targetsMap.count_;
    if(hasCapture) {
      for(var i = 0;!e.propagationStopped_ && i < ancestors.length && targetsMap.remaining_;i++) {
        e.currentTarget = ancestors[i];
        rv &= goog.events.fireListeners_(targetsMap, ancestors[i], e.type, false, e) && e.returnValue_ != false
      }
    }else {
      for(var current = src;!e.propagationStopped_ && current && targetsMap.remaining_;current = current.getParentEventTarget()) {
        e.currentTarget = current;
        rv &= goog.events.fireListeners_(targetsMap, current, e.type, false, e) && e.returnValue_ != false
      }
    }
  }
  return Boolean(rv)
};
goog.events.protectBrowserEventEntryPoint = function(errorHandler) {
  goog.events.handleBrowserEvent_ = errorHandler.protectEntryPoint(goog.events.handleBrowserEvent_)
};
goog.events.handleBrowserEvent_ = function(listener, opt_evt) {
  if(listener.removed) {
    return true
  }
  var type = listener.type;
  var map = goog.events.listenerTree_;
  if(!(type in map)) {
    return true
  }
  map = map[type];
  var retval, targetsMap;
  if(!goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT) {
    var ieEvent = opt_evt || (goog.getObjectByName("window.event"));
    var hasCapture = true in map;
    var hasBubble = false in map;
    if(hasCapture) {
      if(goog.events.isMarkedIeEvent_(ieEvent)) {
        return true
      }
      goog.events.markIeEvent_(ieEvent)
    }
    var evt = new goog.events.BrowserEvent;
    evt.init(ieEvent, (this));
    retval = true;
    try {
      if(hasCapture) {
        var ancestors = [];
        for(var parent = evt.currentTarget;parent;parent = parent.parentNode) {
          ancestors.push(parent)
        }
        targetsMap = map[true];
        targetsMap.remaining_ = targetsMap.count_;
        for(var i = ancestors.length - 1;!evt.propagationStopped_ && i >= 0 && targetsMap.remaining_;i--) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type, true, evt)
        }
        if(hasBubble) {
          targetsMap = map[false];
          targetsMap.remaining_ = targetsMap.count_;
          for(var i = 0;!evt.propagationStopped_ && i < ancestors.length && targetsMap.remaining_;i++) {
            evt.currentTarget = ancestors[i];
            retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type, false, evt)
          }
        }
      }else {
        retval = goog.events.fireListener(listener, evt)
      }
    }finally {
      if(ancestors) {
        ancestors.length = 0
      }
    }
    return retval
  }
  var be = new goog.events.BrowserEvent(opt_evt, (this));
  retval = goog.events.fireListener(listener, be);
  return retval
};
goog.events.markIeEvent_ = function(e) {
  var useReturnValue = false;
  if(e.keyCode == 0) {
    try {
      e.keyCode = -1;
      return
    }catch(ex) {
      useReturnValue = true
    }
  }
  if(useReturnValue || (e.returnValue) == undefined) {
    e.returnValue = true
  }
};
goog.events.isMarkedIeEvent_ = function(e) {
  return e.keyCode < 0 || e.returnValue != undefined
};
goog.events.uniqueIdCounter_ = 0;
goog.events.getUniqueId = function(identifier) {
  return identifier + "_" + goog.events.uniqueIdCounter_++
};
goog.events.LISTENER_WRAPPER_PROP_ = "__closure_events_fn_" + (Math.random() * 1E9 >>> 0);
goog.events.wrapListener_ = function(listener) {
  if(goog.isFunction(listener)) {
    return listener
  }
  return listener[goog.events.LISTENER_WRAPPER_PROP_] || (listener[goog.events.LISTENER_WRAPPER_PROP_] = function(e) {
    return listener.handleEvent(e)
  })
};
goog.debug.entryPointRegistry.register(function(transformer) {
  goog.events.handleBrowserEvent_ = transformer(goog.events.handleBrowserEvent_)
});
// Input 21
goog.provide("goog.events.EventTarget");
goog.require("goog.Disposable");
goog.require("goog.events");
goog.require("goog.events.Event");
goog.require("goog.events.Listenable");
goog.require("goog.events.Listener");
goog.require("goog.object");
goog.events.EventTarget = function() {
  goog.Disposable.call(this);
  if(goog.events.Listenable.USE_LISTENABLE_INTERFACE) {
    this.eventTargetListeners_ = {};
    this.reallyDisposed_ = false;
    this.actualEventTarget_ = this
  }
};
goog.inherits(goog.events.EventTarget, goog.Disposable);
if(goog.events.Listenable.USE_LISTENABLE_INTERFACE) {
  goog.events.Listenable.addImplementation(goog.events.EventTarget)
}
goog.events.EventTarget.MAX_ANCESTORS_ = 1E3;
goog.events.EventTarget.prototype.customEvent_ = true;
goog.events.EventTarget.prototype.parentEventTarget_ = null;
goog.events.EventTarget.prototype.getParentEventTarget = function() {
  return this.parentEventTarget_
};
goog.events.EventTarget.prototype.setParentEventTarget = function(parent) {
  this.parentEventTarget_ = parent
};
goog.events.EventTarget.prototype.addEventListener = function(type, handler, opt_capture, opt_handlerScope) {
  goog.events.listen(this, type, handler, opt_capture, opt_handlerScope)
};
goog.events.EventTarget.prototype.removeEventListener = function(type, handler, opt_capture, opt_handlerScope) {
  goog.events.unlisten(this, type, handler, opt_capture, opt_handlerScope)
};
goog.events.EventTarget.prototype.dispatchEvent = function(e) {
  if(goog.events.Listenable.USE_LISTENABLE_INTERFACE) {
    if(this.reallyDisposed_) {
      return true
    }
    var ancestorsTree, ancestor = this.getParentEventTarget();
    if(ancestor) {
      ancestorsTree = [];
      var ancestorCount = 1;
      for(;ancestor;ancestor = ancestor.getParentEventTarget()) {
        ancestorsTree.push(ancestor);
        goog.asserts.assert(++ancestorCount < goog.events.EventTarget.MAX_ANCESTORS_, "infinite loop")
      }
    }
    return goog.events.EventTarget.dispatchEventInternal_(this.actualEventTarget_, e, ancestorsTree)
  }else {
    return goog.events.dispatchEvent(this, e)
  }
};
goog.events.EventTarget.prototype.disposeInternal = function() {
  goog.events.EventTarget.superClass_.disposeInternal.call(this);
  if(goog.events.Listenable.USE_LISTENABLE_INTERFACE) {
    this.removeAllListeners();
    this.reallyDisposed_ = true
  }else {
    goog.events.removeAll(this)
  }
  this.parentEventTarget_ = null
};
if(goog.events.Listenable.USE_LISTENABLE_INTERFACE) {
  goog.events.EventTarget.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
    return this.listenInternal_(type, listener, false, opt_useCapture, opt_listenerScope)
  };
  goog.events.EventTarget.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
    return this.listenInternal_(type, listener, true, opt_useCapture, opt_listenerScope)
  };
  goog.events.EventTarget.prototype.listenInternal_ = function(type, listener, callOnce, opt_useCapture, opt_listenerScope) {
    goog.asserts.assert(!this.reallyDisposed_, "Can not listen on disposed object.");
    var listenerArray = this.eventTargetListeners_[type] || (this.eventTargetListeners_[type] = []);
    var listenerObj;
    var index = goog.events.EventTarget.findListenerIndex_(listenerArray, listener, opt_useCapture, opt_listenerScope);
    if(index > -1) {
      listenerObj = listenerArray[index];
      if(!callOnce) {
        listenerObj.callOnce = false
      }
      return listenerObj
    }
    listenerObj = new goog.events.Listener;
    listenerObj.init(listener, null, this, type, !!opt_useCapture, opt_listenerScope);
    listenerObj.callOnce = callOnce;
    listenerArray.push(listenerObj);
    return listenerObj
  };
  goog.events.EventTarget.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
    if(!(type in this.eventTargetListeners_)) {
      return false
    }
    var listenerArray = this.eventTargetListeners_[type];
    var index = goog.events.EventTarget.findListenerIndex_(listenerArray, listener, opt_useCapture, opt_listenerScope);
    if(index > -1) {
      var listenerObj = listenerArray[index];
      goog.events.cleanUp(listenerObj);
      listenerObj.removed = true;
      return goog.array.removeAt(listenerArray, index)
    }
    return false
  };
  goog.events.EventTarget.prototype.unlistenByKey = function(key) {
    var type = key.type;
    if(!(type in this.eventTargetListeners_)) {
      return false
    }
    var removed = goog.array.remove(this.eventTargetListeners_[type], key);
    if(removed) {
      goog.events.cleanUp(key);
      key.removed = true
    }
    return removed
  };
  goog.events.EventTarget.prototype.removeAllListeners = function(opt_type, opt_capture) {
    var count = 0;
    for(var type in this.eventTargetListeners_) {
      if(!opt_type || type == opt_type) {
        var listenerArray = this.eventTargetListeners_[type];
        for(var i = 0;i < listenerArray.length;i++) {
          ++count;
          goog.events.cleanUp(listenerArray[i]);
          listenerArray[i].removed = true
        }
        listenerArray.length = 0
      }
    }
    return count
  };
  goog.events.EventTarget.prototype.fireListeners = function(type, capture, eventObject) {
    goog.asserts.assert(!this.reallyDisposed_, "Can not fire listeners after dispose() completed.");
    if(!(type in this.eventTargetListeners_)) {
      return true
    }
    var rv = true;
    var listenerArray = goog.array.clone(this.eventTargetListeners_[type]);
    for(var i = 0;i < listenerArray.length;++i) {
      var listener = listenerArray[i];
      if(listener && !listener.removed && listener.capture == capture) {
        if(listener.callOnce) {
          this.unlistenByKey(listener)
        }
        rv = listener.handleEvent(eventObject) !== false && rv
      }
    }
    return rv && eventObject.returnValue_ != false
  };
  goog.events.EventTarget.prototype.getListeners = function(type, capture) {
    var listenerArray = this.eventTargetListeners_[type];
    var rv = [];
    if(listenerArray) {
      for(var i = 0;i < listenerArray.length;++i) {
        var listenerObj = listenerArray[i];
        if(listenerObj.capture == capture) {
          rv.push(listenerObj)
        }
      }
    }
    return rv
  };
  goog.events.EventTarget.prototype.getListener = function(type, listener, capture, opt_listenerScope) {
    var listenerArray = this.eventTargetListeners_[type];
    var i = -1;
    if(listenerArray) {
      i = goog.events.EventTarget.findListenerIndex_(listenerArray, listener, capture, opt_listenerScope)
    }
    return i > -1 ? listenerArray[i] : null
  };
  goog.events.EventTarget.prototype.hasListener = function(opt_type, opt_capture) {
    var hasType = goog.isDef(opt_type);
    var hasCapture = goog.isDef(opt_capture);
    return goog.object.some(this.eventTargetListeners_, function(listenersArray, type) {
      for(var i = 0;i < listenersArray.length;++i) {
        if((!hasType || listenersArray[i].type == opt_type) && (!hasCapture || listenersArray[i].capture == opt_capture)) {
          return true
        }
      }
      return false
    })
  };
  goog.events.EventTarget.prototype.setTargetForTesting = function(target) {
    this.actualEventTarget_ = target
  };
  goog.events.EventTarget.dispatchEventInternal_ = function(target, e, opt_ancestorsTree) {
    var type = e.type || (e);
    if(goog.isString(e)) {
      e = new goog.events.Event(e, target)
    }else {
      if(!(e instanceof goog.events.Event)) {
        var oldEvent = e;
        e = new goog.events.Event(type, target);
        goog.object.extend(e, oldEvent)
      }else {
        e.target = e.target || target
      }
    }
    var rv = true, currentTarget;
    if(opt_ancestorsTree) {
      for(var i = opt_ancestorsTree.length - 1;!e.propagationStopped_ && i >= 0;i--) {
        currentTarget = e.currentTarget = opt_ancestorsTree[i];
        rv = currentTarget.fireListeners(type, true, e) && rv
      }
    }
    if(!e.propagationStopped_) {
      currentTarget = e.currentTarget = target;
      rv = currentTarget.fireListeners(type, true, e) && rv;
      if(!e.propagationStopped_) {
        rv = currentTarget.fireListeners(type, false, e) && rv
      }
    }
    if(opt_ancestorsTree) {
      for(i = 0;!e.propagationStopped_ && i < opt_ancestorsTree.length;i++) {
        currentTarget = e.currentTarget = opt_ancestorsTree[i];
        rv = currentTarget.fireListeners(type, false, e) && rv
      }
    }
    return rv
  };
  goog.events.EventTarget.findListenerIndex_ = function(listenerArray, listener, opt_useCapture, opt_listenerScope) {
    for(var i = 0;i < listenerArray.length;++i) {
      var listenerObj = listenerArray[i];
      if(listenerObj.listener == listener && listenerObj.capture == !!opt_useCapture && listenerObj.handler == opt_listenerScope) {
        return i
      }
    }
    return-1
  }
}
;
// Input 22
/*
 Dual licensed under the MIT or GPL licenses.
*/
goog.provide("pike.events.ChangeSize");
goog.provide("pike.events.ChangePosition");
goog.provide("pike.events.Update");
goog.provide("pike.events.Render");
goog.provide("pike.events.NewEntity");
goog.provide("pike.events.RemoveEntity");
goog.provide("pike.events.Collision");
goog.provide("pike.events.Down");
goog.provide("pike.events.Up");
goog.provide("pike.events.Move");
goog.provide("pike.events.StartDialogue");
goog.provide("pike.events.ShowDialogue");
goog.provide("pike.events.EndDialogue");
goog.require("goog.events.Event");
goog.require("goog.events.EventTarget");
pike.events.Update = function(now, target) {
  goog.events.Event.call(this, pike.events.Update.EVENT_TYPE, target);
  this.now = now
};
goog.inherits(pike.events.Update, goog.events.Event);
pike.events.Update.EVENT_TYPE = "update";
pike.events.Render = function(now, target) {
  goog.events.Event.call(this, pike.events.Render.EVENT_TYPE, target);
  this.now = now
};
goog.inherits(pike.events.Render, goog.events.Event);
pike.events.Render.EVENT_TYPE = "render";
pike.events.NewEntity = function(entity, target) {
  goog.events.Event.call(this, pike.events.NewEntity.EVENT_TYPE, target);
  this.entity = entity
};
goog.inherits(pike.events.NewEntity, goog.events.Event);
pike.events.NewEntity.EVENT_TYPE = "newentity";
pike.events.RemoveEntity = function(entity, target) {
  goog.events.Event.call(this, pike.events.RemoveEntity.EVENT_TYPE, target);
  this.entity = entity
};
goog.inherits(pike.events.RemoveEntity, goog.events.Event);
pike.events.RemoveEntity.EVENT_TYPE = "removeentity";
pike.events.Down = function(posX, posY, domEvent, target) {
  goog.events.Event.call(this, pike.events.Down.EVENT_TYPE, target);
  this.posX = posX;
  this.posY = posY;
  this.domEvent = domEvent
};
goog.inherits(pike.events.Down, goog.events.Event);
pike.events.Down.EVENT_TYPE = "down";
pike.events.Up = function(posX, posY, isMoving, domEvent, target) {
  goog.events.Event.call(this, pike.events.Up.EVENT_TYPE, target);
  this.posX = posX;
  this.posY = posY;
  this.isMoving = isMoving;
  this.domEvent = domEvent
};
goog.inherits(pike.events.Up, goog.events.Event);
pike.events.Up.EVENT_TYPE = "up";
pike.events.Move = function(posX, posY, deltaX, deltaY, domEvent, target) {
  goog.events.Event.call(this, pike.events.Move.EVENT_TYPE, target);
  this.posX = posX;
  this.posY = posY;
  this.deltaX = deltaX;
  this.deltaY = deltaY;
  this.domEvent = domEvent
};
goog.inherits(pike.events.Move, goog.events.Event);
pike.events.Move.EVENT_TYPE = "move";
pike.events.ChangePosition = function(x, y, oldX, oldY, target) {
  goog.events.Event.call(this, pike.events.ChangePosition.EVENT_TYPE, target);
  this.x = x;
  this.y = y;
  this.oldX = oldX;
  this.oldY = oldY
};
goog.inherits(pike.events.ChangePosition, goog.events.Event);
pike.events.ChangePosition.EVENT_TYPE = "changeposition";
pike.events.ChangeSize = function(width, height, oldW, oldH, target) {
  goog.events.Event.call(this, pike.events.ChangeSize.EVENT_TYPE, target);
  this.w = width;
  this.h = height;
  this.oldW = oldW;
  this.oldH = oldH
};
goog.inherits(pike.events.ChangeSize, goog.events.Event);
pike.events.ChangeSize.EVENT_TYPE = "changesize";
pike.events.Collision = function(x, y, oldX, oldY, obj, target) {
  goog.events.Event.call(this, pike.events.Collision.EVENT_TYPE, target);
  this.x = x;
  this.y = y;
  this.oldX = oldX;
  this.oldY = oldY;
  this.obj = obj
};
goog.inherits(pike.events.Collision, goog.events.Event);
pike.events.Collision.EVENT_TYPE = "collision";
pike.events.EndDialogue = function(target) {
  goog.events.Event.call(this, pike.events.EndDialogue.EVENT_TYPE, target)
};
goog.inherits(pike.events.EndDialogue, goog.events.Event);
pike.events.EndDialogue.EVENT_TYPE = "enddialogue";
pike.events.StartDialogue = function(dialogue, target) {
  goog.events.Event.call(this, pike.events.StartDialogue.EVENT_TYPE, target);
  this.dialogue = dialogue
};
goog.inherits(pike.events.StartDialogue, goog.events.Event);
pike.events.StartDialogue.EVENT_TYPE = "startdialogue";
pike.events.ShowDialogue = function(dialogue, target) {
  goog.events.Event.call(this, pike.events.ShowDialogue.EVENT_TYPE, target);
  this.dialogue = dialogue
};
goog.inherits(pike.events.ShowDialogue, goog.events.Event);
pike.events.ShowDialogue.EVENT_TYPE = "showdialogue";
// Input 23
goog.provide("goog.math");
goog.require("goog.array");
goog.require("goog.asserts");
goog.math.randomInt = function(a) {
  return Math.floor(Math.random() * a)
};
goog.math.uniformRandom = function(a, b) {
  return a + Math.random() * (b - a)
};
goog.math.clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max)
};
goog.math.modulo = function(a, b) {
  var r = a % b;
  return r * b < 0 ? r + b : r
};
goog.math.lerp = function(a, b, x) {
  return a + x * (b - a)
};
goog.math.nearlyEquals = function(a, b, opt_tolerance) {
  return Math.abs(a - b) <= (opt_tolerance || 1E-6)
};
goog.math.standardAngle = function(angle) {
  return goog.math.modulo(angle, 360)
};
goog.math.toRadians = function(angleDegrees) {
  return angleDegrees * Math.PI / 180
};
goog.math.toDegrees = function(angleRadians) {
  return angleRadians * 180 / Math.PI
};
goog.math.angleDx = function(degrees, radius) {
  return radius * Math.cos(goog.math.toRadians(degrees))
};
goog.math.angleDy = function(degrees, radius) {
  return radius * Math.sin(goog.math.toRadians(degrees))
};
goog.math.angle = function(x1, y1, x2, y2) {
  return goog.math.standardAngle(goog.math.toDegrees(Math.atan2(y2 - y1, x2 - x1)))
};
goog.math.angleDifference = function(startAngle, endAngle) {
  var d = goog.math.standardAngle(endAngle) - goog.math.standardAngle(startAngle);
  if(d > 180) {
    d = d - 360
  }else {
    if(d <= -180) {
      d = 360 + d
    }
  }
  return d
};
goog.math.sign = function(x) {
  return x == 0 ? 0 : x < 0 ? -1 : 1
};
goog.math.longestCommonSubsequence = function(array1, array2, opt_compareFn, opt_collectorFn) {
  var compare = opt_compareFn || function(a, b) {
    return a == b
  };
  var collect = opt_collectorFn || function(i1, i2) {
    return array1[i1]
  };
  var length1 = array1.length;
  var length2 = array2.length;
  var arr = [];
  for(var i = 0;i < length1 + 1;i++) {
    arr[i] = [];
    arr[i][0] = 0
  }
  for(var j = 0;j < length2 + 1;j++) {
    arr[0][j] = 0
  }
  for(i = 1;i <= length1;i++) {
    for(j = 1;j <= length1;j++) {
      if(compare(array1[i - 1], array2[j - 1])) {
        arr[i][j] = arr[i - 1][j - 1] + 1
      }else {
        arr[i][j] = Math.max(arr[i - 1][j], arr[i][j - 1])
      }
    }
  }
  var result = [];
  var i = length1, j = length2;
  while(i > 0 && j > 0) {
    if(compare(array1[i - 1], array2[j - 1])) {
      result.unshift(collect(i - 1, j - 1));
      i--;
      j--
    }else {
      if(arr[i - 1][j] > arr[i][j - 1]) {
        i--
      }else {
        j--
      }
    }
  }
  return result
};
goog.math.sum = function(var_args) {
  return(goog.array.reduce(arguments, function(sum, value) {
    return sum + value
  }, 0))
};
goog.math.average = function(var_args) {
  return goog.math.sum.apply(null, arguments) / arguments.length
};
goog.math.standardDeviation = function(var_args) {
  var sampleSize = arguments.length;
  if(sampleSize < 2) {
    return 0
  }
  var mean = goog.math.average.apply(null, arguments);
  var variance = goog.math.sum.apply(null, goog.array.map(arguments, function(val) {
    return Math.pow(val - mean, 2)
  })) / (sampleSize - 1);
  return Math.sqrt(variance)
};
goog.math.isInt = function(num) {
  return isFinite(num) && num % 1 == 0
};
goog.math.isFiniteNumber = function(num) {
  return isFinite(num) && !isNaN(num)
};
goog.math.safeFloor = function(num, opt_epsilon) {
  goog.asserts.assert(!goog.isDef(opt_epsilon) || opt_epsilon > 0);
  return Math.floor(num + (opt_epsilon || 2E-15))
};
goog.math.safeCeil = function(num, opt_epsilon) {
  goog.asserts.assert(!goog.isDef(opt_epsilon) || opt_epsilon > 0);
  return Math.ceil(num - (opt_epsilon || 2E-15))
};
// Input 24
goog.provide("goog.math.Coordinate");
goog.require("goog.math");
goog.math.Coordinate = function(opt_x, opt_y) {
  this.x = goog.isDef(opt_x) ? opt_x : 0;
  this.y = goog.isDef(opt_y) ? opt_y : 0
};
goog.math.Coordinate.prototype.clone = function() {
  return new goog.math.Coordinate(this.x, this.y)
};
if(goog.DEBUG) {
  goog.math.Coordinate.prototype.toString = function() {
    return"(" + this.x + ", " + this.y + ")"
  }
}
goog.math.Coordinate.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.x == b.x && a.y == b.y
};
goog.math.Coordinate.distance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy)
};
goog.math.Coordinate.magnitude = function(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y)
};
goog.math.Coordinate.azimuth = function(a) {
  return goog.math.angle(0, 0, a.x, a.y)
};
goog.math.Coordinate.squaredDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx * dx + dy * dy
};
goog.math.Coordinate.difference = function(a, b) {
  return new goog.math.Coordinate(a.x - b.x, a.y - b.y)
};
goog.math.Coordinate.sum = function(a, b) {
  return new goog.math.Coordinate(a.x + b.x, a.y + b.y)
};
goog.math.Coordinate.prototype.ceil = function() {
  this.x = Math.ceil(this.x);
  this.y = Math.ceil(this.y);
  return this
};
goog.math.Coordinate.prototype.floor = function() {
  this.x = Math.floor(this.x);
  this.y = Math.floor(this.y);
  return this
};
goog.math.Coordinate.prototype.round = function() {
  this.x = Math.round(this.x);
  this.y = Math.round(this.y);
  return this
};
goog.math.Coordinate.prototype.translate = function(tx, opt_ty) {
  if(tx instanceof goog.math.Coordinate) {
    this.x += tx.x;
    this.y += tx.y
  }else {
    this.x += tx;
    if(goog.isNumber(opt_ty)) {
      this.y += opt_ty
    }
  }
  return this
};
goog.math.Coordinate.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.x *= sx;
  this.y *= sy;
  return this
};
// Input 25
goog.provide("goog.math.Box");
goog.require("goog.math.Coordinate");
goog.math.Box = function(top, right, bottom, left) {
  this.top = top;
  this.right = right;
  this.bottom = bottom;
  this.left = left
};
goog.math.Box.boundingBox = function(var_args) {
  var box = new goog.math.Box(arguments[0].y, arguments[0].x, arguments[0].y, arguments[0].x);
  for(var i = 1;i < arguments.length;i++) {
    var coord = arguments[i];
    box.top = Math.min(box.top, coord.y);
    box.right = Math.max(box.right, coord.x);
    box.bottom = Math.max(box.bottom, coord.y);
    box.left = Math.min(box.left, coord.x)
  }
  return box
};
goog.math.Box.prototype.clone = function() {
  return new goog.math.Box(this.top, this.right, this.bottom, this.left)
};
if(goog.DEBUG) {
  goog.math.Box.prototype.toString = function() {
    return"(" + this.top + "t, " + this.right + "r, " + this.bottom + "b, " + this.left + "l)"
  }
}
goog.math.Box.prototype.contains = function(other) {
  return goog.math.Box.contains(this, other)
};
goog.math.Box.prototype.expand = function(top, opt_right, opt_bottom, opt_left) {
  if(goog.isObject(top)) {
    this.top -= top.top;
    this.right += top.right;
    this.bottom += top.bottom;
    this.left -= top.left
  }else {
    this.top -= top;
    this.right += opt_right;
    this.bottom += opt_bottom;
    this.left -= opt_left
  }
  return this
};
goog.math.Box.prototype.expandToInclude = function(box) {
  this.left = Math.min(this.left, box.left);
  this.top = Math.min(this.top, box.top);
  this.right = Math.max(this.right, box.right);
  this.bottom = Math.max(this.bottom, box.bottom)
};
goog.math.Box.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.top == b.top && a.right == b.right && a.bottom == b.bottom && a.left == b.left
};
goog.math.Box.contains = function(box, other) {
  if(!box || !other) {
    return false
  }
  if(other instanceof goog.math.Box) {
    return other.left >= box.left && other.right <= box.right && other.top >= box.top && other.bottom <= box.bottom
  }
  return other.x >= box.left && other.x <= box.right && other.y >= box.top && other.y <= box.bottom
};
goog.math.Box.relativePositionX = function(box, coord) {
  if(coord.x < box.left) {
    return coord.x - box.left
  }else {
    if(coord.x > box.right) {
      return coord.x - box.right
    }
  }
  return 0
};
goog.math.Box.relativePositionY = function(box, coord) {
  if(coord.y < box.top) {
    return coord.y - box.top
  }else {
    if(coord.y > box.bottom) {
      return coord.y - box.bottom
    }
  }
  return 0
};
goog.math.Box.distance = function(box, coord) {
  var x = goog.math.Box.relativePositionX(box, coord);
  var y = goog.math.Box.relativePositionY(box, coord);
  return Math.sqrt(x * x + y * y)
};
goog.math.Box.intersects = function(a, b) {
  return a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom
};
goog.math.Box.intersectsWithPadding = function(a, b, padding) {
  return a.left <= b.right + padding && b.left <= a.right + padding && a.top <= b.bottom + padding && b.top <= a.bottom + padding
};
goog.math.Box.prototype.ceil = function() {
  this.top = Math.ceil(this.top);
  this.right = Math.ceil(this.right);
  this.bottom = Math.ceil(this.bottom);
  this.left = Math.ceil(this.left);
  return this
};
goog.math.Box.prototype.floor = function() {
  this.top = Math.floor(this.top);
  this.right = Math.floor(this.right);
  this.bottom = Math.floor(this.bottom);
  this.left = Math.floor(this.left);
  return this
};
goog.math.Box.prototype.round = function() {
  this.top = Math.round(this.top);
  this.right = Math.round(this.right);
  this.bottom = Math.round(this.bottom);
  this.left = Math.round(this.left);
  return this
};
goog.math.Box.prototype.translate = function(tx, opt_ty) {
  if(tx instanceof goog.math.Coordinate) {
    this.left += tx.x;
    this.right += tx.x;
    this.top += tx.y;
    this.bottom += tx.y
  }else {
    this.left += tx;
    this.right += tx;
    if(goog.isNumber(opt_ty)) {
      this.top += opt_ty;
      this.bottom += opt_ty
    }
  }
  return this
};
goog.math.Box.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.left *= sx;
  this.right *= sx;
  this.top *= sy;
  this.bottom *= sy;
  return this
};
// Input 26
goog.provide("goog.math.Size");
goog.math.Size = function(width, height) {
  this.width = width;
  this.height = height
};
goog.math.Size.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.width == b.width && a.height == b.height
};
goog.math.Size.prototype.clone = function() {
  return new goog.math.Size(this.width, this.height)
};
if(goog.DEBUG) {
  goog.math.Size.prototype.toString = function() {
    return"(" + this.width + " x " + this.height + ")"
  }
}
goog.math.Size.prototype.getLongest = function() {
  return Math.max(this.width, this.height)
};
goog.math.Size.prototype.getShortest = function() {
  return Math.min(this.width, this.height)
};
goog.math.Size.prototype.area = function() {
  return this.width * this.height
};
goog.math.Size.prototype.perimeter = function() {
  return(this.width + this.height) * 2
};
goog.math.Size.prototype.aspectRatio = function() {
  return this.width / this.height
};
goog.math.Size.prototype.isEmpty = function() {
  return!this.area()
};
goog.math.Size.prototype.ceil = function() {
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this
};
goog.math.Size.prototype.fitsInside = function(target) {
  return this.width <= target.width && this.height <= target.height
};
goog.math.Size.prototype.floor = function() {
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this
};
goog.math.Size.prototype.round = function() {
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this
};
goog.math.Size.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.width *= sx;
  this.height *= sy;
  return this
};
goog.math.Size.prototype.scaleToFit = function(target) {
  var s = this.aspectRatio() > target.aspectRatio() ? target.width / this.width : target.height / this.height;
  return this.scale(s)
};
// Input 27
goog.provide("goog.math.Rect");
goog.require("goog.math.Box");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Size");
goog.math.Rect = function(x, y, w, h) {
  this.left = x;
  this.top = y;
  this.width = w;
  this.height = h
};
goog.math.Rect.prototype.clone = function() {
  return new goog.math.Rect(this.left, this.top, this.width, this.height)
};
goog.math.Rect.prototype.toBox = function() {
  var right = this.left + this.width;
  var bottom = this.top + this.height;
  return new goog.math.Box(this.top, right, bottom, this.left)
};
goog.math.Rect.createFromBox = function(box) {
  return new goog.math.Rect(box.left, box.top, box.right - box.left, box.bottom - box.top)
};
if(goog.DEBUG) {
  goog.math.Rect.prototype.toString = function() {
    return"(" + this.left + ", " + this.top + " - " + this.width + "w x " + this.height + "h)"
  }
}
goog.math.Rect.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.left == b.left && a.width == b.width && a.top == b.top && a.height == b.height
};
goog.math.Rect.prototype.intersection = function(rect) {
  var x0 = Math.max(this.left, rect.left);
  var x1 = Math.min(this.left + this.width, rect.left + rect.width);
  if(x0 <= x1) {
    var y0 = Math.max(this.top, rect.top);
    var y1 = Math.min(this.top + this.height, rect.top + rect.height);
    if(y0 <= y1) {
      this.left = x0;
      this.top = y0;
      this.width = x1 - x0;
      this.height = y1 - y0;
      return true
    }
  }
  return false
};
goog.math.Rect.intersection = function(a, b) {
  var x0 = Math.max(a.left, b.left);
  var x1 = Math.min(a.left + a.width, b.left + b.width);
  if(x0 <= x1) {
    var y0 = Math.max(a.top, b.top);
    var y1 = Math.min(a.top + a.height, b.top + b.height);
    if(y0 <= y1) {
      return new goog.math.Rect(x0, y0, x1 - x0, y1 - y0)
    }
  }
  return null
};
goog.math.Rect.intersects = function(a, b) {
  return a.left <= b.left + b.width && b.left <= a.left + a.width && a.top <= b.top + b.height && b.top <= a.top + a.height
};
goog.math.Rect.prototype.intersects = function(rect) {
  return goog.math.Rect.intersects(this, rect)
};
goog.math.Rect.difference = function(a, b) {
  var intersection = goog.math.Rect.intersection(a, b);
  if(!intersection || !intersection.height || !intersection.width) {
    return[a.clone()]
  }
  var result = [];
  var top = a.top;
  var height = a.height;
  var ar = a.left + a.width;
  var ab = a.top + a.height;
  var br = b.left + b.width;
  var bb = b.top + b.height;
  if(b.top > a.top) {
    result.push(new goog.math.Rect(a.left, a.top, a.width, b.top - a.top));
    top = b.top;
    height -= b.top - a.top
  }
  if(bb < ab) {
    result.push(new goog.math.Rect(a.left, bb, a.width, ab - bb));
    height = bb - top
  }
  if(b.left > a.left) {
    result.push(new goog.math.Rect(a.left, top, b.left - a.left, height))
  }
  if(br < ar) {
    result.push(new goog.math.Rect(br, top, ar - br, height))
  }
  return result
};
goog.math.Rect.prototype.difference = function(rect) {
  return goog.math.Rect.difference(this, rect)
};
goog.math.Rect.prototype.boundingRect = function(rect) {
  var right = Math.max(this.left + this.width, rect.left + rect.width);
  var bottom = Math.max(this.top + this.height, rect.top + rect.height);
  this.left = Math.min(this.left, rect.left);
  this.top = Math.min(this.top, rect.top);
  this.width = right - this.left;
  this.height = bottom - this.top
};
goog.math.Rect.boundingRect = function(a, b) {
  if(!a || !b) {
    return null
  }
  var clone = a.clone();
  clone.boundingRect(b);
  return clone
};
goog.math.Rect.prototype.contains = function(another) {
  if(another instanceof goog.math.Rect) {
    return this.left <= another.left && this.left + this.width >= another.left + another.width && this.top <= another.top && this.top + this.height >= another.top + another.height
  }else {
    return another.x >= this.left && another.x <= this.left + this.width && another.y >= this.top && another.y <= this.top + this.height
  }
};
goog.math.Rect.prototype.getSize = function() {
  return new goog.math.Size(this.width, this.height)
};
goog.math.Rect.prototype.ceil = function() {
  this.left = Math.ceil(this.left);
  this.top = Math.ceil(this.top);
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this
};
goog.math.Rect.prototype.floor = function() {
  this.left = Math.floor(this.left);
  this.top = Math.floor(this.top);
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this
};
goog.math.Rect.prototype.round = function() {
  this.left = Math.round(this.left);
  this.top = Math.round(this.top);
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this
};
goog.math.Rect.prototype.translate = function(tx, opt_ty) {
  if(tx instanceof goog.math.Coordinate) {
    this.left += tx.x;
    this.top += tx.y
  }else {
    this.left += tx;
    if(goog.isNumber(opt_ty)) {
      this.top += opt_ty
    }
  }
  return this
};
goog.math.Rect.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.left *= sx;
  this.width *= sx;
  this.top *= sy;
  this.height *= sy;
  return this
};
// Input 28
goog.provide("goog.dom.vendor");
goog.require("goog.userAgent");
goog.dom.vendor.getVendorJsPrefix = function() {
  if(goog.userAgent.WEBKIT) {
    return"Webkit"
  }else {
    if(goog.userAgent.GECKO) {
      return"Moz"
    }else {
      if(goog.userAgent.IE) {
        return"ms"
      }else {
        if(goog.userAgent.OPERA) {
          return"O"
        }
      }
    }
  }
  return null
};
goog.dom.vendor.getVendorPrefix = function() {
  if(goog.userAgent.WEBKIT) {
    return"-webkit"
  }else {
    if(goog.userAgent.GECKO) {
      return"-moz"
    }else {
      if(goog.userAgent.IE) {
        return"-ms"
      }else {
        if(goog.userAgent.OPERA) {
          return"-o"
        }
      }
    }
  }
  return null
};
// Input 29
goog.provide("goog.dom.classes");
goog.require("goog.array");
goog.dom.classes.set = function(element, className) {
  element.className = className
};
goog.dom.classes.get = function(element) {
  var className = element.className;
  return goog.isString(className) && className.match(/\S+/g) || []
};
goog.dom.classes.add = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var expectedCount = classes.length + args.length;
  goog.dom.classes.add_(classes, args);
  goog.dom.classes.set(element, classes.join(" "));
  return classes.length == expectedCount
};
goog.dom.classes.remove = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var newClasses = goog.dom.classes.getDifference_(classes, args);
  goog.dom.classes.set(element, newClasses.join(" "));
  return newClasses.length == classes.length - args.length
};
goog.dom.classes.add_ = function(classes, args) {
  for(var i = 0;i < args.length;i++) {
    if(!goog.array.contains(classes, args[i])) {
      classes.push(args[i])
    }
  }
};
goog.dom.classes.getDifference_ = function(arr1, arr2) {
  return goog.array.filter(arr1, function(item) {
    return!goog.array.contains(arr2, item)
  })
};
goog.dom.classes.swap = function(element, fromClass, toClass) {
  var classes = goog.dom.classes.get(element);
  var removed = false;
  for(var i = 0;i < classes.length;i++) {
    if(classes[i] == fromClass) {
      goog.array.splice(classes, i--, 1);
      removed = true
    }
  }
  if(removed) {
    classes.push(toClass);
    goog.dom.classes.set(element, classes.join(" "))
  }
  return removed
};
goog.dom.classes.addRemove = function(element, classesToRemove, classesToAdd) {
  var classes = goog.dom.classes.get(element);
  if(goog.isString(classesToRemove)) {
    goog.array.remove(classes, classesToRemove)
  }else {
    if(goog.isArray(classesToRemove)) {
      classes = goog.dom.classes.getDifference_(classes, classesToRemove)
    }
  }
  if(goog.isString(classesToAdd) && !goog.array.contains(classes, classesToAdd)) {
    classes.push(classesToAdd)
  }else {
    if(goog.isArray(classesToAdd)) {
      goog.dom.classes.add_(classes, classesToAdd)
    }
  }
  goog.dom.classes.set(element, classes.join(" "))
};
goog.dom.classes.has = function(element, className) {
  return goog.array.contains(goog.dom.classes.get(element), className)
};
goog.dom.classes.enable = function(element, className, enabled) {
  if(enabled) {
    goog.dom.classes.add(element, className)
  }else {
    goog.dom.classes.remove(element, className)
  }
};
goog.dom.classes.toggle = function(element, className) {
  var add = !goog.dom.classes.has(element, className);
  goog.dom.classes.enable(element, className, add);
  return add
};
// Input 30
goog.provide("goog.dom.TagName");
goog.dom.TagName = {A:"A", ABBR:"ABBR", ACRONYM:"ACRONYM", ADDRESS:"ADDRESS", APPLET:"APPLET", AREA:"AREA", ARTICLE:"ARTICLE", ASIDE:"ASIDE", AUDIO:"AUDIO", B:"B", BASE:"BASE", BASEFONT:"BASEFONT", BDI:"BDI", BDO:"BDO", BIG:"BIG", BLOCKQUOTE:"BLOCKQUOTE", BODY:"BODY", BR:"BR", BUTTON:"BUTTON", CANVAS:"CANVAS", CAPTION:"CAPTION", CENTER:"CENTER", CITE:"CITE", CODE:"CODE", COL:"COL", COLGROUP:"COLGROUP", COMMAND:"COMMAND", DATA:"DATA", DATALIST:"DATALIST", DD:"DD", DEL:"DEL", DETAILS:"DETAILS", DFN:"DFN", 
DIALOG:"DIALOG", DIR:"DIR", DIV:"DIV", DL:"DL", DT:"DT", EM:"EM", EMBED:"EMBED", FIELDSET:"FIELDSET", FIGCAPTION:"FIGCAPTION", FIGURE:"FIGURE", FONT:"FONT", FOOTER:"FOOTER", FORM:"FORM", FRAME:"FRAME", FRAMESET:"FRAMESET", H1:"H1", H2:"H2", H3:"H3", H4:"H4", H5:"H5", H6:"H6", HEAD:"HEAD", HEADER:"HEADER", HGROUP:"HGROUP", HR:"HR", HTML:"HTML", I:"I", IFRAME:"IFRAME", IMG:"IMG", INPUT:"INPUT", INS:"INS", ISINDEX:"ISINDEX", KBD:"KBD", KEYGEN:"KEYGEN", LABEL:"LABEL", LEGEND:"LEGEND", LI:"LI", LINK:"LINK", 
MAP:"MAP", MARK:"MARK", MATH:"MATH", MENU:"MENU", META:"META", METER:"METER", NAV:"NAV", NOFRAMES:"NOFRAMES", NOSCRIPT:"NOSCRIPT", OBJECT:"OBJECT", OL:"OL", OPTGROUP:"OPTGROUP", OPTION:"OPTION", OUTPUT:"OUTPUT", P:"P", PARAM:"PARAM", PRE:"PRE", PROGRESS:"PROGRESS", Q:"Q", RP:"RP", RT:"RT", RUBY:"RUBY", S:"S", SAMP:"SAMP", SCRIPT:"SCRIPT", SECTION:"SECTION", SELECT:"SELECT", SMALL:"SMALL", SOURCE:"SOURCE", SPAN:"SPAN", STRIKE:"STRIKE", STRONG:"STRONG", STYLE:"STYLE", SUB:"SUB", SUMMARY:"SUMMARY", 
SUP:"SUP", SVG:"SVG", TABLE:"TABLE", TBODY:"TBODY", TD:"TD", TEXTAREA:"TEXTAREA", TFOOT:"TFOOT", TH:"TH", THEAD:"THEAD", TIME:"TIME", TITLE:"TITLE", TR:"TR", TRACK:"TRACK", TT:"TT", U:"U", UL:"UL", VAR:"VAR", VIDEO:"VIDEO", WBR:"WBR"};
// Input 31
goog.provide("goog.dom.BrowserFeature");
goog.require("goog.userAgent");
goog.dom.BrowserFeature = {CAN_ADD_NAME_OR_TYPE_ATTRIBUTES:!goog.userAgent.IE || goog.userAgent.isDocumentMode(9), CAN_USE_CHILDREN_ATTRIBUTE:!goog.userAgent.GECKO && !goog.userAgent.IE || goog.userAgent.IE && goog.userAgent.isDocumentMode(9) || goog.userAgent.GECKO && goog.userAgent.isVersion("1.9.1"), CAN_USE_INNER_TEXT:goog.userAgent.IE && !goog.userAgent.isVersion("9"), CAN_USE_PARENT_ELEMENT_PROPERTY:goog.userAgent.IE || goog.userAgent.OPERA || goog.userAgent.WEBKIT, INNER_HTML_NEEDS_SCOPED_ELEMENT:goog.userAgent.IE};
// Input 32
goog.provide("goog.dom");
goog.provide("goog.dom.DomHelper");
goog.provide("goog.dom.NodeType");
goog.require("goog.array");
goog.require("goog.dom.BrowserFeature");
goog.require("goog.dom.TagName");
goog.require("goog.dom.classes");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Size");
goog.require("goog.object");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.dom.ASSUME_QUIRKS_MODE = false;
goog.dom.ASSUME_STANDARDS_MODE = false;
goog.dom.COMPAT_MODE_KNOWN_ = goog.dom.ASSUME_QUIRKS_MODE || goog.dom.ASSUME_STANDARDS_MODE;
goog.dom.NodeType = {ELEMENT:1, ATTRIBUTE:2, TEXT:3, CDATA_SECTION:4, ENTITY_REFERENCE:5, ENTITY:6, PROCESSING_INSTRUCTION:7, COMMENT:8, DOCUMENT:9, DOCUMENT_TYPE:10, DOCUMENT_FRAGMENT:11, NOTATION:12};
goog.dom.getDomHelper = function(opt_element) {
  return opt_element ? new goog.dom.DomHelper(goog.dom.getOwnerDocument(opt_element)) : goog.dom.defaultDomHelper_ || (goog.dom.defaultDomHelper_ = new goog.dom.DomHelper)
};
goog.dom.defaultDomHelper_;
goog.dom.getDocument = function() {
  return document
};
goog.dom.getElement = function(element) {
  return goog.isString(element) ? document.getElementById(element) : element
};
goog.dom.$ = goog.dom.getElement;
goog.dom.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(document, opt_tag, opt_class, opt_el)
};
goog.dom.getElementsByClass = function(className, opt_el) {
  var parent = opt_el || document;
  if(goog.dom.canUseQuerySelector_(parent)) {
    return parent.querySelectorAll("." + className)
  }else {
    if(parent.getElementsByClassName) {
      return parent.getElementsByClassName(className)
    }
  }
  return goog.dom.getElementsByTagNameAndClass_(document, "*", className, opt_el)
};
goog.dom.getElementByClass = function(className, opt_el) {
  var parent = opt_el || document;
  var retVal = null;
  if(goog.dom.canUseQuerySelector_(parent)) {
    retVal = parent.querySelector("." + className)
  }else {
    retVal = goog.dom.getElementsByClass(className, opt_el)[0]
  }
  return retVal || null
};
goog.dom.canUseQuerySelector_ = function(parent) {
  return!!(parent.querySelectorAll && parent.querySelector)
};
goog.dom.getElementsByTagNameAndClass_ = function(doc, opt_tag, opt_class, opt_el) {
  var parent = opt_el || doc;
  var tagName = opt_tag && opt_tag != "*" ? opt_tag.toUpperCase() : "";
  if(goog.dom.canUseQuerySelector_(parent) && (tagName || opt_class)) {
    var query = tagName + (opt_class ? "." + opt_class : "");
    return parent.querySelectorAll(query)
  }
  if(opt_class && parent.getElementsByClassName) {
    var els = parent.getElementsByClassName(opt_class);
    if(tagName) {
      var arrayLike = {};
      var len = 0;
      for(var i = 0, el;el = els[i];i++) {
        if(tagName == el.nodeName) {
          arrayLike[len++] = el
        }
      }
      arrayLike.length = len;
      return arrayLike
    }else {
      return els
    }
  }
  var els = parent.getElementsByTagName(tagName || "*");
  if(opt_class) {
    var arrayLike = {};
    var len = 0;
    for(var i = 0, el;el = els[i];i++) {
      var className = el.className;
      if(typeof className.split == "function" && goog.array.contains(className.split(/\s+/), opt_class)) {
        arrayLike[len++] = el
      }
    }
    arrayLike.length = len;
    return arrayLike
  }else {
    return els
  }
};
goog.dom.$$ = goog.dom.getElementsByTagNameAndClass;
goog.dom.setProperties = function(element, properties) {
  goog.object.forEach(properties, function(val, key) {
    if(key == "style") {
      element.style.cssText = val
    }else {
      if(key == "class") {
        element.className = val
      }else {
        if(key == "for") {
          element.htmlFor = val
        }else {
          if(key in goog.dom.DIRECT_ATTRIBUTE_MAP_) {
            element.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[key], val)
          }else {
            if(goog.string.startsWith(key, "aria-") || goog.string.startsWith(key, "data-")) {
              element.setAttribute(key, val)
            }else {
              element[key] = val
            }
          }
        }
      }
    }
  })
};
goog.dom.DIRECT_ATTRIBUTE_MAP_ = {"cellpadding":"cellPadding", "cellspacing":"cellSpacing", "colspan":"colSpan", "frameborder":"frameBorder", "height":"height", "maxlength":"maxLength", "role":"role", "rowspan":"rowSpan", "type":"type", "usemap":"useMap", "valign":"vAlign", "width":"width"};
goog.dom.getViewportSize = function(opt_window) {
  return goog.dom.getViewportSize_(opt_window || window)
};
goog.dom.getViewportSize_ = function(win) {
  var doc = win.document;
  var el = goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body;
  return new goog.math.Size(el.clientWidth, el.clientHeight)
};
goog.dom.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(window)
};
goog.dom.getDocumentHeight_ = function(win) {
  var doc = win.document;
  var height = 0;
  if(doc) {
    var vh = goog.dom.getViewportSize_(win).height;
    var body = doc.body;
    var docEl = doc.documentElement;
    if(goog.dom.isCss1CompatMode_(doc) && docEl.scrollHeight) {
      height = docEl.scrollHeight != vh ? docEl.scrollHeight : docEl.offsetHeight
    }else {
      var sh = docEl.scrollHeight;
      var oh = docEl.offsetHeight;
      if(docEl.clientHeight != oh) {
        sh = body.scrollHeight;
        oh = body.offsetHeight
      }
      if(sh > vh) {
        height = sh > oh ? sh : oh
      }else {
        height = sh < oh ? sh : oh
      }
    }
  }
  return height
};
goog.dom.getPageScroll = function(opt_window) {
  var win = opt_window || goog.global || window;
  return goog.dom.getDomHelper(win.document).getDocumentScroll()
};
goog.dom.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(document)
};
goog.dom.getDocumentScroll_ = function(doc) {
  var el = goog.dom.getDocumentScrollElement_(doc);
  var win = goog.dom.getWindow_(doc);
  return new goog.math.Coordinate(win.pageXOffset || el.scrollLeft, win.pageYOffset || el.scrollTop)
};
goog.dom.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(document)
};
goog.dom.getDocumentScrollElement_ = function(doc) {
  return!goog.userAgent.WEBKIT && goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body
};
goog.dom.getWindow = function(opt_doc) {
  return opt_doc ? goog.dom.getWindow_(opt_doc) : window
};
goog.dom.getWindow_ = function(doc) {
  return doc.parentWindow || doc.defaultView
};
goog.dom.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(document, arguments)
};
goog.dom.createDom_ = function(doc, args) {
  var tagName = args[0];
  var attributes = args[1];
  if(!goog.dom.BrowserFeature.CAN_ADD_NAME_OR_TYPE_ATTRIBUTES && attributes && (attributes.name || attributes.type)) {
    var tagNameArr = ["<", tagName];
    if(attributes.name) {
      tagNameArr.push(' name="', goog.string.htmlEscape(attributes.name), '"')
    }
    if(attributes.type) {
      tagNameArr.push(' type="', goog.string.htmlEscape(attributes.type), '"');
      var clone = {};
      goog.object.extend(clone, attributes);
      delete clone["type"];
      attributes = clone
    }
    tagNameArr.push(">");
    tagName = tagNameArr.join("")
  }
  var element = doc.createElement(tagName);
  if(attributes) {
    if(goog.isString(attributes)) {
      element.className = attributes
    }else {
      if(goog.isArray(attributes)) {
        goog.dom.classes.add.apply(null, [element].concat(attributes))
      }else {
        goog.dom.setProperties(element, attributes)
      }
    }
  }
  if(args.length > 2) {
    goog.dom.append_(doc, element, args, 2)
  }
  return element
};
goog.dom.append_ = function(doc, parent, args, startIndex) {
  function childHandler(child) {
    if(child) {
      parent.appendChild(goog.isString(child) ? doc.createTextNode(child) : child)
    }
  }
  for(var i = startIndex;i < args.length;i++) {
    var arg = args[i];
    if(goog.isArrayLike(arg) && !goog.dom.isNodeLike(arg)) {
      goog.array.forEach(goog.dom.isNodeList(arg) ? goog.array.toArray(arg) : arg, childHandler)
    }else {
      childHandler(arg)
    }
  }
};
goog.dom.$dom = goog.dom.createDom;
goog.dom.createElement = function(name) {
  return document.createElement(name)
};
goog.dom.createTextNode = function(content) {
  return document.createTextNode(String(content))
};
goog.dom.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(document, rows, columns, !!opt_fillWithNbsp)
};
goog.dom.createTable_ = function(doc, rows, columns, fillWithNbsp) {
  var rowHtml = ["<tr>"];
  for(var i = 0;i < columns;i++) {
    rowHtml.push(fillWithNbsp ? "<td>&nbsp;</td>" : "<td></td>")
  }
  rowHtml.push("</tr>");
  rowHtml = rowHtml.join("");
  var totalHtml = ["<table>"];
  for(i = 0;i < rows;i++) {
    totalHtml.push(rowHtml)
  }
  totalHtml.push("</table>");
  var elem = doc.createElement(goog.dom.TagName.DIV);
  elem.innerHTML = totalHtml.join("");
  return(elem.removeChild(elem.firstChild))
};
goog.dom.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(document, htmlString)
};
goog.dom.htmlToDocumentFragment_ = function(doc, htmlString) {
  var tempDiv = doc.createElement("div");
  if(goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT) {
    tempDiv.innerHTML = "<br>" + htmlString;
    tempDiv.removeChild(tempDiv.firstChild)
  }else {
    tempDiv.innerHTML = htmlString
  }
  if(tempDiv.childNodes.length == 1) {
    return(tempDiv.removeChild(tempDiv.firstChild))
  }else {
    var fragment = doc.createDocumentFragment();
    while(tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild)
    }
    return fragment
  }
};
goog.dom.getCompatMode = function() {
  return goog.dom.isCss1CompatMode() ? "CSS1Compat" : "BackCompat"
};
goog.dom.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(document)
};
goog.dom.isCss1CompatMode_ = function(doc) {
  if(goog.dom.COMPAT_MODE_KNOWN_) {
    return goog.dom.ASSUME_STANDARDS_MODE
  }
  return doc.compatMode == "CSS1Compat"
};
goog.dom.canHaveChildren = function(node) {
  if(node.nodeType != goog.dom.NodeType.ELEMENT) {
    return false
  }
  switch(node.tagName) {
    case goog.dom.TagName.APPLET:
    ;
    case goog.dom.TagName.AREA:
    ;
    case goog.dom.TagName.BASE:
    ;
    case goog.dom.TagName.BR:
    ;
    case goog.dom.TagName.COL:
    ;
    case goog.dom.TagName.COMMAND:
    ;
    case goog.dom.TagName.EMBED:
    ;
    case goog.dom.TagName.FRAME:
    ;
    case goog.dom.TagName.HR:
    ;
    case goog.dom.TagName.IMG:
    ;
    case goog.dom.TagName.INPUT:
    ;
    case goog.dom.TagName.IFRAME:
    ;
    case goog.dom.TagName.ISINDEX:
    ;
    case goog.dom.TagName.KEYGEN:
    ;
    case goog.dom.TagName.LINK:
    ;
    case goog.dom.TagName.NOFRAMES:
    ;
    case goog.dom.TagName.NOSCRIPT:
    ;
    case goog.dom.TagName.META:
    ;
    case goog.dom.TagName.OBJECT:
    ;
    case goog.dom.TagName.PARAM:
    ;
    case goog.dom.TagName.SCRIPT:
    ;
    case goog.dom.TagName.SOURCE:
    ;
    case goog.dom.TagName.STYLE:
    ;
    case goog.dom.TagName.TRACK:
    ;
    case goog.dom.TagName.WBR:
      return false
  }
  return true
};
goog.dom.appendChild = function(parent, child) {
  parent.appendChild(child)
};
goog.dom.append = function(parent, var_args) {
  goog.dom.append_(goog.dom.getOwnerDocument(parent), parent, arguments, 1)
};
goog.dom.removeChildren = function(node) {
  var child;
  while(child = node.firstChild) {
    node.removeChild(child)
  }
};
goog.dom.insertSiblingBefore = function(newNode, refNode) {
  if(refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode)
  }
};
goog.dom.insertSiblingAfter = function(newNode, refNode) {
  if(refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling)
  }
};
goog.dom.insertChildAt = function(parent, child, index) {
  parent.insertBefore(child, parent.childNodes[index] || null)
};
goog.dom.removeNode = function(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null
};
goog.dom.replaceNode = function(newNode, oldNode) {
  var parent = oldNode.parentNode;
  if(parent) {
    parent.replaceChild(newNode, oldNode)
  }
};
goog.dom.flattenElement = function(element) {
  var child, parent = element.parentNode;
  if(parent && parent.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    if(element.removeNode) {
      return(element.removeNode(false))
    }else {
      while(child = element.firstChild) {
        parent.insertBefore(child, element)
      }
      return(goog.dom.removeNode(element))
    }
  }
};
goog.dom.getChildren = function(element) {
  if(goog.dom.BrowserFeature.CAN_USE_CHILDREN_ATTRIBUTE && element.children != undefined) {
    return element.children
  }
  return goog.array.filter(element.childNodes, function(node) {
    return node.nodeType == goog.dom.NodeType.ELEMENT
  })
};
goog.dom.getFirstElementChild = function(node) {
  if(node.firstElementChild != undefined) {
    return(node).firstElementChild
  }
  return goog.dom.getNextElementNode_(node.firstChild, true)
};
goog.dom.getLastElementChild = function(node) {
  if(node.lastElementChild != undefined) {
    return(node).lastElementChild
  }
  return goog.dom.getNextElementNode_(node.lastChild, false)
};
goog.dom.getNextElementSibling = function(node) {
  if(node.nextElementSibling != undefined) {
    return(node).nextElementSibling
  }
  return goog.dom.getNextElementNode_(node.nextSibling, true)
};
goog.dom.getPreviousElementSibling = function(node) {
  if(node.previousElementSibling != undefined) {
    return(node).previousElementSibling
  }
  return goog.dom.getNextElementNode_(node.previousSibling, false)
};
goog.dom.getNextElementNode_ = function(node, forward) {
  while(node && node.nodeType != goog.dom.NodeType.ELEMENT) {
    node = forward ? node.nextSibling : node.previousSibling
  }
  return(node)
};
goog.dom.getNextNode = function(node) {
  if(!node) {
    return null
  }
  if(node.firstChild) {
    return node.firstChild
  }
  while(node && !node.nextSibling) {
    node = node.parentNode
  }
  return node ? node.nextSibling : null
};
goog.dom.getPreviousNode = function(node) {
  if(!node) {
    return null
  }
  if(!node.previousSibling) {
    return node.parentNode
  }
  node = node.previousSibling;
  while(node && node.lastChild) {
    node = node.lastChild
  }
  return node
};
goog.dom.isNodeLike = function(obj) {
  return goog.isObject(obj) && obj.nodeType > 0
};
goog.dom.isElement = function(obj) {
  return goog.isObject(obj) && obj.nodeType == goog.dom.NodeType.ELEMENT
};
goog.dom.isWindow = function(obj) {
  return goog.isObject(obj) && obj["window"] == obj
};
goog.dom.getParentElement = function(element) {
  if(goog.dom.BrowserFeature.CAN_USE_PARENT_ELEMENT_PROPERTY) {
    return element.parentElement
  }
  var parent = element.parentNode;
  return goog.dom.isElement(parent) ? (parent) : null
};
goog.dom.contains = function(parent, descendant) {
  if(parent.contains && descendant.nodeType == goog.dom.NodeType.ELEMENT) {
    return parent == descendant || parent.contains(descendant)
  }
  if(typeof parent.compareDocumentPosition != "undefined") {
    return parent == descendant || Boolean(parent.compareDocumentPosition(descendant) & 16)
  }
  while(descendant && parent != descendant) {
    descendant = descendant.parentNode
  }
  return descendant == parent
};
goog.dom.compareNodeOrder = function(node1, node2) {
  if(node1 == node2) {
    return 0
  }
  if(node1.compareDocumentPosition) {
    return node1.compareDocumentPosition(node2) & 2 ? 1 : -1
  }
  if(goog.userAgent.IE && !goog.userAgent.isDocumentMode(9)) {
    if(node1.nodeType == goog.dom.NodeType.DOCUMENT) {
      return-1
    }
    if(node2.nodeType == goog.dom.NodeType.DOCUMENT) {
      return 1
    }
  }
  if("sourceIndex" in node1 || node1.parentNode && "sourceIndex" in node1.parentNode) {
    var isElement1 = node1.nodeType == goog.dom.NodeType.ELEMENT;
    var isElement2 = node2.nodeType == goog.dom.NodeType.ELEMENT;
    if(isElement1 && isElement2) {
      return node1.sourceIndex - node2.sourceIndex
    }else {
      var parent1 = node1.parentNode;
      var parent2 = node2.parentNode;
      if(parent1 == parent2) {
        return goog.dom.compareSiblingOrder_(node1, node2)
      }
      if(!isElement1 && goog.dom.contains(parent1, node2)) {
        return-1 * goog.dom.compareParentsDescendantNodeIe_(node1, node2)
      }
      if(!isElement2 && goog.dom.contains(parent2, node1)) {
        return goog.dom.compareParentsDescendantNodeIe_(node2, node1)
      }
      return(isElement1 ? node1.sourceIndex : parent1.sourceIndex) - (isElement2 ? node2.sourceIndex : parent2.sourceIndex)
    }
  }
  var doc = goog.dom.getOwnerDocument(node1);
  var range1, range2;
  range1 = doc.createRange();
  range1.selectNode(node1);
  range1.collapse(true);
  range2 = doc.createRange();
  range2.selectNode(node2);
  range2.collapse(true);
  return range1.compareBoundaryPoints(goog.global["Range"].START_TO_END, range2)
};
goog.dom.compareParentsDescendantNodeIe_ = function(textNode, node) {
  var parent = textNode.parentNode;
  if(parent == node) {
    return-1
  }
  var sibling = node;
  while(sibling.parentNode != parent) {
    sibling = sibling.parentNode
  }
  return goog.dom.compareSiblingOrder_(sibling, textNode)
};
goog.dom.compareSiblingOrder_ = function(node1, node2) {
  var s = node2;
  while(s = s.previousSibling) {
    if(s == node1) {
      return-1
    }
  }
  return 1
};
goog.dom.findCommonAncestor = function(var_args) {
  var i, count = arguments.length;
  if(!count) {
    return null
  }else {
    if(count == 1) {
      return arguments[0]
    }
  }
  var paths = [];
  var minLength = Infinity;
  for(i = 0;i < count;i++) {
    var ancestors = [];
    var node = arguments[i];
    while(node) {
      ancestors.unshift(node);
      node = node.parentNode
    }
    paths.push(ancestors);
    minLength = Math.min(minLength, ancestors.length)
  }
  var output = null;
  for(i = 0;i < minLength;i++) {
    var first = paths[0][i];
    for(var j = 1;j < count;j++) {
      if(first != paths[j][i]) {
        return output
      }
    }
    output = first
  }
  return output
};
goog.dom.getOwnerDocument = function(node) {
  return(node.nodeType == goog.dom.NodeType.DOCUMENT ? node : node.ownerDocument || node.document)
};
goog.dom.getFrameContentDocument = function(frame) {
  var doc = frame.contentDocument || frame.contentWindow.document;
  return doc
};
goog.dom.getFrameContentWindow = function(frame) {
  return frame.contentWindow || goog.dom.getWindow_(goog.dom.getFrameContentDocument(frame))
};
goog.dom.setTextContent = function(element, text) {
  if("textContent" in element) {
    element.textContent = text
  }else {
    if(element.firstChild && element.firstChild.nodeType == goog.dom.NodeType.TEXT) {
      while(element.lastChild != element.firstChild) {
        element.removeChild(element.lastChild)
      }
      element.firstChild.data = text
    }else {
      goog.dom.removeChildren(element);
      var doc = goog.dom.getOwnerDocument(element);
      element.appendChild(doc.createTextNode(String(text)))
    }
  }
};
goog.dom.getOuterHtml = function(element) {
  if("outerHTML" in element) {
    return element.outerHTML
  }else {
    var doc = goog.dom.getOwnerDocument(element);
    var div = doc.createElement("div");
    div.appendChild(element.cloneNode(true));
    return div.innerHTML
  }
};
goog.dom.findNode = function(root, p) {
  var rv = [];
  var found = goog.dom.findNodes_(root, p, rv, true);
  return found ? rv[0] : undefined
};
goog.dom.findNodes = function(root, p) {
  var rv = [];
  goog.dom.findNodes_(root, p, rv, false);
  return rv
};
goog.dom.findNodes_ = function(root, p, rv, findOne) {
  if(root != null) {
    var child = root.firstChild;
    while(child) {
      if(p(child)) {
        rv.push(child);
        if(findOne) {
          return true
        }
      }
      if(goog.dom.findNodes_(child, p, rv, findOne)) {
        return true
      }
      child = child.nextSibling
    }
  }
  return false
};
goog.dom.TAGS_TO_IGNORE_ = {"SCRIPT":1, "STYLE":1, "HEAD":1, "IFRAME":1, "OBJECT":1};
goog.dom.PREDEFINED_TAG_VALUES_ = {"IMG":" ", "BR":"\n"};
goog.dom.isFocusableTabIndex = function(element) {
  var attrNode = element.getAttributeNode("tabindex");
  if(attrNode && attrNode.specified) {
    var index = element.tabIndex;
    return goog.isNumber(index) && index >= 0 && index < 32768
  }
  return false
};
goog.dom.setFocusableTabIndex = function(element, enable) {
  if(enable) {
    element.tabIndex = 0
  }else {
    element.tabIndex = -1;
    element.removeAttribute("tabIndex")
  }
};
goog.dom.getTextContent = function(node) {
  var textContent;
  if(goog.dom.BrowserFeature.CAN_USE_INNER_TEXT && "innerText" in node) {
    textContent = goog.string.canonicalizeNewlines(node.innerText)
  }else {
    var buf = [];
    goog.dom.getTextContent_(node, buf, true);
    textContent = buf.join("")
  }
  textContent = textContent.replace(/ \xAD /g, " ").replace(/\xAD/g, "");
  textContent = textContent.replace(/\u200B/g, "");
  if(!goog.dom.BrowserFeature.CAN_USE_INNER_TEXT) {
    textContent = textContent.replace(/ +/g, " ")
  }
  if(textContent != " ") {
    textContent = textContent.replace(/^\s*/, "")
  }
  return textContent
};
goog.dom.getRawTextContent = function(node) {
  var buf = [];
  goog.dom.getTextContent_(node, buf, false);
  return buf.join("")
};
goog.dom.getTextContent_ = function(node, buf, normalizeWhitespace) {
  if(node.nodeName in goog.dom.TAGS_TO_IGNORE_) {
  }else {
    if(node.nodeType == goog.dom.NodeType.TEXT) {
      if(normalizeWhitespace) {
        buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ""))
      }else {
        buf.push(node.nodeValue)
      }
    }else {
      if(node.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
        buf.push(goog.dom.PREDEFINED_TAG_VALUES_[node.nodeName])
      }else {
        var child = node.firstChild;
        while(child) {
          goog.dom.getTextContent_(child, buf, normalizeWhitespace);
          child = child.nextSibling
        }
      }
    }
  }
};
goog.dom.getNodeTextLength = function(node) {
  return goog.dom.getTextContent(node).length
};
goog.dom.getNodeTextOffset = function(node, opt_offsetParent) {
  var root = opt_offsetParent || goog.dom.getOwnerDocument(node).body;
  var buf = [];
  while(node && node != root) {
    var cur = node;
    while(cur = cur.previousSibling) {
      buf.unshift(goog.dom.getTextContent(cur))
    }
    node = node.parentNode
  }
  return goog.string.trimLeft(buf.join("")).replace(/ +/g, " ").length
};
goog.dom.getNodeAtOffset = function(parent, offset, opt_result) {
  var stack = [parent], pos = 0, cur = null;
  while(stack.length > 0 && pos < offset) {
    cur = stack.pop();
    if(cur.nodeName in goog.dom.TAGS_TO_IGNORE_) {
    }else {
      if(cur.nodeType == goog.dom.NodeType.TEXT) {
        var text = cur.nodeValue.replace(/(\r\n|\r|\n)/g, "").replace(/ +/g, " ");
        pos += text.length
      }else {
        if(cur.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
          pos += goog.dom.PREDEFINED_TAG_VALUES_[cur.nodeName].length
        }else {
          for(var i = cur.childNodes.length - 1;i >= 0;i--) {
            stack.push(cur.childNodes[i])
          }
        }
      }
    }
  }
  if(goog.isObject(opt_result)) {
    opt_result.remainder = cur ? cur.nodeValue.length + offset - pos - 1 : 0;
    opt_result.node = cur
  }
  return cur
};
goog.dom.isNodeList = function(val) {
  if(val && typeof val.length == "number") {
    if(goog.isObject(val)) {
      return typeof val.item == "function" || typeof val.item == "string"
    }else {
      if(goog.isFunction(val)) {
        return typeof val.item == "function"
      }
    }
  }
  return false
};
goog.dom.getAncestorByTagNameAndClass = function(element, opt_tag, opt_class) {
  if(!opt_tag && !opt_class) {
    return null
  }
  var tagName = opt_tag ? opt_tag.toUpperCase() : null;
  return(goog.dom.getAncestor(element, function(node) {
    return(!tagName || node.nodeName == tagName) && (!opt_class || goog.dom.classes.has(node, opt_class))
  }, true))
};
goog.dom.getAncestorByClass = function(element, className) {
  return goog.dom.getAncestorByTagNameAndClass(element, null, className)
};
goog.dom.getAncestor = function(element, matcher, opt_includeNode, opt_maxSearchSteps) {
  if(!opt_includeNode) {
    element = element.parentNode
  }
  var ignoreSearchSteps = opt_maxSearchSteps == null;
  var steps = 0;
  while(element && (ignoreSearchSteps || steps <= opt_maxSearchSteps)) {
    if(matcher(element)) {
      return element
    }
    element = element.parentNode;
    steps++
  }
  return null
};
goog.dom.getActiveElement = function(doc) {
  try {
    return doc && doc.activeElement
  }catch(e) {
  }
  return null
};
goog.dom.DomHelper = function(opt_document) {
  this.document_ = opt_document || goog.global.document || document
};
goog.dom.DomHelper.prototype.getDomHelper = goog.dom.getDomHelper;
goog.dom.DomHelper.prototype.setDocument = function(document) {
  this.document_ = document
};
goog.dom.DomHelper.prototype.getDocument = function() {
  return this.document_
};
goog.dom.DomHelper.prototype.getElement = function(element) {
  if(goog.isString(element)) {
    return this.document_.getElementById(element)
  }else {
    return element
  }
};
goog.dom.DomHelper.prototype.$ = goog.dom.DomHelper.prototype.getElement;
goog.dom.DomHelper.prototype.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(this.document_, opt_tag, opt_class, opt_el)
};
goog.dom.DomHelper.prototype.getElementsByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementsByClass(className, doc)
};
goog.dom.DomHelper.prototype.getElementByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementByClass(className, doc)
};
goog.dom.DomHelper.prototype.$$ = goog.dom.DomHelper.prototype.getElementsByTagNameAndClass;
goog.dom.DomHelper.prototype.setProperties = goog.dom.setProperties;
goog.dom.DomHelper.prototype.getViewportSize = function(opt_window) {
  return goog.dom.getViewportSize(opt_window || this.getWindow())
};
goog.dom.DomHelper.prototype.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(this.getWindow())
};
goog.dom.Appendable;
goog.dom.DomHelper.prototype.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(this.document_, arguments)
};
goog.dom.DomHelper.prototype.$dom = goog.dom.DomHelper.prototype.createDom;
goog.dom.DomHelper.prototype.createElement = function(name) {
  return this.document_.createElement(name)
};
goog.dom.DomHelper.prototype.createTextNode = function(content) {
  return this.document_.createTextNode(String(content))
};
goog.dom.DomHelper.prototype.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(this.document_, rows, columns, !!opt_fillWithNbsp)
};
goog.dom.DomHelper.prototype.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(this.document_, htmlString)
};
goog.dom.DomHelper.prototype.getCompatMode = function() {
  return this.isCss1CompatMode() ? "CSS1Compat" : "BackCompat"
};
goog.dom.DomHelper.prototype.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(this.document_)
};
goog.dom.DomHelper.prototype.getWindow = function() {
  return goog.dom.getWindow_(this.document_)
};
goog.dom.DomHelper.prototype.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(this.document_)
};
goog.dom.DomHelper.prototype.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(this.document_)
};
goog.dom.DomHelper.prototype.getActiveElement = function(opt_doc) {
  return goog.dom.getActiveElement(opt_doc || this.document_)
};
goog.dom.DomHelper.prototype.appendChild = goog.dom.appendChild;
goog.dom.DomHelper.prototype.append = goog.dom.append;
goog.dom.DomHelper.prototype.canHaveChildren = goog.dom.canHaveChildren;
goog.dom.DomHelper.prototype.removeChildren = goog.dom.removeChildren;
goog.dom.DomHelper.prototype.insertSiblingBefore = goog.dom.insertSiblingBefore;
goog.dom.DomHelper.prototype.insertSiblingAfter = goog.dom.insertSiblingAfter;
goog.dom.DomHelper.prototype.insertChildAt = goog.dom.insertChildAt;
goog.dom.DomHelper.prototype.removeNode = goog.dom.removeNode;
goog.dom.DomHelper.prototype.replaceNode = goog.dom.replaceNode;
goog.dom.DomHelper.prototype.flattenElement = goog.dom.flattenElement;
goog.dom.DomHelper.prototype.getChildren = goog.dom.getChildren;
goog.dom.DomHelper.prototype.getFirstElementChild = goog.dom.getFirstElementChild;
goog.dom.DomHelper.prototype.getLastElementChild = goog.dom.getLastElementChild;
goog.dom.DomHelper.prototype.getNextElementSibling = goog.dom.getNextElementSibling;
goog.dom.DomHelper.prototype.getPreviousElementSibling = goog.dom.getPreviousElementSibling;
goog.dom.DomHelper.prototype.getNextNode = goog.dom.getNextNode;
goog.dom.DomHelper.prototype.getPreviousNode = goog.dom.getPreviousNode;
goog.dom.DomHelper.prototype.isNodeLike = goog.dom.isNodeLike;
goog.dom.DomHelper.prototype.isElement = goog.dom.isElement;
goog.dom.DomHelper.prototype.isWindow = goog.dom.isWindow;
goog.dom.DomHelper.prototype.getParentElement = goog.dom.getParentElement;
goog.dom.DomHelper.prototype.contains = goog.dom.contains;
goog.dom.DomHelper.prototype.compareNodeOrder = goog.dom.compareNodeOrder;
goog.dom.DomHelper.prototype.findCommonAncestor = goog.dom.findCommonAncestor;
goog.dom.DomHelper.prototype.getOwnerDocument = goog.dom.getOwnerDocument;
goog.dom.DomHelper.prototype.getFrameContentDocument = goog.dom.getFrameContentDocument;
goog.dom.DomHelper.prototype.getFrameContentWindow = goog.dom.getFrameContentWindow;
goog.dom.DomHelper.prototype.setTextContent = goog.dom.setTextContent;
goog.dom.DomHelper.prototype.getOuterHtml = goog.dom.getOuterHtml;
goog.dom.DomHelper.prototype.findNode = goog.dom.findNode;
goog.dom.DomHelper.prototype.findNodes = goog.dom.findNodes;
goog.dom.DomHelper.prototype.isFocusableTabIndex = goog.dom.isFocusableTabIndex;
goog.dom.DomHelper.prototype.setFocusableTabIndex = goog.dom.setFocusableTabIndex;
goog.dom.DomHelper.prototype.getTextContent = goog.dom.getTextContent;
goog.dom.DomHelper.prototype.getNodeTextLength = goog.dom.getNodeTextLength;
goog.dom.DomHelper.prototype.getNodeTextOffset = goog.dom.getNodeTextOffset;
goog.dom.DomHelper.prototype.getNodeAtOffset = goog.dom.getNodeAtOffset;
goog.dom.DomHelper.prototype.isNodeList = goog.dom.isNodeList;
goog.dom.DomHelper.prototype.getAncestorByTagNameAndClass = goog.dom.getAncestorByTagNameAndClass;
goog.dom.DomHelper.prototype.getAncestorByClass = goog.dom.getAncestorByClass;
goog.dom.DomHelper.prototype.getAncestor = goog.dom.getAncestor;
// Input 33
goog.provide("goog.style");
goog.require("goog.array");
goog.require("goog.dom");
goog.require("goog.dom.vendor");
goog.require("goog.math.Box");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Rect");
goog.require("goog.math.Size");
goog.require("goog.object");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.style.setStyle = function(element, style, opt_value) {
  if(goog.isString(style)) {
    goog.style.setStyle_(element, opt_value, style)
  }else {
    goog.object.forEach(style, goog.partial(goog.style.setStyle_, element))
  }
};
goog.style.setStyle_ = function(element, value, style) {
  var propertyName = goog.style.getVendorJsStyleName_(element, style);
  if(propertyName) {
    element.style[propertyName] = value
  }
};
goog.style.getVendorJsStyleName_ = function(element, style) {
  var camelStyle = goog.string.toCamelCase(style);
  if(element.style[camelStyle] === undefined) {
    var prefixedStyle = goog.dom.vendor.getVendorJsPrefix() + goog.string.toTitleCase(style);
    if(element.style[prefixedStyle] !== undefined) {
      return prefixedStyle
    }
  }
  return camelStyle
};
goog.style.getVendorStyleName_ = function(element, style) {
  var camelStyle = goog.string.toCamelCase(style);
  if(element.style[camelStyle] === undefined) {
    var prefixedStyle = goog.dom.vendor.getVendorJsPrefix() + goog.string.toTitleCase(style);
    if(element.style[prefixedStyle] !== undefined) {
      return goog.dom.vendor.getVendorPrefix() + "-" + style
    }
  }
  return style
};
goog.style.getStyle = function(element, property) {
  var styleValue = element.style[goog.string.toCamelCase(property)];
  if(typeof styleValue !== "undefined") {
    return styleValue
  }
  return element.style[goog.style.getVendorJsStyleName_(element, property)] || ""
};
goog.style.getComputedStyle = function(element, property) {
  var doc = goog.dom.getOwnerDocument(element);
  if(doc.defaultView && doc.defaultView.getComputedStyle) {
    var styles = doc.defaultView.getComputedStyle(element, null);
    if(styles) {
      return styles[property] || styles.getPropertyValue(property) || ""
    }
  }
  return""
};
goog.style.getCascadedStyle = function(element, style) {
  return element.currentStyle ? element.currentStyle[style] : null
};
goog.style.getStyle_ = function(element, style) {
  return goog.style.getComputedStyle(element, style) || goog.style.getCascadedStyle(element, style) || element.style && element.style[style]
};
goog.style.getComputedPosition = function(element) {
  return goog.style.getStyle_(element, "position")
};
goog.style.getBackgroundColor = function(element) {
  return goog.style.getStyle_(element, "backgroundColor")
};
goog.style.getComputedOverflowX = function(element) {
  return goog.style.getStyle_(element, "overflowX")
};
goog.style.getComputedOverflowY = function(element) {
  return goog.style.getStyle_(element, "overflowY")
};
goog.style.getComputedZIndex = function(element) {
  return goog.style.getStyle_(element, "zIndex")
};
goog.style.getComputedTextAlign = function(element) {
  return goog.style.getStyle_(element, "textAlign")
};
goog.style.getComputedCursor = function(element) {
  return goog.style.getStyle_(element, "cursor")
};
goog.style.setPosition = function(el, arg1, opt_arg2) {
  var x, y;
  var buggyGeckoSubPixelPos = goog.userAgent.GECKO && (goog.userAgent.MAC || goog.userAgent.X11) && goog.userAgent.isVersion("1.9");
  if(arg1 instanceof goog.math.Coordinate) {
    x = arg1.x;
    y = arg1.y
  }else {
    x = arg1;
    y = opt_arg2
  }
  el.style.left = goog.style.getPixelStyleValue_((x), buggyGeckoSubPixelPos);
  el.style.top = goog.style.getPixelStyleValue_((y), buggyGeckoSubPixelPos)
};
goog.style.getPosition = function(element) {
  return new goog.math.Coordinate(element.offsetLeft, element.offsetTop)
};
goog.style.getClientViewportElement = function(opt_node) {
  var doc;
  if(opt_node) {
    doc = goog.dom.getOwnerDocument(opt_node)
  }else {
    doc = goog.dom.getDocument()
  }
  if(goog.userAgent.IE && !goog.userAgent.isDocumentMode(9) && !goog.dom.getDomHelper(doc).isCss1CompatMode()) {
    return doc.body
  }
  return doc.documentElement
};
goog.style.getViewportPageOffset = function(doc) {
  var body = doc.body;
  var documentElement = doc.documentElement;
  var scrollLeft = body.scrollLeft || documentElement.scrollLeft;
  var scrollTop = body.scrollTop || documentElement.scrollTop;
  return new goog.math.Coordinate(scrollLeft, scrollTop)
};
goog.style.getBoundingClientRect_ = function(el) {
  var rect = el.getBoundingClientRect();
  if(goog.userAgent.IE) {
    var doc = el.ownerDocument;
    rect.left -= doc.documentElement.clientLeft + doc.body.clientLeft;
    rect.top -= doc.documentElement.clientTop + doc.body.clientTop
  }
  return(rect)
};
goog.style.getOffsetParent = function(element) {
  if(goog.userAgent.IE && !goog.userAgent.isDocumentMode(8)) {
    return element.offsetParent
  }
  var doc = goog.dom.getOwnerDocument(element);
  var positionStyle = goog.style.getStyle_(element, "position");
  var skipStatic = positionStyle == "fixed" || positionStyle == "absolute";
  for(var parent = element.parentNode;parent && parent != doc;parent = parent.parentNode) {
    positionStyle = goog.style.getStyle_((parent), "position");
    skipStatic = skipStatic && positionStyle == "static" && parent != doc.documentElement && parent != doc.body;
    if(!skipStatic && (parent.scrollWidth > parent.clientWidth || parent.scrollHeight > parent.clientHeight || positionStyle == "fixed" || positionStyle == "absolute" || positionStyle == "relative")) {
      return(parent)
    }
  }
  return null
};
goog.style.getVisibleRectForElement = function(element) {
  var visibleRect = new goog.math.Box(0, Infinity, Infinity, 0);
  var dom = goog.dom.getDomHelper(element);
  var body = dom.getDocument().body;
  var documentElement = dom.getDocument().documentElement;
  var scrollEl = dom.getDocumentScrollElement();
  for(var el = element;el = goog.style.getOffsetParent(el);) {
    if((!goog.userAgent.IE || el.clientWidth != 0) && (!goog.userAgent.WEBKIT || el.clientHeight != 0 || el != body) && el != body && el != documentElement && goog.style.getStyle_(el, "overflow") != "visible") {
      var pos = goog.style.getPageOffset(el);
      var client = goog.style.getClientLeftTop(el);
      pos.x += client.x;
      pos.y += client.y;
      visibleRect.top = Math.max(visibleRect.top, pos.y);
      visibleRect.right = Math.min(visibleRect.right, pos.x + el.clientWidth);
      visibleRect.bottom = Math.min(visibleRect.bottom, pos.y + el.clientHeight);
      visibleRect.left = Math.max(visibleRect.left, pos.x)
    }
  }
  var scrollX = scrollEl.scrollLeft, scrollY = scrollEl.scrollTop;
  visibleRect.left = Math.max(visibleRect.left, scrollX);
  visibleRect.top = Math.max(visibleRect.top, scrollY);
  var winSize = dom.getViewportSize();
  visibleRect.right = Math.min(visibleRect.right, scrollX + winSize.width);
  visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + winSize.height);
  return visibleRect.top >= 0 && visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left ? visibleRect : null
};
goog.style.getContainerOffsetToScrollInto = function(element, container, opt_center) {
  var elementPos = goog.style.getPageOffset(element);
  var containerPos = goog.style.getPageOffset(container);
  var containerBorder = goog.style.getBorderBox(container);
  var relX = elementPos.x - containerPos.x - containerBorder.left;
  var relY = elementPos.y - containerPos.y - containerBorder.top;
  var spaceX = container.clientWidth - element.offsetWidth;
  var spaceY = container.clientHeight - element.offsetHeight;
  var scrollLeft = container.scrollLeft;
  var scrollTop = container.scrollTop;
  if(opt_center) {
    scrollLeft += relX - spaceX / 2;
    scrollTop += relY - spaceY / 2
  }else {
    scrollLeft += Math.min(relX, Math.max(relX - spaceX, 0));
    scrollTop += Math.min(relY, Math.max(relY - spaceY, 0))
  }
  return new goog.math.Coordinate(scrollLeft, scrollTop)
};
goog.style.scrollIntoContainerView = function(element, container, opt_center) {
  var offset = goog.style.getContainerOffsetToScrollInto(element, container, opt_center);
  container.scrollLeft = offset.x;
  container.scrollTop = offset.y
};
goog.style.getClientLeftTop = function(el) {
  if(goog.userAgent.GECKO && !goog.userAgent.isVersion("1.9")) {
    var left = parseFloat(goog.style.getComputedStyle(el, "borderLeftWidth"));
    if(goog.style.isRightToLeft(el)) {
      var scrollbarWidth = el.offsetWidth - el.clientWidth - left - parseFloat(goog.style.getComputedStyle(el, "borderRightWidth"));
      left += scrollbarWidth
    }
    return new goog.math.Coordinate(left, parseFloat(goog.style.getComputedStyle(el, "borderTopWidth")))
  }
  return new goog.math.Coordinate(el.clientLeft, el.clientTop)
};
goog.style.getPageOffset = function(el) {
  var box, doc = goog.dom.getOwnerDocument(el);
  var positionStyle = goog.style.getStyle_(el, "position");
  goog.asserts.assertObject(el, "Parameter is required");
  var BUGGY_GECKO_BOX_OBJECT = goog.userAgent.GECKO && doc.getBoxObjectFor && !el.getBoundingClientRect && positionStyle == "absolute" && (box = doc.getBoxObjectFor(el)) && (box.screenX < 0 || box.screenY < 0);
  var pos = new goog.math.Coordinate(0, 0);
  var viewportElement = goog.style.getClientViewportElement(doc);
  if(el == viewportElement) {
    return pos
  }
  if(el.getBoundingClientRect) {
    box = goog.style.getBoundingClientRect_(el);
    var scrollCoord = goog.dom.getDomHelper(doc).getDocumentScroll();
    pos.x = box.left + scrollCoord.x;
    pos.y = box.top + scrollCoord.y
  }else {
    if(doc.getBoxObjectFor && !BUGGY_GECKO_BOX_OBJECT) {
      box = doc.getBoxObjectFor(el);
      var vpBox = doc.getBoxObjectFor(viewportElement);
      pos.x = box.screenX - vpBox.screenX;
      pos.y = box.screenY - vpBox.screenY
    }else {
      var parent = el;
      do {
        pos.x += parent.offsetLeft;
        pos.y += parent.offsetTop;
        if(parent != el) {
          pos.x += parent.clientLeft || 0;
          pos.y += parent.clientTop || 0
        }
        if(goog.userAgent.WEBKIT && goog.style.getComputedPosition(parent) == "fixed") {
          pos.x += doc.body.scrollLeft;
          pos.y += doc.body.scrollTop;
          break
        }
        parent = parent.offsetParent
      }while(parent && parent != el);
      if(goog.userAgent.OPERA || goog.userAgent.WEBKIT && positionStyle == "absolute") {
        pos.y -= doc.body.offsetTop
      }
      for(parent = el;(parent = goog.style.getOffsetParent(parent)) && parent != doc.body && parent != viewportElement;) {
        pos.x -= parent.scrollLeft;
        if(!goog.userAgent.OPERA || parent.tagName != "TR") {
          pos.y -= parent.scrollTop
        }
      }
    }
  }
  return pos
};
goog.style.getPageOffsetLeft = function(el) {
  return goog.style.getPageOffset(el).x
};
goog.style.getPageOffsetTop = function(el) {
  return goog.style.getPageOffset(el).y
};
goog.style.getFramedPageOffset = function(el, relativeWin) {
  var position = new goog.math.Coordinate(0, 0);
  var currentWin = goog.dom.getWindow(goog.dom.getOwnerDocument(el));
  var currentEl = el;
  do {
    var offset = currentWin == relativeWin ? goog.style.getPageOffset(currentEl) : goog.style.getClientPosition(currentEl);
    position.x += offset.x;
    position.y += offset.y
  }while(currentWin && currentWin != relativeWin && (currentEl = currentWin.frameElement) && (currentWin = currentWin.parent));
  return position
};
goog.style.translateRectForAnotherFrame = function(rect, origBase, newBase) {
  if(origBase.getDocument() != newBase.getDocument()) {
    var body = origBase.getDocument().body;
    var pos = goog.style.getFramedPageOffset(body, newBase.getWindow());
    pos = goog.math.Coordinate.difference(pos, goog.style.getPageOffset(body));
    if(goog.userAgent.IE && !origBase.isCss1CompatMode()) {
      pos = goog.math.Coordinate.difference(pos, origBase.getDocumentScroll())
    }
    rect.left += pos.x;
    rect.top += pos.y
  }
};
goog.style.getRelativePosition = function(a, b) {
  var ap = goog.style.getClientPosition(a);
  var bp = goog.style.getClientPosition(b);
  return new goog.math.Coordinate(ap.x - bp.x, ap.y - bp.y)
};
goog.style.getClientPosition = function(el) {
  var pos = new goog.math.Coordinate;
  if(el.nodeType == goog.dom.NodeType.ELEMENT) {
    el = (el);
    if(el.getBoundingClientRect) {
      var box = goog.style.getBoundingClientRect_(el);
      pos.x = box.left;
      pos.y = box.top
    }else {
      var scrollCoord = goog.dom.getDomHelper(el).getDocumentScroll();
      var pageCoord = goog.style.getPageOffset(el);
      pos.x = pageCoord.x - scrollCoord.x;
      pos.y = pageCoord.y - scrollCoord.y
    }
    if(goog.userAgent.GECKO && !goog.userAgent.isVersion(12)) {
      pos = goog.math.Coordinate.sum(pos, goog.style.getCssTranslation(el))
    }
  }else {
    var isAbstractedEvent = goog.isFunction(el.getBrowserEvent);
    var targetEvent = el;
    if(el.targetTouches) {
      targetEvent = el.targetTouches[0]
    }else {
      if(isAbstractedEvent && el.getBrowserEvent().targetTouches) {
        targetEvent = el.getBrowserEvent().targetTouches[0]
      }
    }
    pos.x = targetEvent.clientX;
    pos.y = targetEvent.clientY
  }
  return pos
};
goog.style.setPageOffset = function(el, x, opt_y) {
  var cur = goog.style.getPageOffset(el);
  if(x instanceof goog.math.Coordinate) {
    opt_y = x.y;
    x = x.x
  }
  var dx = x - cur.x;
  var dy = opt_y - cur.y;
  goog.style.setPosition(el, el.offsetLeft + dx, el.offsetTop + dy)
};
goog.style.setSize = function(element, w, opt_h) {
  var h;
  if(w instanceof goog.math.Size) {
    h = w.height;
    w = w.width
  }else {
    if(opt_h == undefined) {
      throw Error("missing height argument");
    }
    h = opt_h
  }
  goog.style.setWidth(element, (w));
  goog.style.setHeight(element, (h))
};
goog.style.getPixelStyleValue_ = function(value, round) {
  if(typeof value == "number") {
    value = (round ? Math.round(value) : value) + "px"
  }
  return value
};
goog.style.setHeight = function(element, height) {
  element.style.height = goog.style.getPixelStyleValue_(height, true)
};
goog.style.setWidth = function(element, width) {
  element.style.width = goog.style.getPixelStyleValue_(width, true)
};
goog.style.getSize = function(element) {
  if(goog.style.getStyle_(element, "display") != "none") {
    return goog.style.getSizeWithDisplay_(element)
  }
  var style = element.style;
  var originalDisplay = style.display;
  var originalVisibility = style.visibility;
  var originalPosition = style.position;
  style.visibility = "hidden";
  style.position = "absolute";
  style.display = "inline";
  var size = goog.style.getSizeWithDisplay_(element);
  style.display = originalDisplay;
  style.position = originalPosition;
  style.visibility = originalVisibility;
  return size
};
goog.style.getSizeWithDisplay_ = function(element) {
  var offsetWidth = element.offsetWidth;
  var offsetHeight = element.offsetHeight;
  var webkitOffsetsZero = goog.userAgent.WEBKIT && !offsetWidth && !offsetHeight;
  if((!goog.isDef(offsetWidth) || webkitOffsetsZero) && element.getBoundingClientRect) {
    var clientRect = goog.style.getBoundingClientRect_(element);
    return new goog.math.Size(clientRect.right - clientRect.left, clientRect.bottom - clientRect.top)
  }
  return new goog.math.Size(offsetWidth, offsetHeight)
};
goog.style.getBounds = function(element) {
  var o = goog.style.getPageOffset(element);
  var s = goog.style.getSize(element);
  return new goog.math.Rect(o.x, o.y, s.width, s.height)
};
goog.style.toCamelCase = function(selector) {
  return goog.string.toCamelCase(String(selector))
};
goog.style.toSelectorCase = function(selector) {
  return goog.string.toSelectorCase(selector)
};
goog.style.getOpacity = function(el) {
  var style = el.style;
  var result = "";
  if("opacity" in style) {
    result = style.opacity
  }else {
    if("MozOpacity" in style) {
      result = style.MozOpacity
    }else {
      if("filter" in style) {
        var match = style.filter.match(/alpha\(opacity=([\d.]+)\)/);
        if(match) {
          result = String(match[1] / 100)
        }
      }
    }
  }
  return result == "" ? result : Number(result)
};
goog.style.setOpacity = function(el, alpha) {
  var style = el.style;
  if("opacity" in style) {
    style.opacity = alpha
  }else {
    if("MozOpacity" in style) {
      style.MozOpacity = alpha
    }else {
      if("filter" in style) {
        if(alpha === "") {
          style.filter = ""
        }else {
          style.filter = "alpha(opacity=" + alpha * 100 + ")"
        }
      }
    }
  }
};
goog.style.setTransparentBackgroundImage = function(el, src) {
  var style = el.style;
  if(goog.userAgent.IE && !goog.userAgent.isVersion("8")) {
    style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(" + 'src="' + src + '", sizingMethod="crop")'
  }else {
    style.backgroundImage = "url(" + src + ")";
    style.backgroundPosition = "top left";
    style.backgroundRepeat = "no-repeat"
  }
};
goog.style.clearTransparentBackgroundImage = function(el) {
  var style = el.style;
  if("filter" in style) {
    style.filter = ""
  }else {
    style.backgroundImage = "none"
  }
};
goog.style.showElement = function(el, display) {
  el.style.display = display ? "" : "none"
};
goog.style.isElementShown = function(el) {
  return el.style.display != "none"
};
goog.style.installStyles = function(stylesString, opt_node) {
  var dh = goog.dom.getDomHelper(opt_node);
  var styleSheet = null;
  if(goog.userAgent.IE) {
    styleSheet = dh.getDocument().createStyleSheet();
    goog.style.setStyles(styleSheet, stylesString)
  }else {
    var head = dh.getElementsByTagNameAndClass("head")[0];
    if(!head) {
      var body = dh.getElementsByTagNameAndClass("body")[0];
      head = dh.createDom("head");
      body.parentNode.insertBefore(head, body)
    }
    styleSheet = dh.createDom("style");
    goog.style.setStyles(styleSheet, stylesString);
    dh.appendChild(head, styleSheet)
  }
  return styleSheet
};
goog.style.uninstallStyles = function(styleSheet) {
  var node = styleSheet.ownerNode || styleSheet.owningElement || (styleSheet);
  goog.dom.removeNode(node)
};
goog.style.setStyles = function(element, stylesString) {
  if(goog.userAgent.IE) {
    element.cssText = stylesString
  }else {
    element.innerHTML = stylesString
  }
};
goog.style.setPreWrap = function(el) {
  var style = el.style;
  if(goog.userAgent.IE && !goog.userAgent.isVersion("8")) {
    style.whiteSpace = "pre";
    style.wordWrap = "break-word"
  }else {
    if(goog.userAgent.GECKO) {
      style.whiteSpace = "-moz-pre-wrap"
    }else {
      style.whiteSpace = "pre-wrap"
    }
  }
};
goog.style.setInlineBlock = function(el) {
  var style = el.style;
  style.position = "relative";
  if(goog.userAgent.IE && !goog.userAgent.isVersion("8")) {
    style.zoom = "1";
    style.display = "inline"
  }else {
    if(goog.userAgent.GECKO) {
      style.display = goog.userAgent.isVersion("1.9a") ? "inline-block" : "-moz-inline-box"
    }else {
      style.display = "inline-block"
    }
  }
};
goog.style.isRightToLeft = function(el) {
  return"rtl" == goog.style.getStyle_(el, "direction")
};
goog.style.unselectableStyle_ = goog.userAgent.GECKO ? "MozUserSelect" : goog.userAgent.WEBKIT ? "WebkitUserSelect" : null;
goog.style.isUnselectable = function(el) {
  if(goog.style.unselectableStyle_) {
    return el.style[goog.style.unselectableStyle_].toLowerCase() == "none"
  }else {
    if(goog.userAgent.IE || goog.userAgent.OPERA) {
      return el.getAttribute("unselectable") == "on"
    }
  }
  return false
};
goog.style.setUnselectable = function(el, unselectable, opt_noRecurse) {
  var descendants = !opt_noRecurse ? el.getElementsByTagName("*") : null;
  var name = goog.style.unselectableStyle_;
  if(name) {
    var value = unselectable ? "none" : "";
    el.style[name] = value;
    if(descendants) {
      for(var i = 0, descendant;descendant = descendants[i];i++) {
        descendant.style[name] = value
      }
    }
  }else {
    if(goog.userAgent.IE || goog.userAgent.OPERA) {
      var value = unselectable ? "on" : "";
      el.setAttribute("unselectable", value);
      if(descendants) {
        for(var i = 0, descendant;descendant = descendants[i];i++) {
          descendant.setAttribute("unselectable", value)
        }
      }
    }
  }
};
goog.style.getBorderBoxSize = function(element) {
  return new goog.math.Size(element.offsetWidth, element.offsetHeight)
};
goog.style.setBorderBoxSize = function(element, size) {
  var doc = goog.dom.getOwnerDocument(element);
  var isCss1CompatMode = goog.dom.getDomHelper(doc).isCss1CompatMode();
  if(goog.userAgent.IE && (!isCss1CompatMode || !goog.userAgent.isVersion("8"))) {
    var style = element.style;
    if(isCss1CompatMode) {
      var paddingBox = goog.style.getPaddingBox(element);
      var borderBox = goog.style.getBorderBox(element);
      style.pixelWidth = size.width - borderBox.left - paddingBox.left - paddingBox.right - borderBox.right;
      style.pixelHeight = size.height - borderBox.top - paddingBox.top - paddingBox.bottom - borderBox.bottom
    }else {
      style.pixelWidth = size.width;
      style.pixelHeight = size.height
    }
  }else {
    goog.style.setBoxSizingSize_(element, size, "border-box")
  }
};
goog.style.getContentBoxSize = function(element) {
  var doc = goog.dom.getOwnerDocument(element);
  var ieCurrentStyle = goog.userAgent.IE && element.currentStyle;
  if(ieCurrentStyle && goog.dom.getDomHelper(doc).isCss1CompatMode() && ieCurrentStyle.width != "auto" && ieCurrentStyle.height != "auto" && !ieCurrentStyle.boxSizing) {
    var width = goog.style.getIePixelValue_(element, ieCurrentStyle.width, "width", "pixelWidth");
    var height = goog.style.getIePixelValue_(element, ieCurrentStyle.height, "height", "pixelHeight");
    return new goog.math.Size(width, height)
  }else {
    var borderBoxSize = goog.style.getBorderBoxSize(element);
    var paddingBox = goog.style.getPaddingBox(element);
    var borderBox = goog.style.getBorderBox(element);
    return new goog.math.Size(borderBoxSize.width - borderBox.left - paddingBox.left - paddingBox.right - borderBox.right, borderBoxSize.height - borderBox.top - paddingBox.top - paddingBox.bottom - borderBox.bottom)
  }
};
goog.style.setContentBoxSize = function(element, size) {
  var doc = goog.dom.getOwnerDocument(element);
  var isCss1CompatMode = goog.dom.getDomHelper(doc).isCss1CompatMode();
  if(goog.userAgent.IE && (!isCss1CompatMode || !goog.userAgent.isVersion("8"))) {
    var style = element.style;
    if(isCss1CompatMode) {
      style.pixelWidth = size.width;
      style.pixelHeight = size.height
    }else {
      var paddingBox = goog.style.getPaddingBox(element);
      var borderBox = goog.style.getBorderBox(element);
      style.pixelWidth = size.width + borderBox.left + paddingBox.left + paddingBox.right + borderBox.right;
      style.pixelHeight = size.height + borderBox.top + paddingBox.top + paddingBox.bottom + borderBox.bottom
    }
  }else {
    goog.style.setBoxSizingSize_(element, size, "content-box")
  }
};
goog.style.setBoxSizingSize_ = function(element, size, boxSizing) {
  var style = element.style;
  if(goog.userAgent.GECKO) {
    style.MozBoxSizing = boxSizing
  }else {
    if(goog.userAgent.WEBKIT) {
      style.WebkitBoxSizing = boxSizing
    }else {
      style.boxSizing = boxSizing
    }
  }
  style.width = Math.max(size.width, 0) + "px";
  style.height = Math.max(size.height, 0) + "px"
};
goog.style.getIePixelValue_ = function(element, value, name, pixelName) {
  if(/^\d+px?$/.test(value)) {
    return parseInt(value, 10)
  }else {
    var oldStyleValue = element.style[name];
    var oldRuntimeValue = element.runtimeStyle[name];
    element.runtimeStyle[name] = element.currentStyle[name];
    element.style[name] = value;
    var pixelValue = element.style[pixelName];
    element.style[name] = oldStyleValue;
    element.runtimeStyle[name] = oldRuntimeValue;
    return pixelValue
  }
};
goog.style.getIePixelDistance_ = function(element, propName) {
  var value = goog.style.getCascadedStyle(element, propName);
  return value ? goog.style.getIePixelValue_(element, value, "left", "pixelLeft") : 0
};
goog.style.getBox_ = function(element, stylePrefix) {
  if(goog.userAgent.IE) {
    var left = goog.style.getIePixelDistance_(element, stylePrefix + "Left");
    var right = goog.style.getIePixelDistance_(element, stylePrefix + "Right");
    var top = goog.style.getIePixelDistance_(element, stylePrefix + "Top");
    var bottom = goog.style.getIePixelDistance_(element, stylePrefix + "Bottom");
    return new goog.math.Box(top, right, bottom, left)
  }else {
    var left = (goog.style.getComputedStyle(element, stylePrefix + "Left"));
    var right = (goog.style.getComputedStyle(element, stylePrefix + "Right"));
    var top = (goog.style.getComputedStyle(element, stylePrefix + "Top"));
    var bottom = (goog.style.getComputedStyle(element, stylePrefix + "Bottom"));
    return new goog.math.Box(parseFloat(top), parseFloat(right), parseFloat(bottom), parseFloat(left))
  }
};
goog.style.getPaddingBox = function(element) {
  return goog.style.getBox_(element, "padding")
};
goog.style.getMarginBox = function(element) {
  return goog.style.getBox_(element, "margin")
};
goog.style.ieBorderWidthKeywords_ = {"thin":2, "medium":4, "thick":6};
goog.style.getIePixelBorder_ = function(element, prop) {
  if(goog.style.getCascadedStyle(element, prop + "Style") == "none") {
    return 0
  }
  var width = goog.style.getCascadedStyle(element, prop + "Width");
  if(width in goog.style.ieBorderWidthKeywords_) {
    return goog.style.ieBorderWidthKeywords_[width]
  }
  return goog.style.getIePixelValue_(element, width, "left", "pixelLeft")
};
goog.style.getBorderBox = function(element) {
  if(goog.userAgent.IE) {
    var left = goog.style.getIePixelBorder_(element, "borderLeft");
    var right = goog.style.getIePixelBorder_(element, "borderRight");
    var top = goog.style.getIePixelBorder_(element, "borderTop");
    var bottom = goog.style.getIePixelBorder_(element, "borderBottom");
    return new goog.math.Box(top, right, bottom, left)
  }else {
    var left = (goog.style.getComputedStyle(element, "borderLeftWidth"));
    var right = (goog.style.getComputedStyle(element, "borderRightWidth"));
    var top = (goog.style.getComputedStyle(element, "borderTopWidth"));
    var bottom = (goog.style.getComputedStyle(element, "borderBottomWidth"));
    return new goog.math.Box(parseFloat(top), parseFloat(right), parseFloat(bottom), parseFloat(left))
  }
};
goog.style.getFontFamily = function(el) {
  var doc = goog.dom.getOwnerDocument(el);
  var font = "";
  if(doc.body.createTextRange) {
    var range = doc.body.createTextRange();
    range.moveToElementText(el);
    try {
      font = range.queryCommandValue("FontName")
    }catch(e) {
      font = ""
    }
  }
  if(!font) {
    font = goog.style.getStyle_(el, "fontFamily")
  }
  var fontsArray = font.split(",");
  if(fontsArray.length > 1) {
    font = fontsArray[0]
  }
  return goog.string.stripQuotes(font, "\"'")
};
goog.style.lengthUnitRegex_ = /[^\d]+$/;
goog.style.getLengthUnits = function(value) {
  var units = value.match(goog.style.lengthUnitRegex_);
  return units && units[0] || null
};
goog.style.ABSOLUTE_CSS_LENGTH_UNITS_ = {"cm":1, "in":1, "mm":1, "pc":1, "pt":1};
goog.style.CONVERTIBLE_RELATIVE_CSS_UNITS_ = {"em":1, "ex":1};
goog.style.getFontSize = function(el) {
  var fontSize = goog.style.getStyle_(el, "fontSize");
  var sizeUnits = goog.style.getLengthUnits(fontSize);
  if(fontSize && "px" == sizeUnits) {
    return parseInt(fontSize, 10)
  }
  if(goog.userAgent.IE) {
    if(sizeUnits in goog.style.ABSOLUTE_CSS_LENGTH_UNITS_) {
      return goog.style.getIePixelValue_(el, fontSize, "left", "pixelLeft")
    }else {
      if(el.parentNode && el.parentNode.nodeType == goog.dom.NodeType.ELEMENT && sizeUnits in goog.style.CONVERTIBLE_RELATIVE_CSS_UNITS_) {
        var parentElement = (el.parentNode);
        var parentSize = goog.style.getStyle_(parentElement, "fontSize");
        return goog.style.getIePixelValue_(parentElement, fontSize == parentSize ? "1em" : fontSize, "left", "pixelLeft")
      }
    }
  }
  var sizeElement = goog.dom.createDom("span", {"style":"visibility:hidden;position:absolute;" + "line-height:0;padding:0;margin:0;border:0;height:1em;"});
  goog.dom.appendChild(el, sizeElement);
  fontSize = sizeElement.offsetHeight;
  goog.dom.removeNode(sizeElement);
  return fontSize
};
goog.style.parseStyleAttribute = function(value) {
  var result = {};
  goog.array.forEach(value.split(/\s*;\s*/), function(pair) {
    var keyValue = pair.split(/\s*:\s*/);
    if(keyValue.length == 2) {
      result[goog.string.toCamelCase(keyValue[0].toLowerCase())] = keyValue[1]
    }
  });
  return result
};
goog.style.toStyleAttribute = function(obj) {
  var buffer = [];
  goog.object.forEach(obj, function(value, key) {
    buffer.push(goog.string.toSelectorCase(key), ":", value, ";")
  });
  return buffer.join("")
};
goog.style.setFloat = function(el, value) {
  el.style[goog.userAgent.IE ? "styleFloat" : "cssFloat"] = value
};
goog.style.getFloat = function(el) {
  return el.style[goog.userAgent.IE ? "styleFloat" : "cssFloat"] || ""
};
goog.style.getScrollbarWidth = function(opt_className) {
  var outerDiv = goog.dom.createElement("div");
  if(opt_className) {
    outerDiv.className = opt_className
  }
  outerDiv.style.cssText = "overflow:auto;" + "position:absolute;top:0;width:100px;height:100px";
  var innerDiv = goog.dom.createElement("div");
  goog.style.setSize(innerDiv, "200px", "200px");
  outerDiv.appendChild(innerDiv);
  goog.dom.appendChild(goog.dom.getDocument().body, outerDiv);
  var width = outerDiv.offsetWidth - outerDiv.clientWidth;
  goog.dom.removeNode(outerDiv);
  return width
};
goog.style.MATRIX_TRANSLATION_REGEX_ = new RegExp("matrix\\([0-9\\.\\-]+, [0-9\\.\\-]+, " + "[0-9\\.\\-]+, [0-9\\.\\-]+, " + "([0-9\\.\\-]+)p?x?, ([0-9\\.\\-]+)p?x?\\)");
goog.style.getCssTranslation = function(element) {
  var property;
  if(goog.userAgent.IE) {
    property = "-ms-transform"
  }else {
    if(goog.userAgent.WEBKIT) {
      property = "-webkit-transform"
    }else {
      if(goog.userAgent.OPERA) {
        property = "-o-transform"
      }else {
        if(goog.userAgent.GECKO) {
          property = "-moz-transform"
        }
      }
    }
  }
  var transform;
  if(property) {
    transform = goog.style.getStyle_(element, property)
  }
  if(!transform) {
    transform = goog.style.getStyle_(element, "transform")
  }
  if(!transform) {
    return new goog.math.Coordinate(0, 0)
  }
  var matches = transform.match(goog.style.MATRIX_TRANSLATION_REGEX_);
  if(!matches) {
    return new goog.math.Coordinate(0, 0)
  }
  return new goog.math.Coordinate(parseFloat(matches[1]), parseFloat(matches[2]))
};
// Input 34
/*
 Dual licensed under the MIT or GPL licenses.
*/
goog.provide("pike.graphics.Rectangle");
goog.provide("pike.graphics.Cluster");
pike.graphics.Rectangle = function(x, y, width, height) {
  this.x = x || 0;
  this.y = y || 0;
  this.w = width || 0;
  this.h = height || 0
};
pike.graphics.Rectangle.prototype.copy = function() {
  return new pike.graphics.Rectangle(this.x, this.y, this.w, this.h)
};
pike.graphics.Rectangle.prototype.equals = function(r2) {
  return this.x == r2.x && this.y == r2.y && this.w == r2.w && this.h == r2.h
};
pike.graphics.Rectangle.prototype.toString = function() {
  return"[x=" + this.x + ", y=" + this.y + ", width=" + this.w + ", height=" + this.h + "]"
};
pike.graphics.Rectangle.prototype.intersects = function(r2) {
  return this.x <= r2.x + r2.w && this.x + this.w >= r2.x && this.y <= r2.y + r2.h && this.y + this.h >= r2.y
};
pike.graphics.Rectangle.prototype.intersection = function(r2) {
  var x = Math.max(this.x, r2.x);
  var y = Math.max(this.y, r2.y);
  var width = Math.min(this.x + this.w, r2.x + r2.w) - x;
  var height = Math.min(this.y + this.h, r2.y + r2.h) - y;
  if(width <= 0 || height <= 0) {
    return null
  }
  return new pike.graphics.Rectangle(x, y, width, height)
};
pike.graphics.Rectangle.prototype.covers = function(r2) {
  return r2.x >= this.x && r2.y >= this.y && r2.x + r2.w <= this.x + this.w && r2.y + r2.h <= this.y + this.h
};
pike.graphics.Rectangle.prototype.containsPoint = function(x, y) {
  return x >= this.x && x < this.x + this.w && y >= this.y && y < this.y + this.h
};
pike.graphics.Rectangle.prototype.convexHull = function(r2) {
  var x = Math.min(this.x, r2.x);
  var y = Math.min(this.y, r2.y);
  var width = Math.max(this.x + this.w, r2.x + r2.w) - x;
  var height = Math.max(this.y + this.h, r2.y + r2.h) - y;
  return new pike.graphics.Rectangle(x, y, width, height)
};
pike.graphics.Rectangle.prototype.getOverlappingGridCells = function(cellW, cellH, cellsInRow, cellsInColumn) {
  var rectX = Math.max(0, Math.floor(this.x / cellW));
  var rectY = Math.max(0, Math.floor(this.y / cellH));
  var rectWidth = Math.min(cellsInRow - rectX, Math.floor((this.x + this.w) / cellW) - rectX + 1);
  var rectHeight = Math.min(cellsInColumn - rectY, Math.floor((this.y + this.h) / cellH) - rectY + 1);
  return new pike.graphics.Rectangle(rectX, rectY, rectWidth, rectHeight)
};
pike.graphics.Cluster = function(clusterSize, width, height) {
  this.clusterSize_ = clusterSize;
  this.bounds_ = new pike.graphics.Rectangle(0, 0, width, height);
  this.clusters_ = [];
  this.idToClusterBounds_ = {}
};
pike.graphics.Cluster.prototype.setSize = function(width, height) {
  this.bounds_.w = width;
  this.bounds_.h = height
};
pike.graphics.Cluster.prototype.getClusters = function() {
  return this.clusters_
};
pike.graphics.Cluster.prototype.getClusterSize = function() {
  return this.clusterSize_
};
pike.graphics.Cluster.prototype.getIdToClusterBounds = function(id) {
  return this.idToClusterBounds_[id]
};
pike.graphics.Cluster.prototype.setIdToClusterBounds = function(id, bounds) {
  this.idToClusterBounds_[id] = bounds
};
pike.graphics.Cluster.prototype.build = function() {
  this.clusters_ = [];
  for(var i = 0;i < Math.ceil(this.bounds_.h / this.clusterSize_);i++) {
    this.clusters_[i] = [];
    for(var j = 0;j < Math.ceil(this.bounds_.w / this.clusterSize_);j++) {
      this.clusters_[i][j] = []
    }
  }
};
pike.graphics.Cluster.prototype.addToClusters = function(entity, clusterBounds) {
  clusterBounds = clusterBounds || entity.getBounds().getOverlappingGridCells(this.clusterSize_, this.clusterSize_, this.clusters_[0].length, this.clusters_.length);
  for(var clusterY = clusterBounds.y;clusterY < clusterBounds.y + clusterBounds.h;clusterY++) {
    for(var clusterX = clusterBounds.x;clusterX < clusterBounds.x + clusterBounds.w;clusterX++) {
      this.clusters_[clusterY][clusterX].push(entity)
    }
  }
  this.idToClusterBounds_[entity.id] = clusterBounds;
  if(goog.DEBUG) {
    window.console.log("[pike.graphics.Cluster] entity " + entity.id + " is added to cluster " + clusterBounds)
  }
  return clusterBounds
};
pike.graphics.Cluster.prototype.removeFromClusters = function(entity, clusterBounds) {
  clusterBounds = clusterBounds || this.idToClusterBounds_[entity.id];
  for(var clusterY = clusterBounds.y;clusterY < clusterBounds.y + clusterBounds.h;clusterY++) {
    for(var clusterX = clusterBounds.x;clusterX < clusterBounds.x + clusterBounds.w;clusterX++) {
      goog.array.remove(this.clusters_[clusterY][clusterX], entity)
    }
  }
  if(goog.DEBUG) {
    window.console.log("[pike.graphics.Cluster] entity " + entity.id + " is removed from cluster " + clusterBounds)
  }
};
// Input 35
/*
 Dual licensed under the MIT or GPL licenses.
*/
goog.provide("pike.input.InputHandlerBase");
goog.provide("pike.input.MouseInputHandler");
goog.provide("pike.input.TouchInputHandler");
goog.provide("pike.input.Utils");
goog.require("pike.graphics.Rectangle");
goog.require("pike.events.Down");
goog.require("pike.events.Up");
goog.require("pike.events.Move");
goog.require("goog.events.EventTarget");
goog.require("goog.style");
pike.input.InputHandlerBase = function() {
  goog.events.EventTarget.call(this);
  this.handler = new goog.events.EventHandler(this);
  this.viewport_ = new pike.graphics.Rectangle(0, 0, 0, 0);
  this.element_ = null;
  this.moving_ = false;
  this.lastMoveCoordinates_ = null;
  this.moveThreshold_ = 10;
  this.stopDomEvents_ = true
};
goog.inherits(pike.input.InputHandlerBase, goog.events.EventTarget);
pike.input.InputHandlerBase.prototype.onDownDomEvent = function(e) {
  var coords = this.lastMoveCoordinates_ = this.getInputCoordinates(e);
  if(goog.DEBUG) {
    window.console.log("[pike.core.InputHanderBase] down " + coords.posX + ", " + coords.posY)
  }
  this.dispatchEvent(new pike.events.Down(coords.posX, coords.posY, e, this.element_));
  this.stopEventIfRequired_(e)
};
pike.input.InputHandlerBase.prototype.onUpDomEvent = function(e) {
  var coords = this.getInputCoordinates(e);
  if(goog.DEBUG) {
    window.console.log("[pike.core.InputHanderBase] up " + coords.posX + ", " + coords.posY + ", moving: " + this.moving_)
  }
  this.dispatchEvent(new pike.events.Up(coords.posX, coords.posY, this.moving_, e, this.element_));
  this.stopEventIfRequired_(e);
  this.moving_ = false
};
pike.input.InputHandlerBase.prototype.onMoveDomEvent = function(e) {
  var coords = this.getInputCoordinates(e);
  var deltaX = coords.posX - this.lastMoveCoordinates_.posX;
  var deltaY = coords.posY - this.lastMoveCoordinates_.posY;
  if(!this.moving_ && Math.sqrt(deltaX * deltaX + deltaY * deltaY) > this.moveThreshold_) {
    this.moving_ = true
  }
  if(this.moving_) {
    if(goog.DEBUG) {
      window.console.log("[pike.core.InputHanderBase] move " + coords.posX + ", " + coords.posY + ", deltaX: " + deltaX + ", deltaY: " + deltaY)
    }
    this.dispatchEvent(new pike.events.Move(coords.posX, coords.posY, deltaX, deltaY, e, this.element_));
    this.lastMoveCoordinates_ = coords
  }
  this.stopEventIfRequired_(e)
};
pike.input.InputHandlerBase.prototype.stopEventIfRequired_ = function(e) {
  if(this.stopDomEvents_) {
    e.stopPropagation();
    e.preventDefault()
  }
};
pike.input.InputHandlerBase.prototype.getInputCoordinates = function(e) {
  return pike.input.Utils.getInputCoordinates(e.getBrowserEvent(), this.element_)
};
pike.input.InputHandlerBase.prototype.onViewportChangePosition = function(e) {
  this.viewport_.x = e.x;
  this.viewport_.y = e.y
};
pike.input.MouseInputHandler = function() {
  pike.input.InputHandlerBase.call(this);
  this.mouseDown_ = false
};
goog.inherits(pike.input.MouseInputHandler, pike.input.InputHandlerBase);
pike.input.MouseInputHandler.prototype.setEventTarget = function(eventTarget) {
  this.element_ = eventTarget;
  this.attachDomListeners_()
};
pike.input.MouseInputHandler.prototype.attachDomListeners_ = function() {
  var el = this.element_;
  this.handler.listen(el, goog.events.EventType.MOUSEDOWN, this.onDownDomEvent, false, this);
  this.handler.listen(el, goog.events.EventType.MOUSEUP, this.onUpDomEvent, false, this);
  this.handler.listen(el, goog.events.EventType.MOUSEMOVE, this.onMoveDomEvent, false, this);
  this.handler.listen(el, goog.events.EventType.MOUSEOUT, this.onMouseOut, false, this)
};
pike.input.MouseInputHandler.prototype.onDownDomEvent = function(e) {
  this.mouseDown_ = true;
  pike.input.InputHandlerBase.prototype.onDownDomEvent.call(this, e)
};
pike.input.MouseInputHandler.prototype.onUpDomEvent = function(e) {
  this.mouseDown_ = false;
  pike.input.InputHandlerBase.prototype.onUpDomEvent.call(this, e)
};
pike.input.MouseInputHandler.prototype.onMoveDomEvent = function(e) {
  if(this.mouseDown_) {
    pike.input.InputHandlerBase.prototype.onMoveDomEvent.call(this, e)
  }
};
pike.input.MouseInputHandler.prototype.onMouseOut = function() {
  this.mouseDown_ = false
};
pike.input.TouchInputHandler = function() {
  pike.input.InputHandlerBase.call(this);
  this.lastInteractionCoordinates_ = null
};
goog.inherits(pike.input.TouchInputHandler, pike.input.InputHandlerBase);
pike.input.TouchInputHandler.prototype.setEventTarget = function(eventTarget) {
  this.element_ = eventTarget;
  this.attachDomListeners_()
};
pike.input.TouchInputHandler.prototype.attachDomListeners_ = function() {
  var el = this.element_;
  this.handler.listen(el, goog.events.EventType.TOUCHSTART, goog.bind(this.onDownDomEvent, this));
  this.handler.listen(el, goog.events.EventType.TOUCHEND, goog.bind(this.onUpDomEvent, this));
  this.handler.listen(el, goog.events.EventType.TOUCHMOVE, goog.bind(this.onMoveDomEvent, this))
};
pike.input.TouchInputHandler.prototype.onDownDomEvent = function(e) {
  this.lastInteractionCoordinates_ = this.getInputCoordinates(e);
  pike.input.InputHandlerBase.prototype.onDownDomEvent.call(this, e)
};
pike.input.TouchInputHandler.prototype.onUpDomEvent = function(e) {
  if(goog.DEBUG) {
    window.console.log("[pike.core.TouchHanderBase] up " + this.lastInteractionCoordinates_.posX + ", " + this.lastInteractionCoordinates_.posY + ", moving: " + this.moving_)
  }
  this.dispatchEvent(new pike.events.Up(this.lastInteractionCoordinates_.posX, this.lastInteractionCoordinates_.posY, this.moving_, e, this));
  this.stopEventIfRequired_(e);
  this.lastInteractionCoordinates_ = null;
  this.moving_ = false
};
pike.input.TouchInputHandler.prototype.onMoveDomEvent = function(e) {
  this.lastInteractionCoordinates_ = this.getInputCoordinates(e);
  pike.input.InputHandlerBase.prototype.onMoveDomEvent.call(this, e)
};
pike.input.Utils.isTouchDevice = function() {
  return"ontouchstart" in document.documentElement
};
pike.input.Utils.getDeviceInputHandler = function() {
  return pike.input.Utils.isTouchDevice() ? new pike.input.TouchInputHandler : new pike.input.MouseInputHandler
};
pike.input.Utils.getInputCoordinates = function(e, element) {
  var coords = e.targetTouches ? e.targetTouches[0] : e;
  var offset = goog.style.getPageOffset(element);
  return{posX:(coords.pageX || coords.clientX + document.body.scrollLeft) - offset.x, posY:(coords.pageY || coords.clientY + document.body.scrollTop) - offset.y}
};
// Input 36
/*
 Dual licensed under the MIT or GPL licenses.
*/
goog.provide("pike.ai.path.Node");
goog.provide("pike.ai.path.Graph");
goog.provide("pike.ai.decision.DecisionTreeNode");
goog.provide("pike.ai.decision.NumericDecisionNode");
goog.provide("pike.ai.decision.ProbabilisticDecisionNode");
pike.ai.decision.NumericDecisionNode = function(name, threshold, leNode, gNode) {
  this.name_ = name;
  this.threshold_ = threshold;
  this.leNode_ = leNode;
  this.gNode_ = gNode
};
goog.inherits(pike.ai.decision.NumericDecisionNode, pike.ai.decision.DecisionTreeNode);
pike.ai.decision.NumericDecisionNode.prototype.execute = function(agent, data) {
  var node = agent[this.name_] > this.threshold_ ? this.gNode_ : this.leNode_;
  node.execute(agent)
};
pike.ai.decision.ProbabilisticDecisionNode = function(chance, trueNode, falseNode) {
  this.chance_ = chance;
  this.trueNode_ = trueNode;
  this.falseNode_ = falseNode
};
goog.inherits(pike.ai.decision.ProbabilisticDecisionNode, pike.ai.decision.DecisionTreeNode);
pike.ai.decision.ProbabilisticDecisionNode.prototype.execute = function(agent, data) {
  var node = Math.random() < this.chance_ ? this.trueNode_ : this.falseNode_;
  node.execute(agent)
};
pike.ai.decision.DecisionTreeNode = function() {
};
pike.ai.decision.DecisionTreeNode.prototype.execute = function(agent, data) {
  throw Error("Abstract method - must be overwritten");
};
pike.ai.path.Graph = function(nodes, connections) {
  this.nodes_ = nodes;
  if(!connections) {
    return
  }
  for(var i = 0;i < connections.length;i++) {
    for(var j = 0;j < connections[i].length;j++) {
      if(connections[i][j]) {
        nodes[i].addConnection(nodes[j], pike.ai.path.Graph.distance(nodes[i], nodes[j]))
      }
    }
  }
};
pike.ai.path.Graph.prototype.findPath = function(startNode, endNode) {
  function updateNodeValues(node, prevNode, routeCost) {
    node.routeCost = routeCost;
    node.estimatedCost = routeCost + pike.ai.path.Graph.distance(node, endNode);
    node.prevNode = prevNode
  }
  var openList = [];
  var closedList = [];
  startNode.routeCost = 0;
  openList.push(startNode);
  var routeFound = false;
  while(openList.length > 0) {
    var currentNode = openList.sort(function(a, b) {
      return a.estimatedCost - b.estimatedCost
    })[0];
    if(currentNode == endNode) {
      routeFound = true;
      break
    }
    currentNode.getConnections().forEach(function(connection) {
      var node = connection.node;
      var newRouteCost = currentNode.routeCost + connection.weight;
      if(closedList.indexOf(node) > -1) {
        if(newRouteCost < node.routeCost) {
          closedList.splice(closedList.indexOf(node), 1);
          updateNodeValues(node, currentNode, newRouteCost);
          openList.push(node)
        }
      }else {
        if(openList.indexOf(node) > -1) {
          if(newRouteCost < node.routeCost) {
            updateNodeValues(node, currentNode, newRouteCost)
          }
        }else {
          updateNodeValues(node, currentNode, newRouteCost);
          openList.push(node)
        }
      }
      if(openList.indexOf(currentNode) != -1) {
        openList.splice(openList.indexOf(currentNode), 1)
      }
      closedList.push(currentNode)
    })
  }
  var route = [];
  if(routeFound) {
    var routeNode = endNode;
    while(routeNode) {
      route.push(routeNode);
      routeNode = routeNode.prevNode
    }
    route.reverse()
  }
  this.nodes_.forEach(function(node) {
    delete node.routeCost;
    delete node.estimatedCost;
    delete node.prevNode
  });
  return route
};
pike.ai.path.Graph.serialize = function() {
  var data = {};
  data.nodes = [];
  this.nodes_.forEach(function(it) {
    data.nodes.push([it.x, it.y])
  });
  return JSON.stringify(data)
};
pike.ai.path.Graph.distance = function(node1, node2) {
  return Math.sqrt((node1.x - node2.x) * (node1.x - node2.x) + (node1.y - node2.y) * (node1.y - node2.y))
};
pike.ai.path.Node = function(id, x, y) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.connections_ = []
};
pike.ai.path.Node.prototype.addConnection = function(node, weight) {
  this.connections_.push({node:node, weight:weight})
};
pike.ai.path.Node.prototype.getConnections = function() {
  return this.connections_
};
// Input 37
/*
 Dual licensed under the MIT or GPL licenses.
*/
goog.provide("pike.core.Entity");
goog.provide("pike.core.Viewport");
goog.provide("pike.core.GameWorld");
goog.provide("pike.core.Timer");
goog.provide("pike.core.Stage");
goog.require("pike.graphics.Rectangle");
goog.require("goog.events");
goog.require("goog.array");
goog.require("goog.events.EventTarget");
pike.core.Entity = function(components) {
  goog.events.EventTarget.call(this);
  this.id = goog.getUid(this);
  this.components_ = {};
  this.handler = new goog.events.EventHandler(this);
  for(var idx = 0;idx < arguments.length;idx++) {
    if(typeof arguments[idx] !== "function") {
      throw"Argument is not a function " + arguments[idx];
    }
    arguments[idx].call(this);
    if(arguments[idx].NAME) {
      this.components_[arguments[idx].NAME] = true
    }
  }
};
goog.inherits(pike.core.Entity, goog.events.EventTarget);
pike.core.Entity.prototype.hasComponent = function(name) {
  return this.components_[name] ? true : false
};
pike.core.Entity.prototype.getBounds = function() {
  return new pike.graphics.Rectangle(this.x, this.y, this.w, this.h)
};
pike.core.Entity.prototype.getCBounds = function() {
  return this.getBounds()
};
pike.core.Entity.prototype.disposeInternal = function() {
  pike.core.Entity.superClass_.disposeInternal.call(this);
  this.handler.dispose()
};
pike.core.Viewport = function() {
  goog.events.EventTarget.call(this);
  this.viewport_ = new pike.graphics.Rectangle(0, 0, 0, 0);
  this.handler = new goog.events.EventHandler(this)
};
goog.inherits(pike.core.Viewport, goog.events.EventTarget);
pike.core.Viewport.prototype.setSize = function(width, height) {
  var oldW = this.viewport_.w;
  var oldH = this.viewport_.h;
  this.viewport_.w = width;
  this.viewport_.h = height;
  if(goog.DEBUG) {
    window.console.log("[pike.core.Viewport] changesize")
  }
  this.dispatchEvent(new pike.events.ChangeSize(this.viewport_.w, this.viewport_.h, oldW, oldH, this))
};
pike.core.Viewport.prototype.setPosition = function(x, y) {
  var oldX = this.viewport_.x;
  var oldY = this.viewport_.y;
  this.viewport_.x = x;
  this.viewport_.y = y;
  if(goog.DEBUG) {
    window.console.log("[pike.core.Viewport] changeposition")
  }
  this.dispatchEvent(new pike.events.ChangePosition(this.viewport_.x, this.viewport_.y, oldX, oldY, this))
};
pike.core.Viewport.prototype.getBounds = function() {
  return this.viewport_.copy()
};
pike.core.GameWorld = function() {
  goog.events.EventTarget.call(this);
  this.bounds_ = new pike.graphics.Rectangle(0, 0, 0, 0);
  this.handler = new goog.events.EventHandler(this)
};
goog.inherits(pike.core.GameWorld, goog.events.EventTarget);
pike.core.GameWorld.prototype.setSize = function(width, height) {
  var oldW = this.bounds_.w;
  var oldH = this.bounds_.h;
  this.bounds_.w = width;
  this.bounds_.h = height;
  if(goog.DEBUG) {
    window.console.log("[pike.core.GameWorld] changesize")
  }
  this.dispatchEvent(new pike.events.ChangeSize(this.bounds_.w, this.bounds_.h, oldW, oldH, this))
};
pike.core.GameWorld.prototype.getBounds = function() {
  return this.bounds_.copy()
};
pike.core.Timer = function() {
  goog.events.EventTarget.call(this);
  this.handler = new goog.events.EventHandler(this);
  this.boundTick_ = goog.bind(this.tick, this)
};
goog.inherits(pike.core.Timer, goog.events.EventTarget);
pike.core.Timer.prototype.start = function() {
  if(!this.requestID_) {
    this.tick();
    if(goog.DEBUG) {
      window.console.log("[pike.core.Timer] start")
    }
  }
};
pike.core.Timer.prototype.stop = function() {
  if(this.requestID_) {
    window.cancelAnimationFrame(this.requestID_);
    this.requestID_ = undefined;
    if(goog.DEBUG) {
      window.console.log("[pike.core.Timer] stop")
    }
  }
};
pike.core.Timer.prototype.isRunning = function() {
  return this.requestID_ ? true : false
};
pike.core.Timer.prototype.tick = function() {
  this.requestID_ = window.requestAnimationFrame(this.boundTick_);
  this.dispatchEvent(new pike.events.Update((new Date).getTime(), this));
  this.dispatchEvent(new pike.events.Render((new Date).getTime(), this))
};
pike.core.Stage = function() {
  goog.events.EventTarget.call(this);
  this.viewport_ = new pike.graphics.Rectangle(0, 0, 0, 0);
  this.gameWorld_ = new pike.graphics.Rectangle(0, 0, 0, 0);
  this.layers_ = [];
  this.createRootElement_();
  this.handler = new goog.events.EventHandler(this)
};
goog.inherits(pike.core.Stage, goog.events.EventTarget);
pike.core.Stage.ELEMENT_ID = "pike-stage";
pike.core.Stage.prototype.getLayer = function(name) {
  for(var idx = 0;idx < this.layers_.length;idx++) {
    if(this.layers_[idx].name == name) {
      return this.layers_[idx]
    }
  }
  throw new Error("Layer with name " + name + " does not exist.");
};
pike.core.Stage.prototype.addLayer = function(layer) {
  this.setLayerSize_(layer);
  this.layers_.push(layer);
  this.getRootElement().appendChild(layer.getScreen().canvas)
};
pike.core.Stage.prototype.getRootElement = function() {
  return this.rootElement_
};
pike.core.Stage.prototype.onRender = function(e) {
  for(var idx = 0;idx < this.layers_.length;idx++) {
    this.layers_[idx].onRender()
  }
};
pike.core.Stage.prototype.onViewportChangeSize = function(e) {
  this.setViewportSize_(e.w, e.h)
};
pike.core.Stage.prototype.onViewportChangePosition = function(e) {
  this.setViewportPosition_(e.x, e.y)
};
pike.core.Stage.prototype.onGameWorldChangeSize = function(e) {
  this.setGameWorldSize_(e.w, e.h)
};
pike.core.Stage.prototype.createRootElement_ = function() {
  this.rootElement_ = document.getElementById(pike.core.Stage.ELEMENT_ID);
  if(!this.rootElement_) {
    this.rootElement_ = document.createElement("div");
    this.rootElement_.setAttribute("id", pike.core.Stage.ELEMENT_ID);
    document.getElementsByTagName("body")[0].appendChild(this.rootElement_)
  }else {
    this.rootElement_.innerHTML = ""
  }
  this.rootElement_.style.position = "relative"
};
pike.core.Stage.prototype.setLayerSize_ = function(layer) {
  layer.setViewportSize(this.viewport_.w, this.viewport_.h);
  layer.setViewportPosition(this.viewport_.x, this.viewport_.y);
  layer.setGameWorldSize(this.gameWorld_.w, this.gameWorld_.h)
};
pike.core.Stage.prototype.setViewportSize_ = function(width, height) {
  if(this.viewport_.w == width && this.viewport_.h == height) {
    return
  }
  this.viewport_.w = width;
  this.viewport_.h = height;
  this.rootElement_.style.width = this.viewport_.w + "px";
  this.rootElement_.style.height = this.viewport_.h + "px";
  if(this.gameWorld_.w < width || this.gameWorld_.h < height) {
    this.setGameWorldSize_(width, height)
  }
  for(var idx = 0;idx < this.layers_.length;idx++) {
    this.setLayerSize_(this.layers_[idx])
  }
};
pike.core.Stage.prototype.setGameWorldSize_ = function(width, height) {
  this.gameWorld_.w = Math.max(width, this.viewport_.w);
  this.gameWorld_.h = Math.max(height, this.viewport_.h);
  for(var idx = 0;idx < this.layers_.length;idx++) {
    this.setLayerSize_(this.layers_[idx])
  }
};
pike.core.Stage.prototype.setViewportPosition_ = function(x, y) {
  this.viewport_.x = x;
  this.viewport_.y = y;
  for(var idx = 0;idx < this.layers_.length;idx++) {
    this.layers_[idx].setViewportPosition(this.viewport_.x, this.viewport_.y)
  }
};
// Input 38
/*
 Dual licensed under the MIT or GPL licenses.
*/
goog.provide("pike.components.Collision");
goog.provide("pike.components.Sprite");
goog.provide("pike.components.Image");
goog.provide("pike.components.Watch");
goog.provide("pike.components.Backpack");
goog.provide("pike.components.Dialogues");
goog.provide("pike.components.Hen");
goog.provide("pike.components.VisualizeGraph");
goog.provide("pike.components.VisualizeRectangle");
goog.require("goog.events");
goog.require("goog.array");
goog.require("goog.dom");
goog.require("pike.graphics.Rectangle");
goog.require("pike.animation.Animator");
goog.require("pike.events.StartDialogue");
goog.require("pike.events.ShowDialogue");
goog.require("pike.events.EndDialogue");
goog.require("goog.style");
pike.components.Collision = function() {
  this.collisionBounds_ = new pike.graphics.Rectangle(0, 0, 0, 0);
  this.setCollisionBounds = function(x, y, w, h) {
    this.collisionBounds_ = new pike.graphics.Rectangle(x, y, w, h);
    return this
  };
  this.checkCollision = function(e) {
    var boundsInCluster = this.layer.getCluster().getIdToClusterBounds(this.id);
    var entities = this.layer.getCluster().getClusters()[boundsInCluster.y][boundsInCluster.x];
    for(var idx = 0;idx < entities.length;idx++) {
      if(this.id == entities[idx].id) {
        continue
      }
      if(this.getCBounds().intersects(entities[idx].getCBounds())) {
        var entity = entities[idx];
        var activeEvent = new pike.events.Collision(e.x, e.y, e.oldX, e.oldY, entity, this);
        this.dispatchEvent(activeEvent);
        if(goog.DEBUG) {
          window.console.log("[pike.components.Collision] collision active #" + this.id + ", x:" + activeEvent.x + ", y:" + activeEvent.y + ", oldX:" + activeEvent.oldX + ", oldY:" + activeEvent.oldY)
        }
        var passiveEvent = new pike.events.Collision(entity.x, entity.y, entity.x, entity.y, this, this);
        entity.dispatchEvent(passiveEvent);
        if(goog.DEBUG) {
          window.console.log("[pike.components.Collision] collision passive #" + entity.id + ", x:" + passiveEvent.x + ", y:" + passiveEvent.y + ", oldX:" + passiveEvent.oldX + ", oldY:" + passiveEvent.oldY)
        }
      }
    }
  };
  this.getCBounds = function() {
    return new pike.graphics.Rectangle(this.x + this.collisionBounds_.x, this.y + this.collisionBounds_.y, this.w - this.collisionBounds_.w, this.h - this.collisionBounds_.h)
  };
  this.handler.listen(this, pike.events.ChangePosition.EVENT_TYPE, goog.bind(this.checkCollision, this))
};
pike.components.Collision.NAME = "pike.components.Collision";
pike.components.Sprite = function() {
  this.x = 100;
  this.y = 100;
  this.w = 32;
  this.h = 32;
  this.spriteSource = {};
  this.setSprite = function(image, sx, sy, sw, sh, numberOfFrames, duration) {
    this.spriteSource.image = image;
    this.spriteSource.x = sx;
    this.spriteSource.y = sy;
    this.spriteSource.w = sw;
    this.spriteSource.h = sh;
    this.spriteSource.row = 0;
    this.spriteSource.numberOfFrames = numberOfFrames || 1;
    this.spriteSource.currentFrame = 0;
    this.spriteSource.animator = new pike.animation.Animator(duration || 1E3);
    this.spriteSource.animator.start();
    this.spriteSource.lastUpdate = (new Date).getTime();
    return this
  };
  this.onSpriteUpdate = function(e) {
    var now = e.now;
    var deltaTime = now - this.spriteSource.lastUpdate;
    this.spriteSource.lastUpdate = now;
    var fraction = this.spriteSource.animator.update(deltaTime);
    this.spriteSource.currentFrame = Math.floor(fraction * this.spriteSource.numberOfFrames)
  };
  this.setSpriteRow = function(vx, vy) {
    if(Math.abs(vx) > Math.abs(vy)) {
      vx >= 0 ? this.spriteSource.row = pike.components.Sprite.RIGHT : this.spriteSource.row = pike.components.Sprite.LEFT
    }else {
      vy >= 0 ? this.spriteSource.row = pike.components.Sprite.DOWN : this.spriteSource.row = pike.components.Sprite.UP
    }
  };
  this.onSpriteRender = function(e) {
    this.layer.getOffScreen().context.drawImage(this.spriteSource.image, this.spriteSource.x + this.spriteSource.currentFrame * this.spriteSource.w, this.spriteSource.y + this.spriteSource.row * this.spriteSource.h, this.spriteSource.w, this.spriteSource.h, this.x, this.y, this.w, this.h)
  }
};
pike.components.Sprite.NAME = "pike.components.Sprite";
pike.components.Sprite.DOWN = 0;
pike.components.Sprite.LEFT = 1;
pike.components.Sprite.RIGHT = 2;
pike.components.Sprite.UP = 3;
pike.components.Image = function() {
  this.x = 0;
  this.y = 0;
  this.w = 0;
  this.h = 0;
  this.setImage = function(image) {
    this.image = image;
    this.w = image.width;
    this.h = image.height
  };
  this.onImageRender = function(e) {
    this.layer.getOffScreen().context.drawImage(this.image, 0, 0, this.w, this.h, 0, 0, this.w, this.h)
  }
};
pike.components.Image.NAME = "pike.components.Image";
pike.components.Watch = function() {
  this.watchMe = function(viewport, gameWorld) {
    var viewportBounds = viewport.getBounds();
    var gameWorldBounds = gameWorld.getBounds();
    var currentX = viewportBounds.x;
    var currentY = viewportBounds.y;
    if(this.x < this.leftInnerBoundary(viewportBounds)) {
      viewportBounds.x = Math.max(0, Math.min(Math.floor(this.x - viewportBounds.w * 0.25), gameWorldBounds.w - viewportBounds.w))
    }
    if(this.x + this.w > this.rightInnerBoundary(viewportBounds)) {
      viewportBounds.x = Math.max(0, Math.min(Math.floor(this.x + this.w - viewportBounds.w * 0.75), gameWorldBounds.w - viewportBounds.w))
    }
    if(this.y < this.topInnerBoundary(viewportBounds)) {
      viewportBounds.y = Math.max(0, Math.min(Math.floor(this.y - viewportBounds.h * 0.25), gameWorldBounds.h - viewportBounds.h))
    }
    if(this.y + this.h > this.bottomInnerBoundary(viewportBounds)) {
      viewportBounds.y = Math.max(0, Math.min(Math.floor(this.y + this.h - viewportBounds.h * 0.75), gameWorldBounds.h - viewportBounds.h))
    }
    if(currentX != viewportBounds.x || currentY != viewportBounds.y) {
      viewport.setPosition(viewportBounds.x, viewportBounds.y)
    }
  };
  this.rightInnerBoundary = function(viewport) {
    return viewport.x + viewport.w * 0.75
  };
  this.leftInnerBoundary = function(viewport) {
    return viewport.x + viewport.w * 0.25
  };
  this.topInnerBoundary = function(viewport) {
    return viewport.y + viewport.h * 0.25
  };
  this.bottomInnerBoundary = function(viewport) {
    return viewport.y + viewport.h * 0.75
  }
};
pike.components.Watch.NAME = "pike.components.Watch";
pike.components.Backpack = function() {
  this.setIconUrl = function(url) {
    this.iconUrl_ = url
  };
  this.isOnBackpack = function() {
    return this.isOnBackpack_
  };
  this.isDropAcceptable = function() {
    return this.isDropAcceptable_
  };
  this.setDropAcceptable = function(isAcceptable) {
    this.isDropAcceptable_ = isAcceptable
  };
  this.setGameEventHandler = function(eventHandler) {
    this.gameEventHandler_ = eventHandler
  };
  this.getBackpackElement = function() {
    var backpack = document.getElementById(pike.components.Backpack.ELEMENT_ID);
    if(!backpack) {
      backpack = document.createElement("div");
      backpack.setAttribute("id", pike.components.Backpack.ELEMENT_ID);
      document.getElementsByTagName("body")[0].appendChild(backpack)
    }
    return backpack
  };
  this.putInBackpack = function() {
    this.backpackItem_ = document.createElement("img");
    this.backpackItem_.src = this.iconUrl_;
    this.backpackItem_.style.position = "relative";
    this.backpackItem_.style.left = "0px";
    this.backpackItem_.style.top = "0px";
    this.backpackItem_.style.cursor = "pointer";
    this.backpackItem_.style.padding = "2px 2px";
    this.backpackItem_.setAttribute("data-isDraggable", "true");
    this.backpackItem_.setAttribute("data-widget", this.id);
    this.getBackpackElement().appendChild(this.backpackItem_);
    this.layer.setDirty(this.getBounds());
    this.isOnBackpack_ = true;
    if(goog.DEBUG) {
      window.console.log("[pike.components.Backpack] putInBag #" + this.id)
    }
    goog.events.listen(this.gameEventHandler_, pike.events.Down.EVENT_TYPE, this.dragStart_, false, this)
  };
  this.dragStart_ = function(e) {
    if(e.posY < this.layer.viewport_.h) {
      return
    }
    var position = goog.style.getRelativePosition(this.backpackItem_, e.target);
    var size = goog.style.getSize(this.backpackItem_);
    var bounds = new pike.graphics.Rectangle(position.x, position.y, size.width, size.height);
    if(!bounds.containsPoint(e.posX, e.posY)) {
      return
    }
    this.isDropAcceptable_ = true;
    goog.events.listen(this.gameEventHandler_, pike.events.Move.EVENT_TYPE, this.dragMove_, false, this);
    goog.events.listen(this.gameEventHandler_, pike.events.Up.EVENT_TYPE, this.drop_, false, this);
    if(goog.DEBUG) {
      window.console.log("[pike.components.Backpack] dragstart")
    }
  };
  this.dragMove_ = function(e) {
    this.backpackItem_.style.left = parseInt(this.backpackItem_.style.left) + e.deltaX + "px";
    this.backpackItem_.style.top = parseInt(this.backpackItem_.style.top) + e.deltaY + "px"
  };
  this.drop_ = function(e) {
    this.dragEnd_();
    var viewport = this.layer.viewport_;
    var oldX = this.x;
    var oldY = this.y;
    var x = e.posX + viewport.x;
    var y = e.posY + viewport.y;
    if(e.posX < 0 || e.posX > viewport.w || e.posY < 0 || e.posY > viewport.h) {
      if(goog.DEBUG) {
        window.console.log("[pike.components.Backpack] drop out of game area.")
      }
      return
    }
    this.x = x;
    this.y = y;
    this.dispatchEvent(new pike.events.ChangePosition(this.x, this.y, oldX, oldY, this));
    if(!this.isDropAcceptable_) {
      this.x = oldX;
      this.y = oldY;
      if(goog.DEBUG) {
        window.console.log("[pike.components.Backpack] drop is not accepted")
      }
      return
    }
    this.layer.setDirty(this.getBounds());
    if(goog.DEBUG) {
      window.console.log("[pike.components.Backpack] drop #" + this.id)
    }
    this.removeFromBackpack()
  };
  this.dragEnd_ = function() {
    this.backpackItem_.style.left = "0px";
    this.backpackItem_.style.top = "0px";
    goog.events.unlisten(this.gameEventHandler_, pike.events.Move.EVENT_TYPE, this.dragMove_, false, this);
    goog.events.unlisten(this.gameEventHandler_, pike.events.Up.EVENT_TYPE, this.drop_, false, this);
    if(goog.DEBUG) {
      window.console.log("[pike.components.Backpack] dragend")
    }
  };
  this.removeFromBackpack = function() {
    goog.events.unlisten(this.gameEventHandler_, pike.events.Down.EVENT_TYPE, this.dragStart_, false, this);
    goog.dom.removeNode(this.backpackItem_);
    this.backpackItem_ = null;
    this.isOnBackpack_ = false;
    if(goog.DEBUG) {
      window.console.log("[pike.components.Backpack] removeFromBag #" + this.id)
    }
  }
};
pike.components.Backpack.NAME = "pike.components.Backpack";
pike.components.Backpack.ELEMENT_ID = "pike-backpack";
pike.components.Dialogues = function() {
  this.pike_components_Dialogues_ = {codeBeforeDialogueText:null, codeAfterDialogueText:null, codeBeforeDialogueElement:null, codeAfterDialogueElement:null, codeBeforeChoiceElement:null, codeAfterChoiceElement:null};
  this.setDialogues = function(data) {
    if(!this.isDialoguesSourceValid_(data)) {
      throw new Error("Data is not valid.");
    }
    this.dialoguesData_ = data;
    return this
  };
  this.getDialogue = function() {
    if(!this.dialogue_) {
      this.setDialogue_(this.getRootOfDialogues().id);
      if(goog.DEBUG) {
        window.console.log("[pike.components.Dialogues] startdialogue")
      }
      this.dispatchEvent(new pike.events.StartDialogue(this.dialogue_, this))
    }
    return this.dialogue_
  };
  this.showDialogue = function(dialogue) {
    if(!dialogue) {
      throw new Error("[pike.components.Dialogues] Error: There is not a dialogue.");
    }
    this.cleanDialoguesContainer_();
    var dialogueAsHTML = dialogue.isChoice ? this.getChoiceDialogueAsHTML_(dialogue) : this.getSentenceDialogueAsHTML_(dialogue);
    this.getDialoguesDOMContainer_().appendChild(dialogueAsHTML);
    if(goog.DEBUG) {
      window.console.log("[pike.components.Dialogues] showdialogue")
    }
    this.dispatchEvent(new pike.events.ShowDialogue(dialogue, this))
  };
  this.setDialogue_ = function(id) {
    if(this.dialogue_) {
      this.executeCode_(this.dialogue_.codeAfter)
    }
    if(!id) {
      if(goog.DEBUG) {
        window.console.log("[pike.components.Dialogues] enddialogue")
      }
      this.dispatchEvent(new pike.events.EndDialogue(this));
      return
    }
    for(var idx = 0;idx < this.dialoguesData_.dialogues.length;idx++) {
      if(this.dialoguesData_.dialogues[idx].id == id) {
        this.dialogue_ = this.dialoguesData_.dialogues[idx];
        this.executeCode_(this.dialogue_.codeBefore);
        if(!this.isActive_(this.dialogue_)) {
          var nextDialogueId = this.dialogue_.outgoingLinks.length == 1 ? this.dialogue_.outgoingLinks[0] : null;
          this.setDialogue_(nextDialogueId)
        }
        return;
        break
      }
    }
    this.dialogue_ = null
  };
  this.getRootOfDialogues = function() {
    for(var idx = 0;idx < this.dialoguesData_.dialogues.length;idx++) {
      if(!this.dialoguesData_.dialogues[idx].parent) {
        return this.dialoguesData_.dialogues[idx];
        break
      }
    }
  };
  this.getActor = function(id) {
    if(!id) {
      return null
    }
    for(var idx = 0;idx < this.dialoguesData_.actors.length;idx++) {
      if(this.dialoguesData_.actors[idx].id == id) {
        return this.dialoguesData_.actors[idx]
      }
    }
    return null
  };
  this.findDialogueById = function(id) {
    if(!id) {
      return null
    }
    for(var idx = 0;idx < this.dialoguesData_.dialogues.length;idx++) {
      if(this.dialoguesData_.dialogues[idx].id == id) {
        return this.dialoguesData_.dialogues[idx];
        break
      }
    }
    return null
  };
  this.getSentenceDialogueAsHTML_ = function(dialogue) {
    var container = document.createElement("div");
    container.setAttribute("class", this.getActor(dialogue.actor).name);
    if(this.pike_components_Dialogues_.codeBeforeDialogueElement) {
      container.appendChild(this.pike_components_Dialogues_.codeBeforeDialogueElement)
    }
    container.appendChild(this.createDialogueElement_(dialogue));
    if(this.pike_components_Dialogues_.codeAfterDialogueElement) {
      container.appendChild(this.pike_components_Dialogues_.codeAfterDialogueElement)
    }
    return container
  };
  this.getChoiceDialogueAsHTML_ = function(choice) {
    var container = document.createElement("div");
    container.setAttribute("class", "choice");
    if(this.pike_components_Dialogues_.codeBeforeChoiceElement) {
      container.appendChild(this.pike_components_Dialogues_.codeBeforeChoiceElement)
    }
    for(var idx = 0;idx < choice.outgoingLinks.length;idx++) {
      var dialogue = this.findDialogueById(choice.outgoingLinks[idx]);
      if(!this.isActive_(dialogue)) {
        continue
      }
      container.appendChild(this.createChoiceElement_(dialogue))
    }
    if(this.pike_components_Dialogues_.codeAfterChoiceElement) {
      container.appendChild(this.pike_components_Dialogues_.codeAfterChoiceElement)
    }
    return container
  };
  this.createChoiceElement_ = function(dialogue) {
    var container = document.createElement(pike.components.Dialogues.DIALOGUE_ELEMENT);
    container.setAttribute("data-dialogue", dialogue.id);
    var inputHandler = pike.input.Utils.getDeviceInputHandler();
    inputHandler.setEventTarget(container);
    goog.events.listen(inputHandler, pike.events.Down.EVENT_TYPE, goog.bind(function(e) {
      var currentDialogue = this.findDialogueById(e.domEvent.target.getAttribute("data-dialogue"));
      this.setDialogue_(currentDialogue.id);
      if(this.dialogue_) {
        this.showDialogue(this.getDialogue())
      }
    }, this));
    container.appendChild(document.createTextNode(dialogue.menuText));
    return container
  };
  this.createDialogueElement_ = function(dialogue) {
    var container = document.createElement(pike.components.Dialogues.DIALOGUE_ELEMENT);
    container.setAttribute("data-dialogue", dialogue.id);
    var inputHandler = pike.input.Utils.getDeviceInputHandler();
    inputHandler.setEventTarget(container);
    goog.events.listen(inputHandler, pike.events.Down.EVENT_TYPE, goog.bind(function(e) {
      var currentDialogue = this.findDialogueById(e.domEvent.target.getAttribute("data-dialogue"));
      var nextDialogueId = currentDialogue.outgoingLinks.length == 1 ? currentDialogue.outgoingLinks[0] : null;
      this.setDialogue_(nextDialogueId);
      if(this.dialogue_) {
        this.showDialogue(this.getDialogue())
      }
    }, this));
    if(this.pike_components_Dialogues_.codeBeforeDialogueText) {
      container.appendChild(this.pike_components_Dialogues_.codeBeforeDialogueText)
    }
    container.appendChild(document.createTextNode(dialogue.dialogueText));
    if(this.pike_components_Dialogues_.codeAfterDialogueText) {
      container.appendChild(this.pike_components_Dialogues_.codeAfterDialogueText)
    }
    return container
  };
  this.setCodeBeforeDialogueText = function(domElement) {
    this.pike_components_Dialogues_.codeBeforeDialogueText = domElement
  };
  this.setCodeAfterDialogueText = function(domElement) {
    this.pike_components_Dialogues_.codeAfterDialogueText = domElement
  };
  this.setCodeBeforeDialogueElement = function(domElement) {
    this.pike_components_Dialogues_.codeBeforeDialogueElement = domElement
  };
  this.setCodeAfterDialogueElement = function(domElement) {
    this.pike_components_Dialogues_.codeAfterDialogueElement = domElement
  };
  this.setCodeBeforeChoiceElement = function(domElement) {
    this.pike_components_Dialogues_.codeBeforeChoiceElement = domElement
  };
  this.setCodeAfterChoiceElement = function(domElement) {
    this.pike_components_Dialogues_.codeAfterChoiceElement = domElement
  };
  this.cleanDialoguesContainer_ = function() {
    this.getDialoguesDOMContainer_().innerHTML = ""
  };
  this.isDialoguesSourceValid_ = function(data) {
    var isValid = true;
    if(!data || !data.dialogues || data.dialogues.length == 0 || !data.actors || data.actors.length <= 1 || !this.hasDialoguesRoot_(data)) {
      isValid = false
    }
    return isValid
  };
  this.hasDialoguesRoot_ = function(data) {
    var roots = [];
    for(var idx = 0;idx < data.dialogues.length;idx++) {
      if(!data.dialogues[idx].parent) {
        roots.push(data.dialogues[idx])
      }
    }
    return roots.length == 1 ? true : false
  };
  this.isActive_ = function(dialogue) {
    var result = true;
    if(dialogue.conditionsString) {
      result = this.executeCode_(dialogue.conditionsString)
    }
    return result
  };
  this.executeCode_ = function(code) {
    if(code) {
      if(goog.DEBUG) {
        window.console.log(" [pike.components.Dialogues] execute code: " + code)
      }
      try {
        return eval(code)
      }catch(e) {
        if(e) {
          throw new Error("Syntax error on your code: " + code);
        }
      }
    }
  };
  this.getDialoguesDOMContainer_ = function() {
    var dialogues = document.getElementById(pike.components.Dialogues.ELEMENT_ID);
    if(!dialogues) {
      dialogues = document.createElement("div");
      dialogues.setAttribute("id", pike.components.Dialogues.ELEMENT_ID);
      document.getElementsByTagName("body")[0].appendChild(dialogues)
    }
    return dialogues
  };
  this.onEndDialogue = function(e) {
    this.dialogue_ = null;
    this.cleanDialoguesContainer_()
  };
  this.handler.listen(this, pike.events.EndDialogue.EVENT_TYPE, goog.bind(this.onEndDialogue, this))
};
pike.components.Dialogues.NAME = "pike.components.Dialogues";
pike.components.Dialogues.ELEMENT_ID = "pike-dialogues";
pike.components.Dialogues.DIALOGUE_ELEMENT = "p";
pike.components.Hen = function() {
  this.pike_components_Hen = {isMoving_:true, step_:50, duration_:2E3, isEscaping_:false, init:function(parent) {
    this.parent = parent;
    this.animator = new pike.animation.Animator;
    this.animator.setRepeatBehavior(pike.animation.Animator.LOOP);
    this.animator.setRepeatCount(1);
    this.getNextPosition_()
  }, getNextPosition_:function(vx, vy, duration) {
    if(arguments.length == 0) {
      vx = Math.random() * 2 * this.step_ - this.step_;
      vy = Math.random() * 2 * this.step_ - this.step_;
      duration = this.duration_
    }
    this.parent.vx = vx;
    this.parent.vy = vy;
    this.lastUpdate_ = (new Date).getTime();
    this.animator.stop();
    this.animator.setDuration(duration);
    this.animator.start();
    this.startX_ = this.parent.x;
    this.startY_ = this.parent.y
  }};
  this.setStep = function(step) {
    this.pike_components_Hen.step_ = step
  };
  this.getStep = function() {
    return this.pike_components_Hen.step_
  };
  this.setDuration = function(duration) {
    this.pike_components_Hen.duration_ = duration
  };
  this.isEscaping = function() {
    return this.pike_components_Hen.isEscaping_
  };
  this.onHenUpdate = function(e) {
    if(typeof this.vx == "undefined" || typeof this.vy == "undefined") {
      this.pike_components_Hen.init(this);
      if(goog.DEBUG) {
        window.console.log("[pike.components.Hen] init")
      }
    }
    var now = e.now;
    var fraction = this.pike_components_Hen.animator.update(now - this.pike_components_Hen.lastUpdate_);
    this.pike_components_Hen.lastUpdate_ = now;
    if(typeof fraction == "undefined") {
      this.pike_components_Hen.isMoving_ = !this.pike_components_Hen.isMoving_;
      this.pike_components_Hen.isEscaping_ = false;
      this.pike_components_Hen.getNextPosition_();
      return
    }
    if(this.pike_components_Hen.isMoving_) {
      var oldX = this.x;
      var oldY = this.y;
      this.x = this.pike_components_Hen.startX_ + this.vx * fraction;
      this.y = this.pike_components_Hen.startY_ + this.vy * fraction;
      this.x = 0.5 + this.x << 0;
      this.y = 0.5 + this.y << 0;
      this.dispatchEvent(new pike.events.ChangePosition(this.x, this.y, oldX, oldY, this))
    }
  };
  this.setHenEscaping = function(vx, vy, duration) {
    this.pike_components_Hen.isMoving_ = true;
    this.pike_components_Hen.isEscaping_ = true;
    this.pike_components_Hen.getNextPosition_(vx, vy, duration)
  }
};
pike.components.Hen.NAME = "pike.components.Hen";
pike.components.VisualizeGraph = function() {
  this.drawConnectionLabels_ = true;
  this.drawConnections_ = true;
  this.setGraph = function(graph) {
    this.graph_ = graph
  };
  this.setPath = function(path) {
    this.path_ = path
  };
  this.onPathRender = function(e) {
    this.drawGraph_(this.layer.getOffScreen().context, this.path_)
  };
  this.drawGraph_ = function(ctx, path) {
    var self = this;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";
    if(this.drawConnections_) {
      this.graph_.nodes_.forEach(function(node) {
        node.getConnections().forEach(function(connection) {
          self.drawConnection_(ctx, node, connection.node, connection.weight, "black")
        })
      })
    }
    if(path) {
      this.drawPath_(ctx, path)
    }
    if(this.drawConnectionLabels_) {
      this.graph_.nodes_.forEach(function(node) {
        node.getConnections().forEach(function(connection) {
          self.drawConnectionLabel_(ctx, Math.floor(connection.weight) + "", node, connection.node)
        })
      })
    }
    this.graph_.nodes_.forEach(function(node) {
      self.drawNode_(ctx, node)
    })
  };
  this.drawNode_ = function(ctx, node) {
    ctx.fillStyle = "#6ba4d9";
    ctx.strokeStyle = "black";
    ctx.font = "18px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.beginPath();
    ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    var text = "" + node.id;
    ctx.fillStyle = "black";
    ctx.fillText(text, node.x, node.y)
  };
  this.drawPath_ = function(ctx, path) {
    ctx.save();
    ctx.lineWidth = 4;
    for(var i = 1;i < path.length;i++) {
      this.drawConnection_(ctx, path[i], path[i - 1], "", "green")
    }
    ctx.restore()
  };
  this.drawConnection_ = function(ctx, node1, node2, weight, color) {
    ctx.strokeStyle = color ? color : "black";
    ctx.beginPath();
    ctx.moveTo(node1.x, node1.y);
    ctx.lineTo(node2.x, node2.y);
    ctx.stroke();
    ctx.font = "15px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center"
  };
  this.drawConnectionLabel_ = function(ctx, text, node1, node2) {
    var padding = 5;
    var middleX = Math.floor((node1.x + node2.x) / 2);
    var middleY = Math.floor((node1.y + node2.y) / 2);
    var textWidth = ctx.measureText(text).width;
    var width = textWidth + padding * 2;
    var height = 20;
    ctx.fillStyle = "#DDD";
    ctx.fillRect(middleX - width / 2, middleY - height / 2, width, height);
    ctx.fillStyle = "black";
    ctx.fillText(text, middleX, middleY)
  }
};
pike.components.VisualizeGraph.NAME = "pike.components.VisualizeGraph";
pike.components.VisualizeRectangle = function() {
  this.pike_components_VisualizeRectangle = {};
  this.setRectangle = function(rect) {
    this.x = rect.x;
    this.y = rect.y;
    this.w = rect.w;
    this.h = rect.h;
    this.pike_components_VisualizeRectangle.rectangle = rect
  };
  this.getRectangle = function() {
    return this.pike_components_VisualizeRectangle.rectangle
  };
  this.setColor = function(color) {
    this.pike_components_VisualizeRectangle.color = color
  };
  this.onRectangleRender = function(e) {
    this.layer.getOffScreen().context.fillStyle = this.pike_components_VisualizeRectangle.color;
    this.layer.getOffScreen().context.fillRect(this.x, this.y, this.w, this.h)
  }
};
pike.components.VisualizeRectangle.NAME = "pike.components.VisualizeRectangle";
// Input 39
goog.provide("goog.events.EventHandler");
goog.require("goog.Disposable");
goog.require("goog.array");
goog.require("goog.events");
goog.require("goog.events.EventWrapper");
goog.events.EventHandler = function(opt_handler) {
  goog.Disposable.call(this);
  this.handler_ = opt_handler;
  this.keys_ = []
};
goog.inherits(goog.events.EventHandler, goog.Disposable);
goog.events.EventHandler.typeArray_ = [];
goog.events.EventHandler.prototype.listen = function(src, type, opt_fn, opt_capture, opt_handler) {
  if(!goog.isArray(type)) {
    goog.events.EventHandler.typeArray_[0] = (type);
    type = goog.events.EventHandler.typeArray_
  }
  for(var i = 0;i < type.length;i++) {
    var key = (goog.events.listen(src, type[i], opt_fn || this, opt_capture || false, opt_handler || this.handler_ || this));
    this.keys_.push(key)
  }
  return this
};
goog.events.EventHandler.prototype.listenOnce = function(src, type, opt_fn, opt_capture, opt_handler) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      this.listenOnce(src, type[i], opt_fn, opt_capture, opt_handler)
    }
  }else {
    var key = (goog.events.listenOnce(src, type, opt_fn || this, opt_capture, opt_handler || this.handler_ || this));
    this.keys_.push(key)
  }
  return this
};
goog.events.EventHandler.prototype.listenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.listen(src, listener, opt_capt, opt_handler || this.handler_ || this, this);
  return this
};
goog.events.EventHandler.prototype.getListenerCount = function() {
  return this.keys_.length
};
goog.events.EventHandler.prototype.unlisten = function(src, type, opt_fn, opt_capture, opt_handler) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      this.unlisten(src, type[i], opt_fn, opt_capture, opt_handler)
    }
  }else {
    var listener = goog.events.getListener(src, type, opt_fn || this, opt_capture, opt_handler || this.handler_ || this);
    if(listener) {
      var key = listener.key;
      goog.events.unlistenByKey(key);
      goog.array.remove(this.keys_, key)
    }
  }
  return this
};
goog.events.EventHandler.prototype.unlistenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.unlisten(src, listener, opt_capt, opt_handler || this.handler_ || this, this);
  return this
};
goog.events.EventHandler.prototype.removeAll = function() {
  goog.array.forEach(this.keys_, goog.events.unlistenByKey);
  this.keys_.length = 0
};
goog.events.EventHandler.prototype.disposeInternal = function() {
  goog.events.EventHandler.superClass_.disposeInternal.call(this);
  this.removeAll()
};
goog.events.EventHandler.prototype.handleEvent = function(e) {
  throw Error("EventHandler.handleEvent not implemented");
};
// Input 40
/*
 Dual licensed under the MIT or GPL licenses.
*/
goog.provide("pike.layers.Layer");
goog.provide("pike.layers.ClusterLayer");
goog.provide("pike.layers.ObstacleLayer");
goog.provide("pike.layers.DirtyManager");
goog.require("goog.events.EventHandler");
goog.require("goog.events.EventTarget");
goog.require("pike.graphics.Rectangle");
goog.require("pike.events.NewEntity");
goog.require("pike.events.RemoveEntity");
goog.require("goog.events");
pike.layers.Layer = function(name) {
  goog.events.EventTarget.call(this);
  this.name = name;
  this.handler = new goog.events.EventHandler(this);
  this.viewport_ = new pike.graphics.Rectangle(0, 0, 0, 0);
  this.gameWorld_ = new pike.graphics.Rectangle(0, 0, 0, 0);
  this.entities_ = [];
  this.screen_ = {};
  this.offScreen_ = {};
  this.screen_.canvas = document.createElement("canvas");
  this.screen_.canvas.style.position = "absolute";
  this.screen_.canvas.style.top = "0";
  this.screen_.canvas.style.left = "0";
  this.screen_.context = this.screen_.canvas.getContext("2d");
  this.screen_.isDirty = false;
  this.offScreen_.canvas = document.createElement("canvas");
  this.offScreen_.context = this.offScreen_.canvas.getContext("2d");
  this.offScreen_.isDirty = false
};
goog.inherits(pike.layers.Layer, goog.events.EventTarget);
pike.layers.Layer.prototype.onRender = function() {
  if(this.hasDirtyManager()) {
    this.renderDirty_()
  }else {
    if(this.offScreen_.isDirty) {
      this.renderOffScreen_()
    }
  }
  if(this.screen_.isDirty) {
    this.renderScreen_()
  }
};
pike.layers.Layer.prototype.renderDirty_ = function() {
  if(this.dirtyManager.isClean()) {
    return
  }
  this.offScreen_.context.clearRect(this.dirtyManager.getDirtyRectangle().x, this.dirtyManager.getDirtyRectangle().y, this.dirtyManager.getDirtyRectangle().w, this.dirtyManager.getDirtyRectangle().h);
  this.dispatchEvent(new pike.events.Render((new Date).getTime(), this));
  if(!this.screen_.isDirty) {
    this.screen_.context.clearRect(this.dirtyManager.getDirtyRectangle().x - this.viewport_.x, this.dirtyManager.getDirtyRectangle().y - this.viewport_.y, this.dirtyManager.getDirtyRectangle().w, this.dirtyManager.getDirtyRectangle().h);
    this.screen_.context.drawImage(this.offScreen_.canvas, this.dirtyManager.getDirtyRectangle().x, this.dirtyManager.getDirtyRectangle().y, this.dirtyManager.getDirtyRectangle().w, this.dirtyManager.getDirtyRectangle().h, this.dirtyManager.getDirtyRectangle().x - this.viewport_.x, this.dirtyManager.getDirtyRectangle().y - this.viewport_.y, this.dirtyManager.getDirtyRectangle().w, this.dirtyManager.getDirtyRectangle().h)
  }
  this.dirtyManager.clear()
};
pike.layers.Layer.prototype.renderOffScreen_ = function() {
  this.offScreen_.context.clearRect(0, 0, this.gameWorld_.w, this.gameWorld_.h);
  this.dispatchEvent(new pike.events.Render((new Date).getTime(), this));
  this.offScreen_.isDirty = false;
  this.screen_.isDirty = true;
  if(goog.DEBUG) {
    window.console.log("[pike.core.Layer] " + this.name + " redraw offScreen")
  }
};
pike.layers.Layer.prototype.renderScreen_ = function() {
  this.screen_.context.clearRect(0, 0, this.viewport_.w, this.viewport_.h);
  this.screen_.context.drawImage(this.offScreen_.canvas, this.viewport_.x, this.viewport_.y, this.viewport_.w, this.viewport_.h, 0, 0, this.viewport_.w, this.viewport_.h);
  this.screen_.isDirty = false;
  if(goog.DEBUG) {
    window.console.log("[pike.core.Layer] " + this.name + " redraw screen")
  }
};
pike.layers.Layer.prototype.setViewportSize = function(width, height) {
  this.viewport_.w = width;
  this.viewport_.h = height;
  this.screen_.canvas.width = this.viewport_.w;
  this.screen_.canvas.height = this.viewport_.h;
  this.screen_.isDirty = true;
  if(this.hasDirtyManager()) {
    this.dirtyManager.setSize(this.viewport_.w, this.viewport_.h)
  }
};
pike.layers.Layer.prototype.setGameWorldSize = function(width, height) {
  this.gameWorld_.w = width;
  this.gameWorld_.h = height;
  this.offScreen_.canvas.width = this.gameWorld_.w;
  this.offScreen_.canvas.height = this.gameWorld_.h;
  this.offScreen_.isDirty = true
};
pike.layers.Layer.prototype.setViewportPosition = function(x, y) {
  this.viewport_.x = x;
  this.viewport_.y = y;
  this.getScreen().isDirty = true;
  if(this.hasDirtyManager()) {
    this.dirtyManager.setPosition(this.viewport_.x, this.viewport_.y)
  }
};
pike.layers.Layer.prototype.setDirtyManager = function(dirtyManager) {
  this.dirtyManager = dirtyManager
};
pike.layers.Layer.prototype.hasDirtyManager = function() {
  return this.dirtyManager
};
pike.layers.Layer.prototype.setDirty = function(rect) {
  if(this.hasDirtyManager()) {
    this.dirtyManager.markDirty(rect)
  }else {
    this.offScreen_.isDirty = true
  }
};
pike.layers.Layer.prototype.getScreen = function() {
  return this.screen_
};
pike.layers.Layer.prototype.getOffScreen = function() {
  return this.offScreen_
};
pike.layers.Layer.prototype.addEntity = function(entity) {
  this.entities_.push(entity);
  entity.layer = this;
  this.dispatchEvent(new pike.events.NewEntity(entity, this));
  if(goog.DEBUG) {
    window.console.log("[pike.core.Layer] Layer: " + this.name + " has newentity #" + entity.id)
  }
};
pike.layers.Layer.prototype.removeEntity = function(entity) {
  goog.array.remove(this.entities_, entity);
  delete entity.layer;
  this.dispatchEvent(new pike.events.RemoveEntity(entity, this));
  if(goog.DEBUG) {
    window.console.log("[pike.core.Layer] removeentity")
  }
};
pike.layers.Layer.prototype.getEntity = function(id) {
  for(var idx = 0;idx < this.entities_.length;idx++) {
    if(this.entities_[idx].id == id) {
      return this.entities_[idx]
    }
  }
};
pike.layers.Layer.prototype.getAllEntities = function() {
  return this.entities_
};
pike.layers.Layer.prototype.dispatchEvent = function(e) {
  for(var idx = 0;idx < this.entities_.length;idx++) {
    this.entities_[idx].dispatchEvent(e)
  }
  goog.events.EventTarget.prototype.dispatchEvent.call(this, e)
};
pike.layers.ClusterLayer = function(name, clusterSize) {
  pike.layers.Layer.call(this, name);
  this.clusters_ = new pike.graphics.Cluster(clusterSize, 0, 0);
  this.visibleClusterBounds_ = {};
  this.cache_ = [];
  this.cacheDirty_ = true;
  this.cacheUnsorted_ = false
};
goog.inherits(pike.layers.ClusterLayer, pike.layers.Layer);
pike.layers.ClusterLayer.prototype.getCluster = function() {
  return this.clusters_
};
pike.layers.ClusterLayer.prototype.dispatchEvent = function(e) {
  if(this.cacheDirty_) {
    this.resetCache_()
  }else {
    if(this.cacheUnsorted_) {
      this.sortCache_()
    }
  }
  for(var i = 0;i < this.cache_.length;i++) {
    var entity = this.cache_[i];
    if(entity.getBounds().intersects(this.viewport_)) {
      entity.dispatchEvent(e)
    }
  }
  goog.events.EventTarget.prototype.dispatchEvent.call(this, e)
};
pike.layers.ClusterLayer.prototype.addEntity = function(entity) {
  pike.layers.Layer.prototype.addEntity.call(this, entity);
  this.handler.listen(entity, pike.events.ChangePosition.EVENT_TYPE, this.onEntityMove, false, this);
  if(this.clusters_.getClusters().length == 0) {
    return
  }
  var clusters = this.clusters_.addToClusters(entity);
  if(clusters.intersects(this.visibleClusterBounds_)) {
    this.cache_.push(entity);
    this.cacheUnsorted_ = true
  }
};
pike.layers.ClusterLayer.prototype.removeEntity = function(entity) {
  this.clusters_.removeFromClusters(entity);
  this.handler.unlisten(entity, pike.events.ChangePosition.EVENT_TYPE, this.onEntityMove, false, this);
  pike.layers.Layer.prototype.removeEntity.call(this, entity)
};
pike.layers.ClusterLayer.prototype.resetCache_ = function() {
  var cache = this.cache_ = [];
  for(var i = this.visibleClusterBounds_.y;i < this.visibleClusterBounds_.y + this.visibleClusterBounds_.h;i++) {
    for(var j = this.visibleClusterBounds_.x;j < this.visibleClusterBounds_.x + this.visibleClusterBounds_.w;j++) {
      var cluster = this.clusters_.getClusters()[i][j];
      for(var k = 0;k < cluster.length;k++) {
        if(cache.indexOf(cluster[k]) == -1) {
          cache.push(cluster[k])
        }
      }
    }
  }
  if(goog.DEBUG) {
    window.console.log("[pike.layers.ClusterLayer] resetcache")
  }
  this.sortCache_();
  this.cacheDirty_ = false;
  this.cacheUnsorted_ = false
};
pike.layers.ClusterLayer.prototype.sortCache_ = function() {
  this.cache_.sort(function(a, b) {
    var aBounds = a.getBounds();
    var bBounds = b.getBounds();
    return aBounds.y + aBounds.h - (bBounds.y + bBounds.h)
  });
  this.cacheUnsorted_ = false;
  if(goog.DEBUG) {
    window.console.log("[pike.layers.ClusterLayer] sortcache")
  }
};
pike.layers.ClusterLayer.prototype.resetClusters_ = function() {
  this.clusters_.build();
  if(goog.DEBUG) {
    window.console.log("[pike.layers.ClusterLayer] resetcluster")
  }
  for(var i = 0;i < this.entities_.length;i++) {
    var entity = this.entities_[i];
    this.clusters_.addToClusters(entity)
  }
};
pike.layers.ClusterLayer.prototype.updateVisibleClusters_ = function() {
  var newRect = this.viewport_.getOverlappingGridCells(this.clusters_.getClusterSize(), this.clusters_.getClusterSize(), this.clusters_.getClusters()[0].length, this.clusters_.getClusters().length);
  if(!newRect.equals(this.visibleClusterBounds_)) {
    this.visibleClusterBounds_ = newRect;
    this.cacheDirty_ = true
  }
};
pike.layers.ClusterLayer.prototype.setViewportSize = function(width, height) {
  pike.layers.Layer.prototype.setViewportSize.call(this, width, height);
  this.setGameWorldSize.call(this, Math.max(this.gameWorld_.w, width), Math.max(this.gameWorld_.h, height));
  this.updateVisibleClusters_()
};
pike.layers.ClusterLayer.prototype.setViewportPosition = function(x, y) {
  pike.layers.Layer.prototype.setViewportPosition.call(this, x, y);
  this.updateVisibleClusters_()
};
pike.layers.ClusterLayer.prototype.setGameWorldSize = function(width, height) {
  pike.layers.Layer.prototype.setGameWorldSize.call(this, width, height);
  this.clusters_.setSize(width, height);
  this.resetClusters_()
};
pike.layers.ClusterLayer.prototype.onEntityMove = function(e) {
  var entity = e.target;
  var newClusters = entity.getBounds().getOverlappingGridCells(this.clusters_.getClusterSize(), this.clusters_.getClusterSize(), this.clusters_.getClusters()[0].length, this.clusters_.getClusters().length);
  var oldClusters = this.clusters_.getIdToClusterBounds(entity.id);
  if(!oldClusters.equals(newClusters)) {
    this.moveObjectBetweenClusters_(entity, oldClusters, newClusters)
  }
  if(newClusters.intersects(this.visibleClusterBounds_) && e.y != e.oldY) {
    this.cacheUnsorted_ = true
  }
};
pike.layers.ClusterLayer.prototype.moveObjectBetweenClusters_ = function(entity, oldClusters, newClusters) {
  this.clusters_.removeFromClusters(entity, oldClusters);
  this.clusters_.addToClusters(entity, newClusters);
  this.clusters_.setIdToClusterBounds(entity.id, newClusters);
  if(newClusters.intersects(this.visibleClusterBounds_)) {
    if(!goog.array.contains(this.cache_, entity)) {
      this.cache_.push(entity)
    }
  }else {
    goog.array.remove(this.cache_, entity)
  }
};
pike.layers.ObstacleLayer = function(name) {
  pike.layers.Layer.call(this, name)
};
goog.inherits(pike.layers.ObstacleLayer, pike.layers.Layer);
pike.layers.ObstacleLayer.prototype.setViewportSize = function(width, height) {
  pike.layers.Layer.prototype.setViewportSize.call(this, width, height);
  this.screen_.isDirty = false
};
pike.layers.ObstacleLayer.prototype.setViewportPosition = function(x, y) {
  pike.layers.Layer.prototype.setViewportPosition.call(this, x, y);
  this.screen_.isDirty = false
};
pike.layers.ObstacleLayer.prototype.renderOffScreen_ = function() {
  pike.layers.Layer.prototype.renderOffScreen_.call(this);
  this.screen_.isDirty = false;
  if(goog.DEBUG) {
    window.console.log("[pike.core.ObstacleLayer] " + this.name + " redraw offScreen")
  }
};
pike.layers.ObstacleLayer.prototype.onEntityChangePosition = function(e) {
  var entity = e.target;
  var collisionBounds = entity.getCBounds();
  if(this.offScreen_.context.getImageData(collisionBounds.x, collisionBounds.y, 1, 1).data[3] != 0 || this.offScreen_.context.getImageData(collisionBounds.x + collisionBounds.w, collisionBounds.y, 1, 1).data[3] != 0 || this.offScreen_.context.getImageData(collisionBounds.x + collisionBounds.w, collisionBounds.y + collisionBounds.h, 1, 1).data[3] != 0 || this.offScreen_.context.getImageData(collisionBounds.x, collisionBounds.y + collisionBounds.h, 1, 1).data[3] != 0) {
    if(goog.DEBUG) {
      window.console.log("[pike.core.ObstacleLayer] obstacle collision entity #" + e.target.id)
    }
    entity.dispatchEvent(new pike.events.Collision(e.x, e.y, e.oldX, e.oldY, new pike.core.Entity, entity))
  }
};
pike.layers.DirtyManager = function(allDirtyThreshold) {
  this.viewport_ = new pike.graphics.Rectangle(0, 0, 0, 0);
  this.handler = new goog.events.EventHandler(this);
  this.dirtyRect_ = null;
  this.allDirtyThreshold_ = allDirtyThreshold == undefined ? 0.5 : allDirtyThreshold;
  this.allDirty_ = true;
  this.markAllDirty()
};
pike.layers.DirtyManager.prototype.getDirtyRectangle = function() {
  return this.dirtyRect_
};
pike.layers.DirtyManager.prototype.markAllDirty = function() {
  this.allDirty_ = true;
  this.dirtyRect_ = this.viewport_.copy()
};
pike.layers.DirtyManager.prototype.markDirty = function(rect) {
  if(!(rect.w || rect.h) || this.allDirty_) {
    return
  }
  if(!rect.intersects(this.viewport_)) {
    return
  }
  if(this.dirtyRect_) {
    this.dirtyRect_ = this.dirtyRect_.convexHull(rect)
  }else {
    this.dirtyRect_ = rect
  }
  if(this.dirtyRect_.w * this.dirtyRect_.h > this.allDirtyThreshold_ * this.viewport_.w * this.viewport_.h) {
    this.markAllDirty()
  }
};
pike.layers.DirtyManager.prototype.isClean = function() {
  return!this.dirtyRect_
};
pike.layers.DirtyManager.prototype.clear = function() {
  this.dirtyRect_ = null;
  this.allDirty_ = false
};
pike.layers.DirtyManager.prototype.setSize = function(width, height) {
  this.viewport_.w = width;
  this.viewport_.h = height;
  this.markAllDirty()
};
pike.layers.DirtyManager.prototype.setPosition = function(x, y) {
  this.viewport_.x = x;
  this.viewport_.y = y
};
// Input 41
/*
 Dual licensed under the MIT or GPL licenses.
*/
goog.provide("pike.assets.ImageManager");
pike.assets.ImageManager = function() {
  this.images_ = {}
};
pike.assets.ImageManager.prototype.load = function(images, onDone, onProgress) {
  var queue = [];
  for(var name in images) {
    queue.push({key:name, path:images[name]})
  }
  if(queue.length == 0) {
    onProgress && onProgress(0, 0, null, null, true);
    onDone && onDone();
    return
  }
  var itemCounter = {loaded:0, total:queue.length};
  for(var i = 0;i < queue.length;i++) {
    this.loadImage_(queue[i], itemCounter, onDone, onProgress)
  }
};
pike.assets.ImageManager.prototype.get = function(key) {
  return this.images_[key]
};
pike.assets.ImageManager.prototype.loadImage_ = function(queueItem, itemCounter, onDone, onProgress) {
  var self = this;
  var img = new Image;
  img.onload = function() {
    self.images_[queueItem.key] = img;
    self.onItemLoaded_(queueItem, itemCounter, onDone, onProgress, true)
  };
  img.onerror = function() {
    self.onItemLoaded_(queueItem, itemCounter, onDone, onProgress, false)
  };
  img.src = queueItem.path
};
pike.assets.ImageManager.prototype.onItemLoaded_ = function(queueItem, itemCounter, onDone, onProgress, success) {
  itemCounter.loaded++;
  onProgress && onProgress(itemCounter.loaded, itemCounter.total, queueItem.key, queueItem.path, success);
  if(goog.DEBUG) {
    window.console.log("[pike.assets.ImageManager] item  " + queueItem.path + " loaded")
  }
  if(itemCounter.loaded == itemCounter.total) {
    if(goog.DEBUG) {
      window.console.log("[pike.assets.ImageManager] done")
    }
    onDone && onDone()
  }
};

