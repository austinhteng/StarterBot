/**
 * This strategy is an advanced example of how to customize movements, place blocks, and craft items with the rg-bot package.
 * The Bot will collect coal until it has 100 points-worth of items in its inventory.
 * (Note: Coal_Ore and apples are each worth 1 point.  Why apples you say?  Apples are a possible byproduct from collecting the logs to create new pickaxes.)
 *
 * @param {RGBot} bot
 */
function configureBot(bot) {

    bot.setDebug(true);

    // Find and break chest
    async function gatherChest() {
        await gatherEntity('chest')
    }

    async function breakDoor() {
        await gatherEntity('spruce_door')
        return true;
    }

    // This function will make the Bot chop + pick up a named entity.
    async function gatherEntity(entityName) {

        // Track whether the Bot encountered any issues while chopping.
        // There are so many things around the spawn area that it can
        // simply try to chop a different one
        let skipCurrentEntity = false;
        const countBefore = bot.getInventoryItemQuantity(entityName);

        // Ensure that if the Bot fails to gather the dropped item,
        // it will try collecting another until its inventory reflects one has been picked up
        while (bot.getInventoryItemQuantity(entityName) <= countBefore) {
            const foundEntity = await bot.findBlock(entityName, {maxDistance: 80});
            if (foundEntity) {
                // If the Bot located one, then go chop it
                const success = await bot.findAndDigBlock(entityName, { maxDistance: 80 });
                if (!success) { 
                    // If anything prevents the Bot from breaking the block,
                    // then find the next-closest and try gathering that instead.
                    // skipCurrentEntity = true;
                } else {
                    // skipCurrentEntity = false;
                }
            } else {
                // skipCurrentEntity = false;
                // If the Bot didn't find any nearby,
                // then allow it to wander a bit and look again.
                // This loop makes sure it completes the 'wander' movement.
                // let didWander = false;
                // while (!didWander) {
                //     didWander = await bot.wander();
                // }
            }
        }
    }

    // The bot will announce whenever it collects ore or an apple
    bot.on('playerCollect', async (collector, collected) => {
        const itemName = bot.getEntityName(collected).toLowerCase();
        if (collector.username === bot.mineflayer().username && (itemName.includes('ore') || itemName === 'apple')) {
            bot.chat(`I collected a(n) ${itemName}`);
        }
    });

    // When the Bot spawns, begin the main gathering loop.
    // Before collecting, have the Bot craft pickaxes if it has none.
    bot.on('spawn', async () => {
        bot.chat('Hello, I have arrived!');

        let oreCollected = bot.getInventoryItemQuantity('coal_ore');
        let applesCollected = bot.getInventoryItemQuantity('apple');

        while (true) {
            await gatherChest();
        }

        // Once the Bot has 100 points, announce it in the chat
        bot.chat(`I reached my goal! I have ${oreCollected} coal_ore and ${applesCollected} apples`);
    });

}

exports.configureBot = configureBot;
