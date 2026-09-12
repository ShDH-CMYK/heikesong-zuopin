"""Combine the actual Blender review renders into a shareable contact sheet."""
from pathlib import Path
from PIL import Image, ImageDraw
root = Path(__file__).resolve().parents[1]
review = root / 'output' / 'model-review'
sheet = Image.new('RGB', (1600, 506), '#303b4d')
draw = ImageDraw.Draw(sheet)
for i, (name, label) in enumerate([('front','FRONT'),('side','SIDE'),('back','BACK'),('three-quarter','THREE QUARTER')]):
    pic = Image.open(review / (name+'.png')).convert('RGB').resize((400,450), Image.Resampling.LANCZOS)
    sheet.paste(pic,(i*400,36))
    draw.text((i*400+16,14),label,fill='#e4edff')
draw.text((16,489),'DeepSeek | Blender character / UV textures / 14-bone rig / Idle + React',fill='#e4edff')
sheet.save(review/'preview.png')
