// This script will check if the User table is empty and if
// required seed the table with an initial Admin user.
const randomString = () =>
  Math.random()
    .toString(36)
    .substring(2, 6) +
  Math.random()
    .toString(36)
    .substring(2, 6);

module.exports = async keystone => {
  // Count existing users
  const {
    data: {
      _allUsersMeta: { count },
    },
  } = await keystone.executeQuery(
    `query {
      _allUsersMeta {
        count
      }
    }`
  );

  if (count === 0) {
    const password = randomString();
    const email = 'admin@keystonejs.com';

    await keystone.executeQuery(
      `mutation initialUser($password: String, $email: String) {
            createUser(data: {name: "Admin", email: $email, isAdmin: true, password: $password}) {
              id
            }
          }`,
      {
        variables: {
          password,
          email,
        },
      }
    );

    console.log(`

User created:
  email: ${email}
  password: ${password}
Please change these details after initial login.
`);
  }
};
