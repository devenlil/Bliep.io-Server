# Bliep.io Protocol
Here is the protocol for the BliepProject.

Notice! This is not the diep.io protocol.

## Clientbound Packets (server -> client)

### Packet 0: Handshake Request
This packet is sent to the player immediately after they connect.
If player does not respond with packet 1 within 10 seconds of sending this packet,
they will be kicked.

| Bytes | Data Type | Description |
|-------|-----------|-------------|
| 0     | uint8     | Packet Id   |
| 1     | uint16    | World Size  |

### Packet 20: Init Player(s)
This packet is sent to the client when a new tank(s) enters the players viewing
range or the player presses play. The client stores the information sent in this
packet as information such as a tank's nickname or tank type will no longer be
sent to the player for that tank.

| Bytes | Data Type    | Description          |
|-------|--------------|----------------------|
| 0     | uint8        | Packet Id            |
| 1     | uint8        | Player Count         |
| 2-?   | Player Data  | Data for all players |
#### Player Data
| Data Type | Description                  |
|-----------|------------------------------|
| uint32    | Player's Id (0=you)          |
| uint16    | Player's Nickname (charcode) |
| uint16    | Marks End of Nick (always 0) |
| uint32    | Player's Score               |
| uint8     | Tank Type Id                 |

### Packet 21: Forget Player(s)
This is packet is sent to the client when a player disconnects and must be
removed from the canvas.

| Bytes | Data Type | Description  |
|-------|-----------|--------------|
| 0     | uint8     | Packet Id    |
| 1     | uint8     | Player Count |
| 2-?   | uint32    | Player's Id  |

### Packet 25: Update Player(s) Score, Position, Bullets
This packet is sent to the client 30 times per second. It contains the new score
and position/rotation of the player and other players in the viewing range and
the players bullets location.
UPDATE: This packet is no longer being used for bullets, instead see packet 35.

| Bytes | Data Type          | Description          |
|-------|--------------------|----------------------|
| 0     | uint8              | Packet Id            |
| 1     | uint8              | Player Count         |
| 2-?   | Player Update Data | New data for players |
#### Player Update Data
| Data Type   | Description              |
|-------------|--------------------------|
| uint32      | Player's Id (0=you)      |
| uint32      | Player's Score           |
| uint32      | Player's Position X      |
| uint32      | Player's Position Y      |
| uint16      | Player's Rotation (!you) |
| uint8       | Player's Bullet Count    |
| Bullet Data | Data for Player's Bullet |
#### Bullet Data
| Data Type | Description         |
|-----------|---------------------|
| uint8     | Bullet Type Id      |
| uint32    | Bullet's Position X |
| uint32    | Bullet's Position Y |

### Packet 30: Add Food
This packet is sent to the client when new food is spawned in.

| Bytes | Data Type | Description       |
|-------|-----------|-------------------|
| 0     | uint8     | Packet Id         |
| 1     | uint16    | Food Count        |
| 2-?   | Food Data | Data for all food |
#### Food Data
| Data Type | Description     |
|-----------|-----------------|
| uint8     | Food Type Id    |
| uint32    | Food Position X |
| uint32    | Food Position Y |

### Packet 35: Spawn Player Bullet(s)
This packet is sent to the client after packet 25 if there are any bullets which
are unknown to the client, fired by the client's known players. The packet is
only sent once for each bullet, but contains lots of information to aid the
client in locally calculating and rendering bullets and their movement.

| Bytes | Data Type    | Description             |
|-------|--------------|-------------------------|
| 0     | uint8        | Packet Id               |
| 1     | uint16       | Server Time (part 1)    |
| 3     | uint32       | Server Time (part 2)    |
| 7     | uint8        | Bullet Count            |
| 7-?   | Bullet Data2 | Bullet Data             |
#### Bullet Data2
| uint32  | Owner's Id (0=yours)    |
| uint8   | Bullet Type Id          |
| float32 | Bullet Speed            |
| uint16  | Bullet Aim Angle        |
| uint32  | Bullet Start Position X |
| uint32  | Bullet Stop Position Y  |
| uint16  | Bullet Life             |

## Serverbound Packets (client -> server)

### Packet 1: Handshake
This packet is sent after receiving packet 0 from server.

| Bytes | Data Type | Description      |
|-------|-----------|------------------|
| 0     | uint8     | Packet Id        |
| 1     | uint8     | Protocol Version |

### Packet 2: Heartbeat
This packet is sent every second to keep the connection alive.

| Bytes | Data Type | Description |
|-------|-----------|-------------|
| 0     | uint8     | Packet Id   |

### Packet 10: Set Nickname & Play
This packet is sent when the player presses enter on the menu screen to play.

| Bytes | Data Type | Description                  |
|-------|-----------|------------------------------|
| 0     | uint8     | Packet Id                    |
| 1-?   | uint16    | Player's Nickname (charcode) |
| ?     | uint16    | Marks End of Nick (always 0) |

### Packet 50: Mouse Move
This packet is sent when the player moves their mouse.

| Bytes | Data Type | Description            |
|-------|-----------|------------------------|
| 0     | uint8     | Packet Id              |
| 1     | uint16    | Mouse angle in Degrees |

### Packet 51: Movement key press
This packet is sent when a WASD key is pressed or released.

| Bytes | Data Type | Description |
|-------|-----------|-------------|
| 0     | uint8     | Packet Id   |
| 1     | uint8     | W Key State |
| 2     | uint8     | A Key State |
| 3     | uint8     | S Key State |
| 4     | uint8     | D Key State |

### Packet 52: Fire Bullet
This packet is sent when the tanks needs to start or stop firing bullets.

| Bytes | Data Type | Description  |
|-------|-----------|--------------|
| 0     | uint8     | Packet Id    |
| 1     | uint8     | Fire Bullets |
