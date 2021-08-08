const debouncedReload = debounce(() => window.location.reload(), 100)
import { libWrapper } from './shim.js';


Hooks.on('init', () => {

    game.settings.register("Next-Up", "combatFocusEnable", {
        name: 'Auto Open Character Sheets',
        hint: 'Enable opening of character sheets',
        scope: 'world',
        type: Boolean,
        default: true,
        config: true,
    });

    game.settings.register("Next-Up", "combatFocusPostion", {
        name: 'Sheet Position',
        hint: 'Position of opened character sheet',
        scope: 'world',
        type: String,
        choices: {
            "0": "Center",
            "1": "Top Left",
            "2": "Top Right",
            "3": "Bottom Left",
            "4": "Bottom Right",
        },
        default: "0",
        config: true,
    });
    game.settings.register("Next-Up", "combatFocusType", {
        name: 'Open Sheets: Actor Type Filter',
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
        name: 'Close Sheets: Actor Type Filter',
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
        name: 'Close Sheets: Combatant Filter',
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
    game.settings.register("Next-Up", "closeOnEnd", {
        name: 'Close Sheets: Combat End',
        hint: 'Close all actor sheets on combat end',
        scope: 'world',
        type: Boolean,
        default: false,
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
        type: String,
        default: "modules/Next-Up/Markers/DoubleSquare.png",
        config: true,
        filePicker: true,
        onChange: debouncedReload,
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
        hint: "How many squares/hexes does the marker extend past the tokens border",
        scope: 'world',
        type: Number,
        default: 0,
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
        type: String,
        default: "modules/Next-Up/Markers/start.png",
        config: true,
        filePicker: true,
        onChange: debouncedReload,
    });
    game.settings.register("Next-Up", "startMarkerRatio", {
        name: 'Start Marker Ratio',
        hint: "Ratio compared to token height/width for icon type marker",
        scope: 'world',
        type: Number,
        default: 1,
        config: true,
    });
    game.settings.register("Next-Up", "controlOption", {
        name: 'Auto Control Next Token',
        scope: 'client',
        type: String,
        choices: {
            "none": "None",
            "npc": "NPCs Only",
            "pc": "PCs only",
            "all": "All"
        },
        default: "All",
        config: true,
    });
    game.settings.register("Next-Up", "clearTargets", {
        name: 'Auto Clear User Targets',
        scope: 'client',
        type: Boolean,
        default: false,
        config: true,
    });
    game.settings.register("Next-Up", "audioCue", {
        name: 'Turn Start Audio Cue',
        scope: 'world',
        type: Boolean,
        default: false,
        config: true
    });
    game.settings.register("Next-Up", "audioPath", {
        name: 'Audio Cue Path',
        scope: 'world',
        type: String,
        default: "",
        config: true,
        filePicker: true,
        onChange: debouncedReload,
    });
    game.settings.register("Next-Up", "audioVolume", {
        name: 'Audio Cue Volume',
        scope: 'client',
        type: String,
        default: "0.5",
        config: true,
        onChange: debouncedReload,
    });
    libWrapper.register('Next-Up', 'TokenLayer.prototype.tearDown', newTearDown, 'WRAPPER')
})

function newTearDown(wrapped, ...args) {

    for (let child of this.placeables) {
        TweenMax.killTweensOf(child.children)
    }
    return wrapped(...args)
}



function newRefresh(wrapped, ...args) {
    TweenMax.killTweensOf(this.children)
    return wrapped(...args)
}


Hooks.once('ready', () => {

    Hooks.on("createCombatant", (combatant) => {
        NextUP.createTurnMarker(combatant.data.tokenId)
    })
    Hooks.on("preDeleteToken", (token) => {
        if (token.actorId === "") return;
        NextUP.clearMarker(token._id)
    })

    Hooks.on("deleteCombat", (combat) => {
        NextUP.clearMarker(combat.current?.tokenId)
        NextUP.clearShadows()
        NextUP.closeAll()
    })

    Hooks.on("deleteCombatant", (combatant) => {
        NextUP.clearMarker(combatant.token.id)
    })

    Hooks.on("updateCombat", NextUP.handleCombatUpdate)

    Hooks.on("preUpdateToken", (token, update) => {
        if ("height" in update || "width" in update || "img" in update) {
            let markerToken = token.object?.children.find(i => i.NUMaker)
            TweenMax.killTweensOf(token.object?.children);
            Hooks.once("updateToken", async (token, update) => {
                await NextUP.createTurnMarker(token.id, canvas.grid);
                if (markerToken.NUMaker) NextUP.AddTurnMaker(token.object, canvas.grid)
            })
        }
    })

    Hooks.on("renderActorSheet", NextUP.addPinButton)
})

Hooks.on("canvasReady", async () => {
    await NextUpChangeImage();
    if (!game.settings.get("Next-Up", "markerEnable")) return;
    let tokens = canvas.tokens.placeables.filter(t => t.inCombat)
    for (let t of tokens) { await NextUP.createTurnMarker(t.data._id) }
    let token = canvas.tokens.get(game.combat?.current?.tokenId)
    if (token) {
        NextUP.AddTurnMaker(token, canvas.grid)
    }
})

Hooks.on("updateCombatant", (combatant) => {
    if(game.system.id !== "swade") return
    let debouncedUpdate = debounce(NextUP.handleCombatUpdate, 50)
    debouncedUpdate(combatant.parent, {turn: 1, round: 2})
})


let NUMarkerImage;

async function NextUpChangeImage() {
    if (!game.settings.get("Next-Up", "markerEnable")) return;
    NUMarkerImage = await game.settings.get("Next-Up", "markerType")
    if (NUMarkerImage === "") return;
}

class NextUP {



    static closeAll() {
        if (!game.settings.get("Next-Up", "closeOnEnd")) return
        const currentWindows = Object.values(ui.windows);

        for (let window of currentWindows) {
            if (window.actor) window.close()
        }
    }

    static async handleCombatUpdate(combat, changed) {

        if (canvas.scene === null) return;
        //if (combat.round === 0 || changed?.round === 0) return;
        if (!("turn" in changed) && changed.round !== 1) return;
        if (game.combats.get(combat.id).data.combatants.length == 0) return;
        const playerPanEnable = game.settings.get('Next-Up', 'playerPanEnable');
        const playerPan = game.settings.get('Next-Up', 'playerPan');
        const nextToken = canvas.tokens.get(combat.current.tokenId)
        const previousToken = canvas.tokens.get(combat.previous.tokenId)
        if (game.settings.get("Next-Up", "markerEnable")) {
            if(game.system.id==="swade"){
                let combatTokens = canvas.tokens.placeables.filter(i => i.inCombat)
                for(let t of combatTokens){
                    NextUP.clearMarker(t.id)
                }
            }
            NextUP.clearMarker(previousToken.id)
            NextUP.AddTurnMaker(nextToken, canvas.grid)
        }
        if (game.settings.get("Next-Up", "startMarker")) {
            NextUP.clearShadows()
        }
        NextUP.cycleSheets(nextToken, previousToken)
        if (playerPanEnable && playerPan && (nextToken.isVisible || game.user === firstGm)) {
            canvas.animatePan({ x: nextToken.center.x, y: nextToken.center.y, duration: 250 });
        }
        if (game.settings.get("Next-Up", "clearTargets")) {
            game.user.updateTokenTargets()
        }
        if (game.settings.get("Next-Up", "audioCue")) {
            if (nextToken.actor?.id === game.user.character?.id) NextUP.audioCue()
        }
    }

    static audioCue() {
        const data = {
            src: game.user.character.getFlag("Next-Up", "audioPath") || game.settings.get("Next-Up", "audioPath"),
            volume: game.settings.get("Next-Up", "audioVolume"),
            autoplay: true,
            loop: false,
        }
        AudioHelper.play(data, false)
    }

    static async cycleSheets(currentToken, previousToken) {
        const combatFocusEnable = game.settings.get("Next-Up", "combatFocusEnable");
        const combatFocusPostion = game.settings.get('Next-Up', 'combatFocusPostion');
        const closeWhich = game.settings.get('Next-Up', 'closewhich');
        const combatFocusType = game.settings.get('Next-Up', 'combatFocusType');
        const autoControl = game.settings.get('Next-Up', 'controlOption');

        switch (autoControl) {
            case "none": break;
            case "npc": if (!currentToken.actor?.hasPlayerOwner) await currentToken.control()
                break;
            case "pc": if (currentToken.hasPlayerOwner) await currentToken.control()
                break;
            case "all": await currentToken.control()
                break;

        }
        if (game.user.isGM) {


            const currentWindows = Object.values(ui.windows);

            let currentSheet = currentWindows.filter(i => i.token?.id === currentToken.id);
            let sheet;
            if (combatFocusEnable) {
                if (currentSheet.length === 0)
                    Hooks.once("renderActorSheet", async (sheet) => {
                        let rightPos = window.innerWidth - sheet.position.width - 310;
                        let topPos = window.innerHeight - sheet.position.height - 80
                        let sheetPinned = sheet.pinned === true ? true : false;
                        switch (combatFocusPostion) {
                            case "0": break;
                            case "1": if (!sheetPinned) await sheet.setPosition({ left: 107, top: 46 });
                                break;
                            case "2": if (!sheetPinned) await sheet.setPosition({ left: rightPos, top: 46 });
                                break;
                            case "3": if (!sheetPinned) await sheet.setPosition({ left: 107, top: topPos });
                                break;
                            case "4": if (!sheetPinned) await sheet.setPosition({ left: rightPos, top: topPos });
                                break;
                        }
                        if (game.settings.get("Next-Up", "popout")) {
                            await PopoutModule.singleton.onPopoutClicked(sheet.object.apps[sheet.appId], sheet);
                        }
                    });
                switch (combatFocusType) {
                    case "0": sheet = await currentToken.actor?.sheet.render(true);
                        break;
                    case "1": {
                        if (currentToken.data.actorLink === false) sheet = await currentToken.actor?.sheet.render(true);
                        else sheet = false;
                    }
                        break;
                    case "2": {
                        if (currentToken.actor?.hasPlayerOwner === false) sheet = await currentToken.actor?.sheet.render(true);
                        else sheet = false;
                    }
                        break;
                }
            }
            else sheet = currentSheet[0];

            switch (closeWhich) {
                case "0": break;
                case "1":
                    let window = currentWindows.find(i => i.actor?.token?.id === previousToken.id) || currentWindows.find(i => i.actor?.id === previousToken.actor?.id);
                    if (window && window.actor) this.CloseSheet(previousToken.actor?.data.token.actorLink, window)
                    break;
                case "2": for (let window of currentWindows) {
                    switch (currentToken.actor?.data.token.actorLink) {
                        case true: if (window.actor && window.actor.id !== currentToken.actor?.id) NextUP.CloseSheet(window.actor.data.token.actorLink, window)
                            break;
                        case false:
                            if (window.actor) this.CloseSheet(window.actor.data.token.actorLink, window)
                            break;
                    }
                }
            }
        }
    }

    static CloseSheet(link, sheet) {
        const closeType = game.settings.get('Next-Up', 'closetype');
        if (sheet.pinned) return;
        if (link && (closeType === "1" || closeType === "2")) sheet.close()
        if (!link && (closeType === "0" || closeType === "2")) sheet.close()
    }

    static clearMarker(tokenId) {
        const removeToken = canvas.tokens.get(tokenId)
        if (!removeToken) return;
        const markers = removeToken.children.filter(i => i.NUMaker)
        if (!markers) return;
        markers.forEach(m => {
            TweenMax.killTweensOf(m)
            m.visible = false
            m.rotation = 0
        })
    }

    static async clearShadows() {
        const shadows = canvas.background.children.filter(i => i.isShadow)
        for (let shadow of shadows) {
            await shadow.destroy()
        }
    }

    static addPinButton(app, html, _data) {
        if (game.settings.get("Next-Up", "removePin")) return;
        const pinButton = `
        <button id="nextup-pin" class="nextup-button" title="Pin Actor Sheet" style="height:30px;width:30px">
            <i id="nextup-pin-icon" style="color: white" class="fas fa-thumbtack"></i>
        </button>`;

        const title = html.find('.window-title');

        title.prepend(pinButton);
        NextUP.restyleButton(html, app.pinned)

        title.find("#nextup-pin").click(async (_event) => {
            app.pinned = !app.pinned
            NextUP.restyleButton(title, app.pinned)
        })
    }

    static restyleButton(title, isPinned) {
        const color = isPinned ? 'darkred' : 'white';
        title.find("#nextup-pin #nextup-pin-icon").css('color', color);
    }

    static async createTurnMarker(tokenId) {
        if (!game.settings.get("Next-Up", "markerEnable")) return;
        let token = canvas.tokens.get(tokenId)
        let prevMarker = token.children.filter(i => i.NUMaker)
        if (prevMarker.length > 0) {
            return;
        }
        const markerRatio = token.actor?.getFlag("Next-Up", "markerRatio") || game.settings.get("Next-Up", "markerRatio")
        const markerImage = token.actor?.getFlag("Next-Up", "markerImage") || NUMarkerImage
        let gs = canvas.dimensions.size * markerRatio
        let markerTexture = await loadTexture(markerImage)
        const textureSize = canvas.grid.size + gs
        markerTexture.orig = { height: textureSize, width: textureSize, x: textureSize / 2, y: textureSize / 2 }
        // Add non-existent property
        markerTexture.isNUMarker = true
        let sprite = new PIXI.Sprite(markerTexture)
        let scale = token.data.height
        sprite.transform.scale.set(scale)
        sprite.anchor.set(0.5)
        let markerToken = token.addChild(sprite)
        markerToken.position.x = canvas.grid.w * token.data.width / 2;
        markerToken.position.y = canvas.grid.h * token.data.height / 2;
        markerToken.visible = false
        token.sortableChildren = true
        markerToken.NUMaker = true
        if (game.settings.get("Next-Up", "iconLevel") === false) {
            markerToken.zIndex = -1
        }
        const source = getProperty(markerToken._texture, "baseTexture.resource.source")
        if (source && (source.tagName === "VIDEO")) {
            source.loop = true;
            source.muted = true;
            game.video.play(source);
        }
    }

    static async AddTurnMaker(token, grid) {
        let markerToken = token.children.find(i => i.NUMaker)
        markerToken.visible = true
        const animationSpeed = game.settings.get("Next-Up", "animateSpeed")

        if (animationSpeed !== 0) {
            TweenMax.to(markerToken, animationSpeed, { angle: 360, repeat: -1, ease: Linear.easeNone });
        }

        NextUP.DropStartMarker(token, grid)
    }

    static async DropStartMarker(token, grid) {
        if (!token.owner) return;
        switch (game.settings.get("Next-Up", "startMarker")) {
            case "0":
                break;
            case "1": {
                if (token.data.hidden && !game.user.isGM) return;
                let markerTexture = await loadTexture(token.data.img)
                const textureSize = grid.size * token.data.height * token.data.scale
                const offsetX = (textureSize - (canvas.grid.w * token.data.width)) / 2
                const offsetY = (textureSize - (canvas.grid.h * token.data.height)) / 2
                let sprite = new PIXI.Sprite(markerTexture)
                sprite.height = textureSize
                sprite.width = textureSize
                let startMarker = canvas.background.addChild(sprite)
                startMarker.position.x = token.data.x - offsetX
                startMarker.position.y = token.data.y - offsetY
                startMarker.isShadow = true
                startMarker.tint = 9410203
                startMarker.alpha = 0.7
            }
                break;
            case "2": {
                if (token.data.hidden && !game.user.isGM) return;
                let ratio = token.actor?.getFlag("Next-Up", "startMarkerRatio") || game.settings.get("Next-Up", "startMarkerRatio")
                let NUStartImage = await game.settings.get("Next-Up", "startMarkerImage")
                let startImage = token.actor?.getFlag("Next-Up", "startMarkerImage") || NUStartImage
                let startMarkerTexture = await loadTexture(startImage)
                const textureSize = grid.size * token.data.height * ratio
                const offsetX = (textureSize - (canvas.grid.w * token.data.width)) / 2
                const offsetY = (textureSize - (canvas.grid.h * token.data.height)) / 2
                let sprite = new PIXI.Sprite(startMarkerTexture)
                sprite.height = textureSize
                sprite.width = textureSize
                let startMarker = canvas.background.addChild(sprite)
                startMarker.position.x = token.data.x - offsetX
                startMarker.position.y = token.data.y - offsetY
                startMarker.isShadow = true
                startMarker.alpha = 0.7
            }
        }
    }
}
