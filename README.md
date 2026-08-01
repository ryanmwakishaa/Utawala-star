This is the website for utawala star sprints club


Drop the client's photos in this folder named exactly:

  photo1.jpg
  photo2.jpg
  photo3.jpg
  ...
  photo30.jpg

You don't need all 30 - the gallery only shows images that actually exist,
so whether the client sent 27, 28, 29, or 30, just number them in order
starting at photo1.jpg and the site will display exactly that many.

If they ever send MORE than 30, open src/App.jsx and raise the
GALLERY_COUNT number near the top of the file to match.

If your photos are .jpeg or .png instead of .jpg, tell Claude and it will
adjust the file extension in App.jsx to match.