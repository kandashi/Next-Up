import ImagePicker from "./ImagePicker.js";
import {libWrapper} from './shim.js';

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
    game.settings.register("Next-Up", "controlOption", {
        name: 'Auto Control Next Token',
        scope: 'world',
        type: Boolean,
        default: true,
        config: true,
    });

    libWrapper.register('Next-Up', 'TokenLayer.prototype.tearDown', newTearDown, 'WRAPPER')
})

function newTearDown(wrapped, ...args) {

    for( let child of this.placeables){
        TweenMax.killTweensOf(child.children)
    }
    return wrapped(...args)
}


Hooks.once('ready', () => {
    Hooks.on("preDeleteToken", (_scene, token) => {
        NextUP.clearMarker(token._id)
    })

    Hooks.on("deleteCombat", (combat) => {
        NextUP.clearMarker(combat.current?.tokenId)
        NextUP.clearShadows()
    })

    Hooks.on("updateCombat", NextUP.handleCombatUpdate)

    Hooks.on("updateToken", (_scene, token, update) => {
        if ("height" in update || "width" in update) {
            const removeToken = canvas.tokens.get(token._id)
            const marker = removeToken.children.find(i => i.NUMaker)
            if (marker) {
                NextUP.clearMarker(token._id)
                NextUP.AddTurnMaker(token, canvas.grid)
            }
        }
    })
})

Hooks.on("canvasInit", async (newCanvas) => {
    NextUpChangeImage();
    
    Hooks.once("canvasPan", () => {
        let combat = game.combats?.find(i => i.data.scene === canvas.scene._id)
        if (combat) {
            let currentToken = canvas.tokens.get(combat.current.tokenId)
            if (currentToken) {
                NextUP.AddTurnMaker(currentToken, canvas.grid);
            }
        }
    })
})


let NUMarkerImage;

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

class NextUP {

    static async handleCombatUpdate(combat, changed) {
        const playerPanEnable = game.settings.get('Next-Up', 'playerPanEnable');
        const playerPan = game.settings.get('Next-Up', 'playerPan');
        if (!combat.started) return;
        if (!("turn" in changed) && changed.round !== 1) return;
        if (game.combats.get(combat.id).data.combatants.length == 0) return;
        const nextTurn = combat.turns[changed.turn] || combat.turns[0]
        const previousTurn = combat.turns[changed.turn - 1 > -1 ? changed.turn - 1 : combat.turns.length - 1]
        const nextTokenId = getProperty(nextTurn, "tokenId") || getProperty(nextTurn, token._id);
        let currentToken = canvas.tokens.placeables.find(i => i.id === nextTokenId);
        let previousToken = canvas.tokens.get(previousTurn.tokenId)
        NextUP.clearMarker(previousToken.id)
        NextUP.AddTurnMaker(currentToken, canvas.grid)
        NextUP.clearShadows()
        NextUP.cycleSheets(currentToken, previousToken)
        if (playerPanEnable && playerPan && (currentToken.isVisible || game.user === firstGm)) {
            canvas.animatePan({ x: currentToken.center.x, y: currentToken.center.y, duration: 250 });
        }
    }

    

    static async cycleSheets(currentToken, previousToken) {
        const combatFocusPostion = game.settings.get('Next-Up', 'combatFocusPostion');
        const closeWhich = game.settings.get('Next-Up', 'closewhich');
        const combatFocusType = game.settings.get('Next-Up', 'combatFocusType');
        const autoControl = game.settings.get('Next-Up', 'controlOption');

        if (game.user.isGM) {

            if (autoControl) await currentToken.control()
            const currentWindows = Object.values(ui.windows);

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
                    if (window) this.CloseSheet(previousToken.actor.data.token.actorLink, window)
                }
                    break;
                case "2": for (let window of currentWindows) {
                    switch (currentToken.actor.data.token.actorLink) {
                        case true: if (window.actor && window.actor.id !== currentToken.actor.id) CloseSheet(window.actor.data.token.actorLink, window)
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
        const markers = removeToken.children.filter(i => i.NUMaker)
        if (!markers) return;
        markers.forEach(m => { 
            TweenMax.killTweensOf(m)
            m.destroy()
        })
    }

    static async clearShadows() {
        const shadows = canvas.tiles.children.filter(i => i.isShadow)
        for (let shadow of shadows) {
            await shadow.destroy()
        }
    }

    static addPinButton(app, html, _data) {
        const pinButton = `
        <button id="nextup-pin" class="nextup-button" title="Pin Actor Sheet" style="height:30px;width:30px">
            <i id="nextup-pin-icon" style="color: white" class="fas fa-thumbtack"></i>
        </button>`;

        const title = html.find('.window-title');

        title.prepend(pinButton);
        this.restyleButton(html, app.pinned)

        title.find("#nextup-pin").click(async (_event) => {
            app.pinned = !app.pinned
            this.restyleButton(title, app.pinned)
        })
    }

    static restyleButton(title, isPinned) {
        const color = isPinned ? 'darkred' : 'white';
        title.find("#nextup-pin #nextup-pin-icon").css('color', color);
    }

    static async AddTurnMaker(token, grid) {
        if (!game.settings.get("Next-Up", "markerEnable")) return;
        let prevMarker = token.children.filter(i => i.NUMaker)
        if(prevMarker.length > 0){
            return;
        }

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
        markerToken.NUMaker = true
        if (game.settings.get("Next-Up", "iconLevel") === false) {
            markerToken.zIndex = -1
        }


        if (animationSpeed !== 0) {
            TweenMax.to(markerToken, animationSpeed, { angle: 360, repeat: -1, ease: Linear.easeNone });
            markerToken.transform.position = { x: grid.w * token.data.width / 2, y: grid.h * token.data.height / 2 };
        }
        else markerToken.transform.position.set((textureSize - (textureSize * markerRatio)) / 2)

        NextUP.DropStartMarker(token, grid)
    }

    static async DropStartMarker(token, grid) {
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
                if (token.data.hidden && !game.user.isGM) return;
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
}