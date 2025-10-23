#!/usr/bin/env python3
import re
import os
import sys

def kebab_to_camel(match):
    """Convert kebab-case class names to camelCase"""
    class_name = match.group(1)
    # Convert kebab-case to camelCase
    parts = class_name.split('-')
    if len(parts) == 1:
        return f'{{styles.{parts[0]}}}'
    camel = parts[0] + ''.join(word.capitalize() for word in parts[1:])
    return f'{{styles.{camel}}}'

def convert_file(filepath):
    """Convert a JSX/JS file to use CSS Modules"""
    with open(filepath, 'r') as f:
        content = f.read()

    # Check if file imports CSS
    css_import_match = re.search(r"import ['\"]([^'\"]*\.css)['\"]", content)
    if not css_import_match:
        return False

    css_path = css_import_match.group(1)

    # Update import to use .module.css and import as styles
    new_import = css_path.replace('.css', '.module.css')
    content = re.sub(
        r"import ['\"]" + re.escape(css_path) + r"['\"]",
        f"import styles from '{new_import}'",
        content
    )

    # Convert className="some-class" to className={styles.someClass}
    content = re.sub(
        r'className="([a-z][a-zA-Z0-9-]*)"',
        kebab_to_camel,
        content
    )

    # Convert className={'some-class'} to className={styles.someClass}
    content = re.sub(
        r"className=\{'([a-z][a-zA-Z0-9-]*)'\}",
        lambda m: f"{{styles.{m.group(1).replace('-', '_')}}}",
        content
    )

    # Write back
    with open(filepath, 'w') as f:
        f.write(content)

    return True

# Get all JSX and JS files
root_dir = '/home/hammadharahim/Desktop/timber-mart-crm/frontend/src'
files_to_convert = [
    'pages/CustomersPage.jsx',
    'pages/UsersPage.jsx',
    'pages/Dashboard.jsx',
    'pages/LoginPage.jsx',
    'components/features/CustomerList.jsx',
    'components/features/CustomerForm.jsx',
    'components/features/UserList.jsx',
    'components/features/UserForm.jsx',
    'components/shared/MainLayout.jsx',
]

converted = 0
for file_path in files_to_convert:
    full_path = os.path.join(root_dir, file_path)
    if os.path.exists(full_path):
        if convert_file(full_path):
            print(f"✓ Converted: {file_path}")
            converted += 1
        else:
            print(f"- Skipped (no CSS import): {file_path}")
    else:
        print(f"✗ Not found: {file_path}")

print(f"\nTotal converted: {converted}")
