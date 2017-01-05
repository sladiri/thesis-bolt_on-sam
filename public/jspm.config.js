SystemJS.config({
  paths: {
    "npm:": "jspm_packages/npm/",
    "bolt_on-sam/": "src/"
  },
  browserConfig: {
    "baseURL": "/public"
  },
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.17"
    }
  },
  transpiler: "plugin-babel",
  packages: {
    "bolt_on-sam": {
      "main": "client/boundary/index.js",
      "format": "esm",
      "meta": {
        "*.js": {
          "loader": "plugin-babel",
          "babelOptions": {
            "es2015": false,
            "stage3": false,
            "stage2": false,
            "stage1": false,
            "plugins": [
              "babel-plugin-syntax-trailing-function-commas",
              "babel-plugin-transform-async-generator-functions",
              "babel-plugin-transform-async-to-generator",
              "babel-plugin-transform-do-expressions",
              "babel-plugin-transform-function-bind",
              "babel-plugin-transform-object-rest-spread"
            ]
          }
        }
      }
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json"
  ],
  map: {
    "ajv": "npm:ajv@5.0.0-beta.1",
    "assert": "npm:jspm-nodelibs-assert@0.2.0",
    "babel-plugin-syntax-trailing-function-commas": "npm:babel-plugin-syntax-trailing-function-commas@6.20.0",
    "babel-plugin-transform-async-generator-functions": "npm:babel-plugin-transform-async-generator-functions@6.17.0",
    "babel-plugin-transform-async-to-generator": "npm:babel-plugin-transform-async-to-generator@6.16.0",
    "babel-plugin-transform-do-expressions": "npm:babel-plugin-transform-do-expressions@6.8.0",
    "babel-plugin-transform-es2015-modules-commonjs": "npm:babel-plugin-transform-es2015-modules-commonjs@6.18.0",
    "babel-plugin-transform-function-bind": "npm:babel-plugin-transform-function-bind@6.8.0",
    "babel-plugin-transform-object-rest-spread": "npm:babel-plugin-transform-object-rest-spread@6.20.2",
    "bluebird": "npm:bluebird@3.4.6",
    "buffer": "npm:jspm-nodelibs-buffer@0.2.1",
    "constants": "npm:jspm-nodelibs-constants@0.2.0",
    "core-js": "npm:core-js@2.4.1",
    "crypto": "npm:jspm-nodelibs-crypto@0.2.0",
    "debug": "npm:debug@2.3.3",
    "events": "npm:jspm-nodelibs-events@0.2.0",
    "fs": "npm:jspm-nodelibs-fs@0.2.0",
    "inferno": "npm:inferno@0.7.27",
    "inferno-dom": "npm:inferno-dom@0.7.27",
    "inferno-hyperscript": "npm:inferno-hyperscript@2.0.3",
    "module": "npm:jspm-nodelibs-module@0.2.0",
    "os": "npm:jspm-nodelibs-os@0.2.0",
    "path": "npm:jspm-nodelibs-path@0.2.1",
    "postal": "npm:postal@2.0.5",
    "process": "npm:jspm-nodelibs-process@0.2.0",
    "ramda": "npm:ramda@0.23.0",
    "rxjs": "npm:rxjs@5.0.2",
    "stream": "npm:jspm-nodelibs-stream@0.2.0",
    "string_decoder": "npm:jspm-nodelibs-string_decoder@0.2.0",
    "url": "npm:jspm-nodelibs-url@0.2.0",
    "util": "npm:jspm-nodelibs-util@0.2.1",
    "vm": "npm:jspm-nodelibs-vm@0.2.0"
  },
  packages: {
    "npm:babel-plugin-transform-es2015-modules-commonjs@6.18.0": {
      "map": {
        "babel-types": "npm:babel-types@6.20.0",
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "babel-plugin-transform-strict-mode": "npm:babel-plugin-transform-strict-mode@6.18.0",
        "babel-template": "npm:babel-template@6.16.0"
      }
    },
    "npm:babel-plugin-transform-async-generator-functions@6.17.0": {
      "map": {
        "babel-helper-remap-async-to-generator": "npm:babel-helper-remap-async-to-generator@6.20.3",
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "babel-plugin-syntax-async-generators": "npm:babel-plugin-syntax-async-generators@6.13.0"
      }
    },
    "npm:babel-plugin-transform-async-to-generator@6.16.0": {
      "map": {
        "babel-helper-remap-async-to-generator": "npm:babel-helper-remap-async-to-generator@6.20.3",
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "babel-plugin-syntax-async-functions": "npm:babel-plugin-syntax-async-functions@6.13.0"
      }
    },
    "npm:babel-plugin-transform-function-bind@6.8.0": {
      "map": {
        "babel-plugin-syntax-function-bind": "npm:babel-plugin-syntax-function-bind@6.13.0",
        "babel-runtime": "npm:babel-runtime@6.20.0"
      }
    },
    "npm:babel-plugin-transform-do-expressions@6.8.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "babel-plugin-syntax-do-expressions": "npm:babel-plugin-syntax-do-expressions@6.13.0"
      }
    },
    "npm:babel-plugin-transform-object-rest-spread@6.20.2": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "babel-plugin-syntax-object-rest-spread": "npm:babel-plugin-syntax-object-rest-spread@6.13.0"
      }
    },
    "npm:babel-template@6.16.0": {
      "map": {
        "babel-types": "npm:babel-types@6.20.0",
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "babylon": "npm:babylon@6.14.1",
        "lodash": "npm:lodash@4.17.2",
        "babel-traverse": "npm:babel-traverse@6.20.0"
      }
    },
    "npm:babel-helper-remap-async-to-generator@6.20.3": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "babel-types": "npm:babel-types@6.20.0",
        "babel-template": "npm:babel-template@6.16.0",
        "babel-traverse": "npm:babel-traverse@6.20.0",
        "babel-helper-function-name": "npm:babel-helper-function-name@6.18.0"
      }
    },
    "npm:babel-types@6.20.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "lodash": "npm:lodash@4.17.2",
        "esutils": "npm:esutils@2.0.2",
        "to-fast-properties": "npm:to-fast-properties@1.0.2"
      }
    },
    "npm:babel-plugin-transform-strict-mode@6.18.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "babel-types": "npm:babel-types@6.20.0"
      }
    },
    "npm:babel-runtime@6.20.0": {
      "map": {
        "regenerator-runtime": "npm:regenerator-runtime@0.10.1",
        "core-js": "npm:core-js@2.4.1"
      }
    },
    "npm:babel-traverse@6.20.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "babel-types": "npm:babel-types@6.20.0",
        "babylon": "npm:babylon@6.14.1",
        "lodash": "npm:lodash@4.17.2",
        "babel-messages": "npm:babel-messages@6.8.0",
        "globals": "npm:globals@9.14.0",
        "babel-code-frame": "npm:babel-code-frame@6.20.0",
        "debug": "npm:debug@2.3.3",
        "invariant": "npm:invariant@2.2.2"
      }
    },
    "npm:babel-helper-function-name@6.18.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "babel-types": "npm:babel-types@6.20.0",
        "babel-template": "npm:babel-template@6.16.0",
        "babel-traverse": "npm:babel-traverse@6.20.0",
        "babel-helper-get-function-arity": "npm:babel-helper-get-function-arity@6.18.0"
      }
    },
    "npm:babel-code-frame@6.20.0": {
      "map": {
        "esutils": "npm:esutils@2.0.2",
        "js-tokens": "npm:js-tokens@2.0.0",
        "chalk": "npm:chalk@1.1.3"
      }
    },
    "npm:babel-messages@6.8.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.20.0"
      }
    },
    "npm:babel-helper-get-function-arity@6.18.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "babel-types": "npm:babel-types@6.20.0"
      }
    },
    "npm:debug@2.3.3": {
      "map": {
        "ms": "npm:ms@0.7.2"
      }
    },
    "npm:invariant@2.2.2": {
      "map": {
        "loose-envify": "npm:loose-envify@1.3.0"
      }
    },
    "npm:loose-envify@1.3.0": {
      "map": {
        "js-tokens": "npm:js-tokens@2.0.0"
      }
    },
    "npm:chalk@1.1.3": {
      "map": {
        "escape-string-regexp": "npm:escape-string-regexp@1.0.5",
        "has-ansi": "npm:has-ansi@2.0.0",
        "supports-color": "npm:supports-color@2.0.0",
        "ansi-styles": "npm:ansi-styles@2.2.1",
        "strip-ansi": "npm:strip-ansi@3.0.1"
      }
    },
    "npm:jspm-nodelibs-stream@0.2.0": {
      "map": {
        "stream-browserify": "npm:stream-browserify@2.0.1"
      }
    },
    "npm:has-ansi@2.0.0": {
      "map": {
        "ansi-regex": "npm:ansi-regex@2.0.0"
      }
    },
    "npm:strip-ansi@3.0.1": {
      "map": {
        "ansi-regex": "npm:ansi-regex@2.0.0"
      }
    },
    "npm:stream-browserify@2.0.1": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "readable-stream": "npm:readable-stream@2.2.2"
      }
    },
    "npm:readable-stream@2.2.2": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "core-util-is": "npm:core-util-is@1.0.2",
        "string_decoder": "npm:string_decoder@0.10.31",
        "util-deprecate": "npm:util-deprecate@1.0.2",
        "buffer-shims": "npm:buffer-shims@1.0.0",
        "process-nextick-args": "npm:process-nextick-args@1.0.7",
        "isarray": "npm:isarray@1.0.0"
      }
    },
    "npm:jspm-nodelibs-buffer@0.2.1": {
      "map": {
        "buffer": "npm:buffer@4.9.1"
      }
    },
    "npm:buffer@4.9.1": {
      "map": {
        "isarray": "npm:isarray@1.0.0",
        "base64-js": "npm:base64-js@1.2.0",
        "ieee754": "npm:ieee754@1.1.8"
      }
    },
    "npm:jspm-nodelibs-crypto@0.2.0": {
      "map": {
        "crypto-browserify": "npm:crypto-browserify@3.11.0"
      }
    },
    "npm:jspm-nodelibs-os@0.2.0": {
      "map": {
        "os-browserify": "npm:os-browserify@0.2.1"
      }
    },
    "npm:crypto-browserify@3.11.0": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "browserify-sign": "npm:browserify-sign@4.0.0",
        "pbkdf2": "npm:pbkdf2@3.0.9",
        "create-ecdh": "npm:create-ecdh@4.0.0",
        "browserify-cipher": "npm:browserify-cipher@1.0.0",
        "randombytes": "npm:randombytes@2.0.3",
        "public-encrypt": "npm:public-encrypt@4.0.0",
        "diffie-hellman": "npm:diffie-hellman@5.0.2",
        "create-hash": "npm:create-hash@1.1.2",
        "create-hmac": "npm:create-hmac@1.1.4"
      }
    },
    "npm:public-encrypt@4.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2",
        "randombytes": "npm:randombytes@2.0.3",
        "parse-asn1": "npm:parse-asn1@5.0.0",
        "bn.js": "npm:bn.js@4.11.6",
        "browserify-rsa": "npm:browserify-rsa@4.0.1"
      }
    },
    "npm:browserify-sign@4.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "create-hash": "npm:create-hash@1.1.2",
        "create-hmac": "npm:create-hmac@1.1.4",
        "parse-asn1": "npm:parse-asn1@5.0.0",
        "bn.js": "npm:bn.js@4.11.6",
        "browserify-rsa": "npm:browserify-rsa@4.0.1",
        "elliptic": "npm:elliptic@6.3.2"
      }
    },
    "npm:create-hash@1.1.2": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "ripemd160": "npm:ripemd160@1.0.1",
        "cipher-base": "npm:cipher-base@1.0.3",
        "sha.js": "npm:sha.js@2.4.8"
      }
    },
    "npm:diffie-hellman@5.0.2": {
      "map": {
        "randombytes": "npm:randombytes@2.0.3",
        "bn.js": "npm:bn.js@4.11.6",
        "miller-rabin": "npm:miller-rabin@4.0.0"
      }
    },
    "npm:pbkdf2@3.0.9": {
      "map": {
        "create-hmac": "npm:create-hmac@1.1.4"
      }
    },
    "npm:create-hmac@1.1.4": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:browserify-cipher@1.0.0": {
      "map": {
        "browserify-aes": "npm:browserify-aes@1.0.6",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "browserify-des": "npm:browserify-des@1.0.0"
      }
    },
    "npm:create-ecdh@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "elliptic": "npm:elliptic@6.3.2"
      }
    },
    "npm:parse-asn1@5.0.0": {
      "map": {
        "browserify-aes": "npm:browserify-aes@1.0.6",
        "create-hash": "npm:create-hash@1.1.2",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "pbkdf2": "npm:pbkdf2@3.0.9",
        "asn1.js": "npm:asn1.js@4.9.0"
      }
    },
    "npm:evp_bytestokey@1.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:cipher-base@1.0.3": {
      "map": {
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "npm:browserify-rsa@4.0.1": {
      "map": {
        "randombytes": "npm:randombytes@2.0.3",
        "bn.js": "npm:bn.js@4.11.6"
      }
    },
    "npm:browserify-aes@1.0.6": {
      "map": {
        "cipher-base": "npm:cipher-base@1.0.3",
        "create-hash": "npm:create-hash@1.1.2",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "inherits": "npm:inherits@2.0.3",
        "buffer-xor": "npm:buffer-xor@1.0.3"
      }
    },
    "npm:miller-rabin@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "brorand": "npm:brorand@1.0.6"
      }
    },
    "npm:browserify-des@1.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "cipher-base": "npm:cipher-base@1.0.3",
        "des.js": "npm:des.js@1.0.0"
      }
    },
    "npm:sha.js@2.4.8": {
      "map": {
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "npm:elliptic@6.3.2": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "bn.js": "npm:bn.js@4.11.6",
        "brorand": "npm:brorand@1.0.6",
        "hash.js": "npm:hash.js@1.0.3"
      }
    },
    "npm:jspm-nodelibs-string_decoder@0.2.0": {
      "map": {
        "string_decoder-browserify": "npm:string_decoder@0.10.31"
      }
    },
    "npm:des.js@1.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    },
    "npm:asn1.js@4.9.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "inherits": "npm:inherits@2.0.3",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    },
    "npm:hash.js@1.0.3": {
      "map": {
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "npm:ajv@5.0.0-beta.1": {
      "map": {
        "co": "npm:co@4.6.0",
        "json-stable-stringify": "npm:json-stable-stringify@1.0.1"
      }
    },
    "npm:json-stable-stringify@1.0.1": {
      "map": {
        "jsonify": "npm:jsonify@0.0.0"
      }
    },
    "npm:jspm-nodelibs-url@0.2.0": {
      "map": {
        "url-browserify": "npm:url@0.11.0"
      }
    },
    "npm:url@0.11.0": {
      "map": {
        "punycode": "npm:punycode@1.3.2",
        "querystring": "npm:querystring@0.2.0"
      }
    },
    "npm:postal@2.0.5": {
      "map": {
        "lodash": "npm:lodash@4.17.2"
      }
    },
    "npm:inferno-hyperscript@2.0.3": {
      "map": {
        "inferno": "npm:inferno@0.7.27",
        "lodash": "npm:lodash@4.17.2",
        "virtual-dom": "npm:virtual-dom@2.1.1"
      }
    },
    "npm:inferno-dom@0.7.27": {
      "map": {
        "inferno": "npm:inferno@0.7.27"
      }
    },
    "npm:virtual-dom@2.1.1": {
      "map": {
        "error": "npm:error@4.4.0",
        "x-is-array": "npm:x-is-array@0.1.0",
        "browser-split": "npm:browser-split@0.0.1",
        "global": "npm:global@4.3.1",
        "ev-store": "npm:ev-store@7.0.0",
        "next-tick": "npm:next-tick@0.2.2",
        "is-object": "npm:is-object@1.0.1",
        "x-is-string": "npm:x-is-string@0.1.0"
      }
    },
    "npm:error@4.4.0": {
      "map": {
        "camelize": "npm:camelize@1.0.0",
        "string-template": "npm:string-template@0.2.1",
        "xtend": "npm:xtend@4.0.1"
      }
    },
    "npm:global@4.3.1": {
      "map": {
        "min-document": "npm:min-document@2.19.0",
        "node-min-document": "npm:min-document@2.19.0",
        "process": "npm:process@0.5.2"
      }
    },
    "npm:ev-store@7.0.0": {
      "map": {
        "individual": "npm:individual@3.0.0"
      }
    },
    "npm:min-document@2.19.0": {
      "map": {
        "dom-walk": "npm:dom-walk@0.1.1"
      }
    },
    "npm:rxjs@5.0.2": {
      "map": {
        "symbol-observable": "npm:symbol-observable@1.0.4"
      }
    }
  }
});
