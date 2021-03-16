
import ImagePicker from "./ImagePicker.js";

Hooks.on('init', () => {
    game.settings.register("Next-Up", "combatFocusPostion", {
        name: 'Sheet Position',
        hint: 'Enable opening of character sheets and choose its position',
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
        name: 'Sheets to Open',
        hint: 'Which actor types should be automatically opened',
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
    game.settings.register("Next-Up", "closetype", {
        name: 'Sheets to Close',
        hint: 'Which actor types should be automatically closed',
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
    game.settings.register("Next-Up", "closewhich", {
        name: 'Combatant Sheets to Close',
        hint: 'Which combatants sheets should be automatically closed',
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

    game.settings.register("Next-Up", "popout", {
        name: 'Popout Actor Sheets',
        hint: "Pops out the actor sheet using the `Popout` module",
        scope: 'world',
        type: Boolean,
        default: false,
        config: true,
        onChange: () => {
            if (!game.modules.get("popout").active) ui.notifications.error("The popout feature of Next-Up depends on the Popout module please enable this module before continuing")
        }
    });
    game.settings.register("Next-Up", "playerPanEnable", {
        name: 'Enable Panning For Individual Clients',
        hint: "Enables clients to pan to tokens they have line of sight too. Requires clients to enable on their side (this includes the GM client)",
        scope: 'world',
        type: Boolean,
        default: false,
        config: true,
    });
    game.settings.register("Next-Up", "playerPan", {
        name: 'Pan To Next Combatant',
        scope: 'client',
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
    game.settings.register("Next-Up", "markerEnable", {
        name: 'Add turn marker',
        scope: 'world',
        type: Boolean,
        default: true,
        config: true,
    });

    game.settings.register("Next-Up", "markerType", {
        name: 'Turn marker icon',
        scope: 'world',
        type: ImagePicker.Image,
        default: "[data] modules/Next-Up/Markers/DoubleSquare.png",
        config: true,
        onChange: () => { window.location.reload() }
    });
    game.settings.register("Next-Up", "animateSpeed", {
        name: 'Animation speed for turn marker',
        hint: "Seconds per full rotation, 0 is no rotation",
        scope: 'world',
        type: Number,
        default: 3,
        config: true,
    });
    game.settings.register("Next-Up", "markerRatio", {
        name: 'Turn Marker Ratio',
        hint: "Ratio compared to token height/width",
        scope: 'world',
        type: Number,
        default: 1,
        config: true,
    });
    game.settings.register("Next-Up", "iconLevel", {
        name: 'Render Icon Above Token',
        hint: "Render the turn marker icon above the token image",
        scope: 'world',
        type: Boolean,
        default: false,
        config: true,
    });
    game.settings.register("Next-Up", "startMarker", {
        name: 'Start-Turn Marker',
        hint: "Adds an icon indicate a tokens start position",
        scope: 'world',
        type: String,
        choices: {
            "0": "None",
            "1": "Shadow",
            "2": "Icon",
        },
        default: false,
        config: true,
    });
    game.settings.register("Next-Up", "startMarkerImage", {
        name: 'Start-Turn Marker Icon',
        scope: 'world',
        type: ImagePicker.Image,
        default: "[data] modules/Next-Up/Markers/BlackCross.png",
        config: true,
        onChange: () => { window.location.reload() }
    });
    game.settings.register("Next-Up", "startMarkerRatio", {
        name: 'Start Marker Ratio',
        hint: "Ratio compared to token height/width for icon type marker",
        scope: 'world',
        type: Number,
        default: 1,
        config: true,
    });

})
let NUtweeningToken;
let NUmarkedTokenId;
let NUMarkerImage;


/**
 * Remove  tween and remove the sprite
 */
Hooks.on("canvasInit", async (newCanvas) => {
    NextUpChangeImage();
    if (NUtweeningToken) {
        NUtweeningToken.kill()
    }
    Hooks.once("canvasPan", () => {
        let combat = game.combats?.find(i => i.data.scene === canvas.scene._id)
        if (combat) {
            let currentToken = canvas.tokens.get(combat.current.tokenId)
            if (currentToken) {
                AddTurnMaker(currentToken, canvas.grid);
            }
        }
    })
})


Hooks.on("deleteCombat", () => {
    if (NUtweeningToken) {
        NUtweeningToken.kill()
        let markedToken = canvas.tokens.get(NUmarkedTokenId)
        markedToken.children.find(j => j._texture?.isNUMarker).destroy()
    }
    let shadows = canvas.tiles.children.filter(i => i.isShadow)
    shadows.forEach(s => s.destroy())
})

/**
 * Remove tween 
 */
Hooks.on("preDeleteToken", (scene, token) => {
    let removeToken = canvas.tokens.get(token._id)
    TweenMax.killTweensOf(removeToken?.children[0]);
})

/**
 * Add pin to actor sheet bar and restyle
 */
Hooks.on("renderActorSheet", (app, html, _data) => {
    if (game.settings.get('Next-Up', 'removePin')) return;

    const title = html.find('.window-title');

    title.prepend(pinButton);
    _restyleButton(html, app.pinned)

    title.find("#nextup-pin").click(async (_event) => {
        app.pinned = !app.pinned
        _restyleButton(title, app.pinned)
    })
});


/**
 * Main logic to close/open actor sheets and add Turn Marker sprite with animation
 */
Hooks.on("updateCombat", async (combat, changed, options, userId) => {
    if (!combat.started) return;
    if (!("turn" in changed) && changed.round !== 1) return;
    if (game.combats.get(combat.id).data.combatants.length == 0) return;

    const combatFocusPostion = game.settings.get('Next-Up', 'combatFocusPostion');
    const playerPanEnable = game.settings.get('Next-Up', 'playerPanEnable');
    const playerPan = game.settings.get('Next-Up', 'playerPan');
    const closeWhich = game.settings.get('Next-Up', 'closewhich');
    const closeType = game.settings.get('Next-Up', 'closetype');
    const combatFocusType = game.settings.get('Next-Up', 'combatFocusType');
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
    if (NUtweeningToken) {
        NUtweeningToken.kill()
    }
    let markedToken = canvas.tokens.get(NUmarkedTokenId)
    if (markedToken) {
        let sprite = markedToken.children.filter(i => i._texture?.isNUMarker)
        if (sprite) sprite.forEach(i => i.destroy())
    }
    if (!currentToken.actor) {
        return;
    }

    const firstGm = game.users.find((u) => u.isGM && u.active);
    if (firstGm && game.user === firstGm) {

        await currentToken.control();

        if (combatFocusPostion !== "0") {
            let currentSheet = currentWindows.filter(i => i.token?.id === currentToken.id);
            let sheet;
            if (currentSheet.length === 0)
                switch (combatFocusType) {
                    case "0": sheet = await currentToken.actor.sheet.render(true);
                        break;
                    case "1": {
                        if (currentToken.data.actorLink === false) sheet = await currentToken.actor.sheet.render(true, { token: currentToken.actor.token });
                        else sheet = false;
                    }
                        break;
                    case "2": {
                        if (currentToken.actor.hasPlayerOwner === false) sheet = await currentToken.actor.sheet.render(true, { token: currentToken.actor.token });
                        else sheet = false;
                    }
                        break;
                }
            else sheet = currentSheet[0];

            Hooks.once("renderActorSheet", async (sheet) => {
                let rightPos = window.innerWidth - sheet.position.width - 310;
                let sheetPinned = sheet.pinned === true ? true : false;
                switch (combatFocusPostion) {
                    case "1": if (!sheetPinned) await sheet.setPosition({ left: 107, top: 46 });
                        break;
                    case "2": if (!sheetPinned) await sheet.setPosition({ left: rightPos, top: 46 });
                }
                if (game.settings.get("Next-Up", "popout")) {
                    await PopoutModule.singleton.onPopoutClicked("1", sheet)
                }
            });


        }

        switch (closeWhich) {
            case "0": break;
            case "1": {
                let window = (currentWindows.find(i => i.actor?.token?.id === previousToken.id) || currentWindows.find(i => i.actor?.id === previousToken.actor.id));
                if (window) CloseSheet(previousToken.actor.data.token.actorLink, window)
            }
                break;
            case "2": for (let window of currentWindows) {
                switch (currentToken.actor.data.token.actorLink) {
                    case true: if (window.actor && window.actor.id !== currentToken.actor.id) CloseSheet(window.actor.data.token.actorLink, window)
                        break;
                    case false:
                        if (window.actor && window.token.id !== currentToken.actor.token.id) CloseSheet(window.actor.data.token.actorLink, window)
                        break;
                }
            }
        }
    }
    let shadows = canvas.tiles.children.filter(i => i.isShadow)
    shadows.forEach(s => s.destroy())
    if (playerPanEnable && playerPan && (currentToken.isVisible || game.user === firstGm)) {
        canvas.animatePan({ x: currentToken.center.x, y: currentToken.center.y, duration: 250 });
    }
    if (game.settings.get("Next-Up", "markerEnable")) {
        AddTurnMaker(currentToken, canvas.grid)
    }

    async function CloseSheet(link, sheet) {
        if (sheet.pinned) return;
        if (link && (closeType === "1" || closeType === "2")) sheet.close()
        if (!link && (closeType === "0" || closeType === "2")) sheet.close()
    }

});

/**
 * Remove all sprites and tweens of old image style
 * Update marker image to new choice
 * Add new sprite to current combatant
 */
async function NextUpChangeImage() {
    canvas.tokens.placeables.forEach(i => {
        NUtweeningToken.kill()
        let marker = i.children.filter(j => j._texture?.isNUMarker)
        if (marker) marker.forEach(i => i.destroy())
    })
    NUMarkerImage = await game.settings.get("Next-Up", "markerType")
    NUMarkerImage = NUMarkerImage.substring(7)
    let combat = game.combats?.find(i => i.data.scene === canvas.scene._id)
    if (combat) {
        let currentToken = canvas.tokens.get(combat.current.tokenId)
        if (currentToken) {
            AddTurnMaker(currentToken, canvas.grid);
        }
    }
}

/**
 * Html for pin button
 */
const pinButton = `
<button id="nextup-pin" class="nextup-button" title="Pin Actor Sheet" style="height:30px;width:30px">
    <i id="nextup-pin-icon" style="color: white" class="fas fa-thumbtack"></i>
</button>`;

/**
 * Change Pin color 
 * @param {title bar} title 
 * @param {variable} isPinned 
 */
function _restyleButton(title, isPinned) {
    const color = isPinned ? 'darkred' : 'white';
    title.find("#nextup-pin #nextup-pin-icon").css('color', color);
}
/**
 * Add turn marker to passed token, animate if necessary
 * @param {Token} token 
 * @param {Number} grid canvas.grid 
 */
async function AddTurnMaker(token, grid) {
    const markerRatio = token.actor.getFlag("Next-Up", "markerRatio") || game.settings.get("Next-Up", "markerRatio")
    const markerImage = token.actor.getFlag("Next-Up", "markerImage") || NUMarkerImage
    let markerTexture = await loadTexture(markerImage)
    const textureSize = await grid.size * token.data.height
    const animationSpeed = game.settings.get("Next-Up", "animateSpeed")
    markerTexture.orig = { height: textureSize * markerRatio, width: textureSize * markerRatio, x: (textureSize * markerRatio) / 2, y: (textureSize * markerRatio) / 2 }
    // Add non-existent property
    markerTexture.isNUMarker = true
    let sprite = new PIXI.Sprite(markerTexture)
    if (animationSpeed > 0) sprite.anchor.set(0.5)
    let markerToken = token.addChild(sprite)
    token.sortableChildren = true
    if (game.settings.get("Next-Up", "iconLevel") === false) {
        markerToken.zIndex = -1
    }
    NUmarkedTokenId = token.data._id;

    if (animationSpeed !== 0) {
        NUtweeningToken = TweenMax.to(markerToken, animationSpeed, { angle: 360, repeat: -1, ease: Linear.easeNone });
        markerToken.transform.position = { x: grid.w * token.data.width / 2, y: grid.h * token.data.height / 2 };
    }
    else markerToken.transform.position.set((textureSize - (textureSize * markerRatio)) / 2)

    DropStartMarker(token, grid)
}

async function DropStartMarker(token, grid) {
    switch (game.settings.get("Next-Up", "startMarker")) {
        case "0":
            break;
        case "1": {
            if (token.data.hidden && !game.user.isGM) return;
            let markerTexture = await loadTexture(token.data.img)
            const textureSize = grid.size * token.data.height * token.data.scale
            const offset = (textureSize - (grid.size * token.data.height)) / 2
            let sprite = new PIXI.Sprite(markerTexture)
            sprite.height = textureSize
            sprite.width = textureSize
            let startMarker = canvas.tiles.addChild(sprite)
            startMarker.transform.position.set(token.data.x - offset, token.data.y - offset)
            startMarker.isShadow = true
            startMarker.tint = 9410203
            startMarker.alpha = 0.7
        }
            break;
        case "2": {
            let ratio = token.actor.getFlag("Next-Up", "startMarkerRatio") || game.settings.get("Next-Up", "startMarkerRatio")
            let NUStartImage = await game.settings.get("Next-Up", "startMarkerImage")
            let startImage = token.actor.getFlag("Next-Up", "startMarkerImage") || NUStartImage.substring(7)
            let startMarkerTexture = await loadTexture(startImage)
            const textureSize = grid.size * token.data.height * ratio
            const offset = (textureSize - (grid.size * token.data.height)) / 2
            let sprite = new PIXI.Sprite(startMarkerTexture)
            sprite.height = textureSize
            sprite.width = textureSize
            let startMarker = canvas.tiles.addChild(sprite)
            startMarker.transform.position.set(token.data.x - offset, token.data.y - offset)
            startMarker.isShadow = true
            startMarker.alpha = 0.7
        }
    }
}