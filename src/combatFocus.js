Hooks.on('init', () => {
    game.settings.register("Next-Up", "combatPan", {
        name: 'Pan To Combatant',
        hint: 'Auto focuses to the current combatant ',
        scope: 'world',
        type: Boolean,
        default: true,
        config: true,
    });
    game.settings.register("Next-Up", "combatFocusPostion", {
        name: 'Sheet Position',
        hint: 'Postion Of The Opened Character Sheet',
        scope: 'world',
        type: String,
        choices: {
            "0": "Disable opening character sheet",
            "1": "Top Left",
            "2": "Top Right",
        },
        default: "0",
        config: true,
    });
    game.settings.register("Next-Up", "combatFocusType", {
        name: 'Which Actor Sheet Types To Open',
        hint: 'Which actor types should be opened',
        scope: 'world',
        type: String,
        choices: {
            "0": "All",
            "1": "Only Unlinked",
            "2": "All Non-Owned",
        },
        default: "0",
        config: true,
    });
    game.settings.register("Next-Up", "closewhich", {
        name: 'Which Combatant Sheets To Close',
        scope: 'world',
        type: String,
        choices: {
            "0": "None",
            "1": "Previous Combatant",
            "2": "All",
        },
        default: "0",
        config: true,
    });
    game.settings.register("Next-Up", "closetype", {
        name: 'Which Actor Sheet Types To Close',
        scope: 'world',
        type: String,
        choices: {
            "0": "Unlinked Only",
            "1": "Linked Only",
            "2": "All",
        },
        default: "0",
        config: true,
    });
    game.settings.register("Next-Up", "playerPan", {
        name: 'Pan Players to Combatant',
        scope: 'world', // could be client scope too
        type: Boolean,
        default: false,
        config: true,
    });
    game.settings.register("Next-Up", "removePin", {
        name: 'Remove Pin Icon From Character Sheets',
        scope: 'world',
        type: Boolean,
        default: false,
        config: true,
    });
})

Hooks.on("renderActorSheet", (app, html, data) => {
    if (game.settings.get('Next-Up', 'removePin')) return;

    let title = html.find('.window-title');
    let buttons = `
<button id="nextup-pin" class="nextup-button" title="Pin Actor Sheet" style="height:30px;width:30px">
        <i id="nextup-pin-icon" style="color: white" class="fas fa-thumbtack"></i>
        </button>`;
    title.prepend(buttons);

    if (app.pinned === true) title.find("#nextup-pin #nextup-pin-icon").css('color', 'darkred');

    title.find("#nextup-pin").click(async (ev) => {
        if (app.pinned === true) {
            app.pinned = false
            title.find("#nextup-pin #nextup-pin-icon").css('color', 'white');
        }
        else {
            app.pinned = true
            title.find("#nextup-pin #nextup-pin-icon").css('color', 'darkred');
        }

    })
});

let delay = 5;
if (typeof ForgeVTT !== 'undefined') delay = 15;

Hooks.on("updateCombat", async (combat, changed, options, userId) => {

    if (!("turn" in changed) && changed.round !== 1) return;
    if (game.combats.get(combat.id).data.combatants.length == 0) return;

    const combatFocusPostion = game.settings.get('Next-Up', 'combatFocusPostion');
    const combatFocusPan = game.settings.get('Next-Up', 'combatPan');
    const closeWhich = game.settings.get('Next-Up', 'closewhich');
    const closeType = game.settings.get('Next-Up', 'closetype');
    const combatFocusType = game.settings.get('Next-Up', 'combatFocusType');
    const playerPan = game.settings.get('Next-Up', 'playerPan');
    let currentWindows = Object.values(ui.windows);

    let nextTurn = combat.turns[changed.turn];
    if (changed.turn === undefined) nextTurn = combat.turns[0]
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



    await sleep(delay);
    const firstGm = game.users.find((u) => u.isGM && u.active);
    if (firstGm && game.user === firstGm) {

        await currentToken.control();
        if (combatFocusPan) canvas.animatePan({ x: currentToken.center.x, y: currentToken.center.y, duration: 250 });

        if (combatFocusPostion !== "0") {
            let currentSheet = currentWindows.filter(i => i.token?.id === currentToken.id);
            let sheet;
            if (currentSheet.length === 0)
                switch (combatFocusType) {
                    case "0": sheet = await currentToken.actor.sheet.render(true);
                        break;
                    case "1": {
                        if (currentToken.data.actorLink === false) sheet = await currentToken.actor.sheet.render(true);
                        else sheet = false;
                    }
                        break;
                    case "2": {
                        if (currentToken.actor.hasPlayerOwner === false) sheet = await currentToken.actor.sheet.render(true);
                        else sheet = false;
                    }
                        break;
                }
            else sheet = currentSheet[0];
            await sleep(delay)
            if (sheet) {
                let rightPos = window.innerWidth - sheet.position.width - 310;

                await sleep(10);
                let sheetPinned = sheet.pinned === true ? true : false;
                switch (combatFocusPostion) {
                    case "1": if (!sheetPinned) sheet.setPosition({ left: 107, top: 46 });
                        break;
                    case "2": if (!sheetPinned) sheet.setPosition({ left: rightPos, top: 46 });
                }
            }
        }

        switch (closeWhich) {
            case "0": break;
            case "1": {
                let window = (currentWindows.find(i => i.actor?.token?.id === previousToken.id) || currentWindows.find(i => i.actor?.id === previousToken.actor.id));
                if (window) CloseSheet(previousToken.actor.data.token.actorLink, window)
            }
                break;
            case "2": for (let window of currentWindows) if (window.actor && window.actor.id !== currentToken.actor.id) CloseSheet(window.actor.data.token.actorLink, window)
        }
    }

    if (!game.user.isGM && playerPan && combatFocusPan && currentToken.isVisible) {
        canvas.animatePan({ x: currentToken.center.x, y: currentToken.center.y, duration: 250 });
    }

    async function CloseSheet(link, sheet) {
        let sheetPinned = sheet.pinned === true ? true : false
        if (link && (closeType === "1" || closeType === "2") && !sheetPinned) sheet.close()
        if (!link && (closeType === "0" || closeType === "2") && !sheetPinned) sheet.close()
    }

    async function sleep(millis) {
        return new Promise(r => setTimeout(r, millis));
    }

});
