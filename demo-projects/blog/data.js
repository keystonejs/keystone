const subMonths = require('date-fns/sub_months');

module.exports = {
  Post: [
    {
      title: 'Awful School is Awful Rich',
      author: { where: { email: 'admin@demo.blog' } },
      categories: { where: { name: 'Local News' } },
      status: 'published',
      body: 'Springfield Elementary School has struck oil!',
      posted: subMonths(new Date(), 6).toISOString(),
    },
    {
      title: 'Man yells at cloud',
      author: { where: { email: 'admin@demo.blog' } },
      categories: { where: { name: 'Local News' } },
      status: 'published',
      body: 'Today in Springfield, Abraham Simpson (75) yelled at a cloud.',
      posted: subMonths(new Date(), 6).toISOString(),
    },
    {
      title: 'Halem Globetrotters annihilate Generals',
      author: { where: { email: 'admin@demo.blog' } },
      categories: { where: { name: 'Sports' } },
      status: 'published',
      body:
        "Globetrotters (150) beat the Generals(3) in a cracking game last Sunday. I'd hate to be the guy who bet everything he earned by franchising his name against the Globetrotters!",
      posted: new Date().toISOString(),
    },
  ],
  Comment: [
    {
      body: 'That game was fixed. They were using a freaking ladder!',
      originalPost: { where: { posted: new Date().toISOString() } },
      author: { where: { email: 'k@krustytheclown.tv' } },
      posted: new Date().toISOString(),
    },
  ],
  PostCategory: [
    {
      name: 'Local News',
      slug: 'local-news',
    },
    {
      name: 'Sports',
      slug: 'sports',
    },
  ],
  User: [
    {
      name: 'Kent Brockman',
      email: 'admin@demo.blog',
      isAdmin: true,
      dob: '1990-01-01',
      password: 'password',
    },
    {
      name: 'Herschel Krustofsky',
      email: 'k@krustytheclown.tv',
      dob: '1990-01-01',
      password: 'password',
    },
  ],
};
