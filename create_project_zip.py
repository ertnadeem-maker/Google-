import os
import zipfile

def create_zip():
    output_filename = "public/vyapar-khata-app.zip"
    
    # Files and directories to exclude
    exclude_dirs = {"node_modules", "dist", ".git", ".cache", ".aistudio"}
    exclude_files = {output_filename, "create_project_zip.py"}
    
    os.makedirs("public", exist_ok=True)
    if os.path.exists(output_filename):
        os.remove(output_filename)

    file_count = 0
    with zipfile.ZipFile(output_filename, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk("."):
            # Filter out excluded directories in-place
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith(".")]
            
            for file in files:
                filepath = os.path.join(root, file)
                relpath = os.path.relpath(filepath, ".")
                
                # Exclude specific files
                if file.endswith(".zip") or file in exclude_files or relpath.startswith("public/vyapar-khata-app.zip"):
                    continue
                
                zipf.write(filepath, relpath)
                file_count += 1
                
    file_size_kb = os.path.getsize(output_filename) / 1024
    print(f"Successfully created {output_filename} with {file_count} files ({file_size_kb:.1f} KB)")

if __name__ == "__main__":
    create_zip()
