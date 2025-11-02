# CS2 Trade-Up Technical Requirements Research Report

**Date:** 2025-11-01  
**Investigator:** AI Research Assistant  
**Research Method:** SearXNG Web Search  
**Status:** COMPLETE

---

## Executive Summary

This investigation reveals that **CS2 trade-up automation does NOT require the full game installation**. Trade-up contracts can be executed programmatically via Steam's Game Coordinator (GC) network protocol, eliminating the need for the ~85GB game client, GPU requirements, and game UI.

**Key Finding:** Automation can be achieved using Node.js libraries (e.g., `node-globaloffensive`) that connect to Steam's Game Coordinator via network protocols, requiring only Steam account credentials and minimal system resources.

---

## Research Questions & Answers

### 1. Does trade-up require full CS2 game installation (~30GB)?

**Answer: NO**

**Evidence:**
- **Game Size:** CS2 full game requires 85GB installed (30GB download, expands to 85GB)
- **Alternative Approach:** The `node-globaloffensive` Node.js library connects to Steam's Game Coordinator (GC) without requiring game installation
- **Library Description:** "A Node.js module to connect to and interact with the CS2 game coordinator. Mostly used to get item data."
- **Mechanism:** Uses Steam network protocols via `steam-user` package, not game client

**Source:** 
- GitHub: DoctorMcKay/node-globaloffensive
- Multiple game hosting sites confirm CS2 requires 85GB installed space

---

### 2. Can inventory/trade-up UI be accessed without launching game?

**Answer: YES**

**Evidence:**
- **Programmatic Access:** `node-globaloffensive` library provides `craft()` method to execute trade-ups programmatically
- **No UI Required:** Trade-ups performed via Steam network protocol, not game UI
- **GitHub Project:** `TradeUpApp` demonstrates web-based trade-up execution using `node-globaloffensive` and `node-steam-user`
- **Reddit Confirmation:** "Check out drmckays globaloffensive for node. There is a method called craft() that can automatically perform tradeups."

**Implementation Details:**
```javascript
// Example from node-globaloffensive documentation
csgo.craft(items, recipe);
// - items: Array of item IDs to craft
// - recipe: Integer (0-4 for normal, 10-14 for StatTrak)
// - Emits 'craftingComplete' event when done
```

**Source:**
- GitHub: DoctorMcKay/node-globaloffensive (v2.3.0+)
- GitHub: qordon/TradeUpApp
- Reddit: r/csgomarketforum discussions

---

### 3. Are there Steam API endpoints for inventory management?

**Answer: YES - Multiple Options**

**Evidence:**

#### Official Steam Web API
- **Base URL:** `steamcommunity.com/dev`
- **IInventoryService:** Official Steam inventory web API
- **Inventory Endpoint:** `steamcommunity.com/profiles/{steamid}/inventory/json/730/2`
- **Authentication:** Requires Steam Web API key (obtainable from steamcommunity.com/dev/apikey)

#### Third-Party API Services
- **steamwebapi.com:** "All-in-One Steam API, Market & Inventory Endpoints"
- **steamauth.app/cs2-api:** Real-time CS2 data including inventory
- **csinventoryapi.com:** Specialized CS2 inventory API

#### Game Coordinator Protocol
- **node-globaloffensive:** Direct GC connection for inventory access
- **Inventory Property:** Library exposes `inventory` array with all items
- **Item Details:** Includes paint_index, paint_seed, paint_wear, stickers, etc.

**Source:**
- Valve: partner.steamgames.com/doc/features/inventory
- Steam Web API Documentation
- Third-party API provider documentation

---

### 4. What are minimum GPU/rendering requirements for trade-up UI?

**Answer: NO GPU REQUIRED (for programmatic access)**

**Evidence:**

#### For Programmatic Access (Recommended Approach)
- **GPU:** None required
- **Rationale:** Network-based communication with Game Coordinator, no rendering
- **System Type:** Can run on headless servers, Docker containers, or cloud VMs

#### For Game Client (NOT Recommended)
If using full game client (unnecessary for automation):
- **Minimum GPU:** GeForce GTX 650 or Radeon HD 7750
- **Recommended GPU:** GTX 1060 or AMD RX 580
- **Purpose:** Only for rendering game graphics, not for trade-up functionality

**Source:**
- CS2 system requirements from multiple gaming sites
- node-globaloffensive documentation (no GPU mentioned)

---

### 5. Can a lighter-weight client be used instead of full game?

**Answer: YES - Network Protocol Approach**

**Evidence:**

#### Lightweight Solution: node-globaloffensive Library
- **Installation Size:** ~5MB (Node.js module)
- **Dependencies:** Node.js v14+, steam-user v4.2.0+
- **No Game Files:** Connects via Steam network, no game installation needed
- **System Requirements:** Minimal (any system capable of running Node.js)

#### Alternative: CS2 Dedicated Server
- **Purpose:** For hosting games, NOT for trade-ups
- **Size:** ~60-65GB download
- **Requirements:** 2GB RAM minimum, x86-64-v2 CPU
- **Relevance:** Not applicable for trade-up automation

#### Docker Container Option
- **Available:** Yes, via `joedwards32/cs2` for dedicated server
- **Trade-Up Use:** Not directly applicable (server hosting, not GC client)

**Recommended Architecture:**
```
Lightweight Node.js Application
    ↓
node-steam-user (Steam login)
    ↓
node-globaloffensive (GC connection)
    ↓
Steam Game Coordinator (trade-up execution)
```

**Source:**
- NPM: globaloffensive package
- GitHub: Multiple CS2 automation projects
- Official Valve dedicated server documentation

---

## Technical Architecture Findings

### How Trade-Ups Work Without Game Client

```
┌─────────────────────────────────────────────────────────┐
│ Traditional Approach (NOT NEEDED)                       │
│ ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│ │ CS2 Game     │───▶│ Game         │───▶│ Trade-Up  │ │
│ │ Client       │    │ Coordinator  │    │ Execution │ │
│ │ (85GB)       │    │              │    │           │ │
│ └──────────────┘    └──────────────┘    └───────────┘ │
│                                                         │
│ Requirements:                                           │
│ - 85GB disk space                                       │
│ - GPU (GTX 650+)                                        │
│ - 8GB RAM                                               │
│ - Full game UI                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Programmatic Approach (RECOMMENDED)                     │
│ ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│ │ Node.js      │───▶│ Game         │───▶│ Trade-Up  │ │
│ │ Application  │    │ Coordinator  │    │ Execution │ │
│ │ (~5MB)       │    │ (network)    │    │           │ │
│ └──────────────┘    └──────────────┘    └───────────┘ │
│                                                         │
│ Requirements:                                           │
│ - ~100MB disk space (Node.js + libs)                   │
│ - NO GPU required                                       │
│ - ~512MB RAM                                            │
│ - Headless operation                                    │
└─────────────────────────────────────────────────────────┘
```

### Game Coordinator Connection Process

1. **Authentication:** Login to Steam via `steam-user` library
2. **GC Connection:** Launch CS2 (virtual) via `client.gamesPlayed([730])`
3. **Wait for Ready:** Listen for `connectedToGC` event
4. **Execute Trade-Up:** Call `csgo.craft(itemIds, recipe)`
5. **Handle Result:** Listen for `craftingComplete` event

---

## Recommended Solution for CS2 Docker POC

Based on research findings, the recommended approach for CS2 trade-up automation:

### Architecture
- **Runtime:** Node.js container (Alpine Linux base)
- **Libraries:** 
  - `steam-user` (Steam authentication)
  - `globaloffensive` (GC communication)
- **No Game Installation:** Eliminate 85GB requirement
- **No GPU:** Pure network protocol communication

### System Requirements
- **CPU:** 1 core (minimal)
- **RAM:** 512MB - 1GB
- **Disk:** ~500MB (OS + Node.js + libraries)
- **Network:** Outbound to Steam network (TCP/UDP)

### Benefits Over Full Game Client
- **98% smaller** (~500MB vs 85GB)
- **No GPU required** (can run on any cloud VPS)
- **Faster deployment** (seconds vs hours)
- **Lower costs** (cheaper VPS, no GPU instance needed)
- **Headless operation** (perfect for Docker)

### Limitations & Considerations
- **Steam Account Required:** Must have valid Steam credentials
- **Rate Limiting:** Steam may rate-limit GC connections
- **Account Security:** Same security concerns as game client
- **No Visual Feedback:** Programmatic only, no UI
- **Trade Holds:** Standard Steam trade restrictions apply

---

## Supporting Evidence Summary

### Primary Sources
1. **GitHub: DoctorMcKay/node-globaloffensive**
   - 326 stars, 75 forks
   - Active maintenance (last updated Oct 2024)
   - Comprehensive documentation with `craft()` method
   - Used by 193 projects

2. **NPM: globaloffensive package**
   - Version 3.2.0 (latest)
   - 6 projects depend on it
   - Well-maintained, regular updates

3. **Reddit: r/csgomarketforum**
   - Community confirms API automation viability
   - Multiple users report successful trade-up automation
   - Active discussions on implementation

4. **Valve Official Documentation**
   - CS2 dedicated server: 65GB, separate from client
   - Steam Web API documentation available
   - IInventoryService confirmed

### Secondary Sources
- Multiple third-party API providers (steamwebapi.com, steamauth.app)
- CS2 system requirements from gaming sites
- Community projects (TradeUpApp, CS2-inventory-simulator)
- Docker community containers

---

## Answers to TD-004 Questions

### Question 1: Does trade-up require full CS2 game installation (~30GB)?
**NO** - Can be done programmatically via GC connection (~5MB library)

### Question 2: Can inventory/trade-up UI be accessed without launching game?
**YES** - Via node-globaloffensive `craft()` method and inventory access

### Question 3: Are there Steam API endpoints for inventory management?
**YES** - IInventoryService, community endpoints, and GC protocol

### Question 4: What are minimum GPU/rendering requirements for trade-up UI?
**NONE** - Programmatic access requires no GPU

### Question 5: Can a lighter-weight client be used instead of full game?
**YES** - Node.js + node-globaloffensive (~500MB total vs 85GB game)

---

## Recommendations for Implementation

### Immediate Next Steps
1. **Prototype with node-globaloffensive:** Create proof-of-concept trade-up automation
2. **Docker Container:** Alpine Node.js image (~50MB base)
3. **Test GC Connection:** Verify connection stability and rate limits
4. **Inventory Management:** Implement inventory tracking via library

### Architecture Revision Needed in TD-004
- **Remove:** CS2 game installation requirement
- **Remove:** GPU/rendering requirements
- **Add:** Node.js runtime environment
- **Add:** Steam network connectivity requirements
- **Update:** Disk space from 85GB to ~500MB

### Risk Mitigation
- **Account Security:** Use dedicated Steam account for automation
- **Rate Limiting:** Implement exponential backoff for GC connections
- **Error Handling:** Robust handling of GC disconnections
- **Monitoring:** Track GC connection health and trade-up success rates

---

## Conclusion

The research conclusively demonstrates that **CS2 trade-up automation does NOT require the full game installation**. The node-globaloffensive library provides a lightweight, programmatic interface to Steam's Game Coordinator that:

- Eliminates 99% of disk space requirements (500MB vs 85GB)
- Removes GPU requirements entirely
- Enables headless, containerized deployment
- Provides full trade-up functionality via network protocols

This finding significantly simplifies the CS2 Docker POC architecture and reduces infrastructure costs substantially.

---

## References

### Code Repositories
- https://github.com/DoctorMcKay/node-globaloffensive
- https://github.com/qordon/TradeUpApp
- https://github.com/ianlucas/cs2-inventory-simulator
- https://github.com/redlfox/awesome-cs2-trading

### Documentation
- https://developer.valvesoftware.com/wiki/Counter-Strike_2/Dedicated_Servers
- https://steamcommunity.com/dev (Steam Web API)
- https://partner.steamgames.com/doc/features/inventory
- https://www.npmjs.com/package/globaloffensive

### Community Sources
- https://www.reddit.com/r/csgomarketforum/
- https://steamcommunity.com/app/730 (CS2 community)
- Various CS2 system requirements sites (pcgamebenchmark.com, skinsmonkey.com, etc.)

---

**Report Status:** COMPLETE  
**Confidence Level:** HIGH  
**Recommendation:** Proceed with node-globaloffensive-based architecture
