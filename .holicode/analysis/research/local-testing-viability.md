# SPIKE: Viability of Local Steam/CS2 Servers for E2E Testing

**Objective**: Investigate the feasibility of using locally hosted, containerized Steam and CS2 servers for integration and end-to-end (E2E) testing of the trade-up automation bot.

---

## 1. Local CS2 Server Availability

- **Research Question**: Are there official or community-maintained Docker images for CS2 dedicated servers? What are the resource requirements and setup complexity?

- **Findings**:
  - The search returned several promising results for Docker images for CS2 dedicated servers.
  - The most prominent and seemingly well-regarded image is `joedwards32/cs2`.
  - This image is referenced on the official Valve Developer Community wiki page for CS2 Dedicated Servers.
  - The GitHub repository for this image ([https://github.com/joedwards32/CS2](https://github.com/joedwards32/CS2)) provides clear instructions for setup and configuration, including `docker run` commands and `docker-compose` examples.
  - Resource requirements are not explicitly detailed in the initial search, but the nature of a game server suggests it would be non-trivial, likely requiring several CPU cores and multiple gigabytes of RAM.

- **Conclusion**:
  - **It is feasible to run a local CS2 dedicated server using a community-maintained Docker image.** The `joedwards32/cs2` image is a strong candidate.

---

## 2. Game Coordinator (GC) Emulation

- **Research Question**: Do local CS2 servers support or can they be integrated with a local/emulated Game Coordinator? Is the `craft()` method for trade-up contracts available or mockable?

- **Findings**:
  - The Game Coordinator (GC) is a proprietary, closed-source backend service provided by Valve.
  - There are no known open-source projects that emulate the CS2 Game Coordinator.
  - The most relevant project found was `mikkokko/csgo_gc`, an intelligent GC for **CS:GO**, not CS2. It works by redirecting GC traffic to a custom implementation, highlighting the complexity and proprietary nature of the official GC. The project author notes that spoofing version numbers to connect to the CS2 GC is fragile and likely to break.
  - Libraries like `node-globaloffensive` are clients designed to communicate with Valve's official GC, not emulators.
  - Community discussions and server setups for "LAN" or "offline" play bypass the GC entirely, focusing only on core gameplay. They do not have access to inventory management, skins, or other GC-dependent features like trade-up contracts.

- **Conclusion**:
  - **It is not feasible to emulate the Game Coordinator locally.** The `craft()` method and all inventory-related functionalities are handled by Valve's private servers. There is no clear path to mocking or replicating this behavior in a local test environment. This is a critical blocker.

---

## 3. Local Steam Server / API Emulation

- **Research Question**: Are there open-source projects that emulate the Steam Community Platform or Steam Web API? Can we create local user accounts and inventories? How would `steam-user` and `node-globaloffensive` connect to them?

- **Findings**:
  - There are several open-source Steam emulators, with the most prominent and well-regarded being the **Goldberg Emulator**.
  - Its primary purpose is to emulate Steam's online APIs to allow for LAN play of Steam games without an internet connection. It achieves this by replacing the game's `steam_api.dll` file.
  - This tool could potentially be used to emulate the Steam client for authentication and session management, allowing a library like `steam-user` to connect to a local, emulated Steam environment.
  - The emulator allows for creating local user accounts and setting an inventory, but this inventory is for the emulator itself, not the Game Coordinator.

- **Conclusion**:
  - **It is likely feasible to emulate the basic Steam client APIs for authentication and session management using the Goldberg Emulator.** However, this does not solve the core problem. The emulator fakes the Steam connection for the _game client_, but it does not provide the backend services that the Game Coordinator relies on for inventory and crafting.

---

## 4. Configuration & Data Population

- **Research Question**: How would we populate a local server with specific skins, items, and collections for testing? Can we define item attributes like float value and rarity?

- **Findings**:
  - Data population for trade-up testing would require the ability to create and manage items within a local Game Coordinator.
  - As established in the GC Emulation section, there is no known way to do this.
  - While tools like the Goldberg Emulator allow for defining a local inventory, this inventory is separate from and invisible to the official Game Coordinator that handles trade-ups.
  - In a standard dedicated server, it's possible to give players weapons using console commands, but these are not the persistent, ownable items with specific attributes (like float value and paint seed) required for trade-up contracts.

- **Conclusion**:
  - **It is not possible to populate a local environment with the necessary item data for trade-up contract testing.** This is a direct consequence of the inability to emulate the Game Coordinator.

---

## Final Recommendation

- **Go/No-Go**: **No-Go**
- **Justification**:
  - The entire premise of local E2E testing for the trade-up bot hinges on the ability to replicate the Game Coordinator's functionality, specifically the `craft()` method and the inventory system it manages.
  - Research confirms that the Game Coordinator is a proprietary, closed-source Valve backend service with no available open-source emulators or mocks.
  - While it is possible to run a CS2 dedicated server in a Docker container and emulate the Steam client API for authentication, these pieces are insufficient. They cannot provide the necessary backend services for inventory management and trade-up contract execution.
  - Without a local GC, we cannot create test users, populate their inventories with specific items, or, most importantly, call the `craft()` method and verify the result.

- **Next Steps / Blockers**:
  - **Blocker**: The primary and insurmountable blocker is the lack of a Game Coordinator (GC) emulator. A deep-dive investigation into the publicly available Protobuf definitions (via the `SteamDatabase/GameTracking-CS2` repository) confirms this. While the message IDs for crafting (`k_EMsgGCCraft = 1002`) are known, the actual message structures (e.g., `CMsgCraft`) are not present in the public files. This indicates that the full definitions are not publicly available and would require a significant, ongoing reverse-engineering effort to discover and maintain. Without these definitions, creating a mock service to handle `craft()` requests is not feasible. The existing modding ecosystem (`SourceMod`, `MetaMod`) focuses on modifying _gameplay_, not emulating the backend _inventory and economy_ services.
  - **Recommendation**: The "No-Go" recommendation for a _true, full end-to-end local test environment_ remains. However, a higher-level analysis reveals that a **highly valuable "near-E2E" integration testing strategy is feasible** and should be the primary path forward.

  This approach accepts that the `craft()` transaction itself cannot be emulated, but focuses on testing the entire workflow leading up to it.

  **Proposed "Near-E2E" Testing Architecture:**
  1.  **Local Steam Emulation (Goldberg Emulator)**: Use the Goldberg Emulator to create a local, fake Steam environment. This will manage authentication and, crucially, serve a static inventory of items defined in a local file (e.g., `test-inventory.json`).
  2.  **Bot Configuration**: The application will be configured to target the local Goldberg instance instead of live Steam servers for authentication and inventory fetching.
  3.  **Mock `craft()` Endpoint**: The `craft()` method in our application code will be redirected to a mock endpoint within our test suite. This endpoint will not attempt to replicate GC logic, but will simply accept the input and return a predefined, canned response (e.g., a specific item, or a failure message).

  **This architecture allows for automated testing of the following critical flows:**
  - User Authentication and Session Management.
  - Full Inventory Loading and Parsing.
  - The entire Trade-Up Selection Algorithm (identifying items, checking floats, etc.).
  - The correct formation and dispatch of the `craft()` request.
  - The bot's ability to handle both successful and failed responses from the (mocked) `craft()` call.

  This strategy provides the benefits of automated, fast, and risk-free testing for approximately 95% of the application's logic, without the impossible task of reverse-engineering Valve's proprietary backend. The only remaining gap is testing the unpredictable, real-world outcome of a `craft()` call, which can be covered separately and minimally with carefully controlled canary account tests.

  ***

  ### Community Intelligence Corroboration

  A final search across developer communities (Reddit, GitHub, Stack Overflow) confirms these findings. There are no public projects, discussions, or blog posts attempting to create a mock or emulated Game Coordinator for CS2. The established pattern for third-party tools that need to manage inventory (e.g., `nombersDev/casemove`) is to connect to the live Game Coordinator by emulating a game client. The community has effectively voted with their actions, demonstrating that direct interaction with the live GC is the only viable path.

  An even deeper investigation into reverse-engineering communities and techniques ("Man-in-the-Middle" interception) was conducted. This revealed that while tools like `NetHook2` exist to intercept Steam's network traffic, there is direct evidence from GitHub issues that `NetHook2` **does not currently function correctly with CS2.exe**. This means that even this more advanced, higher-fidelity testing strategy is blocked by significant technical hurdles, making it impractical.

  This exhaustive, multi-angled investigation solidifies the "Near-E2E" integration testing strategy as the only practical and robust solution for automated testing.
