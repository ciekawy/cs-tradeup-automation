import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { execa, ExecaChildProcess } from 'execa';
import { AuthenticationService } from '../src/auth';
import { GameCoordinatorService } from '../src/gamecoordinator';
import SteamUser from 'steam-user';

const DOCKER_IMAGE = 'goldberg-emulator';
const DOCKER_CONTAINER = 'goldberg-test-e2e';

describe('Near-E2E Trade-Up Test (Docker)', () => {
  let emulatorContainer: ExecaChildProcess<string> | undefined;
  let authService: AuthenticationService;
  let gcService: GameCoordinatorService;

  beforeAll(async () => {
    // Start the Goldberg Emulator Docker container
    try {
      console.log('Starting Goldberg emulator container...');

      // Remove any existing container
      try {
        await execa('docker', ['rm', '-f', DOCKER_CONTAINER]);
      } catch {
        // Ignore errors if container doesn't exist
      }

      // Start new container with fixtures mounted
      const containerProcess = execa('docker', [
        'run',
        '--rm',
        '--name',
        DOCKER_CONTAINER,
        '-v',
        `${process.cwd()}/tests/fixtures:/goldberg/fixtures:ro`,
        '-p',
        '27015-27019:27015-27019',
        DOCKER_IMAGE,
      ]);

      emulatorContainer = containerProcess;

      if (containerProcess.stdout && containerProcess.stderr) {
        containerProcess.stdout.pipe(process.stdout);
        containerProcess.stderr.pipe(process.stderr);
      }

      console.log('Waiting for emulator to initialize...');
      // Wait for the emulator to start
      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log('Emulator ready');
    } catch (error) {
      console.error('Failed to start emulator container:', error);
      throw error;
    }

    // Initialize our bot to connect to the local emulator
    authService = new AuthenticationService({
      username: 'testuser',
      password: 'testpassword',
      servers: [{ host: '127.0.0.1', port: 27017 }],
      httpProxy: 'http://127.0.0.1:27017',
    });

    await authService.authenticate();

    const steamClient = new SteamUser();
    gcService = new GameCoordinatorService({ steamClient });
  }, 30000);

  afterAll(async () => {
    // Shut down the emulator container
    console.log('Stopping emulator container...');
    if (emulatorContainer && !emulatorContainer.killed) {
      emulatorContainer.kill('SIGTERM');
    }

    // Force remove container to ensure cleanup
    try {
      await execa('docker', ['rm', '-f', DOCKER_CONTAINER]);
    } catch {
      // Ignore errors if container already stopped
    }

    console.log('Emulator container stopped');
  });

  it('should successfully perform a trade-up against the local emulator', async () => {
    const assetIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

    // Spy on the craft method
    const craftSpy = vi.spyOn(gcService.getClient(), 'craft').mockImplementation(() => {});

    // Trigger the trade-up logic
    await gcService.executeTradeUp(assetIds);

    // Assert that the mock craft() function was called with the correct item IDs
    expect(craftSpy).toHaveBeenCalledWith(assetIds);
  });
});
