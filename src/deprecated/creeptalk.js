
var CreepTalk = function (opts) {
  this.registerCreepFunctions(opts)
}

CreepTalk.prototype.overrideFunctions = [
  'attack',
  'attackController',
  'build',
  'claimController',
  'dismantle',
  'drop',
  'harvest',
  'heal',
  'move',
  'pickup',
  'rangedAttack',
  'rangedHeal',
  'rangedMassAttack',
  'repair',
  'reserveController',
  'suicide',
  'transfer',
  'upgradeController',
  'signController',
  'withdraw'
]

CreepTalk.prototype.wrapFunction = function (name, originalFunction) {
  return function wrappedFunction() {
    if(!!this.talk) {
      this.talk(name)
    }
    return originalFunction.apply(this, arguments);
  };
}

CreepTalk.prototype.registerCreepFunctions = function (opts) {

  try {
    if(!!opts.language) {
      if(typeof opts.language === 'string') {
        var language_pack = require('creeptalk_' + opts.language)
      } else {
        var language_pack = opts.language
      }
    }
  } catch (err) {
    console.log('Unable to load language pack ' + opts.language)
    return
  }

  for(var function_name of this.overrideFunctions) {
    Creep.prototype[function_name] = this.wrapFunction(function_name, Creep.prototype[function_name])
  }

  Creep.prototype.talk = function (group) {
    try {

      if(!!language_pack[group] && language_pack[group].length > 0) {
        var speech = language_pack[group]
      } else if (!!language_pack['default'] && language_pack['default'].length > 0) {
        var speech = language_pack['default']
      } else {
        var speech = false
      }
      if(!!speech) {
        if(typeof speech === 'string') {
          var string = speech
        } else if(typeof speech === 'function') {
          var string = speech(this)
        } else {
          if(this.memory.CreepTalkLevel === undefined) {
            this.memory.CreepTalktype = 0
            this.memory.CreepTalkLevel = -1
          } 
          if(group !== this.memory.CreepTalktype) {
            this.memory.CreepTalktype = group
            this.memory.CreepTalkLevel = -1
          }
          if(this.memory.CreepTalkLevel > speech.length) {
            this.memory.CreepTalkLevel = -1
          }
        this.memory.CreepTalkLevel = (this.memory.CreepTalkLevel+1)
        if(["move","rangedAttack","attack","rangedMassAttack","attackController"].includes(group)) {
          var string = speech[Math.floor(Math.random()*speech.length)];
        } else {
          var string = speech[this.memory.CreepTalkLevel];
        }
        }
        if(!!string) {
          this.say(string, !!opts.public)
        }
      }
    } catch (err) {console.log(err)}
  }
}

module.exports = function (opts) {
  if(!opts.language) {
    opts.language = require('creeptalk_basic')
  }
  new CreepTalk(opts)
}
