# Next-Up

Have you even lost yourself in the mire of 8 actor sheets open at 1 time?
 Do you ever loose track of which mage has spell slots left?
Do you ever run large combats and take 5 seconds each round to find the currently acting token?

## Well Next Up is for you!

This module can:

- Auto focus on the current combatants token at the start of their turn (client setting)
- Pull up its specific actor sheet for the GM.
- Close the previous combatants sheet or all opened character sheets to remove clutter
- Pin specific sheets to the ui to prevent them being closed

![Combat Focus 1](https://github.com/kandashi/Next-Up/blob/main/Images/auto%20focus.gif?raw=true)

![Combat Focus 2](https://github.com/kandashi/Next-Up/blob/main/Images/auto%20focus%202.gif?raw=true)

## Settings

### Sheet Postion

-Where in the ui to open the actor sheet is opened

### Which Actor Sheet Types To Open

- Chooses which types of actor's sheets should be opened, choose from All, Unlinked, or Non-Owned

### Which Combatant Sheets to Close

- Out of the currently open actor sheets, which should be closed when combat moves on. Choose from: none; only previous combatant, and all sheets.

### Which Actor Sheet Types To Close

- Which types of actor sheets should be automaticly closed, filtering from previous settings. Choose from: only unlinked tokens; only linked tokens; all tokens

### Enable Panning For Player Clients

- GM side settings to allow players to enable panning on their clients. Players will only pan to tokens they have line of sight too

### Pan To Next Combatant

- Client side setting to pan to next combatant. GM will pan to every token, players will only pan to those in line of sight.

### Remove Pin Icon From Character Sheets

- Setting to remove the ability to pin character sheets. 

## Add Turn Marker

- This allows the turn marker to be added to the current token active in combat

## Animation Speed

- Any value over 0 will add a rotation to the turn marker. This value is how many seconds per rotation (value of 1 = 1 second per full rotation)

## Turn Marker Ratio

- How much the marker extends past the tokens border (measured in grid squares/hexes)

### Tokens Specific Images

- You can now set token specific markers by setting a flag on the token
- token.setflag("Next-Up", "markerImage"/"markerRatio", "path to image"/ratio)

### Target Clearing

- You can set for targets to be cleared for each user at the end of a turn

### Start Turn Audio Cue

- You can set an audio cue to play for the players assigned character on their turn
- This can be set individually by the flag Next-Up.audioPath

## Licensing

The included rune style images are created by Rin (rin#0002 on Discord)

The DoubleSquare and Cats images are created by Wassily  (Wassily #8035 on Discord)
https://discord.gg/A59GAZwB9M
https://www.patreon.com/JB2A

The BlueCircle image was created by Jinker (Jinker #8073 on Discord)
https://www.patreon.com/jinker

The Red, Yellow and Green circle images are created by Brimcon (Brimcon #1485 on Discord)

The DoubleSquareMuted and PointedCircleMuted images are made by hobolyra (hobolyra #0967 on Discord)

The cycle/oldwest/puzzle/rqhdg-6ypzz/runes.webm files are made by cefasheli on github
