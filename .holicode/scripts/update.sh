#!/bin/bash

# update.sh
#
# A script to sync workflows, templates, and helper scripts from the
# central HoliCode framework repository into the current project's structure.
#
# Workflows are synced to .clinerules/workflows/ for Cline execution.
# Templates and helper scripts are synced to .mementis/ for project context.

# --- Configuration ---
# The name of the directory for contextual/data parts of the framework.
HOLICODE_DATA_DIR=".holicode"
# The name of the directory for executable workflows.
WORKFLOW_TARGET_DIR=".clinerules/workflows"

# --- Pre-flight Checks ---

# Check if a source path was provided
if [ -z "$1" ]; then
  echo "❌ ERROR: You must provide the path to your source HoliCode framework repository."
  echo "   Usage: ./holicode-update.sh /path/to/your/holicode-framework-repo"
  exit 1
fi

FRAMEWORK_SOURCE_PATH=$1

# Check if the source directory exists
if [ ! -d "$FRAMEWORK_SOURCE_PATH" ]; then
  echo "❌ ERROR: Source directory not found at '$FRAMEWORK_SOURCE_PATH'"
  exit 1
fi

# --- Main Sync Logic ---

echo "🚀 Starting HoliCode framework sync..."
echo "   Source: $FRAMEWORK_SOURCE_PATH"
echo "   Target Directories: $(pwd)/$WORKFLOW_TARGET_DIR and $(pwd)/$HOLICODE_DATA_DIR"

# Create target directories if they don't exist
mkdir -p "$WORKFLOW_TARGET_DIR"
mkdir -p "$HOLICODE_DATA_DIR/templates"
mkdir -p "$HOLICODE_DATA_DIR/scripts"

# Use rsync to efficiently sync directories.
# -a: archive mode (preserves permissions, etc.)
# -v: verbose (shows what's being copied)
# --delete: removes files from the target that are no longer in the source

echo "\n🔄 Syncing workflows to $WORKFLOW_TARGET_DIR..."
rsync -av --delete "$FRAMEWORK_SOURCE_PATH/workflows/" "$WORKFLOW_TARGET_DIR/"
rsync -av --delete "$FRAMEWORK_SOURCE_PATH/holicode.md" "$WORKFLOW_TARGET_DIR/../"

echo "\n🔄 Syncing templates to $HOLICODE_DATA_DIR/templates..."
rsync -av --delete "$FRAMEWORK_SOURCE_PATH/templates/" "$HOLICODE_DATA_DIR/templates/"

echo "\n🔄 Syncing templates to $HOLICODE_DATA_DIR/specs..."
rsync -av --delete "$FRAMEWORK_SOURCE_PATH/specs/" "$HOLICODE_DATA_DIR/specs/"

echo "\n🔄 Syncing scripts to $HOLICODE_DATA_DIR/scripts..."
rsync -av --delete "$FRAMEWORK_SOURCE_PATH/scripts/" "$HOLICODE_DATA_DIR/scripts/"

echo "\n🔄 Syncing documentation templates to docs/..."
if [ -d "$FRAMEWORK_SOURCE_PATH/docs-templates" ]; then
    rsync -av --delete "$FRAMEWORK_SOURCE_PATH/docs-templates/" "docs/"
fi

echo "\n✅ Sync complete. Your project's HoliCode framework is up to date."
