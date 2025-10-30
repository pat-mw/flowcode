#!/usr/bin/env python3

import os
import re
import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional, List

def get_next_version(specs_dir: Path) -> int:
    """Determine the next version number for the spec file."""
    if not specs_dir.exists():
        return 1
    
    version_files: List[Path] = list(specs_dir.glob("v*.md"))
    if not version_files:
        return 1
    
    versions: List[int] = []
    for file in version_files:
        match = re.match(r"v(\d+)\.md", file.name)
        if match:
            versions.append(int(match.group(1)))
    
    return max(versions) + 1 if versions else 1

def extract_plan_content(hook_data: Dict[str, Any]) -> Optional[str]:
    """Extract the plan content from the hook data."""
    try:
        # Check for plan in tool_input (Claude Code format)
        if 'tool_input' in hook_data and 'plan' in hook_data['tool_input']:
            return hook_data['tool_input']['plan']
        # Fallback to old format for testing
        elif 'parameters' in hook_data and 'plan' in hook_data['parameters']:
            return hook_data['parameters']['plan']
        elif 'plan' in hook_data:
            return hook_data['plan']
        return None
    except Exception:
        return None

def get_git_context() -> Dict[str, str]:
    """Get current git context information."""
    context = {}
    try:
        import subprocess
        
        # Get current branch
        result = subprocess.run(['git', 'branch', '--show-current'], 
                              capture_output=True, text=True, cwd=Path.cwd())
        if result.returncode == 0:
            context['branch'] = result.stdout.strip()
        
        # Get last commit
        result = subprocess.run(['git', 'log', '-1', '--oneline'], 
                              capture_output=True, text=True, cwd=Path.cwd())
        if result.returncode == 0:
            context['last_commit'] = result.stdout.strip()
        
        # Get modified files
        result = subprocess.run(['git', 'status', '--porcelain'], 
                              capture_output=True, text=True, cwd=Path.cwd())
        if result.returncode == 0:
            modified_files = [line.strip() for line in result.stdout.split('\n') if line.strip()]
            context['modified_files'] = modified_files[:10]  # Limit to 10 files
        
    except Exception:
        pass
    
    return context

def get_project_context() -> Dict[str, Any]:
    """Get project context information."""
    context = {}
    current_dir = Path.cwd()
    
    # Check for package.json
    package_json = current_dir / "package.json"
    if package_json.exists():
        try:
            with open(package_json) as f:
                data = json.load(f)
                context['project_name'] = data.get('name', 'Unknown')
                context['project_version'] = data.get('version', 'Unknown')
                context['description'] = data.get('description', '')
        except Exception:
            pass
    
    # Check for CLAUDE.md
    claude_md = current_dir / "CLAUDE.md"
    if claude_md.exists():
        try:
            with open(claude_md) as f:
                content = f.read()
                # Extract project overview
                if "## Project Overview" in content:
                    overview_start = content.find("## Project Overview")
                    overview_end = content.find("##", overview_start + 1)
                    if overview_end == -1:
                        overview_end = len(content)
                    context['project_overview'] = content[overview_start:overview_end].strip()
        except Exception:
            pass
    
    return context

def format_enhanced_plan(plan_content: str, version: int) -> str:
    """Format the plan with enhanced descriptive content."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    git_context = get_git_context()
    project_context = get_project_context()
    
    enhanced_content = f"""# Plan Specification v{version}

**Generated:** {timestamp}
**Status:** Draft

## Context Information

### Git Context
"""
    
    if git_context.get('branch'):
        enhanced_content += f"- **Branch:** {git_context['branch']}\n"
    if git_context.get('last_commit'):
        enhanced_content += f"- **Last Commit:** {git_context['last_commit']}\n"
    if git_context.get('modified_files'):
        enhanced_content += f"- **Modified Files:** {len(git_context['modified_files'])} files\n"
        for file in git_context['modified_files'][:5]:  # Show first 5
            enhanced_content += f"  - {file}\n"
        if len(git_context['modified_files']) > 5:
            enhanced_content += f"  - ... and {len(git_context['modified_files']) - 5} more\n"
    
    enhanced_content += "\n### Project Context\n"
    
    if project_context.get('project_name'):
        enhanced_content += f"- **Project:** {project_context['project_name']}"
        if project_context.get('project_version'):
            enhanced_content += f" v{project_context['project_version']}"
        enhanced_content += "\n"
    
    if project_context.get('description'):
        enhanced_content += f"- **Description:** {project_context['description']}\n"
    
    if project_context.get('project_overview'):
        enhanced_content += f"\n### Project Overview\n{project_context['project_overview']}\n"
    
    enhanced_content += f"""
## Implementation Plan

{plan_content}

## Notes

- This plan was automatically generated by Claude Code
- Review and validate all steps before implementation
- Consider testing and validation requirements for each step
- Update this document as implementation progresses

---
*Auto-generated by Claude Code post_exit_plan_mode hook*
"""
    
    return enhanced_content

def main() -> None:
    """Main function to process the hook data and save the plan."""
    try:
        # Read the hook data from stdin
        input_data: str = sys.stdin.read()
        
        if not input_data.strip():
            return
        
        # Parse the JSON data
        hook_data: Dict[str, Any] = json.loads(input_data)
        
        # Extract plan content from the tool use
        plan_content: Optional[str] = None
        
        # Look for ExitPlanMode tool use in the hook data
        if 'tool_name' in hook_data and hook_data['tool_name'] == 'ExitPlanMode':
            plan_content = extract_plan_content(hook_data)
        
        # If no plan content found, exit quietly
        if not plan_content:
            return
        
        # Set up paths
        current_dir: Path = Path.cwd()
        specs_dir: Path = current_dir / "specs"
        specs_dir.mkdir(exist_ok=True)
        
        # Get next version number
        version: int = get_next_version(specs_dir)
        
        # Create the spec file
        spec_file: Path = specs_dir / f"v{version}.md"
        
        # Write the enhanced plan content
        enhanced_content = format_enhanced_plan(plan_content, version)
        with open(spec_file, 'w') as f:
            f.write(enhanced_content)
        
        print(f"Plan saved to {spec_file}")
        
    except Exception as e:
        # Log error but don't fail the hook
        print(f"Hook error: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()