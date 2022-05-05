"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var electron = require("electron");
var require$$8 = require("os");
var require$$1 = require("path");
var Store = require("electron-store");
var require$$0 = require("buffer");
var require$$2 = require("child_process");
var require$$3 = require("process");
var require$$6 = require("fs");
var require$$7 = require("url");
var require$$10 = require("assert");
var require$$11 = require("events");
var require$$13 = require("stream");
var require$$14 = require("util");
function _interopDefaultLegacy(e) {
  return e && typeof e === "object" && "default" in e ? e : { "default": e };
}
var require$$8__default = /* @__PURE__ */ _interopDefaultLegacy(require$$8);
var require$$1__default = /* @__PURE__ */ _interopDefaultLegacy(require$$1);
var Store__default = /* @__PURE__ */ _interopDefaultLegacy(Store);
var require$$0__default = /* @__PURE__ */ _interopDefaultLegacy(require$$0);
var require$$2__default = /* @__PURE__ */ _interopDefaultLegacy(require$$2);
var require$$3__default = /* @__PURE__ */ _interopDefaultLegacy(require$$3);
var require$$6__default = /* @__PURE__ */ _interopDefaultLegacy(require$$6);
var require$$7__default = /* @__PURE__ */ _interopDefaultLegacy(require$$7);
var require$$10__default = /* @__PURE__ */ _interopDefaultLegacy(require$$10);
var require$$11__default = /* @__PURE__ */ _interopDefaultLegacy(require$$11);
var require$$13__default = /* @__PURE__ */ _interopDefaultLegacy(require$$13);
var require$$14__default = /* @__PURE__ */ _interopDefaultLegacy(require$$14);
const store = new Store__default["default"]();
electron.ipcMain.handle("electron-store", async (_event, methodSign, ...args) => {
  if (typeof store[methodSign] === "function") {
    return store[methodSign](...args);
  }
  return store[methodSign];
});
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var execa = { exports: {} };
(function(module) {
  (() => {
    var __webpack_modules__ = [
      ,
      (module2) => {
        module2.exports = require$$0__default["default"];
      },
      (module2) => {
        module2.exports = require$$1__default["default"];
      },
      (module2) => {
        module2.exports = require$$2__default["default"];
      },
      (module2) => {
        module2.exports = require$$3__default["default"];
      },
      (module2, __unused_webpack_exports, __webpack_require__2) => {
        const cp = __webpack_require__2(6);
        const parse = __webpack_require__2(7);
        const enoent = __webpack_require__2(20);
        function spawn(command, args, options) {
          const parsed = parse(command, args, options);
          const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);
          enoent.hookChildProcess(spawned, parsed);
          return spawned;
        }
        function spawnSync(command, args, options) {
          const parsed = parse(command, args, options);
          const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);
          result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);
          return result;
        }
        module2.exports = spawn;
        module2.exports.spawn = spawn;
        module2.exports.sync = spawnSync;
        module2.exports._parse = parse;
        module2.exports._enoent = enoent;
      },
      (module2) => {
        module2.exports = require$$2__default["default"];
      },
      (module2, __unused_webpack_exports, __webpack_require__2) => {
        const path = __webpack_require__2(8);
        const resolveCommand = __webpack_require__2(9);
        const escape = __webpack_require__2(16);
        const readShebang = __webpack_require__2(17);
        const isWin = process.platform === "win32";
        const isExecutableRegExp = /\.(?:com|exe)$/i;
        const isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
        function detectShebang(parsed) {
          parsed.file = resolveCommand(parsed);
          const shebang = parsed.file && readShebang(parsed.file);
          if (shebang) {
            parsed.args.unshift(parsed.file);
            parsed.command = shebang;
            return resolveCommand(parsed);
          }
          return parsed.file;
        }
        function parseNonShell(parsed) {
          if (!isWin) {
            return parsed;
          }
          const commandFile = detectShebang(parsed);
          const needsShell = !isExecutableRegExp.test(commandFile);
          if (parsed.options.forceShell || needsShell) {
            const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);
            parsed.command = path.normalize(parsed.command);
            parsed.command = escape.command(parsed.command);
            parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));
            const shellCommand = [parsed.command].concat(parsed.args).join(" ");
            parsed.args = ["/d", "/s", "/c", `"${shellCommand}"`];
            parsed.command = {}.comspec || "cmd.exe";
            parsed.options.windowsVerbatimArguments = true;
          }
          return parsed;
        }
        function parse(command, args, options) {
          if (args && !Array.isArray(args)) {
            options = args;
            args = null;
          }
          args = args ? args.slice(0) : [];
          options = Object.assign({}, options);
          const parsed = {
            command,
            args,
            options,
            file: void 0,
            original: {
              command,
              args
            }
          };
          return options.shell ? parsed : parseNonShell(parsed);
        }
        module2.exports = parse;
      },
      (module2) => {
        module2.exports = require$$1__default["default"];
      },
      (module2, __unused_webpack_exports, __webpack_require__2) => {
        const path = __webpack_require__2(8);
        const which = __webpack_require__2(10);
        const getPathKey = __webpack_require__2(15);
        function resolveCommandAttempt(parsed, withoutPathExt) {
          const env = parsed.options.env || process.env;
          const cwd = process.cwd();
          const hasCustomCwd = parsed.options.cwd != null;
          const shouldSwitchCwd = hasCustomCwd && process.chdir !== void 0 && !process.chdir.disabled;
          if (shouldSwitchCwd) {
            try {
              process.chdir(parsed.options.cwd);
            } catch (err) {
            }
          }
          let resolved;
          try {
            resolved = which.sync(parsed.command, {
              path: env[getPathKey({ env })],
              pathExt: withoutPathExt ? path.delimiter : void 0
            });
          } catch (e) {
          } finally {
            if (shouldSwitchCwd) {
              process.chdir(cwd);
            }
          }
          if (resolved) {
            resolved = path.resolve(hasCustomCwd ? parsed.options.cwd : "", resolved);
          }
          return resolved;
        }
        function resolveCommand(parsed) {
          return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
        }
        module2.exports = resolveCommand;
      },
      (module2, __unused_webpack_exports, __webpack_require__2) => {
        const isWindows = process.platform === "win32" || {}.OSTYPE === "cygwin" || {}.OSTYPE === "msys";
        const path = __webpack_require__2(8);
        const COLON = isWindows ? ";" : ":";
        const isexe = __webpack_require__2(11);
        const getNotFoundError = (cmd) => Object.assign(new Error(`not found: ${cmd}`), { code: "ENOENT" });
        const getPathInfo = (cmd, opt) => {
          const colon = opt.colon || COLON;
          const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? [""] : [
            ...isWindows ? [process.cwd()] : [],
            ...(opt.path || {}.PATH || "").split(colon)
          ];
          const pathExtExe = isWindows ? opt.pathExt || {}.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "";
          const pathExt = isWindows ? pathExtExe.split(colon) : [""];
          if (isWindows) {
            if (cmd.indexOf(".") !== -1 && pathExt[0] !== "")
              pathExt.unshift("");
          }
          return {
            pathEnv,
            pathExt,
            pathExtExe
          };
        };
        const which = (cmd, opt, cb) => {
          if (typeof opt === "function") {
            cb = opt;
            opt = {};
          }
          if (!opt)
            opt = {};
          const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
          const found = [];
          const step = (i) => new Promise((resolve, reject) => {
            if (i === pathEnv.length)
              return opt.all && found.length ? resolve(found) : reject(getNotFoundError(cmd));
            const ppRaw = pathEnv[i];
            const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
            const pCmd = path.join(pathPart, cmd);
            const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
            resolve(subStep(p, i, 0));
          });
          const subStep = (p, i, ii) => new Promise((resolve, reject) => {
            if (ii === pathExt.length)
              return resolve(step(i + 1));
            const ext = pathExt[ii];
            isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
              if (!er && is) {
                if (opt.all)
                  found.push(p + ext);
                else
                  return resolve(p + ext);
              }
              return resolve(subStep(p, i, ii + 1));
            });
          });
          return cb ? step(0).then((res) => cb(null, res), cb) : step(0);
        };
        const whichSync = (cmd, opt) => {
          opt = opt || {};
          const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
          const found = [];
          for (let i = 0; i < pathEnv.length; i++) {
            const ppRaw = pathEnv[i];
            const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
            const pCmd = path.join(pathPart, cmd);
            const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
            for (let j = 0; j < pathExt.length; j++) {
              const cur = p + pathExt[j];
              try {
                const is = isexe.sync(cur, { pathExt: pathExtExe });
                if (is) {
                  if (opt.all)
                    found.push(cur);
                  else
                    return cur;
                }
              } catch (ex) {
              }
            }
          }
          if (opt.all && found.length)
            return found;
          if (opt.nothrow)
            return null;
          throw getNotFoundError(cmd);
        };
        module2.exports = which;
        which.sync = whichSync;
      },
      (module2, __unused_webpack_exports, __webpack_require__2) => {
        __webpack_require__2(12);
        var core;
        if (process.platform === "win32" || commonjsGlobal.TESTING_WINDOWS) {
          core = __webpack_require__2(13);
        } else {
          core = __webpack_require__2(14);
        }
        module2.exports = isexe;
        isexe.sync = sync;
        function isexe(path, options, cb) {
          if (typeof options === "function") {
            cb = options;
            options = {};
          }
          if (!cb) {
            if (typeof Promise !== "function") {
              throw new TypeError("callback not provided");
            }
            return new Promise(function(resolve, reject) {
              isexe(path, options || {}, function(er, is) {
                if (er) {
                  reject(er);
                } else {
                  resolve(is);
                }
              });
            });
          }
          core(path, options || {}, function(er, is) {
            if (er) {
              if (er.code === "EACCES" || options && options.ignoreErrors) {
                er = null;
                is = false;
              }
            }
            cb(er, is);
          });
        }
        function sync(path, options) {
          try {
            return core.sync(path, options || {});
          } catch (er) {
            if (options && options.ignoreErrors || er.code === "EACCES") {
              return false;
            } else {
              throw er;
            }
          }
        }
      },
      (module2) => {
        module2.exports = require$$6__default["default"];
      },
      (module2, __unused_webpack_exports, __webpack_require__2) => {
        module2.exports = isexe;
        isexe.sync = sync;
        var fs = __webpack_require__2(12);
        function checkPathExt(path, options) {
          var pathext = options.pathExt !== void 0 ? options.pathExt : {}.PATHEXT;
          if (!pathext) {
            return true;
          }
          pathext = pathext.split(";");
          if (pathext.indexOf("") !== -1) {
            return true;
          }
          for (var i = 0; i < pathext.length; i++) {
            var p = pathext[i].toLowerCase();
            if (p && path.substr(-p.length).toLowerCase() === p) {
              return true;
            }
          }
          return false;
        }
        function checkStat(stat, path, options) {
          if (!stat.isSymbolicLink() && !stat.isFile()) {
            return false;
          }
          return checkPathExt(path, options);
        }
        function isexe(path, options, cb) {
          fs.stat(path, function(er, stat) {
            cb(er, er ? false : checkStat(stat, path, options));
          });
        }
        function sync(path, options) {
          return checkStat(fs.statSync(path), path, options);
        }
      },
      (module2, __unused_webpack_exports, __webpack_require__2) => {
        module2.exports = isexe;
        isexe.sync = sync;
        var fs = __webpack_require__2(12);
        function isexe(path, options, cb) {
          fs.stat(path, function(er, stat) {
            cb(er, er ? false : checkStat(stat, options));
          });
        }
        function sync(path, options) {
          return checkStat(fs.statSync(path), options);
        }
        function checkStat(stat, options) {
          return stat.isFile() && checkMode(stat, options);
        }
        function checkMode(stat, options) {
          var mod = stat.mode;
          var uid = stat.uid;
          var gid = stat.gid;
          var myUid = options.uid !== void 0 ? options.uid : process.getuid && process.getuid();
          var myGid = options.gid !== void 0 ? options.gid : process.getgid && process.getgid();
          var u = parseInt("100", 8);
          var g = parseInt("010", 8);
          var o = parseInt("001", 8);
          var ug = u | g;
          var ret = mod & o || mod & g && gid === myGid || mod & u && uid === myUid || mod & ug && myUid === 0;
          return ret;
        }
      },
      (module2) => {
        const pathKey = (options = {}) => {
          const environment = options.env || process.env;
          const platform = options.platform || process.platform;
          if (platform !== "win32") {
            return "PATH";
          }
          return Object.keys(environment).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
        };
        module2.exports = pathKey;
        module2.exports["default"] = pathKey;
      },
      (module2) => {
        const metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;
        function escapeCommand(arg) {
          arg = arg.replace(metaCharsRegExp, "^$1");
          return arg;
        }
        function escapeArgument(arg, doubleEscapeMetaChars) {
          arg = `${arg}`;
          arg = arg.replace(/(\\*)"/g, '$1$1\\"');
          arg = arg.replace(/(\\*)$/, "$1$1");
          arg = `"${arg}"`;
          arg = arg.replace(metaCharsRegExp, "^$1");
          if (doubleEscapeMetaChars) {
            arg = arg.replace(metaCharsRegExp, "^$1");
          }
          return arg;
        }
        module2.exports.command = escapeCommand;
        module2.exports.argument = escapeArgument;
      },
      (module2, __unused_webpack_exports, __webpack_require__2) => {
        const fs = __webpack_require__2(12);
        const shebangCommand = __webpack_require__2(18);
        function readShebang(command) {
          const size = 150;
          const buffer = Buffer.alloc(size);
          let fd;
          try {
            fd = fs.openSync(command, "r");
            fs.readSync(fd, buffer, 0, size, 0);
            fs.closeSync(fd);
          } catch (e) {
          }
          return shebangCommand(buffer.toString());
        }
        module2.exports = readShebang;
      },
      (module2, __unused_webpack_exports, __webpack_require__2) => {
        const shebangRegex = __webpack_require__2(19);
        module2.exports = (string = "") => {
          const match = string.match(shebangRegex);
          if (!match) {
            return null;
          }
          const [path, argument] = match[0].replace(/#! ?/, "").split(" ");
          const binary = path.split("/").pop();
          if (binary === "env") {
            return argument;
          }
          return argument ? `${binary} ${argument}` : binary;
        };
      },
      (module2) => {
        module2.exports = /^#!(.*)/;
      },
      (module2) => {
        const isWin = process.platform === "win32";
        function notFoundError(original, syscall) {
          return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
            code: "ENOENT",
            errno: "ENOENT",
            syscall: `${syscall} ${original.command}`,
            path: original.command,
            spawnargs: original.args
          });
        }
        function hookChildProcess(cp, parsed) {
          if (!isWin) {
            return;
          }
          const originalEmit = cp.emit;
          cp.emit = function(name, arg1) {
            if (name === "exit") {
              const err = verifyENOENT(arg1, parsed);
              if (err) {
                return originalEmit.call(cp, "error", err);
              }
            }
            return originalEmit.apply(cp, arguments);
          };
        }
        function verifyENOENT(status, parsed) {
          if (isWin && status === 1 && !parsed.file) {
            return notFoundError(parsed.original, "spawn");
          }
          return null;
        }
        function verifyENOENTSync(status, parsed) {
          if (isWin && status === 1 && !parsed.file) {
            return notFoundError(parsed.original, "spawnSync");
          }
          return null;
        }
        module2.exports = {
          hookChildProcess,
          verifyENOENT,
          verifyENOENTSync,
          notFoundError
        };
      },
      (__unused_webpack___webpack_module__, __webpack_exports__2, __webpack_require__2) => {
        __webpack_require__2.r(__webpack_exports__2);
        __webpack_require__2.d(__webpack_exports__2, {
          "default": () => stripFinalNewline
        });
        function stripFinalNewline(input) {
          const LF = typeof input === "string" ? "\n" : "\n".charCodeAt();
          const CR = typeof input === "string" ? "\r" : "\r".charCodeAt();
          if (input[input.length - 1] === LF) {
            input = input.slice(0, -1);
          }
          if (input[input.length - 1] === CR) {
            input = input.slice(0, -1);
          }
          return input;
        }
      },
      (__unused_webpack___webpack_module__, __webpack_exports__2, __webpack_require__2) => {
        __webpack_require__2.r(__webpack_exports__2);
        __webpack_require__2.d(__webpack_exports__2, {
          "npmRunPath": () => npmRunPath,
          "npmRunPathEnv": () => npmRunPathEnv
        });
        var node_process__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__2(4);
        var node_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__2(2);
        var node_url__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__2(23);
        var path_key__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__2(24);
        function npmRunPath(options = {}) {
          const {
            cwd = node_process__WEBPACK_IMPORTED_MODULE_0__.cwd(),
            path: path_ = node_process__WEBPACK_IMPORTED_MODULE_0__.env[(0, path_key__WEBPACK_IMPORTED_MODULE_3__["default"])()],
            execPath = node_process__WEBPACK_IMPORTED_MODULE_0__.execPath
          } = options;
          let previous;
          const cwdString = cwd instanceof URL ? node_url__WEBPACK_IMPORTED_MODULE_2__.fileURLToPath(cwd) : cwd;
          let cwdPath = node_path__WEBPACK_IMPORTED_MODULE_1__.resolve(cwdString);
          const result = [];
          while (previous !== cwdPath) {
            result.push(node_path__WEBPACK_IMPORTED_MODULE_1__.join(cwdPath, "node_modules/.bin"));
            previous = cwdPath;
            cwdPath = node_path__WEBPACK_IMPORTED_MODULE_1__.resolve(cwdPath, "..");
          }
          result.push(node_path__WEBPACK_IMPORTED_MODULE_1__.resolve(cwdString, execPath, ".."));
          return [...result, path_].join(node_path__WEBPACK_IMPORTED_MODULE_1__.delimiter);
        }
        function npmRunPathEnv(_a = {}) {
          var _b = _a, { env = node_process__WEBPACK_IMPORTED_MODULE_0__.env } = _b, options = __objRest(_b, ["env"]);
          env = __spreadValues({}, env);
          const path = (0, path_key__WEBPACK_IMPORTED_MODULE_3__["default"])({ env });
          options.path = env[path];
          env[path] = npmRunPath(options);
          return env;
        }
      },
      (module2) => {
        module2.exports = require$$7__default["default"];
      },
      (__unused_webpack___webpack_module__, __webpack_exports__2, __webpack_require__2) => {
        __webpack_require__2.r(__webpack_exports__2);
        __webpack_require__2.d(__webpack_exports__2, {
          "default": () => pathKey
        });
        function pathKey(options = {}) {
          const {
            env = process.env,
            platform = process.platform
          } = options;
          if (platform !== "win32") {
            return "PATH";
          }
          return Object.keys(env).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
        }
      },
      (__unused_webpack___webpack_module__, __webpack_exports__2, __webpack_require__2) => {
        __webpack_require__2.r(__webpack_exports__2);
        __webpack_require__2.d(__webpack_exports__2, {
          "default": () => __WEBPACK_DEFAULT_EXPORT__
        });
        var mimic_fn__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__2(26);
        const calledFunctions = /* @__PURE__ */ new WeakMap();
        const onetime = (function_, options = {}) => {
          if (typeof function_ !== "function") {
            throw new TypeError("Expected a function");
          }
          let returnValue;
          let callCount = 0;
          const functionName = function_.displayName || function_.name || "<anonymous>";
          const onetime2 = function(...arguments_) {
            calledFunctions.set(onetime2, ++callCount);
            if (callCount === 1) {
              returnValue = function_.apply(this, arguments_);
              function_ = null;
            } else if (options.throw === true) {
              throw new Error(`Function \`${functionName}\` can only be called once`);
            }
            return returnValue;
          };
          (0, mimic_fn__WEBPACK_IMPORTED_MODULE_0__["default"])(onetime2, function_);
          calledFunctions.set(onetime2, callCount);
          return onetime2;
        };
        onetime.callCount = (function_) => {
          if (!calledFunctions.has(function_)) {
            throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
          }
          return calledFunctions.get(function_);
        };
        const __WEBPACK_DEFAULT_EXPORT__ = onetime;
      },
      (__unused_webpack___webpack_module__, __webpack_exports__2, __webpack_require__2) => {
        __webpack_require__2.r(__webpack_exports__2);
        __webpack_require__2.d(__webpack_exports__2, {
          "default": () => mimicFunction
        });
        const copyProperty = (to, from, property, ignoreNonConfigurable) => {
          if (property === "length" || property === "prototype") {
            return;
          }
          if (property === "arguments" || property === "caller") {
            return;
          }
          const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
          const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);
          if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
            return;
          }
          Object.defineProperty(to, property, fromDescriptor);
        };
        const canCopyProperty = function(toDescriptor, fromDescriptor) {
          return toDescriptor === void 0 || toDescriptor.configurable || toDescriptor.writable === fromDescriptor.writable && toDescriptor.enumerable === fromDescriptor.enumerable && toDescriptor.configurable === fromDescriptor.configurable && (toDescriptor.writable || toDescriptor.value === fromDescriptor.value);
        };
        const changePrototype = (to, from) => {
          const fromPrototype = Object.getPrototypeOf(from);
          if (fromPrototype === Object.getPrototypeOf(to)) {
            return;
          }
          Object.setPrototypeOf(to, fromPrototype);
        };
        const wrappedToString = (withName, fromBody) => `/* Wrapped ${withName}*/
${fromBody}`;
        const toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, "toString");
        const toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name");
        const changeToString = (to, from, name) => {
          const withName = name === "" ? "" : `with ${name.trim()}() `;
          const newToString = wrappedToString.bind(null, withName, from.toString());
          Object.defineProperty(newToString, "name", toStringName);
          Object.defineProperty(to, "toString", __spreadProps(__spreadValues({}, toStringDescriptor), { value: newToString }));
        };
        function mimicFunction(to, from, { ignoreNonConfigurable = false } = {}) {
          const { name } = to;
          for (const property of Reflect.ownKeys(from)) {
            copyProperty(to, from, property, ignoreNonConfigurable);
          }
          changePrototype(to, from);
          changeToString(to, from, name);
          return to;
        }
      },
      (__unused_webpack___webpack_module__, __webpack_exports__2, __webpack_require__2) => {
        __webpack_require__2.r(__webpack_exports__2);
        __webpack_require__2.d(__webpack_exports__2, {
          "makeError": () => makeError
        });
        var human_signals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__2(28);
        const getErrorPrefix = ({ timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled }) => {
          if (timedOut) {
            return `timed out after ${timeout} milliseconds`;
          }
          if (isCanceled) {
            return "was canceled";
          }
          if (errorCode !== void 0) {
            return `failed with ${errorCode}`;
          }
          if (signal !== void 0) {
            return `was killed with ${signal} (${signalDescription})`;
          }
          if (exitCode !== void 0) {
            return `failed with exit code ${exitCode}`;
          }
          return "failed";
        };
        const makeError = ({
          stdout,
          stderr,
          all,
          error,
          signal,
          exitCode,
          command,
          escapedCommand,
          timedOut,
          isCanceled,
          killed,
          parsed: { options: { timeout } }
        }) => {
          exitCode = exitCode === null ? void 0 : exitCode;
          signal = signal === null ? void 0 : signal;
          const signalDescription = signal === void 0 ? void 0 : human_signals__WEBPACK_IMPORTED_MODULE_0__.signalsByName[signal].description;
          const errorCode = error && error.code;
          const prefix = getErrorPrefix({ timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled });
          const execaMessage = `Command ${prefix}: ${command}`;
          const isError = Object.prototype.toString.call(error) === "[object Error]";
          const shortMessage = isError ? `${execaMessage}
${error.message}` : execaMessage;
          const message = [shortMessage, stderr, stdout].filter(Boolean).join("\n");
          if (isError) {
            error.originalMessage = error.message;
            error.message = message;
          } else {
            error = new Error(message);
          }
          error.shortMessage = shortMessage;
          error.command = command;
          error.escapedCommand = escapedCommand;
          error.exitCode = exitCode;
          error.signal = signal;
          error.signalDescription = signalDescription;
          error.stdout = stdout;
          error.stderr = stderr;
          if (all !== void 0) {
            error.all = all;
          }
          if ("bufferedData" in error) {
            delete error.bufferedData;
          }
          error.failed = true;
          error.timedOut = Boolean(timedOut);
          error.isCanceled = isCanceled;
          error.killed = killed && !timedOut;
          return error;
        };
      },
      (__unused_webpack___webpack_module__, __webpack_exports__2, __webpack_require__2) => {
        __webpack_require__2.r(__webpack_exports__2);
        __webpack_require__2.d(__webpack_exports__2, {
          "signalsByName": () => signalsByName,
          "signalsByNumber": () => signalsByNumber
        });
        var os__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__2(29);
        var _realtime_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__2(30);
        var _signals_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__2(31);
        const getSignalsByName = function() {
          const signals = (0, _signals_js__WEBPACK_IMPORTED_MODULE_2__.getSignals)();
          return signals.reduce(getSignalByName, {});
        };
        const getSignalByName = function(signalByNameMemo, { name, number, description, supported, action, forced, standard }) {
          return __spreadProps(__spreadValues({}, signalByNameMemo), {
            [name]: { name, number, description, supported, action, forced, standard }
          });
        };
        const signalsByName = getSignalsByName();
        const getSignalsByNumber = function() {
          const signals = (0, _signals_js__WEBPACK_IMPORTED_MODULE_2__.getSignals)();
          const length = _realtime_js__WEBPACK_IMPORTED_MODULE_1__.SIGRTMAX + 1;
          const signalsA = Array.from({ length }, (value, number) => getSignalByNumber(number, signals));
          return Object.assign({}, ...signalsA);
        };
        const getSignalByNumber = function(number, signals) {
          const signal = findSignalByNumber(number, signals);
          if (signal === void 0) {
            return {};
          }
          const { name, description, supported, action, forced, standard } = signal;
          return {
            [number]: {
              name,
              number,
              description,
              supported,
              action,
              forced,
              standard
            }
          };
        };
        const findSignalByNumber = function(number, signals) {
          const signal = signals.find(({ name }) => os__WEBPACK_IMPORTED_MODULE_0__.constants.signals[name] === number);
          if (signal !== void 0) {
            return signal;
          }
          return signals.find((signalA) => signalA.number === number);
        };
        const signalsByNumber = getSignalsByNumber();
      },
      (module2) => {
        module2.exports = require$$8__default["default"];
      },
      (__unused_webpack___webpack_module__, __webpack_exports__2, __webpack_require__2) => {
        __webpack_require__2.r(__webpack_exports__2);
        __webpack_require__2.d(__webpack_exports__2, {
          "SIGRTMAX": () => SIGRTMAX,
          "getRealtimeSignals": () => getRealtimeSignals
        });
        const getRealtimeSignals = function() {
          const length = SIGRTMAX - SIGRTMIN + 1;
          return Array.from({ length }, getRealtimeSignal);
        };
        const getRealtimeSignal = function(value, index) {
          return {
            name: `SIGRT${index + 1}`,
            number: SIGRTMIN + index,
            action: "terminate",
            description: "Application-specific signal (realtime)",
            standard: "posix"
          };
        };
        const SIGRTMIN = 34;
        const SIGRTMAX = 64;
      },
      (__unused_webpack___webpack_module__, __webpack_exports__2, __webpack_require__2) => {
        __webpack_require__2.r(__webpack_exports__2);
        __webpack_require__2.d(__webpack_exports__2, {
          "getSignals": () => getSignals
        });
        var os__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__2(29);
        var _core_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__2(32);
        var _realtime_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__2(30);
        const getSignals = function() {
          const realtimeSignals = (0, _realtime_js__WEBPACK_IMPORTED_MODULE_2__.getRealtimeSignals)();
          const signals = [..._core_js__WEBPACK_IMPORTED_MODULE_1__.SIGNALS, ...realtimeSignals].map(normalizeSignal);
          return signals;
        };
        const normalizeSignal = function({
          name,
          number: defaultNumber,
          description,
          action,
          forced = false,
          standard
        }) {
          const {
            signals: { [name]: constantSignal }
          } = os__WEBPACK_IMPORTED_MODULE_0__.constants;
          const supported = constantSignal !== void 0;
          const number = supported ? constantSignal : defaultNumber;
          return { name, number, description, supported, action, forced, standard };
        };
      },
      (__unused_webpack___webpack_module__, __webpack_exports__2, __webpack_require__2) => {
        __webpack_require__2.r(__webpack_exports__2);
        __webpack_require__2.d(__webpack_exports__2, {
          "SIGNALS": () => SIGNALS
        });
        const SIGNALS = [
          {
            name: "SIGHUP",
            number: 1,
            action: "terminate",
            description: "Terminal closed",
            standard: "posix"
          },
          {
            name: "SIGINT",
            number: 2,
            action: "terminate",
            description: "User interruption with CTRL-C",
            standard: "ansi"
          },
          {
            name: "SIGQUIT",
            number: 3,
            action: "core",
            description: "User interruption with CTRL-\\",
            standard: "posix"
          },
          {
            name: "SIGILL",
            number: 4,
            action: "core",
            description: "Invalid machine instruction",
            standard: "ansi"
          },
          {
            name: "SIGTRAP",
            number: 5,
            action: "core",
            description: "Debugger breakpoint",
            standard: "posix"
          },
          {
            name: "SIGABRT",
            number: 6,
            action: "core",
            description: "Aborted",
            standard: "ansi"
          },
          {
            name: "SIGIOT",
            number: 6,
            action: "core",
            description: "Aborted",
            standard: "bsd"
          },
          {
            name: "SIGBUS",
            number: 7,
            action: "core",
            description: "Bus error due to misaligned, non-existing address or paging error",
            standard: "bsd"
          },
          {
            name: "SIGEMT",
            number: 7,
            action: "terminate",
            description: "Command should be emulated but is not implemented",
            standard: "other"
          },
          {
            name: "SIGFPE",
            number: 8,
            action: "core",
            description: "Floating point arithmetic error",
            standard: "ansi"
          },
          {
            name: "SIGKILL",
            number: 9,
            action: "terminate",
            description: "Forced termination",
            standard: "posix",
            forced: true
          },
          {
            name: "SIGUSR1",
            number: 10,
            action: "terminate",
            description: "Application-specific signal",
            standard: "posix"
          },
          {
            name: "SIGSEGV",
            number: 11,
            action: "core",
            description: "Segmentation fault",
            standard: "ansi"
          },
          {
            name: "SIGUSR2",
            number: 12,
            action: "terminate",
            description: "Application-specific signal",
            standard: "posix"
          },
          {
            name: "SIGPIPE",
            number: 13,
            action: "terminate",
            description: "Broken pipe or socket",
            standard: "posix"
          },
          {
            name: "SIGALRM",
            number: 14,
            action: "terminate",
            description: "Timeout or timer",
            standard: "posix"
          },
          {
            name: "SIGTERM",
            number: 15,
            action: "terminate",
            description: "Termination",
            standard: "ansi"
          },
          {
            name: "SIGSTKFLT",
            number: 16,
            action: "terminate",
            description: "Stack is empty or overflowed",
            standard: "other"
          },
          {
            name: "SIGCHLD",
            number: 17,
            action: "ignore",
            description: "Child process terminated, paused or unpaused",
            standard: "posix"
          },
          {
            name: "SIGCLD",
            number: 17,
            action: "ignore",
            description: "Child process terminated, paused or unpaused",
            standard: "other"
          },
          {
            name: "SIGCONT",
            number: 18,
            action: "unpause",
            description: "Unpaused",
            standard: "posix",
            forced: true
          },
          {
            name: "SIGSTOP",
            number: 19,
            action: "pause",
            description: "Paused",
            standard: "posix",
            forced: true
          },
          {
            name: "SIGTSTP",
            number: 20,
            action: "pause",
            description: 'Paused using CTRL-Z or "suspend"',
            standard: "posix"
          },
          {
            name: "SIGTTIN",
            number: 21,
            action: "pause",
            description: "Background process cannot read terminal input",
            standard: "posix"
          },
          {
            name: "SIGBREAK",
            number: 21,
            action: "terminate",
            description: "User interruption with CTRL-BREAK",
            standard: "other"
          },
          {
            name: "SIGTTOU",
            number: 22,
            action: "pause",
            description: "Background process cannot write to terminal output",
            standard: "posix"
          },
          {
            name: "SIGURG",
            number: 23,
            action: "ignore",
            description: "Socket received out-of-band data",
            standard: "bsd"
          },
          {
            name: "SIGXCPU",
            number: 24,
            action: "core",
            description: "Process timed out",
            standard: "bsd"
          },
          {
            name: "SIGXFSZ",
            number: 25,
            action: "core",
            description: "File too big",
            standard: "bsd"
          },
          {
            name: "SIGVTALRM",
            number: 26,
            action: "terminate",
            description: "Timeout or timer",
            standard: "bsd"
          },
          {
            name: "SIGPROF",
            number: 27,
            action: "terminate",
            description: "Timeout or timer",
            standard: "bsd"
          },
          {
            name: "SIGWINCH",
            number: 28,
            action: "ignore",
            description: "Terminal window size changed",
            standard: "bsd"
          },
          {
            name: "SIGIO",
            number: 29,
            action: "terminate",
            description: "I/O is available",
            standard: "other"
          },
          {
            name: "SIGPOLL",
            number: 29,
            action: "terminate",
            description: "Watched event",
            standard: "other"
          },
          {
            name: "SIGINFO",
            number: 29,
            action: "ignore",
            description: "Request for process information",
            standard: "other"
          },
          {
            name: "SIGPWR",
            number: 30,
            action: "terminate",
            description: "Device running out of power",
            standard: "systemv"
          },
          {
            name: "SIGSYS",
            number: 31,
            action: "core",
            description: "Invalid system call",
            standard: "other"
          },
          {
            name: "SIGUNUSED",
            number: 31,
            action: "terminate",
            description: "Invalid system call",
            standard: "other"
          }
        ];
      },
      (__unused_webpack___webpack_module__, __webpack_exports__2, __webpack_require__2) => {
        __webpack_require__2.r(__webpack_exports__2);
        __webpack_require__2.d(__webpack_exports__2, {
          "normalizeStdio": () => normalizeStdio,
          "normalizeStdioNode": () => normalizeStdioNode
        });
        const aliases = ["stdin", "stdout", "stderr"];
        const hasAlias = (options) => aliases.some((alias) => options[alias] !== void 0);
        const normalizeStdio = (options) => {
          if (!options) {
            return;
          }
          const { stdio } = options;
          if (stdio === void 0) {
            return aliases.map((alias) => options[alias]);
          }
          if (hasAlias(options)) {
            throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${aliases.map((alias) => `\`${alias}\``).join(", ")}`);
          }
          if (typeof stdio === "string") {
            return stdio;
          }
          if (!Array.isArray(stdio)) {
            throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio}\``);
          }
          const length = Math.max(stdio.length, aliases.length);
          return Array.from({ length }, (value, index) => stdio[index]);
        };
        const normalizeStdioNode = (options) => {
          const stdio = normalizeStdio(options);
          if (stdio === "ipc") {
            return "ipc";
          }
          if (stdio === void 0 || typeof stdio === "string") {
            return [stdio, stdio, stdio, "ipc"];
          }
          if (stdio.includes("ipc")) {
            return stdio;
          }
          return [...stdio, "ipc"];
        };
      },
      (__unused_webpack___webpack_module__, __webpack_exports__2, __webpack_require__2) => {
        __webpack_require__2.r(__webpack_exports__2);
        __webpack_require__2.d(__webpack_exports__2, {
          "setExitHandler": () => setExitHandler,
          "setupTimeout": () => setupTimeout,
          "spawnedCancel": () => spawnedCancel,
          "spawnedKill": () => spawnedKill,
          "validateTimeout": () => validateTimeout
        });
        var node_os__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__2(35);
        var signal_exit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__2(36);
        const DEFAULT_FORCE_KILL_TIMEOUT = 1e3 * 5;
        const spawnedKill = (kill, signal = "SIGTERM", options = {}) => {
          const killResult = kill(signal);
          setKillTimeout(kill, signal, options, killResult);
          return killResult;
        };
        const setKillTimeout = (kill, signal, options, killResult) => {
          if (!shouldForceKill(signal, options, killResult)) {
            return;
          }
          const timeout = getForceKillAfterTimeout(options);
          const t = setTimeout(() => {
            kill("SIGKILL");
          }, timeout);
          if (t.unref) {
            t.unref();
          }
        };
        const shouldForceKill = (signal, { forceKillAfterTimeout }, killResult) => isSigterm(signal) && forceKillAfterTimeout !== false && killResult;
        const isSigterm = (signal) => signal === node_os__WEBPACK_IMPORTED_MODULE_0__.constants.signals.SIGTERM || typeof signal === "string" && signal.toUpperCase() === "SIGTERM";
        const getForceKillAfterTimeout = ({ forceKillAfterTimeout = true }) => {
          if (forceKillAfterTimeout === true) {
            return DEFAULT_FORCE_KILL_TIMEOUT;
          }
          if (!Number.isFinite(forceKillAfterTimeout) || forceKillAfterTimeout < 0) {
            throw new TypeError(`Expected the \`forceKillAfterTimeout\` option to be a non-negative integer, got \`${forceKillAfterTimeout}\` (${typeof forceKillAfterTimeout})`);
          }
          return forceKillAfterTimeout;
        };
        const spawnedCancel = (spawned, context) => {
          const killResult = spawned.kill();
          if (killResult) {
            context.isCanceled = true;
          }
        };
        const timeoutKill = (spawned, signal, reject) => {
          spawned.kill(signal);
          reject(Object.assign(new Error("Timed out"), { timedOut: true, signal }));
        };
        const setupTimeout = (spawned, { timeout, killSignal = "SIGTERM" }, spawnedPromise) => {
          if (timeout === 0 || timeout === void 0) {
            return spawnedPromise;
          }
          let timeoutId;
          const timeoutPromise = new Promise((resolve, reject) => {
            timeoutId = setTimeout(() => {
              timeoutKill(spawned, killSignal, reject);
            }, timeout);
          });
          const safeSpawnedPromise = spawnedPromise.finally(() => {
            clearTimeout(timeoutId);
          });
          return Promise.race([timeoutPromise, safeSpawnedPromise]);
        };
        const validateTimeout = ({ timeout }) => {
          if (timeout !== void 0 && (!Number.isFinite(timeout) || timeout < 0)) {
            throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${timeout}\` (${typeof timeout})`);
          }
        };
        const setExitHandler = async (spawned, { cleanup, detached }, timedPromise) => {
          if (!cleanup || detached) {
            return timedPromise;
          }
          const removeExitHandler = signal_exit__WEBPACK_IMPORTED_MODULE_1__(() => {
            spawned.kill();
          });
          return timedPromise.finally(() => {
            removeExitHandler();
          });
        };
      },
      (module2) => {
        module2.exports = require$$8__default["default"];
      },
      (module2, __unused_webpack_exports, __webpack_require__2) => {
        var process2 = commonjsGlobal.process;
        const processOk = function(process3) {
          return process3 && typeof process3 === "object" && typeof process3.removeListener === "function" && typeof process3.emit === "function" && typeof process3.reallyExit === "function" && typeof process3.listeners === "function" && typeof process3.kill === "function" && typeof process3.pid === "number" && typeof process3.on === "function";
        };
        if (!processOk(process2)) {
          module2.exports = function() {
            return function() {
            };
          };
        } else {
          var assert = __webpack_require__2(37);
          var signals = __webpack_require__2(38);
          var isWin = /^win/i.test(process2.platform);
          var EE = __webpack_require__2(39);
          if (typeof EE !== "function") {
            EE = EE.EventEmitter;
          }
          var emitter;
          if (process2.__signal_exit_emitter__) {
            emitter = process2.__signal_exit_emitter__;
          } else {
            emitter = process2.__signal_exit_emitter__ = new EE();
            emitter.count = 0;
            emitter.emitted = {};
          }
          if (!emitter.infinite) {
            emitter.setMaxListeners(Infinity);
            emitter.infinite = true;
          }
          module2.exports = function(cb, opts) {
            if (!processOk(commonjsGlobal.process)) {
              return function() {
              };
            }
            assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
            if (loaded === false) {
              load();
            }
            var ev = "exit";
            if (opts && opts.alwaysLast) {
              ev = "afterexit";
            }
            var remove = function() {
              emitter.removeListener(ev, cb);
              if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
                unload();
              }
            };
            emitter.on(ev, cb);
            return remove;
          };
          var unload = function unload2() {
            if (!loaded || !processOk(commonjsGlobal.process)) {
              return;
            }
            loaded = false;
            signals.forEach(function(sig) {
              try {
                process2.removeListener(sig, sigListeners[sig]);
              } catch (er) {
              }
            });
            process2.emit = originalProcessEmit;
            process2.reallyExit = originalProcessReallyExit;
            emitter.count -= 1;
          };
          module2.exports.unload = unload;
          var emit = function emit2(event, code, signal) {
            if (emitter.emitted[event]) {
              return;
            }
            emitter.emitted[event] = true;
            emitter.emit(event, code, signal);
          };
          var sigListeners = {};
          signals.forEach(function(sig) {
            sigListeners[sig] = function listener() {
              if (!processOk(commonjsGlobal.process)) {
                return;
              }
              var listeners = process2.listeners(sig);
              if (listeners.length === emitter.count) {
                unload();
                emit("exit", null, sig);
                emit("afterexit", null, sig);
                if (isWin && sig === "SIGHUP") {
                  sig = "SIGINT";
                }
                process2.kill(process2.pid, sig);
              }
            };
          });
          module2.exports.signals = function() {
            return signals;
          };
          var loaded = false;
          var load = function load2() {
            if (loaded || !processOk(commonjsGlobal.process)) {
              return;
            }
            loaded = true;
            emitter.count += 1;
            signals = signals.filter(function(sig) {
              try {
                process2.on(sig, sigListeners[sig]);
                return true;
              } catch (er) {
                return false;
              }
            });
            process2.emit = processEmit;
            process2.reallyExit = processReallyExit;
          };
          module2.exports.load = load;
          var originalProcessReallyExit = process2.reallyExit;
          var processReallyExit = function processReallyExit2(code) {
            if (!processOk(commonjsGlobal.process)) {
              return;
            }
            process2.exitCode = code || 0;
            emit("exit", process2.exitCode, null);
            emit("afterexit", process2.exitCode, null);
            originalProcessReallyExit.call(process2, process2.exitCode);
          };
          var originalProcessEmit = process2.emit;
          var processEmit = function processEmit2(ev, arg) {
            if (ev === "exit" && processOk(commonjsGlobal.process)) {
              if (arg !== void 0) {
                process2.exitCode = arg;
              }
              var ret = originalProcessEmit.apply(this, arguments);
              emit("exit", process2.exitCode, null);
              emit("afterexit", process2.exitCode, null);
              return ret;
            } else {
              return originalProcessEmit.apply(this, arguments);
            }
          };
        }
      },
      (module2) => {
        module2.exports = require$$10__default["default"];
      },
      (module2) => {
        module2.exports = [
          "SIGABRT",
          "SIGALRM",
          "SIGHUP",
          "SIGINT",
          "SIGTERM"
        ];
        if (process.platform !== "win32") {
          module2.exports.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
        }
        if (process.platform === "linux") {
          module2.exports.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
        }
      },
      (module2) => {
        module2.exports = require$$11__default["default"];
      },
      (__unused_webpack___webpack_module__, __webpack_exports__2, __webpack_require__2) => {
        __webpack_require__2.r(__webpack_exports__2);
        __webpack_require__2.d(__webpack_exports__2, {
          "getSpawnedResult": () => getSpawnedResult,
          "handleInput": () => handleInput,
          "makeAllStream": () => makeAllStream,
          "validateInputSync": () => validateInputSync
        });
        var is_stream__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__2(41);
        var get_stream__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__2(42);
        var merge_stream__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__2(47);
        const handleInput = (spawned, input) => {
          if (input === void 0 || spawned.stdin === void 0) {
            return;
          }
          if ((0, is_stream__WEBPACK_IMPORTED_MODULE_0__.isStream)(input)) {
            input.pipe(spawned.stdin);
          } else {
            spawned.stdin.end(input);
          }
        };
        const makeAllStream = (spawned, { all }) => {
          if (!all || !spawned.stdout && !spawned.stderr) {
            return;
          }
          const mixed = merge_stream__WEBPACK_IMPORTED_MODULE_2__();
          if (spawned.stdout) {
            mixed.add(spawned.stdout);
          }
          if (spawned.stderr) {
            mixed.add(spawned.stderr);
          }
          return mixed;
        };
        const getBufferedData = async (stream, streamPromise) => {
          if (!stream) {
            return;
          }
          stream.destroy();
          try {
            return await streamPromise;
          } catch (error) {
            return error.bufferedData;
          }
        };
        const getStreamPromise = (stream, { encoding, buffer, maxBuffer }) => {
          if (!stream || !buffer) {
            return;
          }
          if (encoding) {
            return get_stream__WEBPACK_IMPORTED_MODULE_1__(stream, { encoding, maxBuffer });
          }
          return get_stream__WEBPACK_IMPORTED_MODULE_1__.buffer(stream, { maxBuffer });
        };
        const getSpawnedResult = async ({ stdout, stderr, all }, { encoding, buffer, maxBuffer }, processDone) => {
          const stdoutPromise = getStreamPromise(stdout, { encoding, buffer, maxBuffer });
          const stderrPromise = getStreamPromise(stderr, { encoding, buffer, maxBuffer });
          const allPromise = getStreamPromise(all, { encoding, buffer, maxBuffer: maxBuffer * 2 });
          try {
            return await Promise.all([processDone, stdoutPromise, stderrPromise, allPromise]);
          } catch (error) {
            return Promise.all([
              { error, signal: error.signal, timedOut: error.timedOut },
              getBufferedData(stdout, stdoutPromise),
              getBufferedData(stderr, stderrPromise),
              getBufferedData(all, allPromise)
            ]);
          }
        };
        const validateInputSync = ({ input }) => {
          if ((0, is_stream__WEBPACK_IMPORTED_MODULE_0__.isStream)(input)) {
            throw new TypeError("The `input` option cannot be a stream in sync mode");
          }
        };
      },
      (__unused_webpack___webpack_module__, __webpack_exports__2, __webpack_require__2) => {
        __webpack_require__2.r(__webpack_exports__2);
        __webpack_require__2.d(__webpack_exports__2, {
          "isDuplexStream": () => isDuplexStream,
          "isReadableStream": () => isReadableStream,
          "isStream": () => isStream,
          "isTransformStream": () => isTransformStream,
          "isWritableStream": () => isWritableStream
        });
        function isStream(stream) {
          return stream !== null && typeof stream === "object" && typeof stream.pipe === "function";
        }
        function isWritableStream(stream) {
          return isStream(stream) && stream.writable !== false && typeof stream._write === "function" && typeof stream._writableState === "object";
        }
        function isReadableStream(stream) {
          return isStream(stream) && stream.readable !== false && typeof stream._read === "function" && typeof stream._readableState === "object";
        }
        function isDuplexStream(stream) {
          return isWritableStream(stream) && isReadableStream(stream);
        }
        function isTransformStream(stream) {
          return isDuplexStream(stream) && typeof stream._transform === "function";
        }
      },
      (module2, __unused_webpack_exports, __webpack_require__2) => {
        const { constants: BufferConstants } = __webpack_require__2(43);
        const stream = __webpack_require__2(44);
        const { promisify } = __webpack_require__2(45);
        const bufferStream = __webpack_require__2(46);
        const streamPipelinePromisified = promisify(stream.pipeline);
        class MaxBufferError extends Error {
          constructor() {
            super("maxBuffer exceeded");
            this.name = "MaxBufferError";
          }
        }
        async function getStream(inputStream, options) {
          if (!inputStream) {
            throw new Error("Expected a stream");
          }
          options = __spreadValues({
            maxBuffer: Infinity
          }, options);
          const { maxBuffer } = options;
          const stream2 = bufferStream(options);
          await new Promise((resolve, reject) => {
            const rejectPromise = (error) => {
              if (error && stream2.getBufferedLength() <= BufferConstants.MAX_LENGTH) {
                error.bufferedData = stream2.getBufferedValue();
              }
              reject(error);
            };
            (async () => {
              try {
                await streamPipelinePromisified(inputStream, stream2);
                resolve();
              } catch (error) {
                rejectPromise(error);
              }
            })();
            stream2.on("data", () => {
              if (stream2.getBufferedLength() > maxBuffer) {
                rejectPromise(new MaxBufferError());
              }
            });
          });
          return stream2.getBufferedValue();
        }
        module2.exports = getStream;
        module2.exports.buffer = (stream2, options) => getStream(stream2, __spreadProps(__spreadValues({}, options), { encoding: "buffer" }));
        module2.exports.array = (stream2, options) => getStream(stream2, __spreadProps(__spreadValues({}, options), { array: true }));
        module2.exports.MaxBufferError = MaxBufferError;
      },
      (module2) => {
        module2.exports = require$$0__default["default"];
      },
      (module2) => {
        module2.exports = require$$13__default["default"];
      },
      (module2) => {
        module2.exports = require$$14__default["default"];
      },
      (module2, __unused_webpack_exports, __webpack_require__2) => {
        const { PassThrough: PassThroughStream } = __webpack_require__2(44);
        module2.exports = (options) => {
          options = __spreadValues({}, options);
          const { array } = options;
          let { encoding } = options;
          const isBuffer = encoding === "buffer";
          let objectMode = false;
          if (array) {
            objectMode = !(encoding || isBuffer);
          } else {
            encoding = encoding || "utf8";
          }
          if (isBuffer) {
            encoding = null;
          }
          const stream = new PassThroughStream({ objectMode });
          if (encoding) {
            stream.setEncoding(encoding);
          }
          let length = 0;
          const chunks = [];
          stream.on("data", (chunk) => {
            chunks.push(chunk);
            if (objectMode) {
              length = chunks.length;
            } else {
              length += chunk.length;
            }
          });
          stream.getBufferedValue = () => {
            if (array) {
              return chunks;
            }
            return isBuffer ? Buffer.concat(chunks, length) : chunks.join("");
          };
          stream.getBufferedLength = () => length;
          return stream;
        };
      },
      (module2, __unused_webpack_exports, __webpack_require__2) => {
        const { PassThrough } = __webpack_require__2(44);
        module2.exports = function() {
          var sources = [];
          var output = new PassThrough({ objectMode: true });
          output.setMaxListeners(0);
          output.add = add;
          output.isEmpty = isEmpty;
          output.on("unpipe", remove);
          Array.prototype.slice.call(arguments).forEach(add);
          return output;
          function add(source) {
            if (Array.isArray(source)) {
              source.forEach(add);
              return this;
            }
            sources.push(source);
            source.once("end", remove.bind(null, source));
            source.once("error", output.emit.bind(output, "error"));
            source.pipe(output, { end: false });
            return this;
          }
          function isEmpty() {
            return sources.length == 0;
          }
          function remove(source) {
            sources = sources.filter(function(it) {
              return it !== source;
            });
            if (!sources.length && output.readable) {
              output.end();
            }
          }
        };
      },
      (__unused_webpack___webpack_module__, __webpack_exports__2, __webpack_require__2) => {
        __webpack_require__2.r(__webpack_exports__2);
        __webpack_require__2.d(__webpack_exports__2, {
          "getSpawnedPromise": () => getSpawnedPromise,
          "mergePromise": () => mergePromise
        });
        const nativePromisePrototype = (async () => {
        })().constructor.prototype;
        const descriptors = ["then", "catch", "finally"].map((property) => [
          property,
          Reflect.getOwnPropertyDescriptor(nativePromisePrototype, property)
        ]);
        const mergePromise = (spawned, promise) => {
          for (const [property, descriptor] of descriptors) {
            const value = typeof promise === "function" ? (...args) => Reflect.apply(descriptor.value, promise(), args) : descriptor.value.bind(promise);
            Reflect.defineProperty(spawned, property, __spreadProps(__spreadValues({}, descriptor), { value }));
          }
          return spawned;
        };
        const getSpawnedPromise = (spawned) => new Promise((resolve, reject) => {
          spawned.on("exit", (exitCode, signal) => {
            resolve({ exitCode, signal });
          });
          spawned.on("error", (error) => {
            reject(error);
          });
          if (spawned.stdin) {
            spawned.stdin.on("error", (error) => {
              reject(error);
            });
          }
        });
      },
      (__unused_webpack___webpack_module__, __webpack_exports__2, __webpack_require__2) => {
        __webpack_require__2.r(__webpack_exports__2);
        __webpack_require__2.d(__webpack_exports__2, {
          "getEscapedCommand": () => getEscapedCommand,
          "joinCommand": () => joinCommand,
          "parseCommand": () => parseCommand
        });
        const normalizeArgs = (file, args = []) => {
          if (!Array.isArray(args)) {
            return [file];
          }
          return [file, ...args];
        };
        const NO_ESCAPE_REGEXP = /^[\w.-]+$/;
        const DOUBLE_QUOTES_REGEXP = /"/g;
        const escapeArg = (arg) => {
          if (typeof arg !== "string" || NO_ESCAPE_REGEXP.test(arg)) {
            return arg;
          }
          return `"${arg.replace(DOUBLE_QUOTES_REGEXP, '\\"')}"`;
        };
        const joinCommand = (file, args) => normalizeArgs(file, args).join(" ");
        const getEscapedCommand = (file, args) => normalizeArgs(file, args).map((arg) => escapeArg(arg)).join(" ");
        const SPACES_REGEXP = / +/g;
        const parseCommand = (command) => {
          const tokens = [];
          for (const token of command.trim().split(SPACES_REGEXP)) {
            const previousToken = tokens[tokens.length - 1];
            if (previousToken && previousToken.endsWith("\\")) {
              tokens[tokens.length - 1] = `${previousToken.slice(0, -1)} ${token}`;
            } else {
              tokens.push(token);
            }
          }
          return tokens;
        };
      }
    ];
    var __webpack_module_cache__ = {};
    function __webpack_require__(moduleId) {
      var cachedModule = __webpack_module_cache__[moduleId];
      if (cachedModule !== void 0) {
        return cachedModule.exports;
      }
      var module2 = __webpack_module_cache__[moduleId] = {
        exports: {}
      };
      __webpack_modules__[moduleId](module2, module2.exports, __webpack_require__);
      return module2.exports;
    }
    (() => {
      __webpack_require__.d = (exports, definition) => {
        for (var key in definition) {
          if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
          }
        }
      };
    })();
    (() => {
      __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    })();
    (() => {
      __webpack_require__.r = (exports) => {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
          Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(exports, "__esModule", { value: true });
      };
    })();
    var __webpack_exports__ = {};
    (() => {
      __webpack_require__.r(__webpack_exports__);
      __webpack_require__.d(__webpack_exports__, {
        "execa": () => execa2,
        "execaCommand": () => execaCommand,
        "execaCommandSync": () => execaCommandSync,
        "execaNode": () => execaNode,
        "execaSync": () => execaSync
      });
      var node_buffer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
      var node_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
      var node_child_process__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
      var node_process__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4);
      var cross_spawn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(5);
      var strip_final_newline__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(21);
      var npm_run_path__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(22);
      var onetime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(25);
      var _lib_error_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(27);
      var _lib_stdio_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(33);
      var _lib_kill_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(34);
      var _lib_stream_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(40);
      var _lib_promise_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(48);
      var _lib_command_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(49);
      const DEFAULT_MAX_BUFFER = 1e3 * 1e3 * 100;
      const getEnv = ({ env: envOption, extendEnv, preferLocal, localDir, execPath }) => {
        const env = extendEnv ? __spreadValues(__spreadValues({}, node_process__WEBPACK_IMPORTED_MODULE_3__.env), envOption) : envOption;
        if (preferLocal) {
          return (0, npm_run_path__WEBPACK_IMPORTED_MODULE_6__.npmRunPathEnv)({ env, cwd: localDir, execPath });
        }
        return env;
      };
      const handleArguments = (file, args, options = {}) => {
        const parsed = cross_spawn__WEBPACK_IMPORTED_MODULE_4__._parse(file, args, options);
        file = parsed.command;
        args = parsed.args;
        options = parsed.options;
        options = __spreadValues({
          maxBuffer: DEFAULT_MAX_BUFFER,
          buffer: true,
          stripFinalNewline: true,
          extendEnv: true,
          preferLocal: false,
          localDir: options.cwd || node_process__WEBPACK_IMPORTED_MODULE_3__.cwd(),
          execPath: node_process__WEBPACK_IMPORTED_MODULE_3__.execPath,
          encoding: "utf8",
          reject: true,
          cleanup: true,
          all: false,
          windowsHide: true
        }, options);
        options.env = getEnv(options);
        options.stdio = (0, _lib_stdio_js__WEBPACK_IMPORTED_MODULE_9__.normalizeStdio)(options);
        if (node_process__WEBPACK_IMPORTED_MODULE_3__.platform === "win32" && node_path__WEBPACK_IMPORTED_MODULE_1__.basename(file, ".exe") === "cmd") {
          args.unshift("/q");
        }
        return { file, args, options, parsed };
      };
      const handleOutput = (options, value, error) => {
        if (typeof value !== "string" && !node_buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.isBuffer(value)) {
          return error === void 0 ? void 0 : "";
        }
        if (options.stripFinalNewline) {
          return (0, strip_final_newline__WEBPACK_IMPORTED_MODULE_5__["default"])(value);
        }
        return value;
      };
      function execa2(file, args, options) {
        const parsed = handleArguments(file, args, options);
        const command = (0, _lib_command_js__WEBPACK_IMPORTED_MODULE_13__.joinCommand)(file, args);
        const escapedCommand = (0, _lib_command_js__WEBPACK_IMPORTED_MODULE_13__.getEscapedCommand)(file, args);
        (0, _lib_kill_js__WEBPACK_IMPORTED_MODULE_10__.validateTimeout)(parsed.options);
        let spawned;
        try {
          spawned = node_child_process__WEBPACK_IMPORTED_MODULE_2__.spawn(parsed.file, parsed.args, parsed.options);
        } catch (error) {
          const dummySpawned = new node_child_process__WEBPACK_IMPORTED_MODULE_2__.ChildProcess();
          const errorPromise = Promise.reject((0, _lib_error_js__WEBPACK_IMPORTED_MODULE_8__.makeError)({
            error,
            stdout: "",
            stderr: "",
            all: "",
            command,
            escapedCommand,
            parsed,
            timedOut: false,
            isCanceled: false,
            killed: false
          }));
          return (0, _lib_promise_js__WEBPACK_IMPORTED_MODULE_12__.mergePromise)(dummySpawned, errorPromise);
        }
        const spawnedPromise = (0, _lib_promise_js__WEBPACK_IMPORTED_MODULE_12__.getSpawnedPromise)(spawned);
        const timedPromise = (0, _lib_kill_js__WEBPACK_IMPORTED_MODULE_10__.setupTimeout)(spawned, parsed.options, spawnedPromise);
        const processDone = (0, _lib_kill_js__WEBPACK_IMPORTED_MODULE_10__.setExitHandler)(spawned, parsed.options, timedPromise);
        const context = { isCanceled: false };
        spawned.kill = _lib_kill_js__WEBPACK_IMPORTED_MODULE_10__.spawnedKill.bind(null, spawned.kill.bind(spawned));
        spawned.cancel = _lib_kill_js__WEBPACK_IMPORTED_MODULE_10__.spawnedCancel.bind(null, spawned, context);
        const handlePromise = async () => {
          const [{ error, exitCode, signal, timedOut }, stdoutResult, stderrResult, allResult] = await (0, _lib_stream_js__WEBPACK_IMPORTED_MODULE_11__.getSpawnedResult)(spawned, parsed.options, processDone);
          const stdout = handleOutput(parsed.options, stdoutResult);
          const stderr = handleOutput(parsed.options, stderrResult);
          const all = handleOutput(parsed.options, allResult);
          if (error || exitCode !== 0 || signal !== null) {
            const returnedError = (0, _lib_error_js__WEBPACK_IMPORTED_MODULE_8__.makeError)({
              error,
              exitCode,
              signal,
              stdout,
              stderr,
              all,
              command,
              escapedCommand,
              parsed,
              timedOut,
              isCanceled: context.isCanceled || (parsed.options.signal ? parsed.options.signal.aborted : false),
              killed: spawned.killed
            });
            if (!parsed.options.reject) {
              return returnedError;
            }
            throw returnedError;
          }
          return {
            command,
            escapedCommand,
            exitCode: 0,
            stdout,
            stderr,
            all,
            failed: false,
            timedOut: false,
            isCanceled: false,
            killed: false
          };
        };
        const handlePromiseOnce = (0, onetime__WEBPACK_IMPORTED_MODULE_7__["default"])(handlePromise);
        (0, _lib_stream_js__WEBPACK_IMPORTED_MODULE_11__.handleInput)(spawned, parsed.options.input);
        spawned.all = (0, _lib_stream_js__WEBPACK_IMPORTED_MODULE_11__.makeAllStream)(spawned, parsed.options);
        return (0, _lib_promise_js__WEBPACK_IMPORTED_MODULE_12__.mergePromise)(spawned, handlePromiseOnce);
      }
      function execaSync(file, args, options) {
        const parsed = handleArguments(file, args, options);
        const command = (0, _lib_command_js__WEBPACK_IMPORTED_MODULE_13__.joinCommand)(file, args);
        const escapedCommand = (0, _lib_command_js__WEBPACK_IMPORTED_MODULE_13__.getEscapedCommand)(file, args);
        (0, _lib_stream_js__WEBPACK_IMPORTED_MODULE_11__.validateInputSync)(parsed.options);
        let result;
        try {
          result = node_child_process__WEBPACK_IMPORTED_MODULE_2__.spawnSync(parsed.file, parsed.args, parsed.options);
        } catch (error) {
          throw (0, _lib_error_js__WEBPACK_IMPORTED_MODULE_8__.makeError)({
            error,
            stdout: "",
            stderr: "",
            all: "",
            command,
            escapedCommand,
            parsed,
            timedOut: false,
            isCanceled: false,
            killed: false
          });
        }
        const stdout = handleOutput(parsed.options, result.stdout, result.error);
        const stderr = handleOutput(parsed.options, result.stderr, result.error);
        if (result.error || result.status !== 0 || result.signal !== null) {
          const error = (0, _lib_error_js__WEBPACK_IMPORTED_MODULE_8__.makeError)({
            stdout,
            stderr,
            error: result.error,
            signal: result.signal,
            exitCode: result.status,
            command,
            escapedCommand,
            parsed,
            timedOut: result.error && result.error.code === "ETIMEDOUT",
            isCanceled: false,
            killed: result.signal !== null
          });
          if (!parsed.options.reject) {
            return error;
          }
          throw error;
        }
        return {
          command,
          escapedCommand,
          exitCode: 0,
          stdout,
          stderr,
          failed: false,
          timedOut: false,
          isCanceled: false,
          killed: false
        };
      }
      function execaCommand(command, options) {
        const [file, ...args] = (0, _lib_command_js__WEBPACK_IMPORTED_MODULE_13__.parseCommand)(command);
        return execa2(file, args, options);
      }
      function execaCommandSync(command, options) {
        const [file, ...args] = (0, _lib_command_js__WEBPACK_IMPORTED_MODULE_13__.parseCommand)(command);
        return execaSync(file, args, options);
      }
      function execaNode(scriptPath, args, options = {}) {
        if (args && !Array.isArray(args) && typeof args === "object") {
          options = args;
          args = [];
        }
        const stdio = (0, _lib_stdio_js__WEBPACK_IMPORTED_MODULE_9__.normalizeStdioNode)(options);
        const defaultExecArgv = node_process__WEBPACK_IMPORTED_MODULE_3__.execArgv.filter((arg) => !arg.startsWith("--inspect"));
        const {
          nodePath = node_process__WEBPACK_IMPORTED_MODULE_3__.execPath,
          nodeOptions = defaultExecArgv
        } = options;
        return execa2(nodePath, [
          ...nodeOptions,
          scriptPath,
          ...Array.isArray(args) ? args : []
        ], __spreadProps(__spreadValues({}, options), {
          stdin: void 0,
          stdout: void 0,
          stderr: void 0,
          stdio,
          shell: false
        }));
      }
    })();
    module.exports = __webpack_exports__;
  })();
})(execa);
(async () => {
  await execa.exports.execa("echo", ["unicorns"]);
})();
if (require$$8.release().startsWith("6.1"))
  electron.app.disableHardwareAcceleration();
if (process.platform === "win32")
  electron.app.setAppUserModelId(electron.app.getName());
if (!electron.app.requestSingleInstanceLock()) {
  electron.app.quit();
  process.exit(0);
}
let win = null;
async function createWindow() {
  win = new electron.BrowserWindow({
    width: 1800,
    height: 1e3,
    title: "Main window",
    webPreferences: {
      preload: require$$1.join(__dirname, "../preload/index.cjs")
    }
  });
  if (electron.app.isPackaged) {
    win.loadFile(require$$1.join(__dirname, "../renderer/index.html"));
  } else {
    const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}`;
    win.loadURL(url);
  }
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", new Date().toLocaleString());
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:"))
      electron.shell.openExternal(url);
    return { action: "deny" };
  });
}
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin")
    electron.app.quit();
});
electron.app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized())
      win.restore();
    win.focus();
  }
});
electron.app.on("activate", () => {
  const allWindows = electron.BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
//# sourceMappingURL=index.cjs.map
