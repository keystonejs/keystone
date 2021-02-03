module.exports = class OEmebedAdapter {
  fetch() {
    // Q: What's with all the random IDs?
    // A: To make searching the codebase for that particular string much easier
    // given the uniqueness of each string, and for ensureing we don't get
    // random false-positives from tests.
    return Promise.resolve({
      type: 'rich',
      version: '1.0',
      title: 'This is Mock Embed Data cjwsmecy400002epf7zhgb063',
      author_name: 'Ms Marvel cjwsmejjp00012epfdzrk31pd',
      author_url: 'https://www.marvel.com/captainmarvel?cjwsmgl8f00032epf48t380cm',
      provider_name: 'Marvel cjwsmgsit00042epfagb75itf',
      provider_url: 'https://www.marvel.com?cjwsmgxin00052epf223q0fsk',
      cache_age: '1000',
      thumbnail_url: 'https://placekitten.com/g/200/200?cjwsmepp400022epf59w9bo21',
      thumbnail_width: 200,
      thumbnail_height: 200,
      html: '<div>Hello cjwsmh7qf00062epfdh1c244s</div>',
      width: 500,
      height: 300,
    });
  }
};
