#!/bin/bash
# Goldberg Steam Emulator Docker Helper Script
# Usage: ./scripts/goldberg-docker.sh [build|run|stop|logs]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
IMAGE_NAME="goldberg-emulator"
CONTAINER_NAME="goldberg-test"

function build_image() {
    echo "Building Goldberg emulator Docker image..."
    cd "$PROJECT_ROOT"
    docker build -f Dockerfile.goldberg -t "$IMAGE_NAME" .
    echo "✓ Image built successfully: $IMAGE_NAME"
}

function run_container() {
    echo "Starting Goldberg emulator container..."

    # Stop existing container if running
    docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

    # Run container with fixtures mounted
    docker run -d \
        --name "$CONTAINER_NAME" \
        -v "$PROJECT_ROOT/tests/fixtures:/goldberg/fixtures:ro" \
        -p 27015-27019:27015-27019 \
        "$IMAGE_NAME"

    echo "✓ Container started: $CONTAINER_NAME"
    echo "  Ports: 27015-27019"
    echo "  Fixtures: $PROJECT_ROOT/tests/fixtures"
    echo ""
    echo "View logs: ./scripts/goldberg-docker.sh logs"
    echo "Stop container: ./scripts/goldberg-docker.sh stop"
}

function stop_container() {
    echo "Stopping Goldberg emulator container..."
    docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
    echo "✓ Container stopped"
}

function show_logs() {
    echo "Showing container logs (Ctrl+C to exit)..."
    docker logs -f "$CONTAINER_NAME"
}

function show_help() {
    echo "Goldberg Steam Emulator Docker Helper"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build    Build the Docker image"
    echo "  run      Start the emulator container"
    echo "  stop     Stop the emulator container"
    echo "  logs     Show container logs"
    echo "  help     Show this help message"
    echo ""
    echo "Example workflow:"
    echo "  $0 build    # Build image (first time only)"
    echo "  $0 run      # Start emulator"
    echo "  npm test    # Run tests"
    echo "  $0 stop     # Stop emulator"
}

# Main command dispatcher
case "${1:-help}" in
    build)
        build_image
        ;;
    run)
        run_container
        ;;
    stop)
        stop_container
        ;;
    logs)
        show_logs
        ;;
    help)
        show_help
        ;;
    *)
        echo "Error: Unknown command '$1'"
        echo ""
        show_help
        exit 1
        ;;
esac
