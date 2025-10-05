# backend/convert_images.py
from PIL import Image
import os
import glob

def convert_jfif_to_jpg():
    """Convert all .jfif images to .jpg"""
    images_dir = '../frontend/public/images'
    
    # Find all .jfif files
    jfif_files = glob.glob(os.path.join(images_dir, '*.jfif'))
    
    if not jfif_files:
        print("❌ No .jfif files found")
        return
    
    print(f"🔄 Converting {len(jfif_files)} .jfif files to .jpg...")
    
    for jfif_path in jfif_files:
        try:
            # Open .jfif image
            with Image.open(jfif_path) as img:
                # Convert to RGB if necessary (for PNG with transparency)
                if img.mode in ('RGBA', 'LA'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[-1])
                    img = background
                
                # Create new filename
                base_name = os.path.splitext(jfif_path)[0]
                jpg_path = base_name + '.jpg'
                
                # Save as JPEG
                img.convert('RGB').save(jpg_path, 'JPEG', quality=85)
                
                # Remove original .jfif file
                os.remove(jfif_path)
                
                print(f"✅ Converted: {os.path.basename(jfif_path)} -> {os.path.basename(jpg_path)}")
                
        except Exception as e:
            print(f"❌ Failed to convert {jfif_path}: {e}")
    
    print("🎉 All images converted!")

if __name__ == "__main__":
    convert_jfif_to_jpg()