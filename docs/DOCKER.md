# Docker-Based Goldberg Steam Emulator

This document describes how to use the Docker-based Goldberg Steam emulator for local testing.

## Overview

The project uses a Docker container running the Goldberg Steam emulator to enable local testing without requiring a real Steam account or native builds. This approach:

- **Eliminates platform-specific build issues** (protobuf version conflicts, Wine dependencies)
- **Provides consistent test environment** across all developer machines
- **Simplifies setup** - just build and run a Docker container
- **Enables CI/CD integration** for automated testing

## Quick Start

### 1. Build the Docker Image

```bash
./scripts/goldberg-docker.sh build
```

This creates a Docker image named `goldberg-emulator` with all necessary dependencies.

### 2. Start the Emulator Container

```bash
./scripts/goldberg-docker.sh run
```

The container will:

- Mount `tests/fixtures/` directory (read-only)
- Expose ports 27015-27019 for Steam connections
- Configure CS2 (App ID 730) environment
- Load item definitions from fixtures

### 3. Run Tests

With the emulator running, execute your tests:

```bash
npm test
# or
pnpm test
```

### 4. Stop the Emulator

```bash
./scripts/goldberg-docker.sh stop
```

## Container Architecture

### Dockerfile (`Dockerfile.goldberg`)

- **Base**: `debian:bullseye-slim`
- **Dependencies**: build-essential, cmake, g++, protobuf
- **Working Directory**: `/goldberg`
- **Exposed Ports**: 27015-27019
- **Volumes**: `/goldberg/fixtures` (mount point for test fixtures)

### Entrypoint (`entrypoint.sh`)

The container startup script:

1. Creates `/goldberg/steam_settings` directory
2. Sets Steam App ID to 730 (CS2/CSGO)
3. Copies item configurations from mounted fixtures
4. Configures emulator account settings
5. Sets listen port to 27017
6. Keeps container running

### Test Fixtures (`tests/fixtures/`)

The fixtures directory contains:

- `items.json` - Available inventory items
- `default_items.json` - Default inventory quantities
- `libsteam_api.dylib` / `linux/` - Platform-specific emulator libraries
- `steam_settings.EXAMPLE/` - Example configuration files

## Integration with Tests

### Near-E2E Tests (`tests/near-e2e.test.ts`)

The near-e2e tests automatically:

1. Start a Docker container before tests run
2. Mount fixtures and expose ports
3. Wait for emulator initialization (3 seconds)
4. Execute trade-up tests against the emulator
5. Clean up and stop the container after tests

### Environment Configuration

Tests connect to the emulator at:

- **Host**: `127.0.0.1`
- **Port**: `27017`
- **Steam App ID**: `730` (CS2)

## Data Persistence

### `.data/` Directory

The project stores authentication data locally:

- `.data/session.json` - Steam session tokens
- `.data/volume.json` - Rate limiter counters

**Note**: The `.data/` directory is gitignored to prevent committing sensitive session data.

### Session Management

`SessionManager` persists Steam sessions to reduce authentication frequency:

- Saves refresh tokens and access tokens
- Stores session expiry timestamps
- Uses file permissions 0600 (owner read/write only)

### Rate Limiting

`RateLimiter` tracks authentication attempts:

- Daily limit: 10 attempts (configurable via `MAX_DAILY_AUTH_ATTEMPTS`)
- Monthly limit: 100 attempts (configurable via `MAX_MONTHLY_AUTH_ATTEMPTS`)
- Persists counters to survive application restarts
- Automatically rotates counters at midnight/month boundaries

## Troubleshooting

### Container Won't Start

**Problem**: Docker image not found

```bash
Error: No such image: goldberg-emulator
```

**Solution**: Build the image first

```bash
./scripts/goldberg-docker.sh build
```

### Port Conflicts

**Problem**: Port 27017 already in use

```bash
Error: port is already allocated
```

**Solution**: Stop other services using these ports or modify port mapping in `scripts/goldberg-docker.sh`

### Fixture Mount Issues

**Problem**: Fixtures not accessible in container

**Solution**: Ensure fixtures directory exists and has correct permissions

```bash
ls -la tests/fixtures/
chmod -R 755 tests/fixtures/
```

### Container Logs

View emulator logs for debugging:

```bash
./scripts/goldberg-docker.sh logs
```

Or directly with Docker:

```bash
docker logs goldberg-test
```

## CI/CD Integration

For continuous integration pipelines:

```yaml
# Example GitHub Actions workflow
- name: Build Goldberg Emulator
  run: docker build -f Dockerfile.goldberg -t goldberg-emulator .

- name: Start Emulator
  run: |
    docker run -d \
      --name goldberg-test \
      -v $(pwd)/tests/fixtures:/goldberg/fixtures:ro \
      -p 27015-27019:27015-27019 \
      goldberg-emulator

- name: Run Tests
  run: npm test

- name: Cleanup
  if: always()
  run: docker rm -f goldberg-test
```

## Advanced Configuration

### Custom Steam App ID

Modify `entrypoint.sh` to change the Steam application:

```bash
echo "440" > /goldberg/steam_appid.txt  # Team Fortress 2
```

### Custom Item Definitions

Update `tests/fixtures/items.json` to test with different inventories:

```json
{
  "12345": {
    "name": "Custom Item",
    "item_class": "weapon_custom",
    "item_rarity": "legendary"
  }
}
```

### Network Isolation

For complete isolation, use a custom Docker network:

```bash
docker network create goldberg-net
docker run --network goldberg-net ...
```

## References

- [Goldberg Steam Emulator GitHub](https://github.com/inflation/goldberg_emulator)
- [Goldberg Documentation](tests/fixtures/Readme.txt)
- [Steam Web API Documentation](https://steamcommunity.com/dev)
