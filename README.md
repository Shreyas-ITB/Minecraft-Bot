# MinecraftBot
A minecraft bot that can mine blocks, protect you and guard your house made with [mineflayer](https://github.com/PrismarineJS/mineflayer).

## Node module credits:

[mineflayer](https://github.com/PrismarineJS/mineflayer)

[PrismarineViewer](https://github.com/PrismarineJS/prismarine-viewer)

[pvp package](https://github.com/PrismarineJS/mineflayer-pvp)

[mineflayer-pathfinder](https://github.com/PrismarineJS/mineflayer-pathfinder)

[mineflayer-auto-eat](https://github.com/link-discord/mineflayer-auto-eat)

[mineflayer-armour-manager](https://github.com/PrismarineJS/MineflayerArmorManager)

[mineflayer-autototem](https://www.npmjs.com/package/mineflayer-auto-totem)

[mineflayer-navigate](https://github.com/PrismarineJS/mineflayer-navigate)

[mineflayer-mother](https://github.com/MakkusuOtaku/mineflayer-mother)

[mineflayer-collectblock](https://github.com/PrismarineJS/mineflayer-collectblock)

## Available Commands:

There are no Command prefixes for the command so that you can just chat with the bot like a normal user

`help = Shows this command`

`guard = guards your location where you are standing`

`fight me = Fights you, PVPs you`

`stop = Stopps all current processes`

`eat = Eats food if the food bar is low`

`openinv = Returns every item the bot currently has`

`drop <ITEMNAME> = drops the item that you mentioned if the bot has it`

`status = Returns health level and food level`

`collect <BLOCK NAME> = Mines that block`

`equip = Equips the armour grades and swords if its not equipped already`

`sleep = Finds the nearby bed and sleeps`

`wakeup = Wakes up from the bed`

`mount = Mounts to the nearby mob or vehicle`

`unmount = Unmounts from the vehicle`

`comehere = Navigates to your current location if you are nearby`

`equiptotem = Equips totem of undying if it has one`

`totemcount = Returns the number of totems the bot has in its inventory`

`go to <X Y Z> = Goes to the given location`

`follow <PLAYERNAME> = Follows the mentioned player`

`enable guardmode = Enables guardmode, spawns bodyguards to protect you`

`disable guardmode = Disables guardmode = despawns bodyguards and stops protecting you`


## Bot Setup

To run the bot you just need to follow the below steps

NOTE: You need to have [NodeJS](https://nodejs.org) 14x or newer version of nodeJS installed

Step 1: Git clone or just download the zip file of this repository.
        Extract the zip file and cd into the extracted directory.

Step 2: Once you are in the extracted directory type this command `npm install` and hit enter.
        This will take some time as it is installing the required node modules and libraries.

Step 3: Create a copy of example.env file and rename the file as .env (THE FILE SHOULD BE IN THE      FOLDER WHERE `index.js` IS LOCATED).
        Read the .env file carefully and fill in the data according to your prefrence.

Step 4: Run the bot by using the command `npm start` and the bot should now join the server..
