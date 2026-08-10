const urls = [
  'https://images.unsplash.com/photo-1582142407894-ec85a1260a46?w=800&q=80',
  'https://images.unsplash.com/photo-1596455607563-ad6193f76b17?w=800&q=80'
];
async function check() {
  for (const url of urls) {
    const res = await fetch(url, {method: 'HEAD'});
    console.log(url, res.status);
  }
}
check();
