module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node":true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    },
    "ecmaFeatures": {
        "arrowFunctions": true,
        "blockBindings": true,
        "classes": true,
        "defaultParameters": true,
        "destructuring": true,
        "forOf": true,
        "generators": true,
        "modules": true,
        "objectLiteralComputedProperties": true,
        "objectLiteralDuplicateProperties": true,
        "objectLiteralShorthandMethods": true,
        "objectLiteralShorthandProperties": true,
        "regexUFlag": true,
        "regexYFlag": true,
        "restParams": true,
        "spread": true,
        "superInFunctions": true,
        "templateStrings": true,
        "unicodeCodePointEscapes": true,
        "globalReturn": true
      }
};