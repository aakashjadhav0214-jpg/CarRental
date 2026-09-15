import sqlite3

conn = sqlite3.connect('rental.db')
c = conn.cursor()

c.execute('UPDATE vehicle_images SET image_url = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1000&auto=format&fit=crop" WHERE image_url LIKE "%ktmindia.com%"')
c.execute('UPDATE vehicle_images SET image_url = "https://images.unsplash.com/photo-1622185135505-2d795003994a?q=80&w=1000&auto=format&fit=crop" WHERE image_url LIKE "%1568901346375%"')
conn.commit()
conn.close()
