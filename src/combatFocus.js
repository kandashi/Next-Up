Hooks.on('init', () => {
    game.settings.register("Next-Up", "combatFocus", {
        name: 'Combatant Focus',
        hint: 'Auto focuses to the current combatant in combat and opens their character sheet in the specified position',
        scope: 'world',
        type: String,
        choices: {
            "0": "Off",
            "1": "Top Left",
            "2": "Top Right",
        },
        default: "0",
        config: true,
    });

    game.settings.register("Next-Up", "close-old", {
      name: 'Close old combatant actor sheet',
      hint: 'Close all previous combatants sheet on turn change',
      scope: 'world',
      type: Boolean,
      default: false,
      config: true,
  });
    game.settings.register("Next-Up", "close-all", {
        name: 'Close all actor sheets',
        hint: 'Close all open actor sheet on turn change',
        scope: 'world',
        type: Boolean,
        default: false,
        config: true,
    });

  })
  
  Hooks.on("updateCombat", async (combat, changed, options, userId) => {
  
    if (!("turn" in changed)) {
        return;
    }
  
    const firstGm = game.users.find((u) => u.isGM && u.active);
    if (firstGm && game.user === firstGm) {
  
        if (game.combats.get(combat.id).data.combatants.length == 0) return;
  
  
        const nextTurn = combat.turns[changed.turn];
        const previousTurn = combat.turns[changed.turn - 1 > -1 ? changed.turn - 1 : combat.turns.length - 1]
  
        let nextTokenId = null;
        if (getProperty(nextTurn, "tokenId")) {
            nextTokenId = nextTurn.tokenId;
        }
        else {
            nextTokenId = getProperty(nextTurn, token._id);
        }
  
        let currentToken = canvas.tokens.get(nextTokenId);
        let previousToken = canvas.tokens.get(previousTurn.tokenId)
  
        if (!currentToken.actor) {
            return;
        }
  
        const combatFocus = game.settings.get('Next-Up', 'combatFocus')
        const closeAll = game.settings.get('Next-Up', 'close-all')
        const closeOld = game.settings.get('Next-Up', 'close-old')
        let currentWindows = Object.values(ui.windows)
        if (combatFocus !== "0") {
            await sleep(5)
            await currentToken.control()
            canvas.animatePan({ x: currentToken.center.x, y: currentToken.center.y, duration: 250 });
            let sheet = await currentToken.actor.sheet.render(true)
            let rightPos = window.innerWidth - sheet.position.width - 310;
            await sleep(10);
            if (combatFocus === "1") {
                sheet.setPosition({ left: 107, top: 46 });
                if (closeAll) for (let window of currentWindows) if (window.actor && window.actor.id !== currentToken.actor.id)  window.close(true)
                if(closeOld) await previousToken.actor.sheet.close(true)

            }
            if (combatFocus === "2") {
                sheet.setPosition({ left: rightPos, top: 46 });
                if (closeAll) for (let window of currentWindows) if (window.actor && window.actor.id !== currentToken.actor.id)  window.close(true) 
                if(closeOld) await previousToken.actor.sheet.close(true)
            }
  
            async function sleep(millis) {
                return new Promise(r => setTimeout(r, millis));
            }
        }
    }
  });
