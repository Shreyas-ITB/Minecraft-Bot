const mineflayer = require('mineflayer')
require('dotenv').config({path: '../.env'})
const mother = require('./mineflayer-mother').mother;
const armorManager = require('mineflayer-armor-manager')
const autoEat = require('mineflayer-auto-eat')
const autotem = require('mineflayer-autotem')
var offset = 0;
var bots = [];
var target;


function createBot() {
	//Log in as a new bot to the server
	let bot = mineflayer.createBot({
		host: process.env.Server,
		username: `${process.env.GuardBotname}_${bots.length}`,
		version: process.env.MCversion,
		viewDistance: process.env.GuardviewDistance
	});

	bot.id = bots.length;
	bot.direction = Math.PI*2/process.env.GuardCount*bots.length;
	bot.loadPlugin(mother)
	bot.loadPlugin(armorManager)
	bot.loadPlugin(autoEat)
	bot.loadPlugin(autotem)

	//Log errors and kick messages
	bot.on('kicked', (reason, loggedIn) => console.log(reason, loggedIn));
	bot.on('error', err => console.log(err));


	//Do this every time the bot moves
	bot.on('move', ()=>{
		let boss = bot.players[process.env.Ownername];
		//Abort if the boss is not on the server
		if (!boss) return;
		boss = boss.entity;
		//Abort if the boss is not close
		if (!boss) return;

		offset = boss.yaw;
		//Location is where the bot is supposed to be headed
		let location;
		
		if (target) {
			//If there is a target (enemy) to attack, make them the target location
			location = target.position;
		} else {
			//If there is no enemy (no combat), return to or keep staying with boss
			let x = Math.sin(bot.direction+offset)*process.env.guardspace;
			let z = Math.cos(bot.direction+offset)*process.env.guardspace;
			//Set the headed location to your position next to boss
			location = boss.position.offset(x, 0, z);
		}

		//Face the location it is heading
		bot.lookAt(location);
		//If in combat, hit the enemy
		if (target) bot.attack(target);
		//If it is not yet the amount of blocks "process.env.guardspace" away from the location, walk
		if (bot.entity.position.xzDistanceTo(location) > process.env.guardspace) {
			//Sprint forward
			bot.setControlState('forward', true);
			bot.setControlState('sprint', true);
			//Jump in case it is stuck
			bot.setControlState('jump', bot.entity.isCollidedHorizontally);
		}

		function stopPopulating() {
			bot.quit()
		}
	});
	return(bot);
}

function mainChat(username, message) {
	//Ignore messages that are not from the boss
	if (username != process.env.Ownername) return;
	//Boss's command parts as an array, e.g. ["kill, "jeb_"]
	let tokens = message.split(' ');

	switch(tokens[0]) {
		case 'kill':
			bots[0].chat("Received.");
			//Set the target to the nearest entity that has the username by what the boss said
			target = bots[0].nearestEntity((entity)=>{
				return(entity.displayName == tokens[1] || entity.username == tokens[1]);
			});
			console.log(target);
			break;
	}
}

function populate() {
	//Spawn 1 Guard
	bots.push(createBot());
	if (bots.length < process.env.GuardCount) {
		//Wait 10 seconds before doing this once again (10 seconds between each Guard spawn)
		setTimeout(populate, 10000);
	} else {
		//Do this when all bots are spawned
		console.log("Ready!");
		bots[0].on('chat', mainChat);
		//When an entity disappears (quits, dies etc.), and it's the target, remove the target
		bots[0].on('entityGone', (entity)=>{
			if (entity != target) return;
			target = 0;
		});
		//When an entity gets harmed
		bots[0].on('entityHurt', (entity)=>{
			//Ignore if the harmed entity is not the boss
			if (entity.username != process.env.Ownername) return;

			let entities = [];

			for (const id of Object.keys(bots[0].entities)) {
				const entity = bots[0].entities[id];
				if (entity.username != process.env.Ownername && !(entity.username || '').startsWith(process.env.GuardBotname) && entity.type === 'mob') {
					entities.push(entity);
				}
			}

			entities = entities.sort((a, b)=>{
				//Sort by lowest distance to the boss
				return (a.position.xzDistanceTo(entity.position) - b.position.xzDistanceTo(entity.position));
			}).filter((entity)=>{
				if (entity) return entity;
			});

			//Select the entity that hurt the boss, by selecting the nearest entity that is not the boss or another Guard
			//This needs work :/
			if (entities[0]) target = entities[0];
		});
	}
}

function stopPopulating() {
	bots[1].quit()
	bots[0].quit()
	bots[2].quit()
	bots[3].quit()
}

//Begin the Guard populating!
module.exports = {
	populate,
    stopPopulating
}