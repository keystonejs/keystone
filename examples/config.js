const adapters = {
  Mongoose: {
    file: "adapter-mongoose.js",
    dependencies: ["@keystone-alpha/adapter-mongoose"]
  },
  Knex: {
    file: "adapter-knex.js",
    dependencies: ["@keystone-alpha/adapter-knex"],
    removeDependencies: ["@keystone-alpha/adapter-mongoose"]
  }
};

const projects = [
  {
    folder: "blank",
    title: "Starter (Users + Authentication)",
    description: "Simple stating point with users and basic authentication.",
    adapters
  },
  {
    folder: "create-react-app",
    title: "Create React App",
    description: "Run Create React App front-end with KeystoneJS.",
    adapters
  },
  {
    folder: "comments",
    title: "Comments",
    description: "A tiny comment service that could be used on any website.",
    adapters
  },
  {
    folder: "nextjs",
    title: "NextJS",
    description: "A server rendered NextJS application powered by Keystone.",
    adapters
  },
  {
    folder: "express",
    title: "Express Server",
    description: "A KeystoneJS application with a custom Express server.",
    adapters
  },
  {
    folder: "todo",
    title: "Todo",
    description:
      "A very simple Todo app with a static front-end written in good old HTML, CSS and JavaScript.",
    adapters
  }
];

module.exports = {
  projects
};
