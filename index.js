const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const armorManager = require('mineflayer-armor-manager')
const autoEat = require('mineflayer-auto-eat')
const navigator = require('mineflayer-navigate')(mineflayer);
const collectBlock = require('mineflayer-collectblock').plugin
const autotem = require('mineflayer-autotem')
const mother = require('./custom-modules/mineflayer-mother').mother;
const guard = require('./custom-modules/bodyguards')
require('dotenv').config({path: './.env'})

const bot = mineflayer.createBot({
  host: process.env.Server,
  username: process.env.Botname,
  version: process.env.MCversion
})

bot.loadPlugin(pvp)
bot.loadPlugin(armorManager)
bot.loadPlugin(pathfinder)
bot.loadPlugin(autoEat)
bot.loadPlugin(collectBlock)
bot.loadPlugin(autotem)
bot.loadPlugin(mother);
navigator(bot)
var mcData;


const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: true })
})

bot.on('playerCollect', (collector, itemDrop) => {
  if (collector !== bot.entity) return

  setTimeout(() => {
    const sword = bot.inventory.items().find(item => item.name.includes('sword'))
    if (sword) bot.equip(sword, 'hand')
  }, 150)
})

bot.on('playerCollect', (collector, itemDrop) => {
  if (collector !== bot.entity) return

  setTimeout(() => {
    const shield = bot.inventory.items().find(item => item.name.includes('shield'))
    if (shield) bot.equip(shield, 'off-hand')
  }, 250)
})

bot.on('login', async () => {
})

bot.on('death', () => {
  bot.chat('OMGGGGGGG I got killed by something!!!')
})

let guardPos = null

function goto (x, y, z) {
  const mcData = require('minecraft-data')(bot.version)
  const movements = new Movements(bot, mcData)
  movements.scafoldingBlocks = ['stone', 'cobblestone', 'dirt']
  bot.pathfinder.setMovements(movements)
  if (z) {
    bot.pathfinder.setGoal(new goals.GoalBlock(x, y, z))
  } else {
    bot.pathfinder.setGoal(new goals.GoalXZ(x, y))
  }
}


function guardArea (pos) {
  guardPos = pos.clone()

  if (!bot.pvp.target) {
    moveToGuardPos()
  }
}

function mountNearest() {
  mountable = ['boat', 'minecart', 'horse', 'donkey', 'bed']

  const filter = e => e.name && mountable.includes(e.name)
  const entity = bot.nearestEntity(filter)

  if (entity) {
      bot.mount(entity)
      return true
  }
  return false
}

function stopGuarding () {
  guardPos = null
  bot.pvp.stop()
  bot.pathfinder.setGoal(null)
  bot.pathfinder.stop()
}

async function goToSleep () {
  const bed = bot.findBlock({
    matching: block => bot.isABed(block)
  })
  if (bed) {
    try {
      await bot.sleep(bed)
      bot.chat("I'm sleeping")
    } catch (err) {
      bot.chat(`I can't sleep: ${err.message}`)
    }
  } else {
    bot.chat('No nearby bed')
  }
}

async function wakeUp () {
  try {
    await bot.wake()
  } catch (err) {
    bot.chat(`I can't wake up: ${err.message}`)
  }
}

async function findAndMine(id){
  const block = bot.findBlock({ matching: id, maxDistance: process.env.MaximumDistance})
  if (block){
    const promiseHack = new Promise((res,rej)=>{
      bot.once('goal_reached', (goal) => {
          if (!bot.canDigBlock(block)){
            bot.chat('Unable to find that block around me..')
            }
            bot.dig(block, false)
            bot.once("diggingCompleted",(block)=>{
              bot.chat('Collecting completed.')
              res()
              })
            })
            goto(block.position.x, block.position.y, block.position.z)
        })
        await promiseHack
        bot.chat('Promise completed')
        return
  } else {
    bot.chat('No Such blocks found')
  }
}
bot.on("diggingAborted",(block)=>{
  console.log("diggingAborted")
})
bot.on("diggingCompleted",(block)=>{
  console.log("diggingCompleted")
})

function moveToGuardPos () {
  goto(guardPos.x, guardPos.y, guardPos.z)
}

function equipForCombat(priorizeAxe = false) {
  if (priorizeAxe) {
      const weapon = bot.inventory.items().find(item => item.name.includes('axe'))
      if (weapon) {
          bot.equip(weapon, 'hand')
          return
      }
  }
  const weapon = bot.inventory.items().find(item => item.name.includes('sword'))
  if (weapon) {
      bot.equip(weapon, 'hand')
  }
  bot.armorManager.equipAll()
}

bot.on('stoppedAttacking', () => {
  if (guardPos) {
    moveToGuardPos()
  }
})

bot.on('physicTick', () => {
  if (bot.pvp.target) return
  if (bot.pathfinder.isMoving()) return

  const entity = bot.nearestEntity()
  if (entity) bot.lookAt(entity.position.offset(0, entity.height, 0))
  bot.autotem.equip()
})

bot.on('physicTick', () => {
  if (!guardPos) return

  const filter = e => (e.type === 'mob' || e.type === 'player') && e.position.distanceTo(bot.entity.position) < 10 && e.mobType !== 'Armor Stand' && e !== bot.players[process.env.Ownername].entity

  const entity = bot.nearestEntity(filter)
  if (entity) {
    const sword = bot.inventory.items().find(item => item.name.includes('sword'))
    if (sword) bot.equip(sword, 'hand')
    bot.pvp.attack(entity)
  }
})

function followPlayer(playername) {
  const player = bot.players[playername]

  if (!player || !player.entity) {
      bot.chat(`I can't see ${playername}!`)
      return
  }

  const mcData = require('minecraft-data')(bot.version)
  const movements = new Movements(bot, mcData)
  movements.scafoldingBlocks = ['stone', 'cobblestone', 'dirt']

  bot.pathfinder.setMovements(movements)

  const goal = new goals.GoalFollow(player.entity, 1)
  bot.pathfinder.setGoal(goal, true)
}

bot.on('chat', (username, message) => {
  if (username === process.env.Ownername) {
    if (message.toLowerCase() === 'guard') {
      const player = bot.players[username]

      if (!player) {
        bot.chat("I can't see you.")
        return
      }

      bot.chat('I will guard that location.')
      guardArea(player.entity.position)
    }

    if (message.toLowerCase() === 'fight me') {
      const player = bot.players[username]

      if (!player) {
        bot.chat("I can't see you.")
        return
      }

      bot.chat('Prepare to fight!')
      setTimeout(() => {
        const sword = bot.inventory.items().find(item => item.name.includes('sword'))
        if (sword) bot.equip(sword, 'hand')
      }, 20)
      bot.pvp.attack(player.entity)
    }

    if (message.toLowerCase() === 'stop') {
      bot.chat('Stopped all current proccesses.')
      stopGuarding()
      bot.pvp.stop()
      bot.pathfinder.setGoal(null)

    }

    if (message.toLowerCase() === 'help') {
      bot.chat("Hello! REMEMBER THERE IS NO COMMAND PREFIX FOR ME")
      bot.chat("")
      bot.chat("help = Shows this command")
      bot.chat("guard = guards your location where you are standing")
      bot.chat("fight me = Fights you, PVPs you")
      bot.chat("stop = Stopps all current processes")
      bot.chat("eat = Eats food if the food bar is low")
      bot.chat("openinv = Returns every item the bot currently has")
      bot.chat("drop <ITEMNAME> = drops the item that you mentioned if the bot has it")
      bot.chat("status = Returns health level and food level")
      bot.chat("collect <BLOCK NAME> = Mines that block")
      bot.chat("equip = Equips the armour grades and swords if its not equipped already")
      bot.chat("sleep = Finds the nearby bed and sleeps")
      bot.chat("wakeup = Wakes up from the bed")
      bot.chat("mount = Mounts to the nearby mob or vehicle")
      bot.chat("unmount = Unmounts from the vehicle")
      bot.chat("comehere = Navigates to your current location if you are nearby")
      bot.chat("equiptotem = Equips totem of undying if it has one")
      bot.chat("totemcount = Returns the number of totems the bot has in its inventory")
      bot.chat("go to <X Y Z> = Goes to the given location")
      bot.chat("follow <PLAYERNAME> = Follows the mentioned player")
      bot.chat("enable guardmode = Enables guardmode, spawns bodyguards to protect you")
      bot.chat("disable guardmode = Disables guardmode = despawns bodyguards and stops protecting you")
    }

    if (message.toLowerCase() === 'eat') {
      if (bot.food === 20) {
        bot.chat('My food level is full')
      }
  // Disable the plugin if the bot is at 20 food points
     else {
      setTimeout(() => {
        const fooditem = bot.inventory.items().find(item => item.name.includes(process.env.FoodITEM))
        if (fooditem) {bot.equip(fooditem, 'hand')} {
          bot.consume()
        }
      }, 1000)
    }
    }

    if (message.toLowerCase() === 'openinv') {
      const invArray = bot.inventory.items().map(a => a.name)
      respone = ["I have " + invArray.toString().split(',').join(', ') + '.'].toString()
      bot.chat(respone)
    }

    if (message.toLowerCase().startsWith('drop ')) {
      const itemname = message.split(' ')[1]
      const item = bot.inventory.items().find(item => item.name.toLowerCase().includes(itemname))
        if (item) {
          bot.tossStack(item)
          rep = [`Dropping ${itemname.toLowerCase()}.`].toString()
          bot.chat(rep)
        }
        else {
          res = ['Item not found.'].toString()
          bot.chat(res)
        }
      }

    if (message.toLowerCase() === 'status') {
      response = ['HP: ' + bot.health.toString().split('.')[0] + ' | Food: ' + bot.food.toString().split('.')[0]].toString()
      bot.chat(response)
    }

    if (message.toLowerCase().startsWith('collect ')) {
      const args = message.split(' ')
      const blockIds = mcData.blocksByName[args[1]].id
      findAndMine(blockIds)
      .catch(function(err){
          bot.chat(err.message)
      })
      .then(function(){
          bot.chat('Done')
      });
    }

    if (message.toLowerCase() === 'equip') {
      equipForCombat()
      bot.chat('Equipped all the equipments..')
    }

    if (message.toLowerCase() === 'sleep') {
      goToSleep()
    }

    if (message.toLowerCase() === 'wakeup') {
      wakeUp()
    }

    if (message.toLowerCase() === 'mount') {
      vehicle = mountNearest()
      if (vehicle) {
        bot.chat('I have mounted the vehicle!')
      }
      else {
        bot.chat('There is no nearby vehicle.')
      }
    }

    if (message.toLowerCase() === 'equiptotem') {
      bot.autotem.equip()
      bot.chat('Equipped a Totem-OF-Undying')
    }

    if (message.toLowerCase() === 'totemcount') {
      bot.chat(`I have ${bot.autotem.totemCount()} totems`)
    }

    if (message.toLowerCase() === 'unmount') {
      bot.dismount()
      bot.chat('unmounting vehicle!')
    }

    if (message.toLowerCase() === 'comehere') {
      const usrname = bot.players[username].entity;
      if (usrname == null) return bot.chat("you're too far away");
      var destination = usrname.position.floored();
      bot.chat("Navigating to " + destination.toString());
      bot.navigate.to(destination);
    }

    if (message.toLowerCase().startsWith('go to ')) {
      const coords = message.split(' ')
      goto(coords[2], coords[3], coords[4])
    }

    if (message.toLowerCase().startsWith('follow ')) {
      const player = message.split(' ')[1]
      followPlayer(player)
      bot.chat(`Okay following ${player}`)
    }

    if (message.toLowerCase() === 'enable guardmode'){
      bot.chat('Guardmode enabled.. I will be inviting some more bots in order to protect you.')
      //godmode()
      guard.populate()
    }

    if (message.toLowerCase() === 'disable guardmode'){
      bot.chat('Guardmode disabled.. The guard bots will be leaving the server now.. they will appear when you call them back again.')
      //godmode()
      guard.stopPopulating()
    }

  }
})

bot.on('kicked', console.log)
bot.on('error', console.log)