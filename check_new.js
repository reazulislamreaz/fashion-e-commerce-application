const urls = [
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
  'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80',
  'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80',
  'https://images.unsplash.com/photo-1583496924827-024843cc14b4?w=800&q=80',
  'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80',
];
async function check() {
  for (const url of urls) {
    const res = await fetch(url, {method: 'HEAD'});
    console.log(url, res.status);
  }
}
check();
