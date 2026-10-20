from PIL import Image

img = Image.open('public/icon-512.png')
img.save('public/favicon.ico', format='ICO', sizes=[(48, 48)])
